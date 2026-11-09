-- ==============================================================================
-- SIMPANWASTE - STORED PROCEDURES & RPC FUNCTIONS
-- Transaksi Atomik, Row-Locking, & Validasi Server-Side
-- ==============================================================================

-- 1. Trigger Otomatis: Sinkronisasi auth.users -> public.profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_nama text;
  v_no_hp text;
  v_alamat text;
  v_peran public.peran;
begin
  v_username := lower(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  v_nama := coalesce(new.raw_user_meta_data->>'nama', v_username);
  v_no_hp := coalesce(new.raw_user_meta_data->>'no_hp', '-');
  v_alamat := coalesce(new.raw_user_meta_data->>'alamat', '-');
  v_peran := coalesce((new.raw_user_meta_data->>'peran')::public.peran, 'warga'::public.peran);

  insert into public.profil (id, nama, username, no_hp, alamat, peran, created_at)
  values (new.id, v_nama, v_username, v_no_hp, v_alamat, v_peran, now())
  on conflict (id) do update set
    nama = excluded.nama,
    username = excluded.username,
    no_hp = excluded.no_hp,
    alamat = excluded.alamat;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Fungsi Ambil Saldo Terkini Pengguna
create or replace function public.get_user_saldo(p_user_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select saldo from public.saldo_transaksi
     where id_pengguna = p_user_id
     order by tanggal desc, id desc
     limit 1),
    0.00
  );
$$;

-- 3. Fungsi Set / Ubah PIN Pengguna (Bcrypt Hash via pgcrypto)
create or replace function public.set_user_pin(p_user_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'Akses ditolak: tidak memiliki hak mengubah PIN pengguna ini.';
  end if;

  if p_pin !~ '^[0-9]{6}$' then
    raise exception 'PIN harus berupa tepat 6 digit angka.';
  end if;

  insert into public.pin_pengguna (id_pengguna, pin_hash, updated_at)
  values (p_user_id, crypt(p_pin, gen_salt('bf')), now())
  on conflict (id_pengguna)
  do update set pin_hash = crypt(p_pin, gen_salt('bf')), updated_at = now();

  return true;
end;
$$;

-- 4. Fungsi Verifikasi PIN Pengguna
create or replace function public.verifikasi_pin(p_user_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  if auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'Akses ditolak.';
  end if;

  select pin_hash into v_hash
  from public.pin_pengguna
  where id_pengguna = p_user_id;

  if not found then
    return false;
  end if;

  return (v_hash = crypt(p_pin, v_hash));
end;
$$;

-- 5. RPC Warga: Batalkan Laporan (Hanya jika status 'menunggu')
create or replace function public.batalkan_laporan(p_id_laporan uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_laporan record;
begin
  select * into v_laporan
  from public.laporan_setoran
  where id = p_id_laporan
  for update;

  if not found then
    raise exception 'Laporan tidak ditemukan.';
  end if;

  if v_laporan.id_pengguna <> auth.uid() and not public.is_admin() then
    raise exception 'Akses ditolak: hanya pemilik laporan yang dapat membatalkan.';
  end if;

  if v_laporan.status <> 'menunggu' then
    raise exception 'Laporan tidak dapat dibatalkan karena sudah dalam status %.', v_laporan.status;
  end if;

  update public.laporan_setoran
  set status = 'dibatalkan'
  where id = p_id_laporan;

  return jsonb_build_object('success', true, 'id_laporan', p_id_laporan, 'status', 'dibatalkan');
end;
$$;

-- 6. RPC Petugas: Proses Penimbangan Sampah (Transaksi Atomik + Snapshot Harga)
create or replace function public.proses_penimbangan(
  p_id_laporan uuid,
  p_detail jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_petugas_id uuid;
  v_laporan record;
  v_item jsonb;
  v_id_kategori uuid;
  v_berat numeric;
  v_kondisi public.kondisi_sampah;
  v_harga_per_kg numeric;
  v_subtotal numeric;
  v_total_berat numeric := 0;
  v_total_nilai numeric := 0;
  v_id_penimbangan uuid;
  v_current_saldo numeric := 0;
  v_new_saldo numeric := 0;
begin
  v_petugas_id := auth.uid();
  if not public.is_petugas_or_admin() then
    raise exception 'Akses ditolak: hanya petugas atau admin yang dapat memproses penimbangan.';
  end if;

  -- Kunci baris laporan untuk mencegah penimbangan ganda konkuren
  select * into v_laporan
  from public.laporan_setoran
  where id = p_id_laporan
  for update;

  if not found then
    raise exception 'Laporan setoran tidak ditemukan.';
  end if;

  if v_laporan.status = 'selesai' then
    raise exception 'Laporan setoran ini sudah selesai ditimbang sebelumnya.';
  end if;

  if v_laporan.status = 'dibatalkan' then
    raise exception 'Laporan setoran ini telah dibatalkan.';
  end if;

  -- Kunci data profil nasabah untuk serialisasi saldo
  perform 1 from public.profil where id = v_laporan.id_pengguna for update;

  -- Simpan header penimbangan
  insert into public.penimbangan (id_laporan, id_petugas, total_berat, total_nilai)
  values (p_id_laporan, v_petugas_id, 0, 0)
  returning id into v_id_penimbangan;

  -- Iterasi rincian penimbangan per kategori
  for v_item in select * from jsonb_array_elements(p_detail)
  loop
    v_id_kategori := (v_item->>'id_kategori')::uuid;
    v_berat := (v_item->>'berat_aktual')::numeric;
    v_kondisi := (v_item->>'kondisi')::public.kondisi_sampah;

    if v_berat < 0 then
      raise exception 'Berat aktual tidak boleh bernilai negatif.';
    end if;

    -- Ambil harga snapshot saat ini
    select harga_per_kg into v_harga_per_kg
    from public.harga_sampah
    where id_kategori = v_id_kategori and kondisi = v_kondisi;

    if not found then
      raise exception 'Harga untuk kategori % dengan kondisi % belum dikonfigurasi.', v_id_kategori, v_kondisi;
    end if;

    v_subtotal := round(v_berat * v_harga_per_kg, 2);
    v_total_berat := v_total_berat + v_berat;
    v_total_nilai := v_total_nilai + v_subtotal;

    -- Upsert ke detail_setoran
    insert into public.detail_setoran (id_laporan, id_kategori, berat_aktual, kondisi, subtotal)
    values (p_id_laporan, v_id_kategori, v_berat, v_kondisi, v_subtotal)
    on conflict (id_laporan, id_kategori)
    do update set
      berat_aktual = excluded.berat_aktual,
      kondisi = excluded.kondisi,
      subtotal = excluded.subtotal;
  end loop;

  -- Perbarui total berat & nilai penimbangan
  update public.penimbangan
  set total_berat = v_total_berat,
      total_nilai = v_total_nilai
  where id = v_id_penimbangan;

  -- Perbarui status laporan menjadi selesai
  update public.laporan_setoran
  set status = 'selesai'
  where id = p_id_laporan;

  -- Tambah saldo nasabah secara mutasi atomik
  v_current_saldo := public.get_user_saldo(v_laporan.id_pengguna);
  v_new_saldo := v_current_saldo + v_total_nilai;

  insert into public.saldo_transaksi (
    id_pengguna, id_penimbangan, jenis, jumlah, tanggal, saldo
  )
  values (
    v_laporan.id_pengguna, v_id_penimbangan, 'setoran', v_total_nilai, now(), v_new_saldo
  );

  return jsonb_build_object(
    'success', true,
    'id_penimbangan', v_id_penimbangan,
    'total_berat', v_total_berat,
    'total_nilai', v_total_nilai,
    'saldo_baru', v_new_saldo
  );
end;
$$;

-- 7. RPC Warga: Pengajuan Penarikan Saldo / Potong Iuran (Dengan Verifikasi PIN)
create or replace function public.ajukan_penarikan(
  p_jumlah numeric,
  p_tujuan public.tujuan_penarikan,
  p_pin text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_is_pin_valid boolean;
  v_current_saldo numeric;
  v_id_penarikan uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Akses ditolak: pengguna belum terautentikasi.';
  end if;

  if p_jumlah <= 0 then
    raise exception 'Jumlah penarikan harus lebih dari 0.';
  end if;

  -- Validasi PIN
  v_is_pin_valid := public.verifikasi_pin(v_user_id, p_pin);
  if not v_is_pin_valid then
    raise exception 'PIN 6 digit tidak sesuai.';
  end if;

  -- Periksa saldo terkini
  v_current_saldo := public.get_user_saldo(v_user_id);
  if p_jumlah > v_current_saldo then
    raise exception 'Saldo tidak mencukupi. Saldo saat ini: Rp %', v_current_saldo;
  end if;

  insert into public.penarikan_saldo (
    id_pengguna, jumlah, tujuan, status, tanggal_ajuan
  )
  values (
    v_user_id, p_jumlah, p_tujuan, 'menunggu', now()
  )
  returning id into v_id_penarikan;

  return jsonb_build_object(
    'success', true,
    'id_penarikan', v_id_penarikan,
    'jumlah', p_jumlah,
    'status', 'menunggu'
  );
end;
$$;

-- 8. RPC Petugas: Proses Penarikan Saldo (Selesai atau Ditolak)
create or replace function public.proses_penarikan(
  p_id_penarikan uuid,
  p_status public.status_penarikan,
  p_alasan_penolakan text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_petugas_id uuid;
  v_penarikan record;
  v_current_saldo numeric;
  v_new_saldo numeric;
begin
  v_petugas_id := auth.uid();
  if not public.is_petugas_or_admin() then
    raise exception 'Akses ditolak: hanya petugas atau admin yang dapat memproses penarikan.';
  end if;

  if p_status not in ('selesai', 'ditolak') then
    raise exception 'Status penarikan harus berupa selesai atau ditolak.';
  end if;

  select * into v_penarikan
  from public.penarikan_saldo
  where id = p_id_penarikan
  for update;

  if not found then
    raise exception 'Pengajuan penarikan tidak ditemukan.';
  end if;

  if v_penarikan.status <> 'menunggu' then
    raise exception 'Pengajuan penarikan sudah diproses sebelumnya dengan status %.', v_penarikan.status;
  end if;

  -- Jika Ditolak
  if p_status = 'ditolak' then
    if p_alasan_penolakan is null or trim(p_alasan_penolakan) = '' then
      raise exception 'Alasan penolakan wajib dicantumkan jika pengajuan ditolak.';
    end if;

    update public.penarikan_saldo
    set status = 'ditolak',
        alasan_penolakan = p_alasan_penolakan,
        id_petugas = v_petugas_id,
        tanggal_proses = now()
    where id = p_id_penarikan;

    return jsonb_build_object(
      'success', true,
      'id_penarikan', p_id_penarikan,
      'status', 'ditolak',
      'alasan', p_alasan_penolakan
    );
  end if;

  -- Jika Selesai (Pencairan Berhasil)
  perform 1 from public.profil where id = v_penarikan.id_pengguna for update;
  v_current_saldo := public.get_user_saldo(v_penarikan.id_pengguna);

  if v_penarikan.jumlah > v_current_saldo then
    raise exception 'Saldo nasabah saat ini tidak mencukupi untuk dicairkan. Saldo: Rp %, diminta: Rp %', v_current_saldo, v_penarikan.jumlah;
  end if;

  v_new_saldo := v_current_saldo - v_penarikan.jumlah;

  update public.penarikan_saldo
  set status = 'selesai',
      id_petugas = v_petugas_id,
      tanggal_proses = now()
  where id = p_id_penarikan;

  insert into public.saldo_transaksi (
    id_pengguna, id_penarikan, jenis, jumlah, tanggal, saldo
  )
  values (
    v_penarikan.id_pengguna, p_id_penarikan, 'penarikan', v_penarikan.jumlah, now(), v_new_saldo
  );

  return jsonb_build_object(
    'success', true,
    'id_penarikan', p_id_penarikan,
    'status', 'selesai',
    'saldo_baru', v_new_saldo
  );
end;
$$;
