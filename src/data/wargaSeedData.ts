import {
  Leaf,
  Recycle,
  Truck,
  Boxes,
} from "lucide-react";

export type Role = "warga" | "petugas" | "admin";

export type WasteCondition =
  | "Sudah dipilah"
  | "Sudah dibersihkan"
  | "Tidak mudah didaur ulang"
  | "Belum dipilah dan dibersihkan";

export const wasteConditions: WasteCondition[] = [
  "Sudah dipilah",
  "Sudah dibersihkan",
  "Tidak mudah didaur ulang",
  "Belum dipilah dan dibersihkan",
];

export type TrackerStage =
  | "Request Terkirim"
  | "Petugas dalam Perjalanan"
  | "Petugas Memverifikasi"
  | "Poin Saldo Didapatkan";

export type Report = {
  id: string;
  citizen: string;
  phone: string;
  category: string;
  estimate: number;
  method: "Pickup" | "Drop-off";
  status: "Menunggu" | "Selesai";
  date: string;
  location: string;
  assigned: string;
  categoryWeights?: { category: string; estimate: number; conditions?: WasteCondition[] }[];
  weighingPhotoDrafts?: Record<
    string,
    {
      name: string;
      type: string;
      dataUrl: string;
    }
  >;
  trackerHistory?: { stage: TrackerStage; timestamp: string }[];
  verifiedItems?: {
    category: string;
    estimatedWeight: number;
    citizenConditions: WasteCondition[];
    actualWeight: number;
    verifiedCondition?: WasteCondition;
    verifiedConditions?: WasteCondition[];
    weighingPhoto?: {
      name: string;
      type: string;
      dataUrl: string;
    };
    price: number;
    subtotal: number;
  }[];
  actual?: number;
  value?: number;
};

export const trackerTimestamp = () =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date()) + " WIB";

export type UserProfile = {
  name: string;
  username: string;
  phone: string;
  address: string;
};

export const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const categoriesSeed = [
  {
    name: "Botol Plastik PET",
    desc: "Botol minuman bening, bersih dan kering",
    clean: 4500,
    dirty: 2800,
    prices: {
      "Sudah dipilah": 4500,
      "Sudah dibersihkan": 4500,
      "Tidak mudah didaur ulang": 2800,
      "Belum dipilah dan dibersihkan": 2800,
    } as Record<WasteCondition, number>,
  },
  {
    name: "Kardus",
    desc: "Kardus kering tanpa lapisan minyak",
    clean: 2800,
    dirty: 1500,
    prices: {
      "Sudah dipilah": 2800,
      "Sudah dibersihkan": 2800,
      "Tidak mudah didaur ulang": 1500,
      "Belum dipilah dan dibersihkan": 1500,
    } as Record<WasteCondition, number>,
  },
  {
    name: "Kaleng Aluminium",
    desc: "Kaleng minuman dan kemasan aluminium",
    clean: 12000,
    dirty: 8500,
    prices: {
      "Sudah dipilah": 12000,
      "Sudah dibersihkan": 12000,
      "Tidak mudah didaur ulang": 8500,
      "Belum dipilah dan dibersihkan": 8500,
    } as Record<WasteCondition, number>,
  },
  {
    name: "Kertas Campur",
    desc: "Kertas HVS, koran, dan majalah",
    clean: 2200,
    dirty: 1200,
    prices: {
      "Sudah dipilah": 2200,
      "Sudah dibersihkan": 2200,
      "Tidak mudah didaur ulang": 1200,
      "Belum dipilah dan dibersihkan": 1200,
    } as Record<WasteCondition, number>,
  },
  {
    name: "Plastik Campur",
    desc: "Kemasan plastik non-B3 yang sudah dipilah",
    clean: 1800,
    dirty: 900,
    prices: {
      "Sudah dipilah": 1800,
      "Sudah dibersihkan": 1800,
      "Tidak mudah didaur ulang": 900,
      "Belum dipilah dan dibersihkan": 900,
    } as Record<WasteCondition, number>,
  },
];

export const initialReports: Report[] = [
  {
    id: "SW-250319-025",
    citizen: "Ayu Lestari",
    phone: "0812 7788 2341",
    category: "Botol Plastik PET, Kardus",
    estimate: 5,
    method: "Pickup",
    status: "Menunggu",
    date: "19 Mar 2025",
    location: "Jl. Ki Merogan, Kertapati",
    assigned: "Rizky Pratama",
    categoryWeights: [
      { category: "Botol Plastik PET", estimate: 3, conditions: ["Sudah dipilah"] },
      { category: "Kardus", estimate: 2, conditions: ["Sudah dibersihkan"] },
    ],
    trackerHistory: [
      { stage: "Request Terkirim", timestamp: "19 Mar 2025, 08:30 WIB" },
      { stage: "Petugas dalam Perjalanan", timestamp: "19 Mar 2025, 09:15 WIB" },
    ],
  },
  {
    id: "SW-250318-024",
    citizen: "Ayu Lestari",
    phone: "0812 7788 2341",
    category: "Botol Plastik PET, Kardus, Kaleng Aluminium",
    estimate: 8,
    method: "Pickup",
    status: "Menunggu",
    date: "18 Mar 2025",
    location: "Jl. Ki Merogan, Kertapati",
    assigned: "Rizky Pratama",
    categoryWeights: [
      { category: "Botol Plastik PET", estimate: 3, conditions: ["Sudah dipilah"] },
      { category: "Kardus", estimate: 2, conditions: ["Sudah dipilah"] },
      { category: "Kaleng Aluminium", estimate: 3, conditions: ["Sudah dibersihkan"] },
    ],
    trackerHistory: [
      { stage: "Request Terkirim", timestamp: "18 Mar 2025, 10:00 WIB" },
    ],
  },
  {
    id: "SW-250316-019",
    citizen: "Budi Santoso",
    phone: "0813 6900 1122",
    category: "Kardus",
    estimate: 4,
    method: "Drop-off",
    status: "Menunggu",
    date: "16 Mar 2025",
    location: "Bank Sampah Graha Pena Palembang",
    assigned: "Rizky Pratama",
    categoryWeights: [
      { category: "Kardus", estimate: 4, conditions: ["Sudah dipilah"] },
    ],
    trackerHistory: [
      { stage: "Request Terkirim", timestamp: "16 Mar 2025, 14:10 WIB" },
    ],
  },
  {
    id: "SW-250312-011",
    citizen: "Ayu Lestari",
    phone: "0812 7788 2341",
    category: "Kaleng Aluminium",
    estimate: 3.5,
    method: "Drop-off",
    status: "Selesai",
    date: "12 Mar 2025",
    location: "Bank Sampah Graha Pena Palembang",
    assigned: "Rizky Pratama",
    actual: 3.2,
    value: 38400,
    categoryWeights: [
      { category: "Kaleng Aluminium", estimate: 3.5, conditions: ["Sudah dibersihkan"] },
    ],
    trackerHistory: [
      { stage: "Request Terkirim", timestamp: "12 Mar 2025, 09:00 WIB" },
      { stage: "Petugas Memverifikasi", timestamp: "12 Mar 2025, 10:20 WIB" },
      { stage: "Poin Saldo Didapatkan", timestamp: "12 Mar 2025, 11:00 WIB" },
    ],
  },
  {
    id: "SW-250308-006",
    citizen: "Siti Rahma",
    phone: "0852 6655 9012",
    category: "Kertas Campur",
    estimate: 7,
    method: "Pickup",
    status: "Selesai",
    date: "8 Mar 2025",
    location: "Jl. Mayor Zen, Kalidoni",
    assigned: "Dedi Irawan",
    actual: 6.4,
    value: 14080,
    categoryWeights: [
      { category: "Kertas Campur", estimate: 7, conditions: ["Sudah dipilah"] },
    ],
    trackerHistory: [
      { stage: "Request Terkirim", timestamp: "8 Mar 2025, 08:00 WIB" },
      { stage: "Petugas dalam Perjalanan", timestamp: "8 Mar 2025, 08:45 WIB" },
      { stage: "Petugas Memverifikasi", timestamp: "8 Mar 2025, 09:30 WIB" },
      { stage: "Poin Saldo Didapatkan", timestamp: "8 Mar 2025, 10:15 WIB" },
    ],
  },
];

export type WithdrawalRequest = {
  id: string;
  citizenId: string;
  citizenName: string;
  type: "Penarikan manual" | "Potong iuran bulanan";
  amount: number;
  description: string;
  submittedDate: string;
  status: "Menunggu" | "Selesai";
  processedDate?: string;
  processedBy?: string;
  proof?: {
    name: string;
    type: string;
    dataUrl: string;
  };
};

export const withdrawalRequestsSeed: WithdrawalRequest[] = [
  {
    id: "WD-018",
    citizenId: "ayu.lestari",
    citizenName: "Ayu Lestari",
    type: "Penarikan manual",
    amount: 75000,
    description: "Ambil tunai di Bank Sampah Graha Pena",
    submittedDate: "18 Mar 2025",
    status: "Menunggu",
  },
  {
    id: "WD-017",
    citizenId: "siti.rahma",
    citizenName: "Siti Rahma",
    type: "Potong iuran bulanan",
    amount: 25000,
    description: "Iuran sampah bulan Maret",
    submittedDate: "17 Mar 2025",
    status: "Menunggu",
  },
];

export const transactionsSeed = [
  { date: "12 Mar 2025", type: "Setoran", weight: "3,2 kg", value: 38400, balance: 184600 },
  { date: "28 Feb 2025", type: "Penarikan", weight: "—", value: -50000, balance: 146200 },
  { date: "20 Feb 2025", type: "Setoran", weight: "6,8 kg", value: 23800, balance: 196200 },
  { date: "4 Feb 2025", type: "Setoran", weight: "9,1 kg", value: 36400, balance: 172400 },
];

export const banks = [
  {
    name: "Bank Sampah Graha Pena Palembang",
    address: "Jl. Kol. H. Burlian No. 55, Alang-Alang Lebar",
    hours: "Sen–Sab, 08.00–16.00",
    x: 48,
    y: 36,
  },
  {
    name: "Bank Sampah Sejahtera",
    address: "Jl. Merdeka No. 24, Bukit Kecil",
    hours: "Sen–Sab, 08.00–15.00",
    x: 48,
    y: 36,
  },
  {
    name: "Bank Sampah Melati",
    address: "Jl. Demang Lebar Daun, Ilir Barat I",
    hours: "Sel–Min, 07.30–14.00",
    x: 26,
    y: 58,
  },
  {
    name: "Bank Sampah Kalidoni Hijau",
    address: "Jl. Mayor Zen No. 18, Kalidoni",
    hours: "Sen–Jum, 08.00–16.00",
    x: 73,
    y: 50,
  },
];

export const education = [
  {
    title: "Pengolahan Sampah Organik",
    label: "Kompos Rumah",
    desc: "Pelajari cara mengolah sisa sampah organik menjadi kompos mandiri di rumah.",
    tag: "Kompos rumah",
    icon: Leaf,
    color: "bg-emerald-50 text-emerald-700",
    surface: "bg-[#edf8ef]",
    image:
      "https://images.unsplash.com/photo-1576083983802-7ac0103c9d23?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "Compagnons / Unsplash",
    intro:
      "Sampah organik rumah tangga seperti sisa sayur, kulit buah, dan daun kering dapat dikelola secara mandiri agar tidak langsung berakhir di tempat pembuangan.",
    sections: [
      {
        heading: "Bahan yang dapat digunakan",
        body: "Gunakan sisa sayur dan buah, ampas kopi, kulit telur yang dihancurkan, serta daun kering. Hindari minyak, tulang besar, daging, dan bahan yang mengandung zat kimia.",
      },
      {
        heading: "Cara membuat kompos sederhana",
        body: "Siapkan wadah dengan sirkulasi udara. Susun bahan cokelat seperti daun kering, tambahkan bahan hijau dari sisa dapur, lalu tutup kembali dengan bahan kering. Aduk secara berkala dan jaga agar tetap lembap, bukan basah.",
      },
      {
        heading: "Tanda kompos siap digunakan",
        body: "Kompos matang memiliki warna cokelat gelap, tekstur remah, dan beraroma seperti tanah. Proses ini merupakan pengelolaan mandiri di rumah dan bukan layanan setoran organik SIMPANWASTE.",
      },
    ],
    note: "Layanan setoran SIMPANWASTE tetap difokuskan pada sampah anorganik non-B3.",
  },
  {
    title: "Membersihkan Sampah Anorganik",
    label: "Persiapan Setoran",
    desc: "Kenali cara membersihkan dan menyiapkan sampah anorganik sebelum disetorkan agar kualitasnya lebih baik.",
    tag: "5 menit baca",
    icon: Recycle,
    color: "bg-sky-50 text-sky-700",
    surface: "bg-[#eef7f6]",
    image:
      "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "Nick Fewings / Unsplash",
    intro:
      "Sampah anorganik yang bersih, kering, dan terpilah lebih mudah ditimbang serta memiliki kualitas yang lebih baik saat diterima bank sampah.",
    sections: [
      {
        heading: "Kosongkan dan bilas kemasan",
        body: "Pastikan botol, kaleng, dan kemasan tidak menyisakan cairan atau makanan. Bilas secukupnya tanpa menggunakan air secara berlebihan.",
      },
      {
        heading: "Keringkan sebelum disimpan",
        body: "Tiriskan kemasan hingga benar-benar kering untuk mencegah bau, jamur, dan kontaminasi pada kertas atau kardus yang disimpan bersama.",
      },
      {
        heading: "Pisahkan berdasarkan jenis",
        body: "Kelompokkan botol PET, plastik campur, kaleng aluminium, kardus, dan kertas pada wadah berbeda. Lepaskan bagian yang tidak sejenis jika mudah dilakukan.",
      },
    ],
    note: "Kondisi bersih atau kotor akan diperiksa petugas saat penimbangan manual.",
  },
  {
    title: "Tata Cara Penyetoran",
    label: "Pickup & Drop-off",
    desc: "Pelajari prosedur penyetoran sampah melalui metode pickup maupun drop-off.",
    tag: "Panduan setoran",
    icon: Truck,
    color: "bg-amber-50 text-amber-700",
    surface: "bg-[#f8f5ec]",
    image:
      "https://images.unsplash.com/photo-1758599669406-d5179ccefcb9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "Vitaly Gariev / Unsplash",
    intro:
      "SIMPANWASTE menyediakan dua metode penyetoran: penjemputan oleh petugas dan pengantaran langsung ke bank sampah aktif.",
    sections: [
      {
        heading: "Buat laporan setoran",
        body: "Pilih kategori sampah, masukkan estimasi berat, lalu tentukan metode penyetoran. Gunakan estimasi yang wajar agar petugas dapat mempersiapkan proses penerimaan.",
      },
      {
        heading: "Pilih pickup atau drop-off",
        body: "Pickup tersedia apabila estimasi berat memenuhi batas minimum yang ditetapkan Admin. Jika belum memenuhi batas, pilih drop-off dan tentukan bank sampah tujuan.",
      },
      {
        heading: "Serahkan untuk ditimbang",
        body: "Petugas akan memeriksa kondisi dan menimbang sampah secara manual. Nilai setoran dihitung berdasarkan berat aktual, kategori, kondisi, dan harga master yang berlaku.",
      },
    ],
    note: "Status laporan hanya menggunakan Menunggu dan Selesai.",
  },
  {
    title: "Alur Hilir Sampah",
    label: "Perjalanan Material",
    desc: "Kenali perjalanan sampah setelah dikumpulkan dan disalurkan kepada mitra pengepul.",
    tag: "Transparansi",
    icon: Boxes,
    color: "bg-violet-50 text-violet-700",
    surface: "bg-[#f1f4ef]",
    image:
      "https://images.unsplash.com/photo-1763315156830-07870b159121?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
    credit: "Ari Gardinier / Unsplash",
    intro:
      "Setelah diterima dan ditimbang, sampah anorganik dikumpulkan berdasarkan jenis sebelum didistribusikan kepada mitra pengepul.",
    sections: [
      {
        heading: "Pencatatan di bank sampah",
        body: "Hasil penimbangan dicatat sebagai transaksi setoran warga. Sistem menghitung nilainya dan memperbarui saldo secara otomatis tanpa pengeditan saldo manual oleh petugas.",
      },
      {
        heading: "Pengelompokan material",
        body: "Material yang telah diterima dikelompokkan menurut kategori agar penyimpanan dan distribusi berikutnya lebih teratur.",
      },
      {
        heading: "Distribusi kepada mitra",
        body: "Admin mencatat berat, kategori, tanggal distribusi, dan mitra pengepul. Data tersebut menjadi bagian dari statistik agregat pengelolaan sampah.",
      },
    ],
    note: "SIMPANWASTE mencatat distribusi secara administratif dan tidak mengintegrasikan proses industri mitra.",
  },
];

