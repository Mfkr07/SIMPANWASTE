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
