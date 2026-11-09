-- ==============================================================================
-- SIMPANWASTE - INITIAL DATABASE SCHEMA
-- Versi: 1.0 (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Ekstensi yang dibutuhkan
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Tipe Enum
create type public.peran as enum ('warga', 'petugas', 'admin');
create type public.metode_setoran as enum ('pickup', 'drop_off');
create type public.status_laporan as enum ('menunggu', 'dalam_proses', 'selesai', 'dibatalkan');
create type public.kondisi_sampah as enum ('bersih', 'kotor', 'tercampur_air');
create type public.jenis_transaksi as enum ('setoran', 'penarikan');
create type public.status_penarikan as enum ('menunggu', 'selesai', 'ditolak');
create type public.tujuan_penarikan as enum ('tarik_tabungan', 'potong_iuran');

-- 3. Tabel Profil (1:1 dengan auth.users)
create table public.profil (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  username text unique not null check (username ~ '^[a-z0-9._]+$'),
  no_hp text not null,
  alamat text not null,
  peran public.peran not null default 'warga',
  created_at timestamptz not null default now()
);

-- Index username untuk pencarian cepat saat login/lookup
create index idx_profil_username on public.profil (username);
create index idx_profil_peran on public.profil (peran);

-- 4. Tabel PIN Pengguna (Tersimpan sebagai Hash, Terpisah dari Profil)
create table public.pin_pengguna (
  id_pengguna uuid primary key references public.profil(id) on delete cascade,
  pin_hash text not null,
  updated_at timestamptz not null default now()
);

-- 5. Tabel Bank Sampah
create table public.bank_sampah (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  alamat text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  jam_operasional text not null,
  is_aktif boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_bank_sampah_aktif on public.bank_sampah (is_aktif);

-- 6. Tabel Kategori Sampah
create table public.kategori_sampah (
  id uuid primary key default gen_random_uuid(),
  nama_kategori text not null unique,
  deskripsi text,
  is_aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- 7. Tabel Harga Sampah (Kombinasi Kategori x 3 Kondisi)
create table public.harga_sampah (
  id uuid primary key default gen_random_uuid(),
  id_kategori uuid not null references public.kategori_sampah(id) on delete cascade,
  kondisi public.kondisi_sampah not null,
  harga_per_kg numeric(12, 2) not null check (harga_per_kg >= 0),
  updated_at timestamptz not null default now(),
  constraint uq_kategori_kondisi unique (id_kategori, kondisi)
);

-- 8. Tabel Pengaturan Sistem (Singleton: batas minimum pickup, dll.)
create table public.pengaturan_sistem (
  id uuid primary key default gen_random_uuid(),
  batas_minimum_pickup_kg numeric(8, 2) not null default 5.00 check (batas_minimum_pickup_kg > 0),
  updated_at timestamptz not null default now()
);

-- 9. Tabel Laporan Setoran
create table public.laporan_setoran (
  id uuid primary key default gen_random_uuid(),
  id_pengguna uuid not null references public.profil(id) on delete cascade,
  metode public.metode_setoran not null,
  id_bank_sampah uuid references public.bank_sampah(id),
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  estimasi_berat numeric(8, 2) not null check (estimasi_berat > 0),
  status public.status_laporan not null default 'menunggu',
  tanggal_lapor timestamptz not null default now(),
  constraint chk_laporan_lokasi check (
    (metode = 'drop_off' and id_bank_sampah is not null) or
    (metode = 'pickup' and latitude is not null and longitude is not null)
  )
);

create index idx_laporan_pengguna on public.laporan_setoran (id_pengguna);
create index idx_laporan_status on public.laporan_setoran (status);
create index idx_laporan_tanggal on public.laporan_setoran (tanggal_lapor desc);

-- 10. Tabel Detail Setoran
create table public.detail_setoran (
  id uuid primary key default gen_random_uuid(),
  id_laporan uuid not null references public.laporan_setoran(id) on delete cascade,
  id_kategori uuid not null references public.kategori_sampah(id),
  berat_aktual numeric(8, 2) check (berat_aktual >= 0),
  kondisi public.kondisi_sampah,
  subtotal numeric(12, 2) check (subtotal >= 0),
  constraint uq_detail_laporan_kategori unique (id_laporan, id_kategori)
);

create index idx_detail_laporan on public.detail_setoran (id_laporan);

-- 11. Tabel Penimbangan (Petugas memvalidasi timbangan manual)
create table public.penimbangan (
  id uuid primary key default gen_random_uuid(),
  id_laporan uuid not null unique references public.laporan_setoran(id) on delete cascade,
  id_petugas uuid not null references public.profil(id),
  tanggal_timbang timestamptz not null default now(),
  total_berat numeric(8, 2) not null check (total_berat >= 0),
  total_nilai numeric(12, 2) not null check (total_nilai >= 0)
);

create index idx_penimbangan_laporan on public.penimbangan (id_laporan);
create index idx_penimbangan_petugas on public.penimbangan (id_petugas);

-- 12. Tabel Penarikan Saldo / Potong Iuran
create table public.penarikan_saldo (
  id uuid primary key default gen_random_uuid(),
  id_pengguna uuid not null references public.profil(id) on delete cascade,
  jumlah numeric(12, 2) not null check (jumlah > 0),
  tujuan public.tujuan_penarikan not null,
  status public.status_penarikan not null default 'menunggu',
  alasan_penolakan text,
  tanggal_ajuan timestamptz not null default now(),
  id_petugas uuid references public.profil(id),
  tanggal_proses timestamptz
);

create index idx_penarikan_pengguna on public.penarikan_saldo (id_pengguna);
create index idx_penarikan_status on public.penarikan_saldo (status);

-- 13. Tabel Saldo Transaksi (Ledger Mutasi Tabungan)
create table public.saldo_transaksi (
  id uuid primary key default gen_random_uuid(),
  id_pengguna uuid not null references public.profil(id) on delete cascade,
  id_penimbangan uuid references public.penimbangan(id) on delete set null,
  id_penarikan uuid references public.penarikan_saldo(id) on delete set null,
  jenis public.jenis_transaksi not null,
  jumlah numeric(12, 2) not null check (jumlah > 0),
  tanggal timestamptz not null default now(),
  saldo numeric(12, 2) not null check (saldo >= 0)
);

create index idx_saldo_pengguna on public.saldo_transaksi (id_pengguna, tanggal desc);

-- 14. Tabel Konten Edukasi
create table public.konten_edukasi (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  topik text not null,
  isi text not null,
  urutan int not null default 1,
  created_at timestamptz not null default now()
);

-- 15. Tabel Mitra Pengepul
create table public.mitra_pengepul (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  alamat text not null,
  kontak text not null,
  is_aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- 16. Tabel Distribusi Mitra
create table public.distribusi_mitra (
  id uuid primary key default gen_random_uuid(),
  id_mitra uuid not null references public.mitra_pengepul(id),
  id_kategori uuid not null references public.kategori_sampah(id),
  berat numeric(8, 2) not null check (berat > 0),
  tanggal timestamptz not null default now(),
  catatan text
);

-- 17. View Publik untuk Bank Sampah Aktif (Landing Page)
create or replace view public.v_bank_sampah_publik as
select
  id,
  nama,
  alamat,
  jam_operasional,
  latitude,
  longitude
from public.bank_sampah
where is_aktif = true;
-- ==============================================================================
-- SIMPANWASTE - ROW LEVEL SECURITY (RLS) POLICIES
-- Versi: 1.0 (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Helper function untuk mengecek peran user saat ini tanpa recursive RLS loop
create or replace function public.get_my_peran()
returns public.peran
language sql
stable
security definer
set search_path = public
as $$
  select peran from public.profil where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_my_peran() = 'admin', false);
$$;

create or replace function public.is_petugas_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_my_peran() in ('petugas', 'admin'), false);
$$;

-- 2. Aktifkan RLS pada seluruh tabel
alter table public.profil enable row level security;
alter table public.pin_pengguna enable row level security;
alter table public.bank_sampah enable row level security;
alter table public.kategori_sampah enable row level security;
alter table public.harga_sampah enable row level security;
alter table public.pengaturan_sistem enable row level security;
alter table public.laporan_setoran enable row level security;
alter table public.detail_setoran enable row level security;
alter table public.penimbangan enable row level security;
alter table public.penarikan_saldo enable row level security;
alter table public.saldo_transaksi enable row level security;
alter table public.konten_edukasi enable row level security;
alter table public.mitra_pengepul enable row level security;
alter table public.distribusi_mitra enable row level security;

-- ==============================================================================
-- POLICY: PROFIL
-- ==============================================================================
-- Pengguna dapat melihat profil sendiri; Admin dapat melihat semua
create policy "profil_select_policy" on public.profil
  for select
  using (auth.uid() = id or public.is_admin());

-- Pengguna dapat mengubah profil sendiri; Admin dapat mengubah profil siapa saja
create policy "profil_update_policy" on public.profil
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Registrasi akun: insert diizinkan jika id sesuai auth.uid()
create policy "profil_insert_policy" on public.profil
  for insert
  with check (auth.uid() = id or public.is_admin());

-- Hanya admin yang dapat menghapus akun
create policy "profil_delete_policy" on public.profil
  for delete
  using (public.is_admin());

-- ==============================================================================
-- POLICY: PIN_PENGGUNA
-- ==============================================================================
-- Klien TIDAK BOLEH melakukan SELECT pada pin_pengguna untuk alasan keamanan
-- Verifikasi PIN hanya melalui security definer RPC
create policy "pin_no_direct_select" on public.pin_pengguna
  for select
  using (false);

create policy "pin_insert_policy" on public.pin_pengguna
  for insert
  with check (auth.uid() = id_pengguna or public.is_admin());

create policy "pin_update_policy" on public.pin_pengguna
  for update
  using (auth.uid() = id_pengguna or public.is_admin())
  with check (auth.uid() = id_pengguna or public.is_admin());

-- ==============================================================================
-- POLICY: DATA MASTER (bank_sampah, kategori_sampah, harga_sampah, pengaturan_sistem, konten_edukasi)
-- ==============================================================================
-- Semua pengguna login (termasuk anon via view v_bank_sampah_publik) dapat membaca
create policy "bank_sampah_read_all" on public.bank_sampah
  for select
  using (true);

create policy "bank_sampah_admin_write" on public.bank_sampah
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "kategori_sampah_read_all" on public.kategori_sampah
  for select
  using (true);

create policy "kategori_sampah_admin_write" on public.kategori_sampah
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "harga_sampah_read_all" on public.harga_sampah
  for select
  using (true);

create policy "harga_sampah_admin_write" on public.harga_sampah
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "pengaturan_sistem_read_all" on public.pengaturan_sistem
  for select
  using (true);

create policy "pengaturan_sistem_admin_write" on public.pengaturan_sistem
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "konten_edukasi_read_all" on public.konten_edukasi
  for select
  using (true);

create policy "konten_edukasi_admin_write" on public.konten_edukasi
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ==============================================================================
-- POLICY: LAPORAN_SETORAN & DETAIL_SETORAN
-- ==============================================================================
-- Warga membaca laporannya sendiri; Petugas & Admin membaca semua laporan
create policy "laporan_select_policy" on public.laporan_setoran
  for select
  using (id_pengguna = auth.uid() or public.is_petugas_or_admin());

-- Warga membuat laporan untuk dirinya sendiri
create policy "laporan_insert_policy" on public.laporan_setoran
  for insert
  with check (id_pengguna = auth.uid());

-- Warga hanya dapat mengubah saat status 'menunggu'; Petugas/Admin dapat update status
create policy "laporan_update_policy" on public.laporan_setoran
  for update
  using (
    (id_pengguna = auth.uid() and status = 'menunggu') or
    public.is_petugas_or_admin()
  )
  with check (
    (id_pengguna = auth.uid() and status in ('menunggu', 'dibatalkan')) or
    public.is_petugas_or_admin()
  );

-- Detail Setoran
create policy "detail_select_policy" on public.detail_setoran
  for select
  using (
    exists (
      select 1 from public.laporan_setoran l
      where l.id = detail_setoran.id_laporan
        and (l.id_pengguna = auth.uid() or public.is_petugas_or_admin())
    )
  );

create policy "detail_insert_policy" on public.detail_setoran
  for insert
  with check (
    exists (
      select 1 from public.laporan_setoran l
      where l.id = detail_setoran.id_laporan
        and l.id_pengguna = auth.uid()
        and l.status = 'menunggu'
    )
    or public.is_petugas_or_admin()
  );

create policy "detail_update_policy" on public.detail_setoran
  for update
  using (
    exists (
      select 1 from public.laporan_setoran l
      where l.id = detail_setoran.id_laporan
        and (
          (l.id_pengguna = auth.uid() and l.status = 'menunggu') or
          public.is_petugas_or_admin()
        )
    )
  );

-- ==============================================================================
-- POLICY: PENIMBANGAN
-- ==============================================================================
-- Warga membaca penimbangan laporannya sendiri; Petugas & Admin membaca semua
create policy "penimbangan_select_policy" on public.penimbangan
  for select
  using (
    exists (
      select 1 from public.laporan_setoran l
      where l.id = penimbangan.id_laporan
        and (l.id_pengguna = auth.uid() or public.is_petugas_or_admin())
    )
  );

-- Penimbangan hanya boleh ditulis oleh Petugas atau Admin
create policy "penimbangan_insert_policy" on public.penimbangan
  for insert
  with check (public.is_petugas_or_admin());

create policy "penimbangan_update_policy" on public.penimbangan
  for update
  using (public.is_petugas_or_admin())
  with check (public.is_petugas_or_admin());

-- ==============================================================================
-- POLICY: PENARIKAN_SALDO
-- ==============================================================================
-- Warga membaca pengajuan miliknya; Petugas & Admin membaca semua antrean
create policy "penarikan_select_policy" on public.penarikan_saldo
  for select
  using (id_pengguna = auth.uid() or public.is_petugas_or_admin());

-- Warga membuat pengajuan penarikan miliknya (atau via RPC)
create policy "penarikan_insert_policy" on public.penarikan_saldo
  for insert
  with check (id_pengguna = auth.uid());

-- Petugas dan Admin memproses penarikan
create policy "penarikan_update_policy" on public.penarikan_saldo
  for update
  using (public.is_petugas_or_admin())
  with check (public.is_petugas_or_admin());

-- ==============================================================================
-- POLICY: SALDO_TRANSAKSI (MUTASI TABUNGAN)
-- ==============================================================================
-- Warga hanya membaca riwayat miliknya sendiri. Admin membaca agregat via fungsi/dashboard.
create policy "saldo_transaksi_select_policy" on public.saldo_transaksi
  for select
  using (id_pengguna = auth.uid() or public.is_admin());

-- Insert, Update, Delete langsung DILARANG untuk klien. Hanya boleh lewat SECURITY DEFINER RPC!
create policy "saldo_transaksi_no_direct_insert" on public.saldo_transaksi
  for insert
  with check (false);

create policy "saldo_transaksi_no_direct_update" on public.saldo_transaksi
  for update
  using (false);

create policy "saldo_transaksi_no_direct_delete" on public.saldo_transaksi
  for delete
  using (false);

-- ==============================================================================
-- POLICY: MITRA PENGEPUL & DISTRIBUSI (Hanya Admin)
-- ==============================================================================
create policy "mitra_pengepul_admin_only" on public.mitra_pengepul
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "distribusi_mitra_admin_only" on public.distribusi_mitra
  for all
  using (public.is_admin())
  with check (public.is_admin());
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
-- ==============================================================================
-- SIMPANWASTE - DATA SEED AWAL
-- Katalog 5 Kategori, Harga 3 Kondisi, Pengaturan, Bank Sampah, & Edukasi
-- ==============================================================================

-- 1. Pengaturan Sistem
insert into public.pengaturan_sistem (batas_minimum_pickup_kg)
values (5.00)
on conflict do nothing;

-- 2. Kategori Sampah (5 Kategori Terkonfirmasi)
insert into public.kategori_sampah (id, nama_kategori, deskripsi, is_aktif)
values
  ('11111111-1111-1111-1111-111111111101', 'Kaca', 'Botol kaca, toples, pecahan kaca bening atau berwarna', true),
  ('11111111-1111-1111-1111-111111111102', 'Plastik', 'Botol PET bening/warna, tutup botol, gelas plastik, plastik campuran', true),
  ('11111111-1111-1111-1111-111111111103', 'Besi', 'Kaleng makanan/minuman, besi pipa, rongsokan logam, seng, tembaga/alma', true),
  ('11111111-1111-1111-1111-111111111104', 'Kertas', 'Kardus cokelat, duplex, buku tulis, majalah, kertas arsip putih/bersih, koran', true),
  ('11111111-1111-1111-1111-111111111105', 'Kayu', 'Papan kayu bekas, balok kayu, sisa palet kayu tidak berlumut', true)
on conflict (nama_kategori) do nothing;

-- 3. Harga Sampah (Kombinasi 5 Kategori x 3 Kondisi)
insert into public.harga_sampah (id_kategori, kondisi, harga_per_kg)
values
  -- Kaca
  ('11111111-1111-1111-1111-111111111101', 'bersih', 800.00),
  ('11111111-1111-1111-1111-111111111101', 'kotor', 500.00),
  ('11111111-1111-1111-1111-111111111101', 'tercampur_air', 300.00),

  -- Plastik
  ('11111111-1111-1111-1111-111111111102', 'bersih', 3000.00),
  ('11111111-1111-1111-1111-111111111102', 'kotor', 2000.00),
  ('11111111-1111-1111-1111-111111111102', 'tercampur_air', 1200.00),

  -- Besi
  ('11111111-1111-1111-1111-111111111103', 'bersih', 4500.00),
  ('11111111-1111-1111-1111-111111111103', 'kotor', 3500.00),
  ('11111111-1111-1111-1111-111111111103', 'tercampur_air', 2500.00),

  -- Kertas
  ('11111111-1111-1111-1111-111111111104', 'bersih', 2000.00),
  ('11111111-1111-1111-1111-111111111104', 'kotor', 1500.00),
  ('11111111-1111-1111-1111-111111111104', 'tercampur_air', 1000.00),

  -- Kayu
  ('11111111-1111-1111-1111-111111111105', 'bersih', 600.00),
  ('11111111-1111-1111-1111-111111111105', 'kotor', 400.00),
  ('11111111-1111-1111-1111-111111111105', 'tercampur_air', 200.00)
on conflict (id_kategori, kondisi)
do update set harga_per_kg = excluded.harga_per_kg, updated_at = now();

-- 4. Bank Sampah (Mitra Utama & Lokasi Studi + Demo Palembang)
insert into public.bank_sampah (id, nama, alamat, latitude, longitude, jam_operasional, is_aktif, is_demo)
values
  (
    '22222222-2222-2222-2222-222222222201',
    'Bank Sampah Graha Pena Palembang',
    'Jl. Kol. H. Burlian No. 55, Karya Baru, Kec. Alang-Alang Lebar, Kota Palembang',
    -2.9463000,
    104.7391000,
    'Senin - Sabtu: 08.00 - 16.00 WIB',
    true,
    false
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Bank Sampah Berkah Ilir Barat (Demo)',
    'Jl. Demang Lebar Daun No. 12, Ilir Barat I, Kota Palembang',
    -2.9750000,
    104.7300000,
    'Senin - Jumat: 08.30 - 15.30 WIB',
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Bank Sampah Sukarami Mandiri (Demo)',
    'Jl. Sukabangun II No. 88, Sukarami, Kota Palembang',
    -2.9320000,
    104.7450000,
    'Selasa - Minggu: 09.00 - 16.00 WIB',
    true,
    true
  )
on conflict do nothing;

-- 5. Konten Edukasi (4 Topik Sesuai PRD EDU-01)
insert into public.konten_edukasi (judul, topik, urutan, isi)
values
  (
    'Pembuatan Kompos Mandiri dari Sampah Organik Rumah Tangga',
    'Kompos Organik',
    1,
    'Meskipun SIMPANWASTE berfokus pada konversi saldo untuk sampah anorganik terpilah, pemilahan di hulu dimulai dari dapur Anda. Sisihkan sisa sayur, kulit buah, dan dedaunan kering. Gunakan wadah komposter berventilasi dengan rasio 2 bagian bahan cokelat (daun kering/kardus tak berlapis) dan 1 bagian bahan hijau (sisa dapur) untuk menghasilkan pupuk kompos tanpa bau tak sedap.'
  ),
  (
    'Panduan Membersihkan & Mengeringkan Sampah Anorganik',
    'Pemilahan Anorganik',
    2,
    'Sampah anorganik dengan kondisi BERSIH memiliki nilai konversi rupiah tertinggi. Pastikan botol plastik dibilas dari sisa minuman, kaleng makanan dicuci bersih, dan kardus dijaga agar tidak basah terkena hujan atau genangan air. Sampah yang tercampur air akan dinilai lebih rendah karena beban kelembapan dan risiko penurunan mutu daur ulang.'
  ),
  (
    'Alur Penyetoran Sampah: Kapan Memilih Pickup vs Drop-off?',
    'Prosedur Setoran',
    3,
    'Layanan Pickup khusus melayani penjemputan langsung di lokasi warga dengan batas estimasi minimal 5 kg. Jika total sampah Anda di bawah 5 kg, sistem akan menyarankan metode Drop-off langsung ke Bank Sampah Graha Pena atau titik bank sampah terdekat. Pastikan Anda mengemas sampah secara terpilah sesuai kelompoknya.'
  ),
  (
    'Menuju Ekonomi Sirkular: Jejak Hilir Daur Ulang di Palembang',
    'Alur Hilir',
    4,
    'Sampah yang Anda setorkan ditimbang secara transparan oleh petugas dan langsung dicatat ke saldo tabungan. Selanjutnya, bank sampah mengelompokkan sampah terpilah untuk disalurkan ke mitra pengepul dan pabrik daur ulang resmi. Tiap kilogram sampah anorganik yang terselamatkan mengurangi beban TPA Sukawinatan Palembang.'
  )
on conflict do nothing;

-- 6. Mitra Pengepul Awal
insert into public.mitra_pengepul (nama, alamat, kontak, is_aktif)
values
  ('UD Daur Ulang Musi Indah', 'Jl. Soekarno Hatta No. 101, Palembang', '0812-7890-1234', true),
  ('CV Sriwijaya Logam Presisi', 'Kawasan Industri Gandus, Palembang', '0813-6789-5678', true)
on conflict do nothing;
