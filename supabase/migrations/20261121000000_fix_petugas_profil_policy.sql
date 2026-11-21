-- Migration: Izinkan Petugas dan Admin membaca data Profil nasabah (nama, no_hp, alamat) dan Mutasi Saldo
-- Masalah sebelumnya: Policy profil_select_policy dan saldo_transaksi_select_policy hanya mengizinkan auth.uid() = id or public.is_admin(),
-- sehingga saat akun Petugas membuka daftar tugas penjemputan atau verifikasi, data profil warga diblokir RLS menjadi NULL,
-- yang menyebabkan Nama Warga menjadi fallback "Warga" dan No. WhatsApp menjadi "Belum ada nomor".

-- 1. Berikan hak akses baca profil nasabah untuk Petugas & Admin
drop policy if exists "profil_select_policy" on public.profil;

create policy "profil_select_policy" on public.profil
  for select
  using (auth.uid() = id or public.is_petugas_or_admin());

-- 2. Berikan hak akses baca mutasi saldo nasabah untuk Petugas & Admin
drop policy if exists "saldo_transaksi_select_policy" on public.saldo_transaksi;

create policy "saldo_transaksi_select_policy" on public.saldo_transaksi
  for select
  using (id_pengguna = auth.uid() or public.is_petugas_or_admin());
