// ==============================================================================
// SIMPANWASTE - TYPESCRIPT DATABASE & DOMAIN TYPES
// ==============================================================================

export type Peran = "warga" | "petugas" | "admin";
export type MetodeSetoran = "pickup" | "drop_off";
export type StatusLaporan = "menunggu" | "dalam_proses" | "selesai" | "dibatalkan";
export type KondisiSampah = "bersih" | "kotor" | "tercampur_air";
export type JenisTransaksi = "setoran" | "penarikan";
export type StatusPenarikan = "menunggu" | "selesai" | "ditolak";
export type TujuanPenarikan = "tarik_tabungan" | "potong_iuran";

export interface Profil {
  id: string; // uuid from auth.users
  nama: string;
  username: string;
  no_hp: string;
  alamat: string;
  peran: Peran;
  created_at: string;
}

export interface PinPengguna {
  id_pengguna: string;
  pin_hash: string;
  updated_at: string;
}

export interface BankSampah {
  id: string;
  nama: string;
  alamat: string;
  latitude: number | null;
  longitude: number | null;
  jam_operasional: string;
  is_aktif: boolean;
  is_demo: boolean;
  created_at: string;
}

export interface KategoriSampah {
  id: string;
  nama_kategori: string;
  deskripsi: string | null;
  is_aktif: boolean;
  created_at: string;
}

export interface HargaSampah {
  id: string;
  id_kategori: string;
  kondisi: KondisiSampah;
  harga_per_kg: number;
  updated_at: string;
}

export interface PengaturanSistem {
  id: string;
  batas_minimum_pickup_kg: number;
  updated_at: string;
}

export interface LaporanSetoran {
  id: string;
  id_pengguna: string;
  metode: MetodeSetoran;
  id_bank_sampah: string | null;
  latitude: number | null;
  longitude: number | null;
  estimasi_berat: number;
  status: StatusLaporan;
  tanggal_lapor: string;
}

export interface DetailSetoran {
  id: string;
  id_laporan: string;
  id_kategori: string;
  berat_aktual: number | null;
  kondisi: KondisiSampah | null;
  subtotal: number | null;
}

export interface Penimbangan {
  id: string;
  id_laporan: string;
  id_petugas: string;
  tanggal_timbang: string;
  total_berat: number;
  total_nilai: number;
}

export interface PenarikanSaldo {
  id: string;
  id_pengguna: string;
  jumlah: number;
  tujuan: TujuanPenarikan;
  status: StatusPenarikan;
  alasan_penolakan: string | null;
  tanggal_ajuan: string;
  id_petugas: string | null;
  tanggal_proses: string | null;
}

export interface SaldoTransaksi {
  id: string;
  id_pengguna: string;
  id_penimbangan: string | null;
  id_penarikan: string | null;
  jenis: JenisTransaksi;
  jumlah: number;
  tanggal: string;
  saldo: number;
}

export interface KontenEdukasi {
  id: string;
  judul: string;
  topik: string;
  isi: string;
  urutan: number;
  created_at: string;
}

export interface MitraPengepul {
  id: string;
  nama: string;
  alamat: string;
  kontak: string;
  is_aktif: boolean;
  created_at: string;
}

export interface DistribusiMitra {
  id: string;
  id_mitra: string;
  id_kategori: string;
  berat: number;
  tanggal: string;
  catatan: string | null;
}
