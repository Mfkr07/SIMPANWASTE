export interface BankSampahItem {
  id: string;
  nama: string;
  alamat: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
  jam_operasional: string;
  is_utama: boolean;
  telepon: string;
  dukungan?: string;
  deskripsi: string;
  layanan: string[];
  kategori_diterima: string[];
  status: "Aktif Beroperasi";
  google_maps_url: string;
}

export const BANK_SAMPAH_PALEMBANG: BankSampahItem[] = [
  {
    id: "graha-pena",
    nama: "Bank Sampah Graha Pena Palembang",
    is_utama: true,
    alamat: "Jl. Kol. H. Burlian No. 55, Karya Baru, Kec. Alang-Alang Lebar, Kota Palembang 30151",
    kecamatan: "Alang-Alang Lebar",
    latitude: -2.9463,
    longitude: 104.7391,
    jam_operasional: "Senin – Sabtu: 08.00 – 16.00 WIB (Minggu Libur)",
    telepon: "(0711) 412-345 / 0812-7890-5500",
    dukungan: "Didukung Resmi oleh Pemerintah Kota Palembang & Dinas Lingkungan Hidup dan Kebersihan (DLHK) Kota Palembang",
    deskripsi:
      "Pusat operasional utama sistem SIMPANWASTE di Kota Palembang melalui kerja sama dengan Dinas Lingkungan Hidup dan Kebersihan (DLHK). Berfungsi sebagai pusat penimbangan digital terverifikasi, percontohan pengelolaan sampah anorganik berbasis pemilahan dari rumah tangga, serta sarana edukasi bagi warga.",
    layanan: [
      "Timbangan Digital Terverifikasi & Presisi",
      "Pencatatan Transaksi & Saldo Real-Time SIMPANWASTE",
      "Pencairan Saldo Tunai & Potong Iuran Sampah",
      "Layanan Pickup (Penjemputan Minimal 5 kg)",
      "Layanan Drop-Off Langsung di Lokasi",
      "Sentra Edukasi Pemilahan & Kompos Mandiri",
      "Penyaluran Resmi ke Pabrik Daur Ulang Berizin",
    ],
    kategori_diterima: [
      "Plastik (Botol PET, Gelas, Tutup, Campuran)",
      "Kertas (Kardus, Arsip, Duplex, Buku, Koran)",
      "Besi & Logam (Kaleng, Pipa, Seng, Tembaga/Alma)",
      "Kaca & Botol Beling",
      "Kayu & Palet Bersih",
    ],
    status: "Aktif Beroperasi",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=-2.9463,104.7391",
  },
];
