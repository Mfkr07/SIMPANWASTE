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
