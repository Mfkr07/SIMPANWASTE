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
      "Sentra percontohan utama sistem SIMPANWASTE di Kota Palembang melalui kerja sama dengan Dinas Lingkungan Hidup dan Kebersihan (DLHK). Berfungsi sebagai pusat penimbangan digital terverifikasi, percontohan pengelolaan sampah anorganik berbasis pemilahan dari rumah tangga, serta sarana edukasi bagi warga.",
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
  {
    id: "berkah-ilir-barat",
    nama: "Bank Sampah Berkah Ilir Barat",
    is_utama: false,
    alamat: "Jl. Demang Lebar Daun No. 12, Kel. Demang Lebar Daun, Kec. Ilir Barat I, Kota Palembang",
    kecamatan: "Ilir Barat I",
    latitude: -2.975,
    longitude: 104.73,
    jam_operasional: "Senin – Jumat: 08.30 – 15.30 WIB",
    telepon: "0821-8890-1122",
    dukungan: "Binaan Dinas Lingkungan Hidup Kota Palembang",
    deskripsi:
      "Titik layanan aktif wilayah Ilir Barat I yang melayani setoran rutin warga perumahan dan perkantoran di sepanjang poros Demang Lebar Daun.",
    layanan: [
      "Drop-off Langsung di Lokasi",
      "Penimbangan Manual Terverifikasi",
      "Pencatatan Tabungan Warga Terpadu",
    ],
    kategori_diterima: ["Plastik", "Kertas", "Besi & Logam"],
    status: "Aktif Beroperasi",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=-2.975,104.73",
  },
  {
    id: "sukarami-mandiri",
    nama: "Bank Sampah Sukarami Mandiri",
    is_utama: false,
    alamat: "Jl. Sukabangun II No. 88, Kel. Sukajaya, Kec. Sukarami, Kota Palembang",
    kecamatan: "Sukarami",
    latitude: -2.932,
    longitude: 104.745,
    jam_operasional: "Selasa – Minggu: 09.00 – 16.00 WIB",
    telepon: "0813-7766-5544",
    dukungan: "Inisiatif Kolaboratif RW & DLHK Palembang",
    deskripsi:
      "Melayani warga kawasan Sukarami dan sekitarnya dengan fokus pengumpulan botol plastik, kardus belanja, dan kaleng konsumsi.",
    layanan: [
      "Drop-off Sampah Anorganik",
      "Jadwal Penimbangan Komunitas RT/RW",
      "Konversi Nilai Saldo Digital",
    ],
    kategori_diterima: ["Plastik", "Kertas", "Kaca", "Besi"],
    status: "Aktif Beroperasi",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=-2.932,104.745",
  },
  {
    id: "sejahtera-bukit-kecil",
    nama: "Bank Sampah Sejahtera Bukit Kecil",
    is_utama: false,
    alamat: "Jl. Merdeka No. 24, Talang Semut, Kec. Bukit Kecil, Kota Palembang",
    kecamatan: "Bukit Kecil",
    latitude: -2.9905,
    longitude: 104.7562,
    jam_operasional: "Senin – Sabtu: 08.00 – 15.00 WIB",
    telepon: "0819-2233-4455",
    dukungan: "Program Pemberdayaan Warga Kelurahan Talang Semut",
    deskripsi:
      "Beroperasi dekat pusat kota melayani sektor pertokoan, UMKM, dan perumahan di sekitar jalan protokol Merdeka.",
    layanan: [
      "Penerimaan Kardus & Kertas Arsip",
      "Drop-off Botol Minuman",
      "Verifikasi Kebersihan Sampah",
    ],
    kategori_diterima: ["Kertas", "Plastik", "Besi"],
    status: "Aktif Beroperasi",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=-2.9905,104.7562",
  },
  {
    id: "kalidoni-hijau",
    nama: "Bank Sampah Kalidoni Hijau",
    is_utama: false,
    alamat: "Jl. Mayor Zen No. 18, Sungai Selayur, Kec. Kalidoni, Kota Palembang",
    kecamatan: "Kalidoni",
    latitude: -2.9667,
    longitude: 104.8055,
    jam_operasional: "Senin – Jumat: 08.00 – 16.00 WIB",
    telepon: "0852-6677-8899",
    dukungan: "Binaan Pengelolaan Lingkungan Industri Kalidoni",
    deskripsi:
      "Pusat pengumpulan sampah anorganik di wilayah Palembang Timur dengan kapasitas tampung besar untuk logam dan plastik.",
    layanan: [
      "Drop-off Partai Besar & Rumah Tangga",
      "Penimbangan Cepat",
      "Tabungan Saldo Warga",
    ],
    kategori_diterima: ["Plastik", "Besi & Logam", "Kertas"],
    status: "Aktif Beroperasi",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=-2.9667,104.8055",
  },
  {
    id: "sako-bersemi",
    nama: "Bank Sampah Sako Bersemi",
    is_utama: false,
    alamat: "Jl. Sematang Borang No. 42, Sako Baru, Kec. Sako, Kota Palembang",
    kecamatan: "Sako",
    latitude: -2.928,
    longitude: 104.792,
    jam_operasional: "Senin – Sabtu: 08.00 – 15.00 WIB",
    telepon: "0812-9988-7766",
    dukungan: "Kelompok Bank Sampah Mandiri Kota Palembang",
    deskripsi:
      "Melayani pemukiman padat di Sako dengan sistem tabungan sampah berkala dan pemilahan plastik bernilai jual tinggi.",
    layanan: [
      "Penimbangan Komunitas Mingguan",
      "Tabungan Daur Ulang",
      "Edukasi Pemilahan Rumah Tangga",
    ],
    kategori_diterima: ["Plastik", "Kertas / Karton", "Kaleng"],
    status: "Aktif Beroperasi",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=-2.928,104.792",
  },
  {
    id: "jakabaring-bersih",
    nama: "Bank Sampah Jakabaring Bersih",
    is_utama: false,
    alamat: "Jl. Gubernur H. Bastari, Silaberanti, Seberang Ulu I, Kota Palembang",
    kecamatan: "Seberang Ulu I",
    latitude: -3.018,
    longitude: 104.789,
    jam_operasional: "Senin – Jumat: 08.00 – 16.00 WIB",
    telepon: "0813-1122-3344",
    dukungan: "Inisiatif Kawasan Olahraga & Pemukiman Jakabaring",
    deskripsi:
      "Titik strategis wilayah Seberang Ulu I yang mengumpulkan sampah anorganik dari acara olahraga, kampus, dan perumahan.",
    layanan: [
      "Drop-off Botol PET & Kaleng",
      "Pencatatan Setoran Warga",
      "Penyaluran ke Daur Ulang",
    ],
    kategori_diterima: ["Plastik", "Kertas", "Aluminium & Logam"],
    status: "Aktif Beroperasi",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=-3.018,104.789",
  },
  {
    id: "plaju-mandiri",
    nama: "Bank Sampah Plaju Mandiri",
    is_utama: false,
    alamat: "Jl. D.I. Panjaitan No. 70, Plaju Ilir, Kec. Plaju, Kota Palembang",
    kecamatan: "Plaju",
    latitude: -2.998,
    longitude: 104.793,
    jam_operasional: "Senin – Sabtu: 08.30 – 15.00 WIB",
    telepon: "0822-4455-6677",
    dukungan: "Binaan Lingkungan Bersih Plaju",
    deskripsi:
      "Sentra pemilahan sampah anorganik komunitas warga Plaju dengan program penukaran sampah menjadi saldo tabungan.",
    layanan: [
      "Drop-off Komunitas",
      "Timbang & Catat Saldo",
      "Koleksi Botol Kaca & Plastik",
    ],
    kategori_diterima: ["Plastik", "Kertas", "Kaca"],
    status: "Aktif Beroperasi",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=-2.998,104.793",
  },
];

