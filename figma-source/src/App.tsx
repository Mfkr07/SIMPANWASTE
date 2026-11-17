import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  HandCoins,
  LayoutDashboard,
  Leaf,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  Recycle,
  Scale,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Truck,
  UploadCloud,
  UserCog,
  UserRound,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

type Role = "warga" | "petugas" | "admin";
type Page = string;
type WasteCondition =
  | "Sudah dipilah"
  | "Sudah dibersihkan"
  | "Tidak mudah didaur ulang"
  | "Belum dipilah dan dibersihkan";
type TrackerStage =
  | "Request Terkirim"
  | "Petugas dalam Perjalanan"
  | "Petugas Memverifikasi"
  | "Poin Saldo Didapatkan";
type Report = {
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
type WithdrawalRequest = {
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
type UserProfile = {
  name: string;
  username: string;
  phone: string;
  address: string;
};

const wasteConditions: WasteCondition[] = [
  "Sudah dipilah",
  "Sudah dibersihkan",
  "Tidak mudah didaur ulang",
  "Belum dipilah dan dibersihkan",
];

const trackerTimestamp = () =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date()) + " WIB";

const addTrackerStage = (
  report: Report,
  stage: TrackerStage,
  timestamp = trackerTimestamp(),
): Report => {
  const history = report.trackerHistory?.length
    ? report.trackerHistory
    : [{ stage: "Request Terkirim" as const, timestamp: report.date }];
  return history.some((entry) => entry.stage === stage)
    ? report.trackerHistory?.length
      ? report
      : { ...report, trackerHistory: history }
    : {
        ...report,
        trackerHistory: [...history, { stage, timestamp }],
      };
};

const readStoredState = <T,>(key: string, fallback: T): T => {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const categoriesSeed = [
  {
    name: "Botol Plastik PET",
    desc: "Botol minuman bening, bersih dan kering",
    prices: {
      "Sudah dipilah": 4500,
      "Sudah dibersihkan": 4500,
      "Tidak mudah didaur ulang": 2800,
      "Belum dipilah dan dibersihkan": 2800,
    } satisfies Record<WasteCondition, number>,
  },
  {
    name: "Kardus",
    desc: "Kardus kering tanpa lapisan minyak",
    prices: {
      "Sudah dipilah": 2800,
      "Sudah dibersihkan": 2800,
      "Tidak mudah didaur ulang": 1500,
      "Belum dipilah dan dibersihkan": 1500,
    } satisfies Record<WasteCondition, number>,
  },
  {
    name: "Kaleng Aluminium",
    desc: "Kaleng minuman dan kemasan aluminium",
    prices: {
      "Sudah dipilah": 12000,
      "Sudah dibersihkan": 12000,
      "Tidak mudah didaur ulang": 8500,
      "Belum dipilah dan dibersihkan": 8500,
    } satisfies Record<WasteCondition, number>,
  },
  {
    name: "Kertas Campur",
    desc: "Kertas HVS, koran, dan majalah",
    prices: {
      "Sudah dipilah": 2200,
      "Sudah dibersihkan": 2200,
      "Tidak mudah didaur ulang": 1200,
      "Belum dipilah dan dibersihkan": 1200,
    } satisfies Record<WasteCondition, number>,
  },
  {
    name: "Plastik Campur",
    desc: "Kemasan plastik non-B3 yang sudah dipilah",
    prices: {
      "Sudah dipilah": 1800,
      "Sudah dibersihkan": 1800,
      "Tidak mudah didaur ulang": 900,
      "Belum dipilah dan dibersihkan": 900,
    } satisfies Record<WasteCondition, number>,
  },
];

const initialReports: Report[] = [
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
      { category: "Botol Plastik PET", estimate: 3, conditions: [] },
      { category: "Kardus", estimate: 2, conditions: [] },
    ],
    trackerHistory: [
      { stage: "Request Terkirim", timestamp: "19 Mar 2025" },
      { stage: "Petugas dalam Perjalanan", timestamp: "19 Mar 2025" },
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
      { category: "Botol Plastik PET", estimate: 3, conditions: [] },
      { category: "Kardus", estimate: 2, conditions: [] },
      { category: "Kaleng Aluminium", estimate: 3, conditions: [] },
    ],
    trackerHistory: [{ stage: "Request Terkirim", timestamp: "18 Mar 2025" }],
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
    location: "Bank Sampah Sejahtera",
    assigned: "Rizky Pratama",
    trackerHistory: [{ stage: "Request Terkirim", timestamp: "16 Mar 2025" }],
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
    location: "Bank Sampah Melati",
    assigned: "Rizky Pratama",
    actual: 3.2,
    value: 38400,
    trackerHistory: [
      { stage: "Request Terkirim", timestamp: "12 Mar 2025" },
      { stage: "Petugas Memverifikasi", timestamp: "12 Mar 2025" },
      { stage: "Poin Saldo Didapatkan", timestamp: "12 Mar 2025" },
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
    trackerHistory: [
      { stage: "Request Terkirim", timestamp: "8 Mar 2025" },
      { stage: "Petugas dalam Perjalanan", timestamp: "8 Mar 2025" },
      { stage: "Petugas Memverifikasi", timestamp: "8 Mar 2025" },
      { stage: "Poin Saldo Didapatkan", timestamp: "8 Mar 2025" },
    ],
  },
];

const transactionsSeed = [
  { date: "12 Mar 2025", type: "Setoran", weight: "3,2 kg", value: 38400, balance: 184600 },
  { date: "28 Feb 2025", type: "Penarikan", weight: "—", value: -50000, balance: 146200 },
  { date: "20 Feb 2025", type: "Setoran", weight: "6,8 kg", value: 23800, balance: 196200 },
  { date: "4 Feb 2025", type: "Setoran", weight: "9,1 kg", value: 36400, balance: 172400 },
];

const withdrawalRequestsSeed: WithdrawalRequest[] = [
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

const banks = [
  {
    name: "Bank Sampah Sejahtera",
    address: "Jl. Merdeka No. 24, Bukit Kecil",
    hours: "Sen–Sab, 08.00–15.00",
  },
  {
    name: "Bank Sampah Melati",
    address: "Jl. Demang Lebar Daun, Ilir Barat I",
    hours: "Sel–Min, 07.30–14.00",
  },
  {
    name: "Bank Sampah Kalidoni Hijau",
    address: "Jl. Mayor Zen No. 18, Kalidoni",
    hours: "Sen–Jum, 08.00–16.00",
  },
];

const grahaPenaLocation = {
  name: "Bank Sampah Graha Pena Palembang",
  shortName: "Bank Sampah Graha Pena",
  address:
    "Jl. Kolonel H. Barlian KM.6,5 No.773, Srijaya, Kec. Alang-Alang Lebar, Kota Palembang, Sumatera Selatan 30961",
  landmark: "Bersebelahan dengan Taman Wisata Punti Kayu.",
  weekdaySchedule: "09.00–16.00 WIB",
  saturdaySchedule: "Kegiatan rutin pemilahan sampah",
};

const education = [
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

const nav: Record<Role, { label: string; page: string; icon: typeof Leaf }[]> = {
  warga: [
    { label: "Dashboard", page: "dashboard", icon: LayoutDashboard },
    { label: "Informasi & Edukasi", page: "edukasi", icon: BookOpen },
    { label: "Buat Laporan Setoran", page: "buat-laporan", icon: Plus },
    { label: "Riwayat Laporan", page: "riwayat", icon: ClipboardList },
    { label: "Maps Bank Sampah", page: "maps", icon: MapPin },
    { label: "Saldo & Transaksi", page: "saldo", icon: WalletCards },
    { label: "Penarikan Saldo", page: "penarikan", icon: HandCoins },
    { label: "Profil Saya", page: "profil", icon: UserRound },
  ],
  petugas: [
    { label: "Dashboard", page: "dashboard", icon: LayoutDashboard },
    { label: "Tugas Penjemputan", page: "tugas", icon: Truck },
    { label: "Verifikasi & Penimbangan", page: "verifikasi", icon: Scale },
    { label: "Profil Saya", page: "profil", icon: UserRound },
  ],
  admin: [
    { label: "Dashboard", page: "dashboard", icon: LayoutDashboard },
    { label: "Data Laporan Setoran", page: "laporan", icon: ClipboardList },
    { label: "Kelola Akun", page: "akun", icon: Users },
    { label: "Data Master", page: "master", icon: Settings2 },
    { label: "Distribusi ke Mitra", page: "distribusi", icon: PackageCheck },
    { label: "Permintaan Penarikan", page: "permintaan", icon: HandCoins },
  ],
};

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm ${className}`}
      aria-hidden="true"
    >
      <Recycle size={23} strokeWidth={2.35} />
    </span>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      {!compact && (
        <div>
          <div className="font-extrabold tracking-tight text-slate-900">
            SIMPAN<span className="text-green-700">WASTE</span>
          </div>
          <div className="text-[10px] font-semibold tracking-[.15em] text-slate-400">
            PALEMBANG PILOT
          </div>
        </div>
      )}
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-green-700 text-white hover:bg-green-800 shadow-sm",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "blue" | "slate" | "red";
}) {
  const tones = {
    green: "bg-green-50 text-green-700 ring-green-600/15",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/15",
    slate: "bg-slate-100 text-slate-600 ring-slate-500/10",
    red: "bg-red-50 text-red-700 ring-red-600/15",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,.04)] ${className}`}
    >
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function PageTitle({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Leaf;
  tone?: "green" | "blue" | "amber" | "violet";
}) {
  const tones = {
    green: "bg-green-50 text-green-700",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <Card className="group transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          <p className="mt-2 text-xs font-medium text-slate-500">{detail}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
    </Card>
  );
}

function LandingIllustration() {
  return (
    <svg
      viewBox="0 0 720 590"
      role="img"
      aria-labelledby="landing-illustration-title landing-illustration-desc"
      className="h-auto w-full"
    >
      <title id="landing-illustration-title">Ilustrasi pemilahan sampah anorganik</title>
      <desc id="landing-illustration-desc">
        Warga memilah botol, kertas, dan kaleng ke dalam wadah daur ulang.
      </desc>
      <path
        d="M77 463C95 365 141 318 224 291C310 263 334 164 433 144C539 123 638 200 654 308C671 423 596 504 482 522C356 542 61 550 77 463Z"
        fill="#DCFCE7"
      />
      <circle cx="569" cy="132" r="55" fill="#BBF7D0" />
      <path d="M570 86v92M524 132h92" stroke="#86EFAC" strokeWidth="2" opacity=".8" />
      <path d="M130 482h477" stroke="#166534" strokeWidth="4" strokeLinecap="round" />

      <g transform="translate(375 260)">
        <path d="M25 46h178l-13 190H38L25 46Z" fill="#15803D" />
        <path d="M16 27h197l-7 34H23l-7-34Z" fill="#166534" />
        <rect x="78" width="74" height="34" rx="15" fill="#14532D" />
        <circle cx="78" cy="240" r="12" fill="#1E293B" />
        <circle cx="158" cy="240" r="12" fill="#1E293B" />
        <Recycle
          x={73}
          y={99}
          width={82}
          height={82}
          color="white"
          strokeWidth={2.15}
          aria-label="Simbol daur ulang"
        />
      </g>

      <g transform="translate(143 159)">
        <circle cx="94" cy="48" r="39" fill="#F3C9A9" />
        <path
          d="M57 46C57 8 82-5 107 2c21 5 34 25 27 48-13-13-25-22-45-23-7 13-18 20-32 19Z"
          fill="#1E293B"
        />
        <path
          d="M65 102c27-17 59-13 79 8 20 22 25 67 22 106l-89 2c-12-43-34-87-12-116Z"
          fill="#166534"
        />
        <path d="M79 116c19 18 42 18 62-1l7 67H72l7-66Z" fill="#22C55E" opacity=".45" />
        <path d="M79 214 54 323h42l29-83 18 83h43l-20-110-87 1Z" fill="#334155" />
        <path d="M55 323h43v15H45c-8-7-4-13 10-15ZM143 323h43l11 15h-52l-2-15Z" fill="#1E293B" />
        <path
          d="M68 121c-29 35-31 86-8 104 19 15 61-5 92-25"
          fill="none"
          stroke="#F3C9A9"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path
          d="M155 199c17-9 31-10 40-3"
          fill="none"
          stroke="#F3C9A9"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path d="m183 164 18 5-8 38-20-5 10-38Z" fill="#60A5FA" />
        <path d="m185 155 16 4-3 12-16-4 3-12Z" fill="#2563EB" />
      </g>

      <g transform="translate(72 367)">
        <path d="M0 21h113l-9 104H12L0 21Z" fill="#F59E0B" />
        <path d="M-5 8h123v24H-5V8Z" fill="#D97706" />
        <path d="M43 47h28v51H43z" fill="#FEF3C7" opacity=".8" />
        <path d="M47 42h20v11H47z" fill="#92400E" />
      </g>

      <g transform="translate(560 369)">
        <path d="M0 21h98l-8 104H11L0 21Z" fill="#0EA5E9" />
        <path d="M-5 8h108v24H-5V8Z" fill="#0284C7" />
        <path d="M42 45h18v53H42z" fill="#E0F2FE" opacity=".85" />
        <path d="M39 39h24v12H39z" fill="#075985" />
      </g>

      <g fill="#16A34A">
        <path d="M91 146c-36-4-54-27-58-68 38 3 59 24 58 68Z" />
        <path d="M92 146c4-41 25-63 64-66-2 39-24 62-64 66Z" opacity=".75" />
        <path d="M618 281c-31-4-47-24-50-58 33 3 51 21 50 58Z" />
      </g>
      <path
        d="M91 144 51 99M93 145l41-43M618 280l-34-36"
        stroke="#14532D"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g transform="translate(289 102)">
        <path d="M17 0h34l5 16-8 8 9 71H10l8-71-7-8 6-16Z" fill="#38BDF8" />
        <path d="M20 29h29l3 43H16l4-43Z" fill="#BAE6FD" />
        <path d="M20 0h28v11H20z" fill="#0369A1" />
      </g>
    </svg>
  );
}

function LandingPage({ navigate }: { navigate: (path: string) => void }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedLandingLocation, setSelectedLandingLocation] = useState("graha-pena");
  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );
    const elements = document.querySelectorAll("[data-reveal]");
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const publicNav = [
    ["Beranda", "/"],
    ["Alur Penyetoran", "/alur-penyetoran"],
    ["Impact Kami", "/impact-kami"],
    ["About Us", "/about-us"],
  ];
  const openWhatsApp = () =>
    window.alert(
      "Nomor WhatsApp utama belum tersedia. Silakan lengkapi data kontak terverifikasi.",
    );
  const landingLocations = [
    {
      id: "graha-pena",
      name: grahaPenaLocation.name,
      address: grahaPenaLocation.address,
      hours: `Senin–Jumat: ${grahaPenaLocation.weekdaySchedule}`,
      saturday: `Sabtu: ${grahaPenaLocation.saturdaySchedule}`,
      landmark: grahaPenaLocation.landmark,
      partner: true,
    },
    ...banks.map((bank, index) => ({
      ...bank,
      id: `referensi-${index}`,
      address: `${bank.address}, Palembang, Sumatera Selatan`,
      saturday: "",
      landmark: "",
      partner: false,
    })),
  ];
  const activeLandingLocation =
    landingLocations.find((location) => location.id === selectedLandingLocation) ||
    landingLocations[0];
  const activeLandingAddress = encodeURIComponent(activeLandingLocation.address);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => navigate("/")} aria-label="Kembali ke beranda">
            <Logo />
          </button>
          <nav className="hidden items-center gap-7 lg:flex">
            {publicNav.map(([label, path]) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="text-sm font-semibold text-slate-600 transition hover:text-green-700"
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Masuk
            </Button>
            <Button onClick={openWhatsApp}>Setor Sekarang</Button>
          </div>
          <button
            onClick={() => setMobileMenu((open) => !open)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <div
          className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
            mobileMenu ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="space-y-1 px-5 py-4">
            {publicNav.map(([label, path]) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700"
              >
                {label}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Button variant="secondary" onClick={() => navigate("/login")}>
                Masuk
              </Button>
              <Button onClick={openWhatsApp}>Setor Sekarang</Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section id="beranda" className="relative scroll-mt-20 overflow-hidden bg-[#f7fbf7]">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[.92fr_1.08fr] lg:px-8 lg:py-20">
            <div className="landing-intro">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-700 shadow-sm">
                <Leaf size={15} /> Sistem pengelolaan sampah berbasis pemilahan
              </div>
              <h1 className="mt-7 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-[-.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                Ubah Sampah Jadi <span className="text-green-700">Tabungan.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Bank Sampah Graha Pena, binaan Sumatera Ekspres, Palembang.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={openWhatsApp} className="px-6 py-3">
                  Setor via WhatsApp <ArrowRight size={18} />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/alur-penyetoran")}
                  className="px-6 py-3"
                >
                  Lihat Cara Setor <ArrowRight size={18} />
                </Button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 rounded-2xl border border-green-100 bg-white/80 px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm">
                <span className="flex items-center gap-2">
                  <Clock3 size={16} className="text-green-600" /> Senin–Jumat 09.00–16.00
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-green-600" /> Palembang
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={16} className="text-green-600" /> WhatsApp belum tersedia
                </span>
              </div>
            </div>
            <div className="landing-illustration relative mx-auto w-full max-w-[680px]">
              <div className="absolute inset-x-[12%] bottom-[6%] h-20 rounded-full bg-green-900/10 blur-2xl" />
              <LandingIllustration />
              <div className="absolute left-0 top-[22%] rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Recycle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">Setoran tercatat</p>
                    <p className="text-sm font-extrabold text-slate-900">+8,4 kg</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-[12%] right-0 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
                    <Scale size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">Proses terverifikasi</p>
                    <p className="text-sm font-extrabold text-slate-900">Timbang manual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
                Program Tabungan
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                Sampah terpilah, manfaat lebih terarah.
              </h2>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Tabungan Sampah", "Nilai setoran tersimpan sebagai saldo nasabah.", WalletCards],
                ["Pendidikan", "Tabungan sampah dapat mendukung kebutuhan pendidikan.", BookOpen],
                ["Kurban", "Akumulasi tabungan membantu perencanaan ibadah kurban.", HandCoins],
                ["Umroh", "Tabungan jangka panjang dapat diarahkan untuk rencana umroh.", Leaf],
              ].map(([title, description, Icon]) => {
                const ProgramIcon = Icon as typeof Leaf;
                return (
                  <div
                    key={String(title)}
                    className="rounded-2xl border border-green-100 bg-[#f3f8f5] p-5"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-100 text-green-700">
                      <ProgramIcon size={20} />
                    </div>
                    <h3 className="mt-5 font-extrabold text-slate-900">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{description as string}</p>
                    <p className="mt-4 text-[10px] font-semibold text-amber-700">
                      Contoh nilai manfaat menunggu data terverifikasi.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
                  Gambaran sistem
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                  Dampak yang dapat dipantau
                </h2>
              </div>
              <p className="text-xs font-medium text-amber-700">
                Statistik berikut merupakan data demonstrasi.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["12,8 ton", "Total sampah terkumpul", Scale],
                ["1.240+", "Jumlah setoran warga", ClipboardCheck],
                ["8 lokasi", "Bank sampah aktif", Building2],
              ].map(([value, label, Icon]) => {
                const StatIcon = Icon as typeof Leaf;
                return (
                  <div
                    key={String(label)}
                    data-reveal
                    className="reveal-card rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-100 text-green-700">
                      <StatIcon size={21} />
                    </div>
                    <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
                      {value as string}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">{label as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="tentang" className="scroll-mt-20 bg-white py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:px-8">
            <div
              data-reveal
              className="reveal-card order-2 relative mx-auto w-full max-w-2xl lg:order-1"
            >
              <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-green-100/80 sm:-bottom-8 sm:-left-8 sm:h-44 sm:w-44" />
              <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border border-green-200 sm:-right-8 sm:-top-8 sm:h-32 sm:w-32" />
              <figure className="relative overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-[0_24px_70px_rgba(15,23,42,.12)]">
                <img
                  src="https://images.unsplash.com/photo-1654169695107-f5dfb47b9188?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200"
                  alt="Seseorang memilah material daur ulang ke dalam wadah di rumah"
                  className="aspect-[4/5] w-full object-cover sm:aspect-[6/5] lg:aspect-[4/5]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur">
                      <Leaf size={18} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-green-100">
                        Kebiasaan berkelanjutan
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        Pemilahan dimulai dari lingkungan terdekat
                      </p>
                    </div>
                  </div>
                </figcaption>
              </figure>
              <p className="mt-4 text-right text-[10px] font-medium text-slate-400">
                Foto: Vladislav Smigelski / Unsplash
              </p>
            </div>

            <div data-reveal className="reveal-card order-1 lg:order-2">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-10 bg-green-600" />
                <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
                  TENTANG SIMPANWASTE
                </p>
              </div>
              <h2 className="max-w-xl text-3xl font-extrabold leading-[1.13] tracking-[-.035em] text-slate-950 sm:text-4xl lg:text-[2.75rem]">
                Membangun kebiasaan memilah sampah melalui pengelolaan yang{" "}
                <span className="text-green-700">lebih terstruktur.</span>
              </h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600">
                SIMPANWASTE merupakan sistem informasi berbasis web yang dirancang untuk membantu
                masyarakat dalam mengelola penyetoran sampah anorganik secara lebih mudah dan
                transparan.
              </p>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                Melalui satu platform, warga dapat memperoleh informasi pemilahan sampah, mengetahui
                lokasi bank sampah aktif, serta memantau hasil penyetoran mereka. Sistem ini juga
                membantu petugas dalam pencatatan penimbangan dan membantu pengelola memantau data
                sampah terkumpul.
              </p>
              <div className="mt-9 flex max-w-xl items-center gap-5 border-t border-slate-200 pt-6">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-50 text-green-700">
                  <Recycle size={20} />
                </div>
                <p className="text-sm font-semibold leading-6 text-slate-700">
                  Mendukung pengelolaan sampah anorganik berbasis pemilahan di Kota Palembang.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="scroll-mt-20 bg-slate-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
                Fitur utama
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Dirancang untuk mendukung alur yang nyata
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Fitur yang relevan bagi warga dalam mengelola setoran sampah anorganik.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "Informasi & Edukasi Pemilahan",
                  "Panduan membersihkan, memilah, dan menyiapkan sampah sebelum disetor.",
                  BookOpen,
                  "bg-emerald-50 text-emerald-700",
                ],
                [
                  "Pelaporan Setoran Sampah",
                  "Buat laporan pickup atau drop-off sesuai estimasi berat sampah.",
                  ClipboardList,
                  "bg-sky-50 text-sky-700",
                ],
                [
                  "Maps Bank Sampah",
                  "Temukan lokasi, alamat, dan jam operasional bank sampah yang tersedia.",
                  MapPin,
                  "bg-amber-50 text-amber-700",
                ],
                [
                  "Saldo & Riwayat Transaksi",
                  "Pantau hasil setoran dan transaksi pribadi dengan perlindungan PIN.",
                  WalletCards,
                  "bg-violet-50 text-violet-700",
                ],
              ].map(([title, desc, Icon, tone]) => {
                const FeatureIcon = Icon as typeof Leaf;
                return (
                  <article
                    key={String(title)}
                    data-reveal
                    className="reveal-card group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
                  >
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
                      <FeatureIcon size={22} />
                    </div>
                    <h3 className="mt-6 text-lg font-extrabold leading-snug text-slate-900">
                      {title as string}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{desc as string}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="alur" className="scroll-mt-20 bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
                Alur penyetoran
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Empat langkah yang sederhana dan transparan
              </h2>
            </div>
            <div className="relative mt-14 grid gap-5 md:grid-cols-4">
              <div className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-green-200 md:block" />
              {[
                [
                  "01",
                  "Pilah Sampah dari Rumah",
                  "Pisahkan sampah anorganik berdasarkan jenisnya.",
                  Recycle,
                ],
                [
                  "02",
                  "Buat Laporan Setoran",
                  "Pilih pickup atau drop-off sesuai ketentuan berat.",
                  ClipboardList,
                ],
                [
                  "03",
                  "Verifikasi & Penimbangan",
                  "Petugas memeriksa kondisi dan menimbang secara manual.",
                  Scale,
                ],
                [
                  "04",
                  "Saldo Diperbarui",
                  "Sistem menghitung nilai dan memperbarui saldo warga.",
                  WalletCards,
                ],
              ].map(([number, title, desc, Icon]) => {
                const StepIcon = Icon as typeof Leaf;
                return (
                  <div
                    key={String(number)}
                    data-reveal
                    className="reveal-card relative flex gap-4 md:block"
                  >
                    <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 border-white bg-green-700 text-white shadow-md">
                      <StepIcon size={21} />
                    </div>
                    <div className="md:mt-6">
                      <p className="text-xs font-extrabold text-green-700">
                        LANGKAH {number as string}
                      </p>
                      <h3 className="mt-2 font-extrabold text-slate-900">{title as string}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{desc as string}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="lokasi" className="scroll-mt-20 bg-[#f3f8f3] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
                Maps Bank Sampah
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Temukan lokasi penyetoran di Palembang
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Graha Pena merupakan mitra kerja sama utama SIMPANWASTE. Lokasi lainnya tetap
                ditampilkan sebagai referensi bank sampah berdasarkan data demonstrasi aplikasi.
              </p>
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-[.82fr_1.18fr]">
              <div data-reveal className="reveal-card">
                <div className="space-y-3">
                  {landingLocations.map((location) => (
                    <article
                      key={location.id}
                      className={
                        location.partner
                          ? "rounded-2xl border-2 border-green-600 bg-green-50 p-5 shadow-[0_10px_30px_rgba(22,101,52,.09)]"
                          : "rounded-2xl border border-slate-200 bg-white p-4"
                      }
                    >
                      <div className="flex gap-3">
                        <div
                          className={`grid shrink-0 place-items-center rounded-xl ${
                            location.partner
                              ? "h-11 w-11 bg-green-800 text-white"
                              : "h-10 w-10 bg-green-50 text-green-600"
                          }`}
                        >
                          <MapPin size={location.partner ? 21 : 18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900">
                              {location.name}
                            </h3>
                            {location.partner && <Badge tone="green">Mitra SIMPANWASTE</Badge>}
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {location.address}
                          </p>
                          {location.landmark && (
                            <p className="mt-1 text-xs font-semibold text-slate-600">
                              {location.landmark}
                            </p>
                          )}
                          <div className="mt-3 space-y-1.5 text-xs font-bold text-green-700">
                            <p className="flex items-start gap-1.5">
                              <Clock3 className="mt-0.5 shrink-0" size={13} /> {location.hours}
                            </p>
                            {location.saturday && (
                              <p className="flex items-start gap-1.5">
                                <CalendarDays className="mt-0.5 shrink-0" size={13} />{" "}
                                {location.saturday}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedLandingLocation(location.id)}
                            className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-green-700 transition hover:text-green-900"
                          >
                            Lihat Detail <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div
                data-reveal
                className="reveal-card self-start rounded-[2rem] border border-white bg-white p-3 shadow-xl lg:sticky lg:top-24"
              >
                <div className="relative overflow-hidden rounded-[1.4rem] bg-slate-100">
                  <iframe
                    key={activeLandingLocation.id}
                    title={`Peta ${activeLandingLocation.name}`}
                    src={`https://www.google.com/maps?q=${activeLandingAddress}&z=15&output=embed`}
                    className="h-[580px] w-full border-0"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  <div
                    className="absolute left-4 right-4 top-4 flex flex-wrap gap-2"
                    aria-label="Pilih lokasi bank sampah"
                  >
                    {landingLocations.map((location) => {
                      const active = location.id === activeLandingLocation.id;
                      return (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => setSelectedLandingLocation(location.id)}
                          aria-label={`Pusatkan peta ke ${location.name}`}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-extrabold shadow-md backdrop-blur transition ${
                            location.partner
                              ? `border-green-900 bg-green-800 text-white ring-4 ring-green-300/50 ${
                                  active ? "scale-105" : ""
                                }`
                              : `border-green-100 bg-green-50/95 text-green-700 ${
                                  active ? "ring-2 ring-green-400" : "hover:bg-white"
                                }`
                          }`}
                        >
                          <MapPin size={location.partner ? 17 : 14} />
                          <span className="hidden sm:inline">
                            {location.partner
                              ? "Graha Pena"
                              : location.name.replace("Bank Sampah ", "")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p
                          className={`text-[10px] font-extrabold uppercase tracking-[.12em] ${
                            activeLandingLocation.partner ? "text-green-700" : "text-slate-500"
                          }`}
                        >
                          {activeLandingLocation.partner
                            ? "Mitra Kerja Sama SIMPANWASTE"
                            : "Lokasi Bank Sampah Lainnya"}
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-slate-900">
                          {activeLandingLocation.name}
                        </p>
                        <p className="mt-1 max-w-lg text-[11px] leading-5 text-slate-500">
                          {activeLandingLocation.address}
                        </p>
                        <p className="mt-1 max-w-lg text-[11px] font-semibold leading-5 text-slate-600">
                          {activeLandingLocation.hours}
                          {activeLandingLocation.saturday
                            ? ` · ${activeLandingLocation.saturday}`
                            : ""}
                        </p>
                        {activeLandingLocation.landmark && (
                          <p className="mt-1 max-w-lg text-[11px] leading-5 text-slate-500">
                            {activeLandingLocation.landmark}
                          </p>
                        )}
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${activeLandingAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-green-700 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-green-800"
                      >
                        Buka Maps <ArrowRight size={14} />
                      </a>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-green-800 ring-2 ring-green-200" />
                        Mitra SIMPANWASTE
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-green-300" />
                        Lokasi Bank Sampah Lainnya
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20 sm:py-28 lg:px-8">
          <div
            data-reveal
            className="reveal-card relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#086337] text-white shadow-[0_30px_80px_rgba(8,99,55,.2)] lg:grid-cols-[1.08fr_.92fr]"
          >
            <div className="absolute -left-32 -top-36 h-96 w-96 rounded-full border-[68px] border-white/[.045]" />
            <div className="absolute -bottom-44 left-[36%] h-96 w-96 rounded-full border-[58px] border-green-300/[.07]" />

            <div className="relative z-10 flex flex-col justify-center px-7 py-14 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-green-300" />
                <p className="text-xs font-extrabold tracking-[.17em] text-green-200">
                  BERSAMA UNTUK LINGKUNGAN
                </p>
              </div>
              <h2 className="mt-6 max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-[-.035em] sm:text-4xl lg:text-5xl">
                Mulai Langkah Kecil, Ciptakan{" "}
                <span className="text-green-300">Perubahan Besar.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-green-50/85">
                Bergabung dengan SIMPANWASTE dan mulai kelola sampah anorganik secara lebih
                terstruktur. Setiap langkah pemilahan berarti bagi lingkungan yang lebih baik.
              </p>
              <div className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="visible inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-200 px-6 py-3 text-sm font-extrabold text-green-950 opacity-100 shadow-[0_12px_30px_rgba(0,0,0,.12)] transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[.98] sm:w-auto"
                >
                  <span className="visible opacity-100">Daftar Sekarang</span>
                  <ArrowRight size={18} className="shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 px-2 py-3 text-sm font-semibold text-green-100 transition hover:text-white sm:justify-start"
                >
                  Sudah punya akun?{" "}
                  <span className="font-extrabold underline decoration-green-300/60 underline-offset-4">
                    Masuk
                  </span>
                </button>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden bg-green-950/10 sm:min-h-[500px] lg:min-h-full">
              <svg
                viewBox="0 0 620 560"
                role="img"
                aria-labelledby="cta-visual-title cta-visual-desc"
                className="absolute inset-0 h-full w-full"
              >
                <title id="cta-visual-title">Komposisi material daur ulang</title>
                <desc id="cta-visual-desc">
                  Botol plastik, kardus, kertas, daun, dan simbol daur ulang.
                </desc>
                <path
                  d="M107 113C171 46 306 41 397 74C505 113 579 223 554 334C525 464 390 524 254 502C130 482 34 390 50 265C57 203 67 155 107 113Z"
                  fill="#0B7544"
                />
                <circle cx="458" cy="123" r="108" fill="#22C55E" opacity=".13" />
                <circle
                  cx="458"
                  cy="123"
                  r="74"
                  fill="none"
                  stroke="#86EFAC"
                  strokeWidth="2"
                  opacity=".24"
                />

                <g transform="translate(296 206) rotate(8)">
                  <path
                    d="M44 0h62l9 28-13 17 16 158c2 20-13 37-33 37H62c-20 0-35-17-33-37L45 45 34 28 44 0Z"
                    fill="#DDFCE8"
                  />
                  <path d="M45 0h61v24H45z" fill="#86EFAC" />
                  <path d="M38 83h70l7 74H31l7-74Z" fill="#4ADE80" opacity=".55" />
                  <path
                    d="M52 115c11-17 35-17 46 0M49 138c15 19 38 19 52 0"
                    fill="none"
                    stroke="#08713F"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </g>

                <g transform="translate(103 273) rotate(-8)">
                  <path d="M0 37 100 0l92 45-98 43L0 37Z" fill="#FDE68A" />
                  <path d="m0 37 94 51v116L0 149V37Z" fill="#D6A64E" />
                  <path d="m94 88 98-43v111l-98 48V88Z" fill="#E9BC65" />
                  <path d="m53 18 93 45" stroke="#92400E" strokeWidth="5" opacity=".35" />
                  <path
                    d="M28 104h42M28 120h31"
                    stroke="#FFF7D1"
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity=".75"
                  />
                </g>

                <g transform="translate(338 389) rotate(-10)">
                  <rect width="151" height="104" rx="8" fill="#F8FAFC" />
                  <rect x="16" y="18" width="83" height="8" rx="4" fill="#86EFAC" />
                  <rect x="16" y="38" width="117" height="6" rx="3" fill="#CBD5E1" />
                  <rect x="16" y="54" width="100" height="6" rx="3" fill="#CBD5E1" />
                  <rect x="16" y="70" width="71" height="6" rx="3" fill="#CBD5E1" />
                </g>

                <g
                  fill="none"
                  stroke="#BBF7D0"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity=".9"
                >
                  <path d="M213 126c30-28 74-39 116-28" />
                  <path d="m318 73 28 30-39 17" />
                  <path d="M479 275c16 36 13 78-8 111" />
                  <path d="m500 383-34 22-10-39" />
                  <path d="M235 454c-41-7-78-30-98-65" />
                  <path d="m112 400 16-40 35 24" />
                </g>

                <g fill="#4ADE80">
                  <path d="M103 182c-35-5-55-29-57-70 39 5 59 28 57 70Z" />
                  <path d="M104 182c6-39 28-59 67-59-5 38-27 58-67 59Z" fill="#86EFAC" />
                  <path d="M525 425c-29-4-45-24-47-57 32 3 49 22 47 57Z" />
                  <path d="M526 425c4-31 21-48 52-49-3 31-21 48-52 49Z" fill="#86EFAC" />
                </g>
                <path
                  d="M104 181 67 137M105 181l40-37M526 424l-31-35M527 424l31-29"
                  stroke="#D1FAE5"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter navigate={navigate} />
    </div>
  );
}

type PublicInfoPageName = "alur" | "impact" | "about";

function PublicInfoPage({
  page,
  navigate,
}: {
  page: PublicInfoPageName;
  navigate: (path: string) => void;
}) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navItems = [
    ["Beranda", "/"],
    ["Alur Penyetoran", "/alur-penyetoran"],
    ["Impact Kami", "/impact-kami"],
    ["About Us", "/about-us"],
  ];
  const openWhatsApp = () =>
    window.alert(
      "Nomor WhatsApp utama belum tersedia. Silakan lengkapi data kontak terverifikasi.",
    );
  const encodedGrahaAddress = encodeURIComponent(grahaPenaLocation.address);

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => navigate("/")} aria-label="Kembali ke beranda">
            <Logo />
          </button>
          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map(([label, path]) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`text-sm font-semibold transition ${
                  (page === "alur" && path === "/alur-penyetoran") ||
                  (page === "impact" && path === "/impact-kami") ||
                  (page === "about" && path === "/about-us")
                    ? "text-green-700"
                    : "text-slate-600 hover:text-green-700"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Masuk
            </Button>
            <Button onClick={openWhatsApp}>Setor Sekarang</Button>
          </div>
          <button
            onClick={() => setMobileMenu((current) => !current)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
            aria-label="Buka navigasi"
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
            {navItems.map(([label, path]) => (
              <button
                key={path}
                onClick={() => {
                  setMobileMenu(false);
                  navigate(path);
                }}
                className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-green-50"
              >
                {label}
              </button>
            ))}
            <Button onClick={openWhatsApp} className="mt-3 w-full">
              Setor Sekarang
            </Button>
          </div>
        )}
      </header>

      <main>
        {page === "alur" && (
          <>
            <PublicPageHero
              eyebrow="ALUR PENYETORAN"
              title="Dari rumah hingga menjadi tabungan."
              description="Ikuti tahapan sederhana untuk memilah, menyetor, menimbang, dan mencatat nilai sampah di Bank Sampah Graha Pena Palembang."
              icon={Recycle}
            />
            <section className="px-5 py-16 sm:py-20 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <div className="grid gap-5 md:grid-cols-5">
                  {[
                    ["01", "Daftar Nasabah", "Lengkapi data diri sebagai nasabah.", UserRound],
                    ["02", "Pilah di Rumah", "Pisahkan sampah bersih dan kering.", Recycle],
                    [
                      "03",
                      "Antar atau Jemput",
                      "Drop-off ke Graha Pena atau ajukan pickup.",
                      Truck,
                    ],
                    ["04", "Ditimbang", "Petugas memverifikasi dan menimbang manual.", Scale],
                    ["05", "Saldo Masuk", "Nilai setoran tercatat sebagai saldo.", WalletCards],
                  ].map(([number, title, desc, Icon]) => {
                    const StepIcon = Icon as typeof Leaf;
                    return (
                      <div
                        key={String(number)}
                        className="relative rounded-2xl bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-green-700">
                            {number as string}
                          </span>
                          <StepIcon size={20} className="text-green-700" />
                        </div>
                        <h3 className="mt-5 font-extrabold text-slate-900">{title as string}</h3>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{desc as string}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-2">
                  <InfoSection title="Syarat Menjadi Nasabah" icon={UserRound}>
                    <ul className="space-y-3 text-sm leading-6 text-slate-600">
                      <li>Data diri atau identitas yang dapat diverifikasi.</li>
                      <li>
                        Kategori nasabah: pribadi, sekolah, komunitas, perusahaan, atau instansi.
                      </li>
                      <li>Informasi biaya pendaftaran belum tersedia.</li>
                    </ul>
                  </InfoSection>
                  <InfoSection title="Cara Memilah" icon={Recycle}>
                    <ul className="space-y-3 text-sm leading-6 text-slate-600">
                      <li>Sampah wajib bersih, kering, dan tidak mengandung sisa cairan.</li>
                      <li>Pisahkan material per jenis sebelum diserahkan.</li>
                      <li>Ketentuan pelepasan label belum tersedia dalam data operasional.</li>
                    </ul>
                  </InfoSection>
                </div>

                <section className="mt-12">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[.14em] text-green-700">
                        Data Demonstrasi
                      </p>
                      <h2 className="mt-2 text-2xl font-extrabold">Jenis Sampah & Harga</h2>
                    </div>
                    <Badge tone="amber">Bukan harga operasional terkonfirmasi</Badge>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                      ["Kertas", "Kardus Rp2.800/kg · Kertas campur Rp2.200/kg"],
                      ["Plastik", "PET Rp4.500/kg · Plastik campur Rp1.800/kg"],
                      ["Logam", "Kaleng aluminium Rp12.000/kg"],
                      ["Kaca", "Harga terverifikasi belum tersedia"],
                      ["Lainnya", "Minyak jelantah: data belum tersedia"],
                    ].map(([group, info]) => (
                      <div key={group} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="font-extrabold text-green-800">{group}</h3>
                        <p className="mt-3 text-xs leading-5 text-slate-500">{info}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
                    <h3 className="text-sm font-extrabold text-red-800">Tidak diterima</h3>
                    <p className="mt-2 text-sm leading-6 text-red-700">
                      Sampah B3, medis, material berukuran besar, dan layanan pengumpulan sampah
                      organik.
                    </p>
                  </div>
                </section>

                <div className="mt-12 grid gap-6 lg:grid-cols-3">
                  <InfoSection title="Minimal & Saldo" icon={WalletCards}>
                    <p className="text-sm leading-6 text-slate-600">
                      Minimum pickup demo: 5 kg. Saldo dapat dilihat setelah login dan penarikan
                      diproses manual oleh petugas.
                    </p>
                  </InfoSection>
                  <InfoSection title="Layanan Jemput" icon={Truck}>
                    <p className="text-sm leading-6 text-slate-600">
                      Batas minimum mengikuti konfigurasi sistem. Area jangkauan terverifikasi belum
                      tersedia.
                    </p>
                  </InfoSection>
                  <InfoSection title="Jadwal Setor" icon={CalendarDays}>
                    <p className="text-sm leading-6 text-slate-600">
                      Senin–Jumat {grahaPenaLocation.weekdaySchedule}. Sabtu:{" "}
                      {grahaPenaLocation.saturdaySchedule}.
                    </p>
                  </InfoSection>
                </div>
              </div>
            </section>

            <section className="bg-white px-5 py-16 sm:py-20 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <div className="max-w-2xl">
                  <p className="text-xs font-extrabold uppercase tracking-[.14em] text-green-700">
                    Lokasi & Maps
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold">Lokasi operasional</h2>
                </div>
                <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <iframe
                      title="Peta Sekretariat Graha Pena"
                      src={`https://www.google.com/maps?q=${encodedGrahaAddress}&z=16&output=embed`}
                      className="h-[480px] w-full border-0"
                      allowFullScreen
                    />
                  </div>
                  <div className="space-y-4">
                    <LocationInfoCard
                      title="Sekretariat Graha Pena"
                      address={grahaPenaLocation.address}
                      description="Lokasi penyetoran yang terintegrasi dengan SIMPANWASTE."
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodedGrahaAddress}`}
                    />
                    <LocationInfoCard
                      title="Gudang Talang Betutu"
                      address="Alamat dan titik peta terverifikasi belum tersedia."
                      description="Disebut berada di belakang bandara lama; fungsi lokasi menunggu konfirmasi."
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === "impact" && <ImpactPublicPage />}
        {page === "about" && <AboutPublicPage navigate={navigate} />}
      </main>

      <PublicFooter navigate={navigate} />
    </div>
  );
}

function PublicPageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Leaf;
}) {
  return (
    <section className="relative overflow-hidden bg-[#eaf6ed] px-5 py-16 sm:py-24 lg:px-8">
      <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[56px] border-green-600/[.06]" />
      <div className="relative mx-auto flex max-w-7xl items-center gap-6">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-green-700 text-white shadow-lg">
          <Icon size={26} />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.15em] text-green-700">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-.04em] text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{description}</p>
        </div>
      </div>
    </section>
  );
}

function InfoSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Leaf;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
          <Icon size={19} />
        </div>
        <h2 className="font-extrabold text-slate-900">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function LocationInfoCard({
  title,
  address,
  description,
  href,
}: {
  title: string;
  address: string;
  description: string;
  href?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#f7faf8] p-5">
      <MapPin className="text-green-700" size={21} />
      <h3 className="mt-4 font-extrabold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-500">{address}</p>
      <p className="mt-3 text-xs leading-5 text-slate-600">{description}</p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-green-700"
        >
          Petunjuk Arah <ArrowRight size={14} />
        </a>
      )}
    </div>
  );
}

function ImpactPublicPage() {
  const monthlyWaste = [620, 710, 680, 820, 910, 870, 1020, 960, 1110, 1180, 1240, 1360];
  const maxWaste = Math.max(...monthlyWaste);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return (
    <>
      <PublicPageHero
        eyebrow="IMPACT KAMI"
        title="Dampak yang tumbuh dari kebiasaan memilah."
        description="Ringkasan berikut menggunakan data demonstrasi sampai angka operasional terverifikasi tersedia."
        icon={BarChart3}
      />
      <section className="px-5 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1.240+", "Nasabah"],
              ["18", "Mitra"],
              ["12.840 kg", "Sampah terkelola"],
              ["Rp48,6 jt", "Dibagikan ke nasabah"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-green-100 bg-white p-6">
                <p className="text-3xl font-extrabold text-green-800">{value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-semibold text-amber-700">
            Data demonstrasi · terakhir diperbarui Desember 2025
          </p>

          <Card className="mt-8 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-extrabold">Total Sampah Terkumpul dalam 1 Tahun</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Bank Sampah Graha Pena · kilogram per bulan · data demonstrasi
                </p>
              </div>
              <Badge tone="green">Total 11.480 kg</Badge>
            </div>
            <div className="mt-8 flex h-72 items-end gap-2 sm:gap-4">
              {monthlyWaste.map((value, index) => (
                <div key={months[index]} className="flex h-full flex-1 flex-col justify-end">
                  <div
                    className="group relative rounded-t-lg bg-green-600 transition hover:bg-green-700"
                    style={{ height: `${(value / maxWaste) * 100}%` }}
                  >
                    <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 text-[10px] font-bold text-green-800 group-hover:block">
                      {value}
                    </span>
                  </div>
                  <p className="mt-2 text-center text-[9px] font-semibold text-slate-400 sm:text-[10px]">
                    {months[index]}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <InfoSection title="Konversi Dampak" icon={Truck}>
              <p className="text-sm leading-7 text-slate-600">
                Konversi truk sampah dan emisi CO₂ menunggu metodologi serta data terverifikasi.
              </p>
            </InfoSection>
            <InfoSection title="Mitra" icon={Building2}>
              <div className="flex flex-wrap gap-2">
                {[
                  "Sumatera Ekspres",
                  "DLH Palembang",
                  "Disdik",
                  "PTPN I Regional 7",
                  "PHM Hotels",
                ].map((partner) => (
                  <span
                    key={partner}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"
                  >
                    {partner}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[10px] text-amber-700">
                Daftar usulan; status kerja sama perlu dikonfirmasi.
              </p>
            </InfoSection>
          </div>

          <section className="mt-12">
            <h2 className="text-2xl font-extrabold">Cerita, Berita & Galeri</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {["Testimoni nasabah", "Berita terbaru", "Galeri kegiatan"].map((title) => (
                <div
                  key={title}
                  className="rounded-2xl border border-dashed border-slate-300 p-8 text-center"
                >
                  <FileText className="mx-auto text-slate-300" />
                  <h3 className="mt-4 font-extrabold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Konten terverifikasi belum tersedia.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

function AboutPublicPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <>
      <PublicPageHero
        eyebrow="ABOUT US"
        title="Gerakan lokal untuk pengelolaan sampah yang lebih terstruktur."
        description="Bank Sampah Graha Pena merupakan inisiatif di Palembang yang mendorong pemilahan, pencatatan setoran, dan kolaborasi lintas komunitas."
        icon={Leaf}
      />
      <section className="px-5 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <InfoSection title="Visi" icon={Eye}>
              <p className="text-sm leading-7 text-slate-600">
                Mendorong kebiasaan memilah dan pengelolaan sampah anorganik yang memberi manfaat
                bagi masyarakat dan lingkungan.
              </p>
            </InfoSection>
            <InfoSection title="Misi" icon={CheckCircle2}>
              <ol className="space-y-3 text-sm leading-6 text-slate-600">
                <li>1. Memperluas edukasi pemilahan dari sumber.</li>
                <li>2. Menyelenggarakan pencatatan setoran yang transparan.</li>
                <li>3. Mengembangkan kemitraan sekolah, komunitas, dan instansi.</li>
                <li>4. Mendukung distribusi material daur ulang yang lebih tertata.</li>
              </ol>
            </InfoSection>
          </div>

          <section className="mt-12">
            <h2 className="text-2xl font-extrabold">Layanan Kerja Sama</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Produk Daur Ulang", Recycle],
                ["Narasumber & Fasilitator", Users],
                ["CSR / TJSL", Building2],
                ["Pendampingan Unit & Sekolah", BookOpen],
              ].map(([title, Icon]) => {
                const ServiceIcon = Icon as typeof Leaf;
                return (
                  <div
                    key={String(title)}
                    className="rounded-2xl border border-green-100 bg-white p-5"
                  >
                    <ServiceIcon className="text-green-700" size={21} />
                    <h3 className="mt-5 font-extrabold">{title as string}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Detail layanan menunggu informasi terverifikasi.
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  window.alert("Kontak kerja sama belum tersedia. Silakan lengkapi data kontak.")
                }
              >
                Ajukan Kerja Sama
              </Button>
              <Button variant="secondary" disabled>
                Company Profile belum tersedia
              </Button>
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <InfoSection title="Pengurus" icon={Users}>
              <p className="text-sm leading-7 text-slate-600">
                Nama, jabatan, dan foto pengurus terverifikasi belum tersedia.
              </p>
            </InfoSection>
            <InfoSection title="Regulasi" icon={FileText}>
              <div className="space-y-2">
                {[
                  "Regulasi pengelolaan sampah",
                  "Kebijakan bank sampah",
                  "Pedoman operasional",
                ].map((item) => (
                  <details key={item} className="rounded-xl bg-slate-50 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-bold">{item}</summary>
                    <p className="mt-2 text-xs text-slate-500">
                      Dokumen terverifikasi belum tersedia.
                    </p>
                  </details>
                ))}
              </div>
            </InfoSection>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-extrabold">FAQ</h2>
            <div className="mt-5 space-y-3">
              {[
                [
                  "Apakah harus menjadi anggota terlebih dahulu?",
                  "Ya, data diri diperlukan agar setoran dan saldo tercatat pada akun yang tepat.",
                ],
                [
                  "Berapa minimal setoran?",
                  "Tidak ada minimum Drop-off pada prototipe. Minimum pickup demo adalah 5 kg.",
                ],
                [
                  "Kapan saldo bisa dicairkan?",
                  "Permintaan penarikan dicatat melalui sistem dan diproses manual oleh petugas.",
                ],
                [
                  "Bisakah sekolah atau kantor menjadi mitra?",
                  "Kategori sekolah, komunitas, perusahaan, dan instansi termasuk dalam usulan nasabah/mitra.",
                ],
                [
                  "Apakah ada layanan jemput?",
                  "Pickup tersedia jika estimasi berat memenuhi batas minimum; area jangkauan belum terverifikasi.",
                ],
              ].map(([question, answer]) => (
                <details
                  key={question}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
                >
                  <summary className="cursor-pointer font-bold text-slate-800">{question}</summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-[2rem] bg-green-800 p-8 text-white sm:p-12">
            <h2 className="text-3xl font-extrabold">Siap menabung sampah?</h2>
            <p className="mt-3 text-green-100">Mulai pilah dari rumah dan setor ke Graha Pena.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => window.alert("Nomor WhatsApp utama belum tersedia.")}
                className="bg-white text-green-800 hover:bg-green-50"
              >
                WhatsApp
              </Button>
              <Button variant="secondary" onClick={() => navigate("/alur-penyetoran")}>
                Petunjuk Arah
              </Button>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

function PublicFooter({ navigate }: { navigate: (path: string) => void }) {
  return (
    <footer className="bg-[#052e25] text-green-50/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark className="bg-green-600" />
            <div>
              <p className="font-extrabold text-white">SIMPANWASTE</p>
              <p className="text-[10px] font-bold tracking-[.14em] text-green-300">
                GRAHA PENA PALEMBANG
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7">
            Bank Sampah Graha Pena · Sistem pengelolaan sampah berbasis pemilahan.
          </p>
        </div>
        <div>
          <p className="font-extrabold text-green-300">Lokasi</p>
          <p className="mt-4 text-xs leading-6">{grahaPenaLocation.address}</p>
          <p className="mt-3 text-xs leading-6">
            Gudang Talang Betutu: alamat terverifikasi belum tersedia.
          </p>
        </div>
        <div>
          <p className="font-extrabold text-green-300">Kontak</p>
          <p className="mt-4 text-xs leading-6">WhatsApp setoran: belum tersedia</p>
          <p className="text-xs leading-6">WhatsApp kerja sama: belum tersedia</p>
          <p className="text-xs leading-6">Kontak lainnya: belum tersedia</p>
          <p className="mt-2 text-xs leading-6">Email & Instagram: belum tersedia</p>
        </div>
        <div>
          <p className="font-extrabold text-green-300">Tautan</p>
          <div className="mt-4 space-y-2 text-xs">
            <button onClick={() => navigate("/alur-penyetoran")} className="block hover:text-white">
              Jenis Sampah
            </button>
            <button onClick={() => navigate("/impact-kami")} className="block hover:text-white">
              Berita & Impact
            </button>
            <button onClick={() => navigate("/login")} className="block hover:text-white">
              Cek Saldo / Login Anggota
            </button>
            <button onClick={() => navigate("/login")} className="block hover:text-white">
              Login Pengurus
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-green-50/40">
        © 2025 SIMPANWASTE. Prototype sistem informasi.
      </div>
    </footer>
  );
}

function Login({
  onLogin,
  onRegister,
  onHome,
}: {
  onLogin: (role: Role) => void;
  onRegister: () => void;
  onHome: () => void;
}) {
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<Role>("warga");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!form.get("username") || !form.get("password"))
      return setError("Username dan password wajib diisi.");
    setError("");
    setLoading(true);
    setTimeout(() => onLogin(role), 550);
  };
  return (
    <div className="min-h-screen bg-[#f5f8f5] lg:grid lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-[#14532d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[70px] border-white/5" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border-[60px] border-emerald-400/10" />
        <button onClick={onHome} className="relative flex items-center gap-3 text-left">
          <BrandMark className="h-11 w-11 bg-green-700 ring-1 ring-white/30" />
          <div>
            <p className="text-xl font-extrabold">SIMPANWASTE</p>
            <p className="text-xs tracking-[.16em] text-green-200">KOTA PALEMBANG</p>
          </div>
        </button>
        <div className="relative max-w-xl">
          <Badge tone="green">Sistem pengelolaan sampah terpadu</Badge>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight">
            Pilah hari ini,
            <br />
            hijaukan masa depan.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-green-100">
            Kelola setoran sampah anorganik, pantau tabungan, dan terhubung dengan bank sampah
            terverifikasi dalam satu layanan.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["12,8 ton", "Sampah terkelola"],
              ["1.240+", "Setoran warga"],
              ["8", "Bank sampah"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-xl font-extrabold">{v}</p>
                <p className="mt-1 text-xs text-green-100">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-green-200">
          Data pada prototipe ini merupakan data demonstrasi.
        </p>
      </section>
      <main className="flex min-h-screen items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <Logo />
          </div>
          <p className="text-sm font-bold text-green-700">Selamat datang kembali</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Masuk ke akun Anda
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pilih peran demo lalu masukkan data untuk menjelajahi SIMPANWASTE.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1.5">
            {(["warga", "petugas", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-lg px-2 py-2.5 text-sm font-bold capitalize transition ${role === r ? "bg-white text-green-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {r}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Username">
              <input
                name="username"
                defaultValue={
                  role === "warga" ? "ayu.lestari" : role === "petugas" ? "rizky.p" : "admin.simpan"
                }
                className="input"
                placeholder="Masukkan username"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  name="password"
                  defaultValue="demo1234"
                  type={show ? "text" : "password"}
                  className="input pr-12"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label="Tampilkan password"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </Field>
            {error && (
              <div className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                <XCircle size={18} />
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? (
                "Memeriksa akun..."
              ) : (
                <>
                  Masuk ke SIMPANWASTE <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun warga?{" "}
            <button onClick={onRegister} className="font-bold text-green-700 hover:underline">
              Daftar sekarang
            </button>
          </p>
          <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            <strong>Akun demo:</strong> Anda dapat masuk menggunakan data yang sudah terisi untuk
            setiap peran.
          </div>
        </div>
      </main>
    </div>
  );
}

function Register({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    address: "",
    password: "",
    confirmation: "",
    pin: "",
  });

  const existingUsernames = ["ayu.lestari", "budi.s", "rizky.p", "admin.simpan"];
  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateFirstStep = () => {
    const nextErrors: Record<string, string> = {};
    const normalizedUsername = form.username.trim().toLowerCase();
    const normalizedPhone = form.phone.replace(/\D/g, "");
    if (!form.name.trim()) nextErrors.name = "Nama lengkap wajib diisi.";
    if (!normalizedUsername) nextErrors.username = "Username wajib diisi.";
    else if (!/^[a-z0-9._]{4,20}$/.test(normalizedUsername))
      nextErrors.username = "Gunakan 4–20 karakter: huruf kecil, angka, titik, atau garis bawah.";
    else if (existingUsernames.includes(normalizedUsername))
      nextErrors.username = "Username sudah digunakan. Silakan pilih username lain.";
    if (!normalizedPhone) nextErrors.phone = "Nomor telepon wajib diisi.";
    else if (!/^08\d{8,11}$/.test(normalizedPhone))
      nextErrors.phone = "Gunakan nomor Indonesia yang valid, diawali 08.";
    if (!form.address.trim()) nextErrors.address = "Alamat lengkap wajib diisi.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateSecondStep = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.password) nextErrors.password = "Password wajib diisi.";
    else if (form.password.length < 8)
      nextErrors.password = "Password harus terdiri dari minimal 8 karakter.";
    if (!form.confirmation) nextErrors.confirmation = "Konfirmasi password wajib diisi.";
    else if (form.confirmation !== form.password)
      nextErrors.confirmation = "Konfirmasi password tidak sesuai.";
    if (!form.pin) nextErrors.pin = "PIN keamanan wajib diisi.";
    else if (!/^\d{6}$/.test(form.pin)) nextErrors.pin = "PIN harus terdiri dari tepat 6 angka.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const continueToSecurity = () => {
    if (validateFirstStep()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateSecondStep()) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      window.setTimeout(onBack, 1400);
    }, 750);
  };

  const inputClass = (field: string) =>
    `input bg-slate-50/70 py-3 ${errors[field] ? "border-red-400 bg-red-50/30 ring-2 ring-red-100 focus:border-red-400" : "hover:border-slate-300"}`;

  const progress = [
    {
      number: "01",
      label: "DATA DIRI",
      desc: "Lengkapi informasi pribadi untuk membuat akun.",
    },
    {
      number: "02",
      label: "KEAMANAN AKUN",
      desc: "Buat password dan PIN untuk melindungi akun serta saldo tabungan.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f1f5f2] px-4 py-5 sm:px-6 sm:py-8 lg:grid lg:place-items-center lg:px-8 lg:py-10">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-green-200/35 blur-3xl" />
      <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1150px] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_28px_90px_rgba(15,23,42,.13)] lg:min-h-[720px] lg:grid-cols-[.36fr_.64fr]">
        <aside className="relative overflow-hidden bg-[#166534] px-6 py-7 text-white sm:px-8 sm:py-9 lg:flex lg:flex-col lg:px-10 lg:py-11">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[48px] border-white/5" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border-[52px] border-green-300/10" />
          <Recycle className="absolute bottom-8 right-8 hidden text-white/5 lg:block" size={112} />

          <div className="relative flex items-center gap-3">
            <BrandMark className="h-11 w-11 bg-green-700 ring-1 ring-white/30" />
            <div>
              <p className="font-extrabold tracking-tight">SIMPANWASTE</p>
              <p className="text-[10px] font-bold tracking-[.16em] text-green-200">
                PALEMBANG PILOT
              </p>
            </div>
          </div>

          <div className="relative mt-8 hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-green-300">
              Registrasi Warga
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.18] tracking-tight">
              Mulai perjalananmu menuju lingkungan yang lebih bersih.
            </h1>
            <p className="mt-5 text-sm leading-7 text-green-100">
              Buat akun dan bergabung bersama gerakan pemilahan sampah melalui SIMPANWASTE.
            </p>
          </div>

          <div className="relative mt-7 lg:mt-auto">
            <div className="grid grid-cols-2 gap-3 lg:block lg:space-y-0">
              {progress.map((item, index) => {
                const active = step === index + 1;
                const complete = step > index + 1;
                return (
                  <div
                    key={item.number}
                    className="relative flex gap-3 lg:gap-4 lg:pb-10 last:lg:pb-0"
                  >
                    {index === 0 && (
                      <span className="absolute left-[17px] top-9 hidden h-[calc(100%-18px)] w-px bg-white/20 lg:block" />
                    )}
                    <div
                      className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-extrabold transition ${
                        active
                          ? "border-white bg-white text-green-800 shadow-lg"
                          : complete
                            ? "border-green-300 bg-green-300 text-green-950"
                            : "border-white/30 bg-white/10 text-green-100"
                      }`}
                    >
                      {complete ? <Check size={15} strokeWidth={3} /> : item.number}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-[10px] font-extrabold tracking-[.12em] ${
                          active ? "text-white" : "text-green-200"
                        }`}
                      >
                        STEP {item.number} — {item.label}
                      </p>
                      <p className="mt-1.5 hidden text-xs leading-5 text-green-100 sm:block">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-11">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-green-700"
            >
              <ArrowLeft size={15} /> Kembali ke login
            </button>
            <span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-green-700">
              Khusus Warga
            </span>
          </div>

          <div className="mt-8">
            <p className="text-xs font-extrabold uppercase tracking-[.15em] text-green-700">
              Langkah {step} dari 2
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              Daftar sebagai Warga
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Lengkapi informasi berikut untuk membuat akun SIMPANWASTE.
            </p>
          </div>

          {step === 1 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama lengkap
                </span>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass("name")}
                  placeholder="Contoh: Ayu Lestari"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.name}</p>
                )}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Username unik
                </span>
                <input
                  value={form.username}
                  onChange={(e) => update("username", e.target.value.toLowerCase())}
                  className={inputClass("username")}
                  placeholder="contoh.username"
                  autoCapitalize="none"
                />
                {errors.username ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.username}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Huruf kecil, angka, titik, atau garis bawah.
                  </p>
                )}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nomor telepon
                </span>
                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/[^\d\s-]/g, ""))}
                    className={`${inputClass("phone")} pl-10`}
                    placeholder="08xx xxxx xxxx"
                    inputMode="tel"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.phone}</p>
                )}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Alamat lengkap
                </span>
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className={`${inputClass("address")} min-h-28 resize-none`}
                  placeholder="Masukkan alamat domisili lengkap di Palembang"
                />
                {errors.address && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.address}</p>
                )}
              </label>
              <div className="sm:col-span-2">
                <Button onClick={continueToSecurity} className="w-full py-3 sm:w-auto sm:px-7">
                  Lanjutkan <ArrowRight size={17} />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                <div className="relative">
                  <input
                    autoFocus
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    type={showPassword ? "text" : "password"}
                    className={`${inputClass("password")} pr-11`}
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.password}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">Gunakan minimal 8 karakter.</p>
                )}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Konfirmasi password
                </span>
                <div className="relative">
                  <input
                    value={form.confirmation}
                    onChange={(e) => update("confirmation", e.target.value)}
                    type={showConfirmation ? "text" : "password"}
                    className={`${inputClass("confirmation")} pr-11`}
                    placeholder="Ulangi password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmation((visible) => !visible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={
                      showConfirmation ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"
                    }
                  >
                    {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmation && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.confirmation}</p>
                )}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  PIN keamanan
                </span>
                <input
                  value={form.pin}
                  onChange={(e) => update("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className={`${inputClass("pin")} max-w-xs text-lg tracking-[.35em]`}
                  placeholder="••••••"
                />
                {errors.pin ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.pin}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Tepat 6 angka untuk melindungi akses saldo tabungan.
                  </p>
                )}
              </label>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-between">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStep(1);
                    setErrors({});
                  }}
                  className="sm:px-6"
                >
                  <ArrowLeft size={17} /> Kembali
                </Button>
                <Button type="submit" disabled={loading} className="sm:px-7">
                  {loading ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" /> Mendaftarkan akun...
                    </>
                  ) : (
                    <>
                      Daftar Akun Warga <ArrowRight size={17} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-auto border-t border-slate-100 pt-6 text-center text-sm text-slate-500 lg:mt-8">
            Sudah memiliki akun?{" "}
            <button onClick={onBack} className="font-bold text-green-700 hover:underline">
              Masuk sekarang
            </button>
          </div>
        </main>
      </div>

      {success && (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          <CheckCircle2 className="shrink-0 text-green-400" size={21} />
          Pendaftaran berhasil. Mengarahkan Anda ke halaman login...
        </div>
      )}
    </div>
  );
}

function Shell({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebar, setSidebar] = useState(false);
  const [reports, setReports] = useState<Report[]>(() =>
    readStoredState("simpanwaste-reports", initialReports),
  );
  const [pickedUpReports, setPickedUpReports] = useState<string[]>(() =>
    readStoredState("simpanwaste-picked-up", ["SW-250319-025"]),
  );
  const [balance, setBalance] = useState(() =>
    readStoredState("simpanwaste-balance", transactionsSeed[0].balance),
  );
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() =>
    readStoredState("simpanwaste-withdrawal-requests", withdrawalRequestsSeed),
  );
  const [citizenProfile, setCitizenProfile] = useState<UserProfile>({
    name: "Ayu Lestari",
    username: "ayu.lestari",
    phone: "0812 7788 2341",
    address: "Jl. Ki Merogan, Kertapati, Palembang",
  });
  const [categories, setCategories] = useState(categoriesSeed);
  const [minPickup, setMinPickup] = useState(5);
  const [toast, setToast] = useState("");
  const [headerPopover, setHeaderPopover] = useState<"notifications" | "profile" | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const headerActionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.localStorage.setItem("simpanwaste-reports", JSON.stringify(reports));
  }, [reports]);
  useEffect(() => {
    window.localStorage.setItem("simpanwaste-picked-up", JSON.stringify(pickedUpReports));
  }, [pickedUpReports]);
  useEffect(() => {
    window.localStorage.setItem("simpanwaste-balance", JSON.stringify(balance));
  }, [balance]);
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "simpanwaste-withdrawal-requests",
        JSON.stringify(withdrawalRequests),
      );
    } catch {
      notify("Bukti terlalu besar untuk disimpan pada prototype browser.");
    }
  }, [withdrawalRequests]);
  useEffect(() => {
    const closeHeaderPopovers = (event: MouseEvent) => {
      if (!headerActionsRef.current?.contains(event.target as Node)) {
        setHeaderPopover(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHeaderPopover(null);
    };
    document.addEventListener("mousedown", closeHeaderPopovers);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeHeaderPopovers);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2800);
  };
  const names = { warga: citizenProfile.name, petugas: "Rizky Pratama", admin: "Nadia Putri" };
  const roleLabel = { warga: "Warga", petugas: "Petugas Lapangan", admin: "Administrator" };
  const notifications = useMemo(() => {
    const relevantReports =
      role === "warga"
        ? reports.filter((report) => report.citizen === citizenProfile.name)
        : role === "petugas"
          ? reports.filter((report) => report.assigned === names.petugas)
          : reports;
    return relevantReports.slice(0, 5).map((report) => {
      const latestTracker = report.trackerHistory?.at(-1);
      const title =
        role === "warga"
          ? report.status === "Selesai"
            ? "Setoran selesai"
            : "Progres setoran diperbarui"
          : role === "petugas"
            ? report.status === "Selesai"
              ? "Laporan telah diselesaikan"
              : "Laporan menunggu tindakan"
            : report.status === "Selesai"
              ? "Laporan setoran selesai"
              : "Laporan setoran masuk";
      const message =
        role === "warga"
          ? `${report.id} · ${latestTracker?.stage || report.status}`
          : `${report.id} · ${report.citizen} · ${report.estimate} kg`;
      return {
        id: `${role}-${report.id}-${report.status}-${report.trackerHistory?.length || 0}`,
        title,
        message,
        timestamp: latestTracker?.timestamp || report.date,
      };
    });
  }, [citizenProfile.name, reports, role]);
  const unreadCount = notifications.filter(
    (notification) => !readNotificationIds.includes(notification.id),
  ).length;
  const go = (p: string) => {
    const allowedPages = nav[role].map((item) => item.page);
    setPage(allowedPages.includes(p) ? p : "dashboard");
    setSidebar(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const content = (
    <PageRouter
      role={role}
      page={page}
      go={go}
      reports={reports}
      setReports={setReports}
      pickedUpReports={pickedUpReports}
      setPickedUpReports={setPickedUpReports}
      balance={balance}
      setBalance={setBalance}
      withdrawalRequests={withdrawalRequests}
      setWithdrawalRequests={setWithdrawalRequests}
      citizenProfile={citizenProfile}
      setCitizenProfile={setCitizenProfile}
      categories={categories}
      setCategories={setCategories}
      minPickup={minPickup}
      setMinPickup={setMinPickup}
      notify={notify}
    />
  );
  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-800">
      {sidebar && (
        <button
          aria-label="Tutup menu"
          onClick={() => setSidebar(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:translate-x-0 ${sidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button
            onClick={() => setSidebar(false)}
            className="rounded-lg p-2 text-slate-500 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mx-2 mt-6 rounded-xl border border-green-100 bg-green-50 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-green-700 text-sm font-extrabold text-white">
              {names[role]
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{names[role]}</p>
              <p className="text-xs font-medium text-green-700">{roleLabel[role]}</p>
            </div>
          </div>
        </div>
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto">
          {nav[role].map((item) => (
            <button
              key={item.page}
              onClick={() => go(item.page)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${page === item.page ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {page === item.page && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={18} /> Keluar
        </button>
      </aside>
      <div className="lg:pl-[276px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebar(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="hidden text-xs font-medium text-slate-400 sm:block">
                Sistem Informasi Pengelolaan Sampah
              </p>
              <p className="text-sm font-bold text-slate-800">
                {nav[role].find((n) => n.page === page)?.label || "SIMPANWASTE"}
              </p>
            </div>
          </div>
          <div ref={headerActionsRef} className="relative flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                aria-label="Buka notifikasi"
                aria-haspopup="dialog"
                aria-expanded={headerPopover === "notifications"}
                onClick={() =>
                  setHeaderPopover((current) =>
                    current === "notifications" ? null : "notifications",
                  )
                }
                className={`relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 ${
                  headerPopover === "notifications" ? "bg-slate-100 text-green-700" : ""
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-extrabold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {headerPopover === "notifications" && (
                <div
                  role="dialog"
                  aria-label="Notifikasi"
                  className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,.18)]"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">Notifikasi</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                        {unreadCount} belum dibaca
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={unreadCount === 0}
                      onClick={() =>
                        setReadNotificationIds((current) => [
                          ...new Set([
                            ...current,
                            ...notifications.map((notification) => notification.id),
                          ]),
                        ])
                      }
                      className="text-[11px] font-extrabold text-green-700 transition hover:text-green-900 disabled:cursor-default disabled:text-slate-300"
                    >
                      Tandai semua dibaca
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {notifications.length ? (
                      notifications.map((notification) => {
                        const unread = !readNotificationIds.includes(notification.id);
                        return (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              setReadNotificationIds((current) =>
                                current.includes(notification.id)
                                  ? current
                                  : [...current, notification.id],
                              )
                            }
                            className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 ${
                              unread ? "bg-green-50/70" : ""
                            }`}
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                unread ? "bg-green-600" : "bg-slate-200"
                              }`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-start justify-between gap-3">
                                <span className="text-xs font-extrabold text-slate-800">
                                  {notification.title}
                                </span>
                                <span
                                  className={`shrink-0 text-[9px] font-bold ${
                                    unread ? "text-green-700" : "text-slate-400"
                                  }`}
                                >
                                  {unread ? "Belum dibaca" : "Dibaca"}
                                </span>
                              </span>
                              <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                                {notification.message}
                              </span>
                              <span className="mt-1.5 block text-[10px] font-semibold text-slate-400">
                                {notification.timestamp}
                              </span>
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-5 py-10 text-center">
                        <Bell className="mx-auto text-slate-300" size={28} />
                        <p className="mt-3 text-sm font-bold text-slate-500">
                          Belum ada notifikasi
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Pembaruan akun akan muncul di sini.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="ml-1 hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="relative">
              <button
                type="button"
                aria-label="Buka menu profil"
                aria-haspopup="menu"
                aria-expanded={headerPopover === "profile"}
                onClick={() =>
                  setHeaderPopover((current) => (current === "profile" ? null : "profile"))
                }
                className={`flex items-center gap-2 rounded-xl p-1 transition hover:bg-slate-100 ${
                  headerPopover === "profile" ? "bg-slate-100" : ""
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700">
                  {names[role]
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <ChevronDown
                  size={16}
                  className={`hidden text-slate-400 transition-transform sm:block ${
                    headerPopover === "profile" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {headerPopover === "profile" && (
                <div
                  role="menu"
                  aria-label="Menu profil"
                  className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,.18)]"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-100 text-sm font-extrabold text-green-800">
                      {names[role]
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">
                        {names[role]}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-green-700">
                        {roleLabel[role]}
                      </p>
                    </div>
                  </div>
                  <div className="p-2">
                    {[
                      {
                        label: "Profil Saya",
                        icon: UserRound,
                        page: role === "admin" ? "akun" : "profil",
                      },
                      {
                        label: "Pengaturan Akun",
                        icon: Settings2,
                        page: role === "admin" ? "akun" : "profil",
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setHeaderPopover(null);
                          go(item.page);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <item.icon size={17} className="text-slate-400" />
                        {item.label}
                      </button>
                    ))}
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setHeaderPopover(null);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 sm:p-7 lg:p-8">{content}</main>
      </div>
      {toast && (
        <div className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={19} className="text-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}

type RouterProps = {
  role: Role;
  page: Page;
  go: (p: string) => void;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  pickedUpReports: string[];
  setPickedUpReports: React.Dispatch<React.SetStateAction<string[]>>;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  withdrawalRequests: WithdrawalRequest[];
  setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  citizenProfile: UserProfile;
  setCitizenProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  categories: typeof categoriesSeed;
  setCategories: React.Dispatch<React.SetStateAction<typeof categoriesSeed>>;
  minPickup: number;
  setMinPickup: React.Dispatch<React.SetStateAction<number>>;
  notify: (t: string) => void;
};

function PageRouter(props: RouterProps) {
  const { role, page } = props;
  const authorized = nav[role].some((item) => item.page === page);
  if (!authorized) {
    return role === "warga" ? (
      <CitizenDashboard {...props} />
    ) : role === "petugas" ? (
      <StaffDashboard {...props} />
    ) : (
      <AdminDashboard {...props} />
    );
  }
  if (page === "dashboard")
    return role === "warga" ? (
      <CitizenDashboard {...props} />
    ) : role === "petugas" ? (
      <StaffDashboard {...props} />
    ) : (
      <AdminDashboard {...props} />
    );
  if (page === "edukasi" && role === "warga") return <EducationPage />;
  if (page === "maps" && role === "warga") return <MapsPage role={role} go={props.go} />;
  if (page === "profil") return <ProfilePage {...props} />;
  if (role === "warga") {
    if (page === "buat-laporan") return <CreateReport {...props} />;
    if (page === "riwayat") return <ReportsPage {...props} personal />;
    if (page === "saldo") return <BalancePage {...props} />;
    if (page === "penarikan") return <WithdrawalPage {...props} />;
  }
  if (role === "petugas") {
    if (page === "tugas") return <TasksPage {...props} />;
    if (page === "verifikasi") return <VerificationPage {...props} />;
  }
  if (role === "admin") {
    if (page === "laporan") return <ReportsPage {...props} />;
    if (page === "akun") return <AccountsPage notify={props.notify} />;
    if (page === "master") return <MasterPage {...props} />;
    if (page === "distribusi")
      return <DistributionPage notify={props.notify} categories={props.categories} />;
    if (page === "permintaan") return <AdminWithdrawalPage {...props} />;
  }
  return <Empty title="Halaman tidak ditemukan" />;
}

function DepositTracker({ report }: { report: Report }) {
  const stages: Array<{
    stage: TrackerStage;
    description: string;
  }> =
    report.method === "Pickup"
      ? [
          {
            stage: "Request Terkirim",
            description: "Laporan setoran berhasil diterima sistem.",
          },
          {
            stage: "Petugas dalam Perjalanan",
            description: "Petugas menuju lokasi penjemputan.",
          },
          {
            stage: "Petugas Memverifikasi",
            description: "Sampah sedang ditimbang dan diverifikasi.",
          },
          {
            stage: "Poin Saldo Didapatkan",
            description: "Nilai setoran telah ditambahkan ke saldo.",
          },
        ]
      : [
          {
            stage: "Request Terkirim",
            description: "Laporan Drop-off berhasil diterima sistem.",
          },
          {
            stage: "Petugas Memverifikasi",
            description: "Sampah sedang ditimbang dan diverifikasi.",
          },
          {
            stage: "Poin Saldo Didapatkan",
            description: "Nilai setoran telah ditambahkan ke saldo.",
          },
        ];
  const fallbackHistory: NonNullable<Report["trackerHistory"]> = [
    { stage: "Request Terkirim", timestamp: report.date },
  ];
  if (report.status === "Selesai") {
    if (report.method === "Pickup") {
      fallbackHistory.push({ stage: "Petugas dalam Perjalanan", timestamp: report.date });
    }
    fallbackHistory.push(
      { stage: "Petugas Memverifikasi", timestamp: report.date },
      { stage: "Poin Saldo Didapatkan", timestamp: report.date },
    );
  }
  const history = report.trackerHistory?.length ? report.trackerHistory : fallbackHistory;
  const historyByStage = new Map(history.map((entry) => [entry.stage, entry]));
  const currentIndex = stages.reduce(
    (latest, item, index) => (historyByStage.has(item.stage) ? index : latest),
    0,
  );

  return (
    <section aria-label={`Tracker status ${report.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.12em] text-green-700">
            Tracker Status Setoran
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">{report.id}</p>
        </div>
        <Badge tone={report.method === "Pickup" ? "blue" : "green"}>{report.method}</Badge>
      </div>
      <div className="relative mt-6">
        <span className="absolute bottom-6 left-[17px] top-5 w-px bg-slate-200 md:hidden" />
        <span className="absolute left-[12%] right-[12%] top-[17px] hidden h-px bg-slate-200 md:block" />
        <div
          className={`relative grid gap-0 ${
            stages.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"
          }`}
        >
          {stages.map((item, index) => {
            const historyItem = historyByStage.get(item.stage);
            const reached = Boolean(historyItem);
            const current = index === currentIndex;
            return (
              <div
                key={item.stage}
                className="relative flex gap-3 pb-6 last:pb-0 md:block md:px-2 md:pb-0 md:text-center"
              >
                <span
                  className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 md:mx-auto ${
                    reached
                      ? "border-green-700 bg-green-700 text-white"
                      : "border-slate-300 bg-white text-slate-400"
                  } ${current ? "ring-4 ring-green-100" : ""}`}
                >
                  {reached ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-extrabold">{index + 1}</span>
                  )}
                </span>
                <div className="pt-0.5 md:pt-3">
                  <p
                    className={`text-xs font-extrabold ${
                      current ? "text-green-800" : reached ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {item.stage}
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">{item.description}</p>
                  {historyItem && (
                    <p className="mt-1.5 text-[10px] font-bold text-green-700">
                      {historyItem.timestamp}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CitizenDashboard({ go, reports, balance }: RouterProps) {
  const [visible, setVisible] = useState(false);
  const [partnerMapKey, setPartnerMapKey] = useState(0);
  const partnerMapRef = useRef<HTMLDivElement>(null);
  const mine = reports.filter((r) => r.citizen === "Ayu Lestari");
  const [trackerId, setTrackerId] = useState(mine[0]?.id || "");
  const trackedReport = mine.find((report) => report.id === trackerId) || mine[0];
  const encodedPartnerAddress = encodeURIComponent(grahaPenaLocation.address);
  const focusPartnerMap = () => {
    setPartnerMapKey((current) => current + 1);
    partnerMapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  return (
    <>
      <div className="mb-7 rounded-2xl bg-green-800 p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm font-semibold text-green-200">Selasa, 18 Maret 2025</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Selamat datang, Ayu</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-green-100">
            Setiap sampah yang Anda pilah ikut membangun Palembang yang lebih bersih.
          </p>
        </div>
        <button
          type="button"
          onClick={() => go("buat-laporan")}
          className="visible mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-green-500/30 px-4 py-2 text-sm font-semibold text-white opacity-100 shadow-sm transition-colors hover:bg-green-500/45 active:scale-[.98] sm:mt-0"
        >
          <Plus size={18} className="shrink-0 text-white" aria-hidden="true" />
          <span className="visible whitespace-nowrap text-white opacity-100">
            Buat laporan setoran
          </span>
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sampah terkumpul"
          value="19,1 kg"
          detail="+3,2 kg bulan ini"
          icon={Scale}
        />
        <StatCard
          label="Total laporan"
          value={`${mine.length} laporan`}
          detail={`${mine.filter((r) => r.status === "Menunggu").length} sedang diproses`}
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          label="Setoran terakhir"
          value="3,2 kg"
          detail="12 Maret 2025"
          icon={Recycle}
          tone="amber"
        />
        <Card className="border-green-200 bg-green-50/60">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">Saldo tabungan</p>
              <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#166534]">
                {visible ? money(balance) : "Rp ••••••"}
              </p>
              <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-700 transition hover:text-green-900"
              >
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                {visible ? "Sembunyikan Saldo" : "Lihat Saldo"}
              </button>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
              <WalletCards size={21} />
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Laporan terbaru</h2>
              <p className="mt-1 text-xs text-slate-500">Pantau progres setoran Anda</p>
            </div>
            <button onClick={() => go("riwayat")} className="text-sm font-bold text-green-700">
              Lihat semua
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {mine.slice(0, 3).map((r) => (
              <button
                key={r.id}
                onClick={() => setTrackerId(r.id)}
                className="flex w-full items-center gap-4 rounded-xl border border-slate-100 p-3 text-left hover:border-green-200 hover:bg-green-50/50"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <Recycle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{r.category}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {r.id} · {r.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold">{r.estimate} kg</p>
                  <Badge tone={r.status === "Selesai" ? "green" : "amber"}>{r.status}</Badge>
                </div>
              </button>
            ))}
          </div>
          {trackedReport && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <DepositTracker report={trackedReport} />
            </div>
          )}
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold">Bank Sampah Mitra</h2>
              <p className="mt-1 text-xs text-slate-500">Lokasi mitra penyetoran SIMPANWASTE.</p>
            </div>
            <MapPin className="text-green-700" />
          </div>
          <div ref={partnerMapRef} className="map-mini mt-5 bg-slate-100">
            <iframe
              key={partnerMapKey}
              title="Peta Bank Sampah Graha Pena Palembang"
              src={`https://www.google.com/maps?q=${encodedPartnerAddress}&z=16&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <button
            type="button"
            onClick={focusPartnerMap}
            className="mt-4 w-full rounded-xl p-1 text-left transition hover:bg-green-50"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold">{grahaPenaLocation.name}</h3>
              <Badge tone="green">Mitra SIMPANWASTE</Badge>
            </div>
            <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-green-700" />
                {grahaPenaLocation.address}.
              </p>
              <p className="flex items-start gap-2">
                <Leaf size={14} className="mt-0.5 shrink-0 text-green-700" />
                {grahaPenaLocation.landmark}
              </p>
              <p className="flex items-start gap-2">
                <Clock3 size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <span>
                  <strong className="text-slate-600">Senin–Jumat:</strong>{" "}
                  {grahaPenaLocation.weekdaySchedule}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CalendarDays size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <span>
                  <strong className="text-slate-600">Sabtu:</strong>{" "}
                  {grahaPenaLocation.saturdaySchedule}
                </span>
              </p>
            </div>
          </button>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodedPartnerAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-slate-500 transition hover:text-green-700"
            >
              Petunjuk arah
            </a>
            <button onClick={() => go("maps")} className="text-xs font-bold text-green-700">
              Buka Maps
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

function StaffDashboard({ reports, go }: RouterProps) {
  const assigned = reports.filter((r) => r.assigned === "Rizky Pratama");
  return (
    <>
      <PageTitle
        title="Dashboard Petugas"
        desc="Ringkasan tugas lapangan dan aktivitas verifikasi hari ini."
        action={
          <Button onClick={() => go("tugas")}>
            <Truck size={17} /> Lihat semua tugas
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Tugas ditugaskan"
          value={`${assigned.length} tugas`}
          detail="Untuk Rizky Pratama"
          icon={Truck}
        />
        <StatCard
          label="Menunggu diproses"
          value={`${assigned.filter((r) => r.status === "Menunggu").length} laporan`}
          detail="Perlu tindak lanjut"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Selesai bulan ini"
          value={`${assigned.filter((r) => r.status === "Selesai").length} laporan`}
          detail="Verifikasi berhasil"
          icon={CheckCircle2}
          tone="blue"
        />
      </div>
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold">Tugas terbaru</h2>
            <p className="mt-1 text-xs text-slate-500">Hanya laporan yang ditugaskan kepada Anda</p>
          </div>
          <Badge tone="amber">
            {assigned.filter((r) => r.status === "Menunggu").length} menunggu
          </Badge>
        </div>
        <ReportTable
          reports={assigned.slice(0, 4)}
          actionLabel="Proses"
          onAction={() => go("verifikasi")}
        />
      </Card>
    </>
  );
}

function AdminDashboard(_: RouterProps) {
  return (
    <>
      <PageTitle
        title="Dashboard Kota Palembang"
        desc="Statistik agregat pengelolaan sampah berdasarkan data transaksi."
        action={
          <div className="flex gap-2">
            <Button variant="secondary">
              <CalendarDays size={16} /> 1–18 Mar 2025
            </Button>
            <Button variant="secondary">
              <Filter size={16} /> Filter
            </Button>
          </div>
        }
      />
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
        Harga, ambang pickup, dan statistik pada tampilan ini adalah data demonstrasi dan bukan
        nilai operasional terkonfirmasi.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sampah terkumpul"
          value="12.840 kg"
          detail="+12,4% dari periode lalu"
          icon={Scale}
        />
        <StatCard
          label="Total setoran"
          value="1.246"
          detail="+86 transaksi bulan ini"
          icon={ClipboardCheck}
          tone="blue"
        />
        <StatCard
          label="Kategori terbanyak"
          value="Plastik PET"
          detail="4.208 kg · 32,8%"
          icon={Recycle}
          tone="amber"
        />
        <StatCard
          label="Didistribusikan"
          value="10.760 kg"
          detail="83,8% dari total"
          icon={Truck}
          tone="violet"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card>
          <h2 className="font-extrabold">Sampah terkumpul per kategori</h2>
          <p className="mt-1 text-xs text-slate-500">Total berat terverifikasi (kg)</p>
          <div className="mt-7 space-y-5">
            {[
              ["Plastik PET", 4208, 82],
              ["Kardus", 3150, 63],
              ["Kertas Campur", 2420, 48],
              ["Kaleng Aluminium", 1862, 37],
              ["Plastik Campur", 1200, 24],
            ].map(([n, v, p]) => (
              <div key={String(n)}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">{n}</span>
                  <span className="font-extrabold">{Number(v).toLocaleString("id-ID")} kg</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-green-600" style={{ width: `${p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-extrabold">Tren pengumpulan</h2>
          <p className="mt-1 text-xs text-slate-500">Januari–Juni 2025</p>
          <div className="chart mt-8">
            <div className="chart-grid" />
            <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="h-full w-full">
              <path
                d="M0 185 C80 165,90 130,155 145 S250 80,315 105 S420 45,470 70 S550 25,600 35"
                fill="none"
                stroke="#16a34a"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M0 185 C80 165,90 130,155 145 S250 80,315 105 S420 45,470 70 S550 25,600 35 L600 220 L0 220Z"
                fill="url(#g)"
                opacity=".18"
              />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#22c55e" />
                  <stop offset="1" stopColor="#fff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-semibold text-slate-400">
            {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold">Distribusi terbaru ke mitra</h2>
            <p className="mt-1 text-xs text-slate-500">Ringkasan data distribusi bulan berjalan</p>
          </div>
          <Badge tone="green">2.460 kg tersalurkan</Badge>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Mitra pengepul</th>
                <th>Kategori</th>
                <th>Berat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>17 Mar 2025</td>
                <td className="font-bold">PT Sriwijaya Daur Ulang</td>
                <td>Botol Plastik PET</td>
                <td>820 kg</td>
                <td>
                  <Badge>Selesai</Badge>
                </td>
              </tr>
              <tr>
                <td>13 Mar 2025</td>
                <td className="font-bold">Mitra Kertas Musi</td>
                <td>Kardus</td>
                <td>640 kg</td>
                <td>
                  <Badge>Selesai</Badge>
                </td>
              </tr>
              <tr>
                <td>8 Mar 2025</td>
                <td className="font-bold">CV Logam Jaya</td>
                <td>Kaleng Aluminium</td>
                <td>410 kg</td>
                <td>
                  <Badge>Selesai</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function EducationPage() {
  const [detail, setDetail] = useState<number | null>(null);
  const openDetail = (index: number) => {
    setDetail(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeDetail = () => {
    setDetail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (detail !== null) {
    const e = education[detail];
    return (
      <div className="mx-auto max-w-5xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <button onClick={closeDetail} className="transition hover:text-green-700">
            Informasi & Edukasi
          </button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-700">{e.title}</span>
        </nav>

        <button
          onClick={closeDetail}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:-translate-x-0.5 hover:text-green-700"
        >
          <ArrowLeft size={17} /> Kembali ke edukasi
        </button>

        <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,.07)]">
          <div className="relative h-72 overflow-hidden sm:h-[420px]">
            <img
              src={e.image}
              alt={`Ilustrasi ${e.title.toLowerCase()}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.13em] backdrop-blur">
                  {e.label}
                </span>
                <span className="text-xs text-white/70">{e.tag}</span>
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {e.title}
              </h1>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-12 lg:px-16">
            <p className="max-w-3xl text-lg leading-8 text-slate-600">{e.intro}</p>
            <div className="mt-10 grid gap-10 border-t border-slate-200 pt-10 lg:grid-cols-[1fr_260px]">
              <div className="space-y-10">
                {e.sections.map((section, index) => (
                  <section key={section.heading} className="grid gap-4 sm:grid-cols-[42px_1fr]">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-xs font-extrabold text-green-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                        {section.heading}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
                    </div>
                  </section>
                ))}
              </div>
              <aside className="h-fit rounded-2xl bg-[#edf8ef] p-5">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${e.color}`}>
                  <e.icon size={21} />
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-[.12em] text-green-700">
                  Catatan Penting
                </p>
                <p className="mt-2 text-sm leading-6 text-green-950">{e.note}</p>
              </aside>
            </div>
            <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-medium text-slate-400">Foto: {e.credit}</p>
              <Button onClick={closeDetail}>
                <ArrowLeft size={17} /> Kembali ke Informasi & Edukasi
              </Button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="-m-4 sm:-m-7 lg:-m-8">
      <section className="relative overflow-hidden bg-[#edf7f0] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-green-600" />
              <p className="text-xs font-extrabold tracking-[.16em] text-green-700">
                PANDUAN PENGELOLAAN SAMPAH
              </p>
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-[-.04em] text-slate-950 sm:text-5xl">
              Kenali Sampahmu, Mulai <span className="text-green-700">Perubahan dari Rumah.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Pelajari cara memilah, membersihkan, dan menyetorkan sampah dengan benar untuk
              mendukung lingkungan yang lebih bersih.
            </p>
          </div>

          <div className="relative mx-auto min-h-[330px] w-full max-w-xl sm:min-h-[390px]">
            <div className="absolute inset-[8%] rounded-[42%_58%_54%_46%/45%_38%_62%_55%] bg-green-800" />
            <div className="absolute left-[12%] top-[14%] h-28 w-28 rounded-full border-[20px] border-green-300/15 sm:h-36 sm:w-36" />
            <div className="absolute bottom-[13%] right-[9%] h-24 w-24 rounded-full bg-green-300/20" />

            <div className="absolute bottom-[17%] left-[12%] z-10">
              <div className="h-36 w-24 rounded-t-[2rem] rounded-b-xl bg-sky-200 shadow-xl sm:h-44 sm:w-28">
                <div className="mx-auto h-6 w-12 -translate-y-4 rounded-md bg-sky-600" />
                <Recycle className="mx-auto mt-6 text-sky-800" size={32} />
              </div>
            </div>
            <div className="absolute bottom-[13%] left-[37%] z-20">
              <div className="h-40 w-32 rotate-[-5deg] rounded-xl bg-amber-300 p-4 shadow-xl sm:h-48 sm:w-40">
                <div className="h-2 w-16 rounded-full bg-amber-700/30" />
                <div className="mt-3 h-2 w-10 rounded-full bg-amber-700/20" />
                <Boxes className="absolute bottom-5 right-5 text-amber-800" size={31} />
              </div>
            </div>
            <div className="absolute bottom-[19%] right-[11%] z-10">
              <div className="grid h-32 w-24 place-items-center rounded-b-2xl rounded-t-lg bg-emerald-200 shadow-xl sm:h-40 sm:w-28">
                <Leaf className="text-emerald-800" size={34} />
              </div>
            </div>
            <Recycle
              className="absolute right-[26%] top-[18%] z-20 text-green-100"
              size={72}
              strokeWidth={1.5}
            />
            <Leaf
              className="absolute left-[28%] top-[9%] z-20 rotate-[-20deg] text-green-300"
              size={43}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#f8faf8] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
              Pusat Pembelajaran
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Jelajahi Panduan Pemilahan
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Temukan informasi praktis mengenai pengelolaan sampah rumah tangga.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            {education.map((e, index) => (
              <button
                key={e.title}
                onClick={() => openDetail(index)}
                className={`group overflow-hidden rounded-[1.5rem] border border-slate-200/80 text-left shadow-[0_4px_20px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_18px_40px_rgba(22,101,52,.10)] ${
                  index === 0 || index === 3 ? "lg:col-span-7" : "lg:col-span-5"
                } ${e.surface}`}
              >
                <div
                  className={`relative overflow-hidden ${
                    index === 0 || index === 3 ? "h-64 sm:h-72" : "h-56 sm:h-64"
                  }`}
                >
                  <img
                    src={e.image}
                    alt={`Visual ${e.title.toLowerCase()}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-green-800 shadow-sm backdrop-blur">
                    {e.label}
                  </span>
                  <span className="absolute bottom-4 right-5 text-[9px] font-medium text-white/70">
                    {e.credit}
                  </span>
                </div>
                <div className="flex min-h-52 flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-5">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${e.color}`}>
                      <e.icon size={21} />
                    </div>
                    <ArrowRight
                      className="mt-1 text-slate-400 transition duration-300 group-hover:translate-x-1 group-hover:text-green-700"
                      size={20}
                    />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">
                    {e.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{e.desc}</p>
                  <p className="mt-auto pt-5 text-xs font-extrabold text-green-700">
                    Baca panduan lengkap
                  </p>
                </div>
              </button>
            ))}
          </div>

          <aside className="mt-16 overflow-hidden rounded-[1.75rem] bg-green-800 text-white">
            <div className="grid items-center gap-8 px-6 py-9 sm:px-10 lg:grid-cols-[1fr_320px] lg:px-12 lg:py-10">
              <div>
                <div className="flex items-center gap-3 text-green-300">
                  <CheckCircle2 size={20} />
                  <p className="text-xs font-extrabold uppercase tracking-[.14em]">
                    Persiapan Setoran
                  </p>
                </div>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Sebelum Menyetor, Pastikan Sampahmu Sudah Siap.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-green-100">
                  Pisahkan sampah anorganik berdasarkan jenisnya dan bersihkan dari sisa kotoran
                  atau cairan sebelum disetorkan.
                </p>
              </div>
              <div className="relative mx-auto flex h-40 w-full max-w-xs items-end justify-center gap-3">
                <div className="absolute left-3 top-4 h-20 w-20 rounded-full border-[14px] border-green-300/10" />
                <div className="relative h-24 w-16 rounded-t-xl rounded-b-md bg-sky-200 shadow-lg">
                  <div className="mx-auto h-4 w-8 -translate-y-2 rounded-sm bg-sky-500" />
                </div>
                <div className="relative h-28 w-24 rotate-[-4deg] rounded-md bg-amber-300 p-3 shadow-lg">
                  <div className="h-1.5 w-10 rounded bg-amber-700/25" />
                  <div className="mt-2 h-1.5 w-7 rounded bg-amber-700/20" />
                </div>
                <div className="relative grid h-20 w-16 place-items-center rounded-lg bg-green-200 shadow-lg">
                  <Recycle className="text-green-800" size={25} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function WasteCategoryCombobox({
  categories,
  onSelect,
}: {
  categories: typeof categoriesSeed;
  onSelect: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    if (!normalizedQuery) return categories;
    return categories.filter((item) =>
      item.name.toLocaleLowerCase("id-ID").includes(normalizedQuery),
    );
  }, [categories, query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    setHighlightedIndex((current) => Math.min(current, Math.max(filteredCategories.length - 1, 0)));
  }, [filteredCategories.length]);

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`waste-category-${highlightedIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  const selectCategory = (name: string) => {
    onSelect(name);
    setQuery("");
    setOpen(false);
    setHighlightedIndex(0);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Cari dan pilih kategori sampah"
          aria-autocomplete="list"
          aria-controls="waste-category-options"
          aria-expanded={open}
          aria-activedescendant={
            open && filteredCategories[highlightedIndex]
              ? `waste-category-${highlightedIndex}`
              : undefined
          }
          className="input bg-[#f8faf8] py-3 pl-11 pr-20"
          placeholder="Cari jenis sampah..."
          value={query}
          onClick={() => setOpen(true)}
          onFocus={() => {
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              if (filteredCategories.length) {
                setHighlightedIndex((current) =>
                  Math.min(current + 1, filteredCategories.length - 1),
                );
              }
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              if (filteredCategories.length) {
                setHighlightedIndex((current) => Math.max(current - 1, 0));
              }
            } else if (event.key === "Enter") {
              event.preventDefault();
              const highlighted = filteredCategories[highlightedIndex];
              if (open && highlighted) selectCategory(highlighted.name);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setQuery("");
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              setOpen(true);
              window.requestAnimationFrame(() => inputRef.current?.focus());
            }
          }}
          aria-label={open ? "Tutup daftar kategori" : "Buka daftar kategori"}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-green-700"
        >
          <ChevronDown size={17} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div
          id="waste-category-options"
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,.16)]"
        >
          {filteredCategories.length ? (
            filteredCategories.map((item, index) => {
              const highlighted = index === highlightedIndex;
              return (
                <button
                  id={`waste-category-${index}`}
                  key={item.name}
                  type="button"
                  role="option"
                  aria-selected="false"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCategory(item.name)}
                  className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    highlighted ? "bg-green-50" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-green-50 text-green-700">
                      <Plus size={12} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-800">{item.name}</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                        {item.desc}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-5 text-center text-sm font-semibold text-slate-500">
              Jenis sampah tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateReport({ go, reports, setReports, notify, categories, minPickup }: RouterProps) {
  const [step, setStep] = useState(1);
  const [wasteItems, setWasteItems] = useState<
    Array<{
      id: string;
      category: string;
      estimate: number;
      condition?: WasteCondition;
    }>
  >([]);
  const wasteItemSequence = useRef(0);
  const [showStepOneErrors, setShowStepOneErrors] = useState(false);
  const [method, setMethod] = useState<"Pickup" | "Drop-off">("Drop-off");
  const [pickupLocation, setPickupLocation] = useState("Jl. Ki Merogan, Kertapati, Palembang");
  const dropOffDestination = grahaPenaLocation.name;
  const totalWeight = wasteItems.reduce((total, item) => total + (item.estimate || 0), 0);
  const pickupOk = totalWeight >= minPickup;
  const hasValidCategories =
    wasteItems.length > 0 &&
    wasteItems.every((item) => categories.some((category) => category.name === item.category));
  const hasValidWeights = wasteItems.every((item) => item.estimate > 0);
  const hasValidConditions = wasteItems.every(
    (item) => item.condition && wasteConditions.includes(item.condition),
  );
  const combinationKeys = wasteItems
    .filter((item) => item.condition)
    .map((item) => `${item.category}::${item.condition}`);
  const hasUniqueCombinations = new Set(combinationKeys).size === combinationKeys.length;
  useEffect(() => {
    if (!pickupOk && method === "Pickup") setMethod("Drop-off");
  }, [method, pickupOk]);

  const addWasteItem = (name: string) => {
    if (!categories.some((item) => item.name === name)) return;
    const usedConditions = wasteItems
      .filter((item) => item.category === name && item.condition)
      .map((item) => item.condition);
    if (usedConditions.length === wasteConditions.length) {
      return notify(`Semua kombinasi kondisi untuk ${name} sudah ditambahkan.`);
    }
    wasteItemSequence.current += 1;
    setWasteItems((current) => [
      ...current,
      {
        id: `waste-item-${Date.now()}-${wasteItemSequence.current}`,
        category: name,
        estimate: 0,
      },
    ]);
  };
  const selectItemCondition = (itemId: string, condition: WasteCondition) => {
    const currentItem = wasteItems.find((item) => item.id === itemId);
    if (!currentItem) return;
    const duplicate = wasteItems.some(
      (item) =>
        item.id !== itemId &&
        item.category === currentItem.category &&
        item.condition === condition,
    );
    if (duplicate) {
      return notify(
        `${currentItem.category} dengan kondisi "${condition}" sudah ditambahkan. Ubah estimasi berat pada item yang sudah ada.`,
      );
    }
    setWasteItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, condition } : item)),
    );
  };
  const next = () => {
    if (step === 1) {
      setShowStepOneErrors(true);
      if (!hasValidCategories) return notify("Pilih minimal satu jenis sampah dari data master.");
      if (!hasValidWeights)
        return notify("Masukkan estimasi berat yang valid untuk setiap kategori.");
      if (!hasValidConditions) return notify("Pilih kondisi sampah untuk setiap kategori.");
      if (!hasUniqueCombinations)
        return notify("Kombinasi kategori dan kondisi yang sama tidak boleh diduplikasi.");
    }
    if (step === 2 && method === "Pickup" && !pickupOk) return;
    setStep(Math.min(4, step + 1));
  };
  const submit = () => {
    if (!hasValidCategories || !hasValidWeights || !hasValidConditions || !hasUniqueCombinations)
      return notify("Lengkapi kategori, estimasi berat, dan kondisi sebelum mengirim laporan.");
    const report: Report = {
      id: `SW-250318-${String(reports.length + 25).padStart(3, "0")}`,
      citizen: "Ayu Lestari",
      phone: "0812 7788 2341",
      category: wasteItems.map((item) => item.category).join(", "),
      estimate: totalWeight,
      method,
      status: "Menunggu",
      date: "18 Mar 2025",
      location: method === "Pickup" ? pickupLocation : dropOffDestination,
      assigned: "Rizky Pratama",
      trackerHistory: [{ stage: "Request Terkirim", timestamp: trackerTimestamp() }],
      categoryWeights: wasteItems.map((item) => ({
        category: item.category,
        estimate: item.estimate,
        conditions: item.condition ? [item.condition] : [],
      })),
    };
    setReports((r) => [report, ...r]);
    notify("Laporan berhasil dibuat dan diteruskan ke petugas.");
    go("riwayat");
  };
  const steps = [
    { label: "Informasi", icon: Recycle },
    { label: "Metode", icon: Truck },
    { label: "Lokasi", icon: MapPin },
    { label: "Konfirmasi", icon: ClipboardCheck },
  ];

  return (
    <>
      <PageTitle
        title="Buat Laporan Setoran"
        desc="Lengkapi informasi sampah untuk membuat laporan baru."
      />

      <div className="relative mb-7 rounded-2xl border border-slate-200 bg-white px-3 py-5 shadow-sm sm:px-7">
        <div className="absolute left-[12.5%] right-[12.5%] top-[38px] h-0.5 bg-slate-200" />
        <div
          className="absolute left-[12.5%] top-[38px] h-0.5 bg-green-500 transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 75}%` }}
        />
        <div className="relative grid grid-cols-4">
          {steps.map((item, index) => {
            const number = index + 1;
            const active = step === number;
            const complete = step > number;
            const StepIcon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full border-4 border-white shadow-sm transition-all duration-300 sm:h-11 sm:w-11 ${
                    active
                      ? "bg-green-700 text-white ring-4 ring-green-100"
                      : complete
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {complete ? <Check size={17} strokeWidth={3} /> : <StepIcon size={17} />}
                </div>
                <p
                  className={`mt-2 text-[10px] font-extrabold sm:text-xs ${
                    active ? "text-green-800" : complete ? "text-green-600" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,.06)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-green-600" />
          <div className="p-6 sm:p-8">
            {step === 1 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Recycle size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 01
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Informasi sampah</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Pilih kategori sampah dan masukkan estimasi berat untuk masing-masing.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <span
                      id="waste-category-label"
                      className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"
                    >
                      <Recycle size={16} className="text-green-700" /> Kategori sampah
                    </span>
                    <WasteCategoryCombobox categories={categories} onSelect={addWasteItem} />
                    <span className="mt-2 block text-xs leading-5 text-slate-400">
                      Kategori yang sama dapat ditambahkan lagi dengan kondisi yang berbeda.
                    </span>
                    {showStepOneErrors && !hasValidCategories && (
                      <p className="mt-2 text-xs font-semibold text-red-600">
                        Pilih minimal satu jenis sampah.
                      </p>
                    )}
                  </div>

                  {wasteItems.length > 0 && (
                    <div>
                      <span className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Scale size={16} className="text-green-700" /> Daftar item sampah
                      </span>
                      <div className="space-y-3">
                        {wasteItems.map((item, itemIndex) => {
                          const invalid = showStepOneErrors && !(item.estimate > 0);
                          const invalidCondition = showStepOneErrors && !item.condition;
                          return (
                            <div
                              key={item.id}
                              className="block rounded-xl border border-slate-200 bg-[#f8faf8] p-4"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-green-700">
                                    Item {itemIndex + 1}
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {item.category}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setWasteItems((current) =>
                                      current.filter((candidate) => candidate.id !== item.id),
                                    )
                                  }
                                  className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-[.97]"
                                >
                                  <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                              <label className="block">
                                <span className="mb-2 block text-xs font-semibold text-slate-600">
                                  Estimasi berat (kg)
                                </span>
                                <span className="relative block">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step=".1"
                                    inputMode="decimal"
                                    className={`input bg-white py-3 pr-14 ${
                                      invalid
                                        ? "border-red-400 ring-2 ring-red-100 focus:border-red-400"
                                        : ""
                                    }`}
                                    placeholder="Estimasi berat (kg)"
                                    value={item.estimate || ""}
                                    aria-invalid={invalid}
                                    onChange={(event) =>
                                      setWasteItems((current) =>
                                        current.map((candidate) =>
                                          candidate.id === item.id
                                            ? {
                                                ...candidate,
                                                estimate: Number(event.target.value),
                                              }
                                            : candidate,
                                        ),
                                      )
                                    }
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                    kg
                                  </span>
                                </span>
                              </label>
                              {invalid && (
                                <span className="mt-2 block text-xs font-semibold text-red-600">
                                  Estimasi berat harus lebih dari 0 kg.
                                </span>
                              )}
                              <fieldset className="mt-4">
                                <legend className="mb-2 text-xs font-semibold text-slate-600">
                                  Kondisi sampah
                                </legend>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {wasteConditions.map((condition) => (
                                    <label
                                      key={condition}
                                      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-semibold leading-5 transition ${
                                        item.condition === condition
                                          ? "border-green-500 bg-green-50 text-green-900"
                                          : "border-slate-200 bg-white text-slate-600 hover:border-green-200"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`waste-condition-${item.id}`}
                                        value={condition}
                                        checked={item.condition === condition}
                                        onChange={() => selectItemCondition(item.id, condition)}
                                        className="mt-0.5 accent-green-700"
                                      />
                                      <span>{condition}</span>
                                    </label>
                                  ))}
                                </div>
                                {invalidCondition && (
                                  <span className="mt-2 block text-xs font-semibold text-red-600">
                                    Pilih satu kondisi sampah.
                                  </span>
                                )}
                              </fieldset>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                        <span className="text-sm font-bold text-green-900">
                          Total estimasi berat
                        </span>
                        <span className="text-lg font-extrabold text-green-800">
                          {totalWeight.toLocaleString("id-ID", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          kg
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Kondisi yang dipilih merupakan informasi awal dari Warga. Petugas tetap
                        memverifikasi kondisi aktual saat penimbangan manual.
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                    <Scale size={17} className="mt-0.5 shrink-0" />
                    <p>
                      <strong>Data demonstrasi:</strong> Minimum pickup saat ini adalah{" "}
                      <strong>{minPickup} kg</strong>. Total seluruh kategori digunakan untuk
                      menentukan ketersediaan Pickup.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Truck size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 02
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold">Metode penyetoran</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pilih cara penyerahan sampah yang sesuai.
                    </p>
                  </div>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <button
                    disabled={!pickupOk}
                    onClick={() => setMethod("Pickup")}
                    className={`group rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 ${
                      method === "Pickup" && pickupOk
                        ? "border-green-600 bg-green-50 shadow-sm"
                        : "border-slate-200 bg-slate-50/60 hover:border-green-200"
                    }`}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-green-700 shadow-sm">
                      <Truck size={21} />
                    </div>
                    <h3 className="mt-5 font-extrabold">Pickup</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Petugas menjemput ke titik yang Anda tentukan.
                    </p>
                  </button>
                  <button
                    onClick={() => setMethod("Drop-off")}
                    className={`group rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 ${
                      method === "Drop-off"
                        ? "border-green-600 bg-green-50 shadow-sm"
                        : "border-slate-200 bg-slate-50/60 hover:border-green-200"
                    }`}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-green-700 shadow-sm">
                      <Building2 size={21} />
                    </div>
                    <h3 className="mt-5 font-extrabold">Drop-off</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Antar langsung ke bank sampah aktif.
                    </p>
                  </button>
                </div>
                {!pickupOk && (
                  <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <XCircle className="shrink-0" size={20} />
                    <p>
                      Pickup belum tersedia karena total estimasi <strong>{totalWeight} kg</strong>{" "}
                      di bawah minimum {minPickup} kg. Disarankan memilih Drop-off.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <MapPin size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 03
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold">
                      {method === "Pickup" ? "Tentukan Lokasi Penjemputan" : "Tujuan Penyetoran"}
                    </h2>
                    {method === "Pickup" && (
                      <p className="mt-1 text-sm text-slate-500">
                        Tentukan titik penjemputan yang mudah diakses.
                      </p>
                    )}
                  </div>
                </div>
                {method === "Pickup" ? (
                  <>
                    <div className="map-large mt-7">
                      <div className="map-road a" />
                      <div className="map-road b" />
                      <span className="map-pin left-[47%] top-[44%]">
                        <MapPin size={21} />
                      </span>
                    </div>
                    <label className="mt-5 block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">
                        Alamat penjemputan
                      </span>
                      <input
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="input bg-[#f8faf8] py-3"
                        placeholder="Masukkan alamat lengkap"
                      />
                    </label>
                  </>
                ) : (
                  <div className="mt-5">
                    <div className="relative overflow-hidden rounded-2xl border border-green-200 bg-[#eef8f1] p-5 sm:p-6">
                      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[25px] border-green-600/[.055]" />
                      <div className="relative flex items-start gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
                          <Recycle size={23} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-extrabold tracking-tight text-slate-900">
                              {grahaPenaLocation.shortName}
                            </p>
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.1em] text-green-800">
                              Mitra SIMPANWASTE
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            Lokasi ini merupakan tujuan tetap untuk seluruh penyetoran dengan metode
                            Drop-off.
                          </p>
                        </div>
                      </div>
                      <div className="relative mt-5 space-y-3 border-t border-green-200 pt-4 text-xs leading-5 text-slate-600">
                        <p className="flex items-start gap-3">
                          <MapPin className="mt-0.5 shrink-0 text-green-700" size={17} />
                          <span>
                            {grahaPenaLocation.address}. {grahaPenaLocation.landmark}
                          </span>
                        </p>
                        <p className="flex items-start gap-3">
                          <Clock3 className="mt-0.5 shrink-0 text-green-700" size={17} />
                          <span>
                            <strong>Senin–Jumat:</strong> {grahaPenaLocation.weekdaySchedule}
                          </span>
                        </p>
                        <p className="flex items-start gap-3">
                          <CalendarDays className="mt-0.5 shrink-0 text-green-700" size={17} />
                          <span>
                            <strong>Sabtu:</strong> {grahaPenaLocation.saturdaySchedule}
                          </span>
                        </p>
                        <p className="flex items-start gap-3 pt-1">
                          <Recycle className="mt-0.5 shrink-0 text-green-700" size={17} />
                          <span className="font-semibold text-green-900">
                            Untuk metode Drop-off, sampah diantarkan secara langsung oleh warga ke
                            Bank Sampah Graha Pena.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <ClipboardCheck size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 04
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold">Konfirmasi laporan</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pastikan data berikut sudah benar.
                    </p>
                  </div>
                </div>
                <dl className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-[#f8faf8] px-5">
                  {wasteItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 py-4 text-sm sm:flex-row sm:justify-between"
                    >
                      <dt>
                        <p className="font-bold text-slate-800">{item.category}</p>
                        <p className="mt-1 text-xs text-slate-500">Kondisi sampah</p>
                      </dt>
                      <dd className="sm:max-w-[65%] sm:text-right">
                        <p className="font-extrabold text-slate-800">{item.estimate} kg</p>
                        <div className="mt-2 flex flex-wrap gap-1.5 sm:justify-end">
                          {item.condition && (
                            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-800">
                              {item.condition}
                            </span>
                          )}
                        </div>
                      </dd>
                    </div>
                  ))}
                  {[
                    ["Total estimasi berat", `${totalWeight} kg`],
                    ["Metode", method],
                    [
                      method === "Pickup" ? "Titik penjemputan" : "Tujuan Drop-off",
                      method === "Pickup" ? pickupLocation : dropOffDestination,
                    ],
                    ["Status awal", "Menunggu"],
                  ].map(([a, b]) => (
                    <div key={a} className="flex justify-between gap-5 py-4 text-sm">
                      <dt className="text-slate-500">{a}</dt>
                      <dd className="text-right font-bold text-slate-800">{b}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex gap-3 rounded-xl bg-sky-50 p-4 text-xs leading-5 text-sky-800">
                  <ShieldCheck size={17} className="shrink-0" />
                  {method === "Drop-off"
                    ? "Warga harus mengantarkan sampah secara langsung ke Bank Sampah Graha Pena Palembang. Nilai setoran dihitung setelah penimbangan manual."
                    : "Petugas akan menuju alamat atau titik penjemputan yang dipilih. Nilai setoran dihitung setelah penimbangan manual."}
                </div>
              </div>
            )}

            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              <Button
                variant="secondary"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="sm:min-w-28"
              >
                <ArrowLeft size={17} /> Kembali
              </Button>
              {step < 4 ? (
                <Button onClick={next} className="sm:min-w-32">
                  Lanjutkan <ArrowRight size={17} />
                </Button>
              ) : (
                <Button onClick={submit} className="sm:min-w-40">
                  <Check size={17} /> Kirim laporan
                </Button>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-green-100 bg-[#eff8f1] p-5 shadow-[0_8px_24px_rgba(22,101,52,.05)] xl:sticky xl:top-24">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-700 text-white">
              <BookOpen size={19} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-green-700">
                Panduan Singkat
              </p>
              <h2 className="mt-0.5 font-extrabold text-slate-900">Sebelum Melanjutkan</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Estimasi Berat",
                desc: "Masukkan perkiraan berat sampah. Berat final ditentukan petugas setelah penimbangan manual.",
                icon: Scale,
              },
              {
                title: "Ketentuan Pickup",
                desc: "Pickup hanya tersedia apabila estimasi berat memenuhi batas minimum yang ditentukan Admin.",
                icon: Truck,
              },
              {
                title: "Proses Setoran",
                desc: "Petugas akan melakukan verifikasi dan penimbangan sebelum saldo diperbarui.",
                icon: ClipboardCheck,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white/80 p-4">
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-100 text-green-700">
                    <item.icon size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

function ReportTable({
  reports,
  actionLabel = "Detail",
  onAction,
}: {
  reports: Report[];
  actionLabel?: string;
  onAction: (r: Report) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID Laporan</th>
            <th>Warga</th>
            <th>Kategori</th>
            <th>Berat</th>
            <th>Metode</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td className="font-bold text-green-700">{r.id}</td>
              <td>
                <p className="font-semibold text-slate-800">{r.citizen}</p>
                <p className="text-xs text-slate-400">{r.phone}</p>
              </td>
              <td>{r.category}</td>
              <td className="font-bold">{r.estimate} kg</td>
              <td>{r.method}</td>
              <td>{r.date}</td>
              <td>
                <Badge tone={r.status === "Selesai" ? "green" : "amber"}>{r.status}</Badge>
              </td>
              <td>
                <Button
                  variant="secondary"
                  className="min-h-8 px-3 py-1 text-xs"
                  onClick={() => onAction(r)}
                >
                  {actionLabel}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reports.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-500">Belum ada data laporan.</div>
      )}
    </div>
  );
}

function ReportsPage({ reports, personal, notify }: RouterProps & { personal?: boolean }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<"Semua Status" | Report["status"]>(
    "Semua Status",
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const statusOptions: Array<"Semua Status" | Report["status"]> = [
    "Semua Status",
    "Menunggu",
    "Selesai",
  ];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const data = reports.filter(
    (r) =>
      (!personal || r.citizen === "Ayu Lestari") &&
      (statusFilter === "Semua Status" || r.status === statusFilter) &&
      (r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <>
      <PageTitle
        title={personal ? "Riwayat Laporan" : "Data Laporan Setoran"}
        desc={
          personal
            ? "Pantau laporan setoran milik Anda."
            : "Tampilan baca seluruh laporan yang masuk."
        }
      />
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Cari ID atau kategori..."
            />
          </div>
          <div ref={filterRef} className="relative sm:w-48">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((open) => !open)}
              className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2 text-sm font-semibold transition active:scale-[.98] ${
                filterOpen
                  ? "border-green-500 text-green-700 ring-4 ring-green-50"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Filter size={17} />
                {statusFilter}
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${
                  filterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              role="listbox"
              aria-label="Filter status laporan"
              className={`absolute right-0 top-full z-20 mt-2 w-full min-w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all duration-200 ease-out ${
                filterOpen
                  ? "visible translate-y-0 scale-100 opacity-100"
                  : "invisible -translate-y-1 scale-[.98] opacity-0"
              }`}
            >
              {statusOptions.map((option) => {
                const active = statusFilter === option;
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    key={option}
                    onClick={() => {
                      setStatusFilter(option);
                      setFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-green-50 text-green-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {option}
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full transition ${
                        active ? "bg-green-700 text-white" : "text-transparent"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <ReportTable reports={data} onAction={setSelected} />
      </Card>
      {selected && (
        <Modal title="Detail laporan" onClose={() => setSelected(null)} wide={personal}>
          <dl className="divide-y divide-slate-100">
            {[
              ["ID laporan", selected.id],
              ["Nama warga", selected.citizen],
              ["Kategori", selected.category],
              ["Estimasi", `${selected.estimate} kg`],
              ["Metode", selected.method],
              ["Lokasi", selected.location],
              ["Status", selected.status],
            ].map(([a, b]) => (
              <div className="flex justify-between gap-6 py-3 text-sm" key={a}>
                <dt className="text-slate-500">{a}</dt>
                <dd className="text-right font-bold">{b}</dd>
              </div>
            ))}
          </dl>
          {personal && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <DepositTracker report={selected} />
            </div>
          )}
          {personal && selected.status === "Menunggu" && (
            <Button
              onClick={() => {
                notify("Mode edit laporan dibuka.");
                setSelected(null);
              }}
              className="mt-5 w-full"
            >
              <Pencil size={16} /> Edit laporan
            </Button>
          )}
        </Modal>
      )}
    </>
  );
}

function BalancePage({ balance }: RouterProps) {
  const [visible, setVisible] = useState(true);
  const currentBalance = balance;

  return (
    <>
      <PageTitle
        title="Saldo & Riwayat Transaksi"
        desc="Ringkasan saldo dan transaksi pribadi Anda."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-green-200 bg-green-50/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">Saldo Tersedia</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#166534]">
                {visible ? money(currentBalance) : "Rp ••••••"}
              </p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
              <WalletCards size={21} />
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-green-200/80 pt-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Pembaruan terakhir</p>
              <p className="mt-1 text-xs font-bold text-slate-700">18 Maret 2025</p>
            </div>
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100 active:scale-[.98]"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              {visible ? "Sembunyikan" : "Lihat Saldo"}
            </button>
          </div>
        </Card>
        <StatCard
          label="Total berat terkumpul"
          value="19,1 kg"
          detail="Dari seluruh setoran selesai"
          icon={Scale}
          tone="blue"
        />
        <StatCard
          label="Transaksi setoran"
          value="6 kali"
          detail="Sejak Januari 2025"
          icon={Recycle}
          tone="amber"
        />
      </div>
      <Card className="mt-6">
        <h2 className="font-extrabold">Riwayat transaksi</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Berat</th>
                <th>Nilai transaksi</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {transactionsSeed.map((t, i) => (
                <tr key={i}>
                  <td>{t.date}</td>
                  <td>
                    <Badge tone={t.type === "Setoran" ? "green" : "amber"}>{t.type}</Badge>
                  </td>
                  <td>{t.weight}</td>
                  <td className={`font-bold ${t.value > 0 ? "text-green-700" : "text-red-600"}`}>
                    {t.value > 0 ? "+" : ""}
                    {money(t.value)}
                  </td>
                  <td className="font-extrabold">{money(i === 0 ? currentBalance : t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function WithdrawalPage({
  balance,
  notify,
  withdrawalRequests,
  setWithdrawalRequests,
  citizenProfile,
}: RouterProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [amountTouched, setAmountTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [previewRequest, setPreviewRequest] = useState<WithdrawalRequest | null>(null);
  const type = "Penarikan manual";
  const currentBalance = balance;
  const amountValid = amount > 0 && amount <= currentBalance;
  const formValid = amountValid;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAmountTouched(true);
    if (!formValid) return;
    setConfirmOpen(true);
  };

  const sendRequest = () => {
    const nextNumber =
      Math.max(
        0,
        ...withdrawalRequests.map((request) => Number(request.id.replace(/\D/g, "")) || 0),
      ) + 1;
    const submittedDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
    setWithdrawalRequests((current) => [
      {
        id: `WD-${String(nextNumber).padStart(3, "0")}`,
        citizenId: citizenProfile.username,
        citizenName: citizenProfile.name,
        type,
        amount,
        description: description.trim() || "Penarikan saldo manual",
        submittedDate,
        status: "Menunggu",
      },
      ...current,
    ]);
    setConfirmOpen(false);
    notify("Permintaan berhasil dikirim untuk diproses manual.");
    setAmount(0);
    setDescription("");
    setAmountTouched(false);
  };

  return (
    <>
      <PageTitle
        title="Penarikan Saldo"
        desc="Seluruh permintaan diproses manual oleh bank sampah."
      />
      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <Card className="border-green-200 bg-green-50/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">Saldo Tersedia</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#166534]">
                {balanceVisible ? money(currentBalance) : "Rp ••••••"}
              </p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
              <WalletCards size={21} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBalanceVisible((current) => !current)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100 active:scale-[.98]"
          >
            {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            {balanceVisible ? "Sembunyikan Saldo" : "Lihat Saldo"}
          </button>
          <div className="mt-5 border-t border-green-200/80 pt-5 text-xs leading-5 text-slate-600">
            Permintaan hanya dicatat dan diproses secara manual oleh Admin Bank Sampah. Tidak ada
            payment gateway, e-wallet, transfer bank, atau pencairan otomatis.
          </div>
        </Card>
        <Card>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Jenis permintaan</p>
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-700 text-white">
                  <HandCoins size={17} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-green-900">Penarikan manual</p>
                  <p className="mt-0.5 text-xs text-green-700">
                    Diproses langsung oleh pengelola bank sampah.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Field label="Nominal">
                <input
                  value={amount ? money(amount) : ""}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setAmount(digits ? Number(digits) : 0);
                    setAmountTouched(true);
                  }}
                  onBlur={() => setAmountTouched(true)}
                  type="text"
                  inputMode="numeric"
                  className={`input ${
                    amountTouched && !amountValid
                      ? "border-red-400 ring-2 ring-red-100 focus:border-red-400"
                      : ""
                  }`}
                  placeholder="Rp0"
                  aria-invalid={amountTouched && !amountValid}
                />
                {amountTouched && amount <= 0 && (
                  <p className="mt-2 text-xs font-semibold text-red-600">Nominal wajib diisi.</p>
                )}
                {amountTouched && amount > currentBalance && (
                  <p className="mt-2 text-xs font-semibold text-red-600">Saldo tidak mencukupi</p>
                )}
              </Field>
            </div>
            <div>
              <Field label="Keterangan">
                <textarea
                  className="input min-h-20 resize-none"
                  placeholder="Catatan opsional untuk petugas"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>
            </div>
            <Button type="submit" disabled={!formValid} className="w-full">
              Kirim permintaan <ArrowRight size={17} />
            </Button>
          </form>
        </Card>
      </div>
      <Card className="mt-6">
        <div>
          <h2 className="font-extrabold text-slate-900">Riwayat Permintaan Penarikan</h2>
          <p className="mt-1 text-xs text-slate-500">
            Pantau proses manual dan bukti transaksi milik akun Anda.
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {withdrawalRequests
            .filter((request) => request.citizenId === citizenProfile.username)
            .map((request) => (
              <article
                key={request.id}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-extrabold text-green-700">{request.id}</p>
                      <Badge tone={request.status === "Selesai" ? "green" : "amber"}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-extrabold text-slate-900">{request.type}</p>
                    <p className="mt-1 text-xs text-slate-500">{request.submittedDate}</p>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">{money(request.amount)}</p>
                </div>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  {request.status === "Selesai" ? (
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs text-slate-500">Tanggal diproses</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {request.processedDate}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-green-700">
                          {request.type === "Potong iuran bulanan"
                            ? "Bukti Pemotongan Iuran"
                            : "Bukti Transfer"}
                        </p>
                      </div>
                      {request.proof ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="secondary"
                            onClick={() => setPreviewRequest(request)}
                            className="min-h-9 px-3 text-xs"
                          >
                            <Eye size={15} /> Lihat Bukti
                          </Button>
                          <a
                            href={request.proof.dataUrl}
                            download={request.proof.name}
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-green-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-800"
                          >
                            <Download size={15} /> Unduh Bukti
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-slate-400">
                          Bukti transfer belum tersedia
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-amber-700">
                      Bukti transfer belum tersedia
                    </p>
                  )}
                </div>
              </article>
            ))}
          {withdrawalRequests.filter((request) => request.citizenId === citizenProfile.username)
            .length === 0 && <Empty title="Belum ada permintaan penarikan" compact />}
        </div>
      </Card>
      {confirmOpen && (
        <Modal title="Konfirmasi Permintaan" onClose={() => setConfirmOpen(false)}>
          <div className="rounded-xl bg-green-50 p-4">
            <InfoRow label="Jenis permintaan" value={type} />
            <div className="my-4 h-px bg-green-200" />
            <InfoRow label="Nominal" value={money(amount)} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Permintaan akan diteruskan kepada Admin Bank Sampah dan diproses secara manual.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Periksa kembali
            </Button>
            <Button onClick={sendRequest}>
              <Check size={17} /> Ya, kirim permintaan
            </Button>
          </div>
        </Modal>
      )}
      {previewRequest?.proof && previewRequest.citizenId === citizenProfile.username && (
        <Modal title="Bukti Transaksi" onClose={() => setPreviewRequest(null)} wide>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {previewRequest.proof.type === "application/pdf" ? (
              <iframe
                title={`Bukti ${previewRequest.id}`}
                src={previewRequest.proof.dataUrl}
                className="h-[65vh] w-full border-0"
              />
            ) : (
              <img
                src={previewRequest.proof.dataUrl}
                alt={`Bukti transaksi ${previewRequest.id}`}
                className="max-h-[65vh] w-full object-contain"
              />
            )}
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setPreviewRequest(null)}>
              Tutup
            </Button>
            <a
              href={previewRequest.proof.dataUrl}
              download={previewRequest.proof.name}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
            >
              <Download size={16} /> Unduh Bukti
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}

function TasksPage({
  reports,
  setReports,
  go,
  pickedUpReports,
  setPickedUpReports,
  notify,
}: RouterProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const assigned = reports.filter(
    (r) =>
      r.assigned === "Rizky Pratama" &&
      (status === "Semua" || r.status === status) &&
      (r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.citizen.toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <>
      <PageTitle
        title="Daftar Tugas Penjemputan"
        desc="Laporan yang ditugaskan khusus kepada Anda."
      />
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID atau nama warga..."
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input sm:w-48"
          >
            <option>Semua</option>
            <option>Menunggu</option>
            <option>Selesai</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID Laporan</th>
                <th>Warga</th>
                <th>Lokasi</th>
                <th>Kategori</th>
                <th>Berat</th>
                <th>Status Laporan</th>
                <th>Status Tugas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map((report) => {
                const pickedUp = pickedUpReports.includes(report.id);
                const needsPickup = report.method === "Pickup";
                const pickupStarted =
                  report.trackerHistory?.some(
                    (entry) => entry.stage === "Petugas dalam Perjalanan",
                  ) || false;
                return (
                  <tr key={report.id}>
                    <td className="font-bold text-green-700">{report.id}</td>
                    <td>
                      <p className="font-semibold text-slate-800">{report.citizen}</p>
                      <p className="text-xs text-slate-400">{report.phone}</p>
                    </td>
                    <td className="max-w-52 whitespace-normal leading-5">{report.location}</td>
                    <td>{report.category}</td>
                    <td className="font-bold">{report.estimate} kg</td>
                    <td>
                      <Badge tone={report.status === "Selesai" ? "green" : "amber"}>
                        {report.status}
                      </Badge>
                    </td>
                    <td>
                      {report.status === "Selesai" ? (
                        <Badge tone="green">Tugas selesai</Badge>
                      ) : needsPickup ? (
                        <Badge tone={pickedUp ? "green" : pickupStarted ? "amber" : "slate"}>
                          {pickedUp
                            ? "Sudah dijemput"
                            : pickupStarted
                              ? "Dalam perjalanan"
                              : "Belum dijemput"}
                        </Badge>
                      ) : (
                        <Badge tone="blue">Drop-off diterima</Badge>
                      )}
                    </td>
                    <td>
                      {report.status === "Selesai" ? (
                        <span className="text-xs font-semibold text-slate-400">Selesai</span>
                      ) : needsPickup && !pickupStarted ? (
                        <Button
                          onClick={() => {
                            setReports((current) =>
                              current.map((item) =>
                                item.id === report.id
                                  ? addTrackerStage(item, "Petugas dalam Perjalanan")
                                  : item,
                              ),
                            );
                            notify("Penjemputan dimulai dan tracker Warga diperbarui.");
                          }}
                          className="min-h-8 whitespace-nowrap px-3 py-1 text-xs"
                        >
                          <Truck size={14} /> Mulai Penjemputan
                        </Button>
                      ) : needsPickup && !pickedUp ? (
                        <Button
                          onClick={() => {
                            setPickedUpReports((current) => [...current, report.id]);
                            notify("Sampah ditandai sudah dijemput. Lanjutkan ke penimbangan.");
                          }}
                          className="min-h-8 whitespace-nowrap px-3 py-1 text-xs"
                        >
                          <Truck size={14} /> Tandai Dijemput
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            window.sessionStorage.setItem(
                              "simpanwaste-selected-verification",
                              report.id,
                            );
                            go("verifikasi");
                          }}
                          className="min-h-8 whitespace-nowrap px-3 py-1 text-xs"
                        >
                          <Scale size={14} /> Proses
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {assigned.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada tugas yang sesuai filter.
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

function VerificationPage({
  reports,
  setReports,
  setBalance,
  notify,
  categories,
  pickedUpReports,
}: RouterProps) {
  const assignedReports = reports.filter((report) => report.assigned === "Rizky Pratama");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | Report["status"]>("Semua");
  const requestedReportId = window.sessionStorage.getItem("simpanwaste-selected-verification");
  const requestedReport = assignedReports.find(
    (report) =>
      report.id === requestedReportId &&
      (report.status === "Selesai" ||
        report.method === "Drop-off" ||
        pickedUpReports.includes(report.id)),
  );
  const firstReadyReport =
    requestedReport ||
    assignedReports.find(
      (report) =>
        report.status === "Menunggu" &&
        (report.method === "Drop-off" || pickedUpReports.includes(report.id)),
    ) ||
    assignedReports[0];
  const [id, setId] = useState(firstReadyReport?.id || "");
  const [actualWeights, setActualWeights] = useState<Record<string, Record<string, number>>>({});
  const [verifiedConditions, setVerifiedConditions] = useState<
    Record<string, Record<string, WasteCondition[]>>
  >({});
  const processingRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    window.sessionStorage.removeItem("simpanwaste-selected-verification");
  }, []);
  const report = assignedReports.find((item) => item.id === id);
  const reportItems = useMemo(() => {
    if (!report) return [];
    if (report.verifiedItems?.length) {
      return report.verifiedItems.map((item) => ({
        category: item.category,
        estimate: item.estimatedWeight,
        conditions: item.citizenConditions,
      }));
    }
    if (report.categoryWeights?.length) return report.categoryWeights;
    return [{ category: report.category, estimate: report.estimate, conditions: [] }];
  }, [report]);
  const visibleReports = assignedReports.filter(
    (item) =>
      (statusFilter === "Semua" || item.status === statusFilter) &&
      (item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.citizen.toLowerCase().includes(search.toLowerCase())),
  );
  const isReady =
    report?.status === "Selesai" ||
    report?.method === "Drop-off" ||
    (report ? pickedUpReports.includes(report.id) : false);

  useEffect(() => {
    if (!report || report.status !== "Menunggu" || !isReady) return;
    setReports((current) =>
      current.map((item) =>
        item.id === report.id ? addTrackerStage(item, "Petugas Memverifikasi") : item,
      ),
    );
  }, [id, isReady, report, setReports]);

  useEffect(() => {
    if (!report) return;
    const nextActualWeights: Record<string, number> = {};
    const nextConditions: Record<string, WasteCondition[]> = {};
    reportItems.forEach((item, index) => {
      const itemKey = `${index}:${item.category}`;
      const savedItem = report.verifiedItems?.[index];
      nextActualWeights[itemKey] = savedItem?.actualWeight ?? item.estimate;
      nextConditions[itemKey] =
        savedItem?.verifiedConditions ||
        (savedItem?.verifiedCondition ? [savedItem.verifiedCondition] : []);
    });
    setActualWeights((current) =>
      current[report.id] ? current : { ...current, [report.id]: nextActualWeights },
    );
    setVerifiedConditions((current) =>
      current[report.id] ? current : { ...current, [report.id]: nextConditions },
    );
  }, [id, report, reportItems]);

  const reportActualWeights = actualWeights[id] || {};
  const reportVerifiedConditions = verifiedConditions[id] || {};
  const itemCalculations = reportItems.map((item, index) => {
    const itemKey = `${index}:${item.category}`;
    const category = categories.find((candidate) => candidate.name === item.category);
    const selectedConditions = reportVerifiedConditions[itemKey] || [];
    const selectedPrices = category
      ? selectedConditions.map((condition) => category.prices[condition])
      : [];
    const price = selectedPrices.length ? Math.min(...selectedPrices) : 0;
    const actualWeight = reportActualWeights[itemKey] || 0;
    return {
      ...item,
      itemKey,
      actualWeight,
      verifiedConditions: selectedConditions,
      weighingPhoto:
        report.verifiedItems?.[index]?.weighingPhoto || report.weighingPhotoDrafts?.[itemKey],
      price,
      subtotal: actualWeight * price,
    };
  });
  const totalActualWeight = itemCalculations.reduce((total, item) => total + item.actualWeight, 0);
  const totalValue = itemCalculations.reduce((total, item) => total + item.subtotal, 0);
  const formValid =
    itemCalculations.length > 0 &&
    itemCalculations.every(
      (item) =>
        item.actualWeight > 0 &&
        item.verifiedConditions.length > 0 &&
        item.weighingPhoto &&
        categories.some((category) => category.name === item.category),
    );

  const toggleVerifiedCondition = (itemKey: string, condition: WasteCondition) => {
    if (!report || !isReady || report.status === "Selesai") return;
    setVerifiedConditions((current) => {
      const reportConditions = current[report.id] || {};
      const selected = reportConditions[itemKey] || [];
      return {
        ...current,
        [report.id]: {
          ...reportConditions,
          [itemKey]: selected.includes(condition)
            ? selected.filter((item) => item !== condition)
            : [...selected, condition],
        },
      };
    });
  };

  const setWeighingPhoto = (
    itemKey: string,
    photo?: { name: string; type: string; dataUrl: string },
  ) => {
    if (!report || report.status === "Selesai") return;
    setReports((current) =>
      current.map((item) => {
        if (item.id !== report.id) return item;
        const nextDrafts = { ...(item.weighingPhotoDrafts || {}) };
        if (photo) nextDrafts[itemKey] = photo;
        else delete nextDrafts[itemKey];
        return { ...item, weighingPhotoDrafts: nextDrafts };
      }),
    );
  };

  const chooseWeighingPhoto = (itemKey: string, file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      !["jpg", "jpeg", "png"].includes(extension || "")
    ) {
      return notify("Foto penimbangan harus berformat JPG, JPEG, atau PNG.");
    }
    if (file.size > 2 * 1024 * 1024) {
      return notify("Ukuran foto penimbangan maksimum 2 MB pada prototype.");
    }
    const reader = new FileReader();
    reader.onload = () =>
      setWeighingPhoto(itemKey, {
        name: file.name,
        type: file.type,
        dataUrl: String(reader.result),
      });
    reader.onerror = () => notify("Foto tidak dapat dibaca. Silakan pilih foto lain.");
    reader.readAsDataURL(file);
  };

  const complete = () => {
    if (!report || report.status === "Selesai" || processingRef.current.has(report.id)) return;
    if (!formValid)
      return notify(
        "Lengkapi berat aktual, kondisi terverifikasi, dan foto penimbangan setiap kategori.",
      );
    processingRef.current.add(report.id);
    const verifiedItems = itemCalculations.map((item) => ({
      category: item.category,
      estimatedWeight: item.estimate,
      citizenConditions: item.conditions || [],
      actualWeight: item.actualWeight,
      verifiedConditions: item.verifiedConditions,
      weighingPhoto: item.weighingPhoto,
      price: item.price,
      subtotal: item.subtotal,
    }));
    const completionTimestamp = trackerTimestamp();
    if (report.citizen === "Ayu Lestari") setBalance((balance) => balance + totalValue);
    setReports((rs) =>
      rs.map((item) =>
        item.id === report.id && item.status === "Menunggu"
          ? addTrackerStage(
              {
                ...item,
                status: "Selesai",
                actual: totalActualWeight,
                value: totalValue,
                verifiedItems,
                weighingPhotoDrafts: undefined,
              },
              "Poin Saldo Didapatkan",
              completionTimestamp,
            )
          : item,
      ),
    );
    notify(`Penimbangan selesai. Saldo bertambah ${money(totalValue)}.`);
  };

  return (
    <>
      <PageTitle
        title="Verifikasi & Penimbangan"
        desc="Kelola antrean laporan dan verifikasi setiap kategori hasil penimbangan fisik."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <Card className="p-4 xl:sticky xl:top-24">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Total", assignedReports.length],
              ["Menunggu", assignedReports.filter((item) => item.status === "Menunggu").length],
              ["Selesai", assignedReports.filter((item) => item.status === "Selesai").length],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-extrabold text-slate-900">{value}</p>
                <p className="mt-0.5 text-[10px] font-bold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="input py-2.5 pl-9 text-sm"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari ID atau nama warga..."
              />
            </div>
            <select
              className="input py-2.5 text-sm"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "Semua" | Report["status"])
              }
            >
              <option>Semua</option>
              <option>Menunggu</option>
              <option>Selesai</option>
            </select>
          </div>
          <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {visibleReports.map((item) => {
              const categoryCount = item.categoryWeights?.length || 1;
              const active = item.id === id;
              const awaitingPickup =
                item.status === "Menunggu" &&
                item.method === "Pickup" &&
                !pickedUpReports.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setId(item.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-green-500 bg-green-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-green-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-green-700">{item.id}</p>
                      <p className="mt-1 text-sm font-extrabold text-slate-900">{item.citizen}</p>
                    </div>
                    <Badge tone={item.status === "Selesai" ? "green" : "amber"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                    <span>{item.date}</span>
                    <span>{categoryCount} kategori</span>
                    <span className="text-right font-bold">{item.estimate} kg</span>
                  </div>
                  {awaitingPickup && (
                    <p className="mt-2 text-[10px] font-bold text-amber-700">
                      Menunggu konfirmasi penjemputan
                    </p>
                  )}
                </button>
              );
            })}
            {visibleReports.length === 0 && <Empty title="Laporan tidak ditemukan" compact />}
          </div>
        </Card>

        <Card className="p-5 sm:p-7">
          {report ? (
            <>
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-extrabold text-green-700">{report.id}</p>
                    <Badge tone={report.status === "Selesai" ? "green" : "amber"}>
                      {report.status}
                    </Badge>
                  </div>
                  <h2 className="mt-2 text-xl font-extrabold text-slate-900">{report.citizen}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.phone} · {report.date} · {report.method}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">Total estimasi</p>
                  <p className="text-xl font-extrabold text-slate-900">{report.estimate} kg</p>
                </div>
              </div>

              {!isReady && (
                <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <Truck size={18} className="shrink-0" />
                  Laporan Pickup harus ditandai sudah dijemput pada Tugas Penjemputan sebelum
                  ditimbang.
                </div>
              )}

              <div className="mt-6 space-y-4">
                {itemCalculations.map((item, index) => {
                  const savedItem = report.verifiedItems?.[index];
                  const savedConditions =
                    savedItem?.verifiedConditions ||
                    (savedItem?.verifiedCondition ? [savedItem.verifiedCondition] : []);
                  const readOnly = report.status === "Selesai";
                  return (
                    <section
                      key={`${item.category}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-green-700">
                            Kategori {index + 1}
                          </p>
                          <h3 className="mt-1 font-extrabold text-slate-900">{item.category}</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Estimasi Warga: <strong>{item.estimate} kg</strong>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:max-w-[55%] sm:justify-end">
                          {(item.conditions?.length ? item.conditions : []).map((condition) => (
                            <span
                              key={condition}
                              className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-800"
                            >
                              {condition}
                            </span>
                          ))}
                          {!item.conditions?.length && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              Kondisi awal tidak tersedia
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <Field label="Berat aktual (kg)">
                          <input
                            type="number"
                            min=".1"
                            step=".1"
                            disabled={readOnly || !isReady}
                            value={(savedItem?.actualWeight ?? item.actualWeight) || ""}
                            onChange={(event) =>
                              setActualWeights((current) => ({
                                ...current,
                                [report.id]: {
                                  ...(current[report.id] || {}),
                                  [item.itemKey]: Number(event.target.value),
                                },
                              }))
                            }
                            className="input disabled:bg-slate-100"
                          />
                        </Field>
                        <div>
                          <p className="mb-2 text-sm font-semibold text-slate-700">
                            Kondisi terverifikasi
                          </p>
                          {readOnly ? (
                            <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2">
                              {savedConditions.length ? (
                                savedConditions.map((condition) => (
                                  <span
                                    key={condition}
                                    className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700"
                                  >
                                    {condition}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm font-bold text-slate-500">
                                  Tidak tersedia
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {wasteConditions.map((condition) => {
                                const selected = item.verifiedConditions.includes(condition);
                                return (
                                  <label
                                    key={condition}
                                    className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-bold leading-4 transition ${
                                      !isReady ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                    } ${
                                      selected
                                        ? "border-green-600 bg-green-50 text-green-900 ring-1 ring-green-600"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50/50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      disabled={!isReady}
                                      checked={selected}
                                      onChange={() =>
                                        toggleVerifiedCondition(item.itemKey, condition)
                                      }
                                      className="h-4 w-4 shrink-0 accent-green-700"
                                    />
                                    <span>{condition}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                          {!readOnly && item.verifiedConditions.length > 1 && (
                            <p className="mt-2 text-[10px] leading-4 text-slate-500">
                              Harga terendah dari kondisi yang dipilih digunakan untuk perhitungan.
                            </p>
                          )}
                        </div>
                        <Field label="Harga per kilogram">
                          <input
                            disabled
                            className="input bg-slate-100"
                            value={money(savedItem?.price ?? item.price)}
                          />
                        </Field>
                        <Field label="Subtotal">
                          <input
                            disabled
                            className="input bg-green-50 font-extrabold text-green-800"
                            value={money(savedItem?.subtotal ?? item.subtotal)}
                          />
                        </Field>
                      </div>
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <p className="text-sm font-semibold text-slate-700">
                          Foto Bukti Penimbangan
                        </p>
                        {item.weighingPhoto ? (
                          <div className="mt-3 rounded-xl border border-green-200 bg-white p-3">
                            <img
                              src={item.weighingPhoto.dataUrl}
                              alt={`Bukti penimbangan ${item.category}`}
                              className="max-h-56 w-full rounded-lg bg-slate-50 object-contain"
                            />
                            <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <p className="min-w-0 truncate text-xs font-bold text-slate-700">
                                {item.weighingPhoto.name}
                              </p>
                              {!readOnly && (
                                <div className="flex gap-2">
                                  <label className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 active:scale-[.97]">
                                    <UploadCloud size={14} /> Ganti Foto
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                      className="sr-only"
                                      disabled={!isReady}
                                      onChange={(event) =>
                                        chooseWeighingPhoto(item.itemKey, event.target.files?.[0])
                                      }
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    disabled={!isReady}
                                    onClick={() => setWeighingPhoto(item.itemKey)}
                                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <Trash2 size={14} /> Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <label
                              className={`flex min-h-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 px-4 py-5 text-center transition ${
                                isReady
                                  ? "cursor-pointer hover:border-green-400"
                                  : "cursor-not-allowed opacity-50"
                              }`}
                            >
                              <UploadCloud className="text-green-700" size={23} />
                              <span className="mt-2 text-xs font-extrabold text-green-800">
                                Upload Foto Penimbangan
                              </span>
                              <span className="mt-1 text-[10px] text-slate-500">
                                JPG, JPEG, atau PNG · maks. 2 MB
                              </span>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                className="sr-only"
                                disabled={!isReady}
                                onChange={(event) =>
                                  chooseWeighingPhoto(item.itemKey, event.target.files?.[0])
                                }
                              />
                            </label>
                            {isReady && report.status === "Menunggu" && (
                              <p className="mt-2 text-xs font-semibold text-red-600">
                                Foto bukti penimbangan wajib diunggah.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-green-700">Total berat aktual</p>
                    <p className="mt-1 text-xl font-extrabold text-green-950">
                      {report.actual ?? totalActualWeight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Total nilai setoran</p>
                    <p className="mt-1 text-xl font-extrabold text-green-950">
                      {money(report.value ?? totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Saldo ditambahkan</p>
                    <p className="mt-1 text-xl font-extrabold text-green-950">
                      {money(report.value ?? totalValue)}
                    </p>
                  </div>
                </div>
              </div>

              {report.status === "Menunggu" && isReady && !formValid && (
                <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-800">
                  <XCircle size={17} className="mt-0.5 shrink-0" />
                  Lengkapi berat aktual, minimal satu kondisi terverifikasi, dan foto bukti pada
                  setiap kategori sebelum menyelesaikan laporan.
                </div>
              )}

              {report.status === "Menunggu" ? (
                <>
                  <Button
                    onClick={complete}
                    disabled={!isReady || !formValid}
                    className="mt-6 w-full py-3"
                  >
                    <CheckCircle2 size={18} /> Simpan & Selesaikan Laporan
                  </Button>
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Satu laporan diselesaikan sekaligus. Saldo hanya ditambahkan satu kali.
                  </p>
                </>
              ) : (
                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-4 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={18} className="text-green-700" />
                  Laporan selesai dan bersifat hanya-baca
                </div>
              )}
            </>
          ) : (
            <Empty title="Pilih laporan dari antrean" />
          )}
        </Card>
      </div>
    </>
  );
}

function AdminWithdrawalPage({
  notify,
  setBalance,
  withdrawalRequests,
  setWithdrawalRequests,
}: RouterProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | WithdrawalRequest["status"]>("Semua");
  const [processingRequest, setProcessingRequest] = useState<WithdrawalRequest | null>(null);
  const [detailRequest, setDetailRequest] = useState<WithdrawalRequest | null>(null);
  const [previewRequest, setPreviewRequest] = useState<WithdrawalRequest | null>(null);
  const [proofDraft, setProofDraft] = useState<WithdrawalRequest["proof"]>();
  const [proofError, setProofError] = useState("");
  const [processing, setProcessing] = useState(false);
  const visibleRequests = withdrawalRequests.filter(
    (request) =>
      (statusFilter === "Semua" || request.status === statusFilter) &&
      (request.id.toLowerCase().includes(search.toLowerCase()) ||
        request.citizenName.toLowerCase().includes(search.toLowerCase())),
  );
  const openProcessModal = (request: WithdrawalRequest) => {
    if (request.status === "Selesai") return;
    setProcessingRequest(request);
    setProofDraft(undefined);
    setProofError("");
  };
  const chooseProof = (file?: File) => {
    setProofError("");
    if (!file) return setProofDraft(undefined);
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !allowedTypes.includes(file.type) ||
      !["jpg", "jpeg", "png", "pdf"].includes(extension || "")
    ) {
      setProofDraft(undefined);
      return setProofError("Gunakan file JPG, JPEG, PNG, atau PDF.");
    }
    if (file.size > 2 * 1024 * 1024) {
      setProofDraft(undefined);
      return setProofError("Ukuran file maksimum untuk prototype adalah 2 MB.");
    }
    const reader = new FileReader();
    reader.onload = () =>
      setProofDraft({
        name: file.name,
        type: file.type,
        dataUrl: String(reader.result),
      });
    reader.onerror = () => setProofError("File tidak dapat dibaca. Silakan pilih file lain.");
    reader.readAsDataURL(file);
  };
  const confirmProcess = () => {
    if (!processingRequest || processingRequest.status === "Selesai") return;
    if (!proofDraft) return setProofError("Bukti transaksi wajib diunggah.");
    const currentRequest = withdrawalRequests.find(
      (request) => request.id === processingRequest.id,
    );
    if (!currentRequest || currentRequest.status === "Selesai") {
      setProcessingRequest(null);
      return notify("Permintaan ini sudah selesai diproses.");
    }
    setProcessing(true);
    window.setTimeout(() => {
      const processedDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date());
      setWithdrawalRequests((current) =>
        current.map((request) =>
          request.id === processingRequest.id && request.status === "Menunggu"
            ? {
                ...request,
                status: "Selesai",
                processedDate,
                processedBy: "Nadia Putri",
                proof: proofDraft,
              }
            : request,
        ),
      );
      if (processingRequest.citizenId === "ayu.lestari") {
        setBalance((current) => Math.max(0, current - processingRequest.amount));
      }
      setProcessing(false);
      setProcessingRequest(null);
      setProofDraft(undefined);
      notify("Permintaan berhasil diproses dan bukti transaksi tersimpan.");
    }, 650);
  };
  return (
    <>
      <PageTitle
        title="Permintaan Penarikan"
        desc="Kelola dan proses permintaan penarikan saldo warga secara manual."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Permintaan"
          value={String(withdrawalRequests.length)}
          detail="Seluruh permintaan"
          icon={HandCoins}
        />
        <StatCard
          label="Menunggu"
          value={String(
            withdrawalRequests.filter((request) => request.status === "Menunggu").length,
          )}
          detail="Perlu diproses"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Selesai"
          value={String(
            withdrawalRequests.filter((request) => request.status === "Selesai").length,
          )}
          detail="Telah diproses"
          icon={CheckCircle2}
          tone="blue"
        />
      </div>
      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input pl-10"
              placeholder="Cari ID atau nama warga..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "Semua" | WithdrawalRequest["status"])
            }
            className="input sm:w-48"
          >
            <option>Semua</option>
            <option>Menunggu</option>
            <option>Selesai</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID Permintaan</th>
                <th>Nama Warga</th>
                <th>Jenis Permintaan</th>
                <th>Nominal</th>
                <th>Keterangan</th>
                <th>Tanggal Pengajuan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((request) => (
                <tr key={request.id}>
                  <td className="font-bold text-green-700">{request.id}</td>
                  <td className="font-semibold">{request.citizenName}</td>
                  <td>{request.type}</td>
                  <td className="font-bold">{money(request.amount)}</td>
                  <td className="max-w-56 whitespace-normal">{request.description}</td>
                  <td>{request.submittedDate}</td>
                  <td>
                    <Badge tone={request.status === "Selesai" ? "green" : "amber"}>
                      {request.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex min-w-max gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setDetailRequest(request)}
                        className="min-h-8 px-3 py-1 text-xs"
                      >
                        Detail
                      </Button>
                      {request.status === "Menunggu" ? (
                        <Button
                          onClick={() => openProcessModal(request)}
                          className="min-h-8 px-3 py-1 text-xs"
                        >
                          Proses
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => setPreviewRequest(request)}
                          className="min-h-8 px-3 py-1 text-xs"
                        >
                          Lihat Bukti
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleRequests.length === 0 && <Empty title="Permintaan tidak ditemukan" compact />}
        </div>
      </Card>
      {detailRequest && (
        <Modal title="Detail Permintaan" onClose={() => setDetailRequest(null)}>
          <div className="space-y-3 rounded-xl bg-slate-50 p-4">
            <InfoRow label="ID Permintaan" value={detailRequest.id} />
            <InfoRow label="Nama Warga" value={detailRequest.citizenName} />
            <InfoRow label="Jenis" value={detailRequest.type} />
            <InfoRow label="Nominal" value={money(detailRequest.amount)} />
            <InfoRow label="Tanggal" value={detailRequest.submittedDate} />
            <InfoRow label="Status" value={detailRequest.status} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{detailRequest.description}</p>
          <Button
            variant="secondary"
            onClick={() => setDetailRequest(null)}
            className="mt-6 w-full"
          >
            Tutup
          </Button>
        </Modal>
      )}
      {processingRequest && (
        <Modal
          title="Proses Permintaan Penarikan"
          onClose={() => !processing && setProcessingRequest(null)}
        >
          <div className="space-y-3 rounded-xl bg-slate-50 p-4">
            <InfoRow label="ID Permintaan" value={processingRequest.id} />
            <InfoRow label="Nama Warga" value={processingRequest.citizenName} />
            <InfoRow label="Jenis" value={processingRequest.type} />
            <InfoRow label="Nominal" value={money(processingRequest.amount)} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{processingRequest.description}</p>
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold text-slate-700">
              {processingRequest.type === "Potong iuran bulanan"
                ? "Bukti Pemotongan Iuran"
                : "Upload Bukti Transfer"}
            </p>
            <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 px-5 py-6 text-center transition hover:border-green-400">
              <UploadCloud className="text-green-700" size={25} />
              <span className="mt-2 text-sm font-bold text-green-800">Pilih gambar atau PDF</span>
              <span className="mt-1 text-xs text-slate-500">JPG, JPEG, PNG, PDF · maks. 2 MB</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                className="sr-only"
                onChange={(event) => chooseProof(event.target.files?.[0])}
              />
            </label>
            {proofDraft && (
              <div className="mt-3 rounded-xl border border-green-200 bg-white p-3">
                <p className="truncate text-xs font-bold text-slate-700">{proofDraft.name}</p>
                {proofDraft.type.startsWith("image/") && (
                  <img
                    src={proofDraft.dataUrl}
                    alt="Pratinjau bukti"
                    className="mt-3 max-h-48 w-full rounded-lg object-contain"
                  />
                )}
              </div>
            )}
            {proofError && <p className="mt-2 text-xs font-semibold text-red-600">{proofError}</p>}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              disabled={processing}
              onClick={() => setProcessingRequest(null)}
            >
              Batal
            </Button>
            <Button disabled={processing} onClick={confirmProcess}>
              {processing ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <Check size={16} />
              )}
              {processing ? "Menyimpan..." : "Konfirmasi Proses"}
            </Button>
          </div>
        </Modal>
      )}
      {previewRequest?.proof && (
        <Modal title="Bukti Transaksi" onClose={() => setPreviewRequest(null)} wide>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {previewRequest.proof.type === "application/pdf" ? (
              <iframe
                title={`Bukti ${previewRequest.id}`}
                src={previewRequest.proof.dataUrl}
                className="h-[65vh] w-full border-0"
              />
            ) : (
              <img
                src={previewRequest.proof.dataUrl}
                alt={`Bukti transaksi ${previewRequest.id}`}
                className="max-h-[65vh] w-full object-contain"
              />
            )}
          </div>
          <a
            href={previewRequest.proof.dataUrl}
            download={previewRequest.proof.name}
            className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white"
          >
            <Download size={16} /> Unduh Bukti
          </a>
        </Modal>
      )}
    </>
  );
}

function MapsPage({ role, go }: { role: Role; go: (page: string) => void }) {
  const encodedGrahaAddress = encodeURIComponent(grahaPenaLocation.address);
  return (
    <>
      <PageTitle
        title="Maps Bank Sampah"
        desc="Lokasi bank sampah aktif dan terverifikasi di area pilot Palembang."
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_.75fr]">
        <Card className="p-3">
          <div className="map-full bg-slate-100">
            <iframe
              title="Peta Bank Sampah Graha Pena Palembang"
              src={`https://www.google.com/maps?q=${encodedGrahaAddress}&z=16&output=embed`}
              className="h-full min-h-[580px] w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="absolute bottom-4 left-4 right-4 max-w-sm rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur">
              <p className="text-xs font-bold text-green-700">Mitra Utama SIMPANWASTE</p>
              <p className="mt-1 text-sm font-extrabold">{grahaPenaLocation.name}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{grahaPenaLocation.address}</p>
            </div>
          </div>
        </Card>
        <div className="space-y-3">
          <div className="w-full rounded-2xl border-2 border-green-600 bg-green-50/70 p-5 text-left shadow-[0_10px_30px_rgba(22,101,52,.1)]">
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-700 text-white">
                <Recycle size={19} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold">{grahaPenaLocation.name}</p>
                  <Badge tone="green">Mitra SIMPANWASTE</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {grahaPenaLocation.address}. {grahaPenaLocation.landmark}
                </p>
                <div className="mt-3 space-y-2 text-xs font-semibold text-green-700">
                  <p className="flex items-center gap-1.5">
                    <Clock3 size={14} />
                    Senin–Jumat: {grahaPenaLocation.weekdaySchedule}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    Sabtu: {grahaPenaLocation.saturdaySchedule}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-green-200 bg-white p-4">
              <p className="text-xs font-bold leading-5 text-slate-700">
                Bank Sampah Graha Pena adalah lokasi penyetoran yang terintegrasi dengan
                SIMPANWASTE.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {role === "warga" && (
                  <Button onClick={() => go("buat-laporan")} className="flex-1">
                    <Recycle size={16} /> Setor Sekarang
                  </Button>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodedGrahaAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-50"
                >
                  <MapPin size={16} /> Lihat Selengkapnya
                </a>
              </div>
            </div>
          </div>
          {banks.map((bank) => (
            <div
              key={bank.name}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-left opacity-80"
            >
              <div className="flex gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <Building2 size={19} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold">{bank.name}</p>
                    <Badge tone="slate">Lokasi referensi</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{bank.address}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Clock3 size={14} />
                    {bank.hours}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-400">
                    Ditampilkan sebagai informasi dan belum terintegrasi dengan layanan SIMPANWASTE.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ProfilePage({ role, notify, go, citizenProfile, setCitizenProfile }: RouterProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(citizenProfile);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  if (role !== "warga") {
    const data = {
      petugas: [
        "Rizky Pratama",
        "rizky.p",
        "0813 7781 2240",
        "Jl. Rajawali, Ilir Timur II, Palembang",
      ],
      admin: ["Nadia Putri", "admin.simpan", "0812 9900 8822", "Kantor SIMPANWASTE Palembang"],
    }[role] || ["", "", "", ""];
    return (
      <>
        <PageTitle title="Profil Saya" desc="Kelola informasi akun Anda sendiri." />
        <Card className="mx-auto max-w-3xl p-7">
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100 text-xl font-extrabold text-green-800">
              {data[0]
                .split(" ")
                .map((item) => item[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-xl font-extrabold">{data[0]}</h2>
              <Badge tone="amber">Petugas</Badge>
            </div>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              notify("Perubahan profil berhasil disimpan.");
            }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <Field label="Nama lengkap">
              <input className="input" defaultValue={data[0]} />
            </Field>
            <Field label="Username">
              <input className="input" defaultValue={data[1]} />
            </Field>
            <Field label="Nomor telepon">
              <input className="input" defaultValue={data[2]} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Alamat">
                <textarea className="input min-h-24 resize-none" defaultValue={data[3]} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Simpan perubahan</Button>
            </div>
          </form>
        </Card>
      </>
    );
  }

  const initials = citizenProfile.name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const beginEdit = () => {
    setDraft(citizenProfile);
    setProfileErrors({});
    setEditing(true);
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "Nama lengkap wajib diisi.";
    if (!draft.username.trim()) nextErrors.username = "Username wajib diisi.";
    else if (!/^[a-z0-9._]{4,20}$/.test(draft.username))
      nextErrors.username = "Gunakan 4–20 karakter: huruf kecil, angka, titik, atau garis bawah.";
    if (!draft.phone.replace(/\D/g, "")) nextErrors.phone = "Nomor telepon wajib diisi.";
    else if (!/^08\d{8,11}$/.test(draft.phone.replace(/\D/g, "")))
      nextErrors.phone = "Gunakan nomor telepon Indonesia yang valid.";
    if (!draft.address.trim()) nextErrors.address = "Alamat lengkap wajib diisi.";
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setCitizenProfile({
      ...draft,
      name: draft.name.trim(),
      username: draft.username.trim(),
      address: draft.address.trim(),
    });
    setEditing(false);
    notify("Perubahan profil berhasil disimpan.");
  };

  const updatePassword = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!newPassword) nextErrors.password = "Password baru wajib diisi.";
    else if (newPassword.length < 8)
      nextErrors.password = "Password harus terdiri dari minimal 8 karakter.";
    if (!passwordConfirmation) nextErrors.confirmation = "Konfirmasi password wajib diisi.";
    else if (passwordConfirmation !== newPassword)
      nextErrors.confirmation = "Konfirmasi password tidak sesuai.";
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setNewPassword("");
    setPasswordConfirmation("");
    setPasswordErrors({});
    notify("Password berhasil diperbarui.");
  };

  const personalItems = [
    { label: "Nama lengkap", value: citizenProfile.name, icon: UserRound },
    { label: "Username", value: `@${citizenProfile.username}`, icon: UserCog },
    { label: "Nomor telepon", value: citizenProfile.phone, icon: Phone },
    { label: "Alamat lengkap", value: citizenProfile.address, icon: MapPin },
  ];

  return (
    <>
      <PageTitle title="Profil Saya" desc="Kelola informasi akun Anda sendiri." />

      <section className="relative overflow-hidden rounded-[1.75rem] border border-green-100 bg-[#eaf7ed] p-6 sm:p-8">
        <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full border-[42px] border-green-600/[.055]" />
        <div className="absolute -bottom-28 left-[36%] h-60 w-60 rounded-full bg-green-300/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-white bg-green-700 text-2xl font-extrabold text-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                  {citizenProfile.name}
                </h1>
                <Badge tone="green">Warga</Badge>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                @{citizenProfile.username}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-800">
                <MapPin size={14} /> Palembang
              </p>
            </div>
          </div>
          <Button onClick={beginEdit} className="w-full sm:w-auto">
            <Pencil size={16} /> Edit Profil
          </Button>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Informasi Pribadi</h2>
              <p className="mt-1 text-xs text-slate-500">Data utama akun warga Anda.</p>
            </div>
            {!editing && (
              <Button variant="secondary" onClick={beginEdit} className="min-h-9 px-3 text-xs">
                <Pencil size={14} /> Edit
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="mt-7 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama lengkap
                </span>
                <input
                  value={draft.name}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, name: event.target.value }));
                    setProfileErrors((current) => ({ ...current, name: "" }));
                  }}
                  className={`input ${profileErrors.name ? "border-red-400 ring-2 ring-red-100" : ""}`}
                />
                {profileErrors.name && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{profileErrors.name}</p>
                )}
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">Username</span>
                <input
                  value={draft.username}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      username: event.target.value.toLowerCase(),
                    }));
                    setProfileErrors((current) => ({ ...current, username: "" }));
                  }}
                  className={`input ${profileErrors.username ? "border-red-400 ring-2 ring-red-100" : ""}`}
                />
                {profileErrors.username && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {profileErrors.username}
                  </p>
                )}
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nomor telepon
                </span>
                <input
                  value={draft.phone}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, phone: event.target.value }));
                    setProfileErrors((current) => ({ ...current, phone: "" }));
                  }}
                  className={`input ${profileErrors.phone ? "border-red-400 ring-2 ring-red-100" : ""}`}
                />
                {profileErrors.phone && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{profileErrors.phone}</p>
                )}
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Alamat lengkap
                </span>
                <textarea
                  value={draft.address}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, address: event.target.value }));
                    setProfileErrors((current) => ({ ...current, address: "" }));
                  }}
                  className={`input min-h-24 resize-none ${profileErrors.address ? "border-red-400 ring-2 ring-red-100" : ""}`}
                />
                {profileErrors.address && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {profileErrors.address}
                  </p>
                )}
              </label>
              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setDraft(citizenProfile);
                    setProfileErrors({});
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">
                  <Check size={16} /> Simpan Perubahan
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {personalItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`rounded-xl bg-slate-50 p-4 ${
                      item.label === "Alamat lengkap" ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-50 text-green-700">
                        <ItemIcon size={17} />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[.11em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-1.5 text-sm font-bold leading-6 text-slate-800">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Keamanan Akun</h2>
              <p className="mt-1 text-xs text-slate-500">Perbarui password akun Anda.</p>
            </div>
          </div>
          <form onSubmit={updatePassword} className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password baru</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordErrors((current) => ({ ...current, password: "" }));
                  }}
                  className={`input pr-11 ${passwordErrors.password ? "border-red-400 ring-2 ring-red-100" : ""}`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.password && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {passwordErrors.password}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Konfirmasi password
              </span>
              <div className="relative">
                <input
                  type={showConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(event) => {
                    setPasswordConfirmation(event.target.value);
                    setPasswordErrors((current) => ({ ...current, confirmation: "" }));
                  }}
                  className={`input pr-11 ${passwordErrors.confirmation ? "border-red-400 ring-2 ring-red-100" : ""}`}
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showConfirmation ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                >
                  {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.confirmation && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {passwordErrors.confirmation}
                </p>
              )}
            </label>
            <Button
              type="submit"
              disabled={!newPassword && !passwordConfirmation}
              className="w-full"
            >
              Perbarui Password
            </Button>
          </form>
        </Card>
      </div>

      <section className="mt-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Akses Cepat</h2>
          <p className="mt-1 text-xs text-slate-500">Kelola aktivitas akun warga Anda.</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Riwayat Laporan",
              desc: "Pantau seluruh riwayat penyetoran sampah Anda.",
              page: "riwayat",
              icon: ClipboardList,
              color: "bg-green-50 text-green-700",
            },
            {
              title: "Saldo & Transaksi",
              desc: "Lihat saldo tabungan dan riwayat transaksi.",
              page: "saldo",
              icon: WalletCards,
              color: "bg-emerald-50 text-emerald-700",
            },
            {
              title: "Penarikan Saldo",
              desc: "Kelola permintaan penarikan saldo Anda.",
              page: "penarikan",
              icon: HandCoins,
              color: "bg-teal-50 text-teal-700",
            },
          ].map((item) => {
            const QuickIcon = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => go(item.page)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_3px_12px_rgba(15,23,42,.04)] transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl ${item.color}`}>
                    <QuickIcon size={20} />
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-700"
                  />
                </div>
                <h3 className="mt-5 font-extrabold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

function AccountsPage({ notify }: { notify: (t: string) => void }) {
  const defaultUsers = [
    { name: "Ayu Lestari", username: "ayu.lestari", phone: "0812 7788 2341", role: "Warga" },
    { name: "Budi Santoso", username: "budi.s", phone: "0813 6900 1122", role: "Warga" },
    { name: "Rizky Pratama", username: "rizky.p", phone: "0813 7781 2240", role: "Petugas" },
    { name: "Nadia Putri", username: "admin.simpan", phone: "0812 9900 8822", role: "Admin" },
  ];
  const [role, setRole] = useState("Semua");
  const [modal, setModal] = useState(false);
  const [users, setUsers] = useState(() => readStoredState("simpanwaste-users", defaultUsers));
  const [editingUser, setEditingUser] = useState<{
    originalUsername: string;
    data: { name: string; username: string; phone: string; role: string };
  } | null>(null);
  const [deletingUser, setDeletingUser] = useState<(typeof users)[number] | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    window.localStorage.setItem("simpanwaste-users", JSON.stringify(users));
  }, [users]);
  const saveUserChanges = (event: FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;
    const data = {
      ...editingUser.data,
      name: editingUser.data.name.trim(),
      username: editingUser.data.username.trim().toLowerCase(),
      phone: editingUser.data.phone.trim(),
    };
    const errors: Record<string, string> = {};
    if (!data.name) errors.name = "Nama lengkap wajib diisi.";
    if (!data.username) errors.username = "Username wajib diisi.";
    else if (
      users.some(
        (user) =>
          user.username.toLowerCase() === data.username &&
          user.username !== editingUser.originalUsername,
      )
    )
      errors.username = "Username sudah digunakan.";
    if (!data.phone) errors.phone = "Nomor telepon wajib diisi.";
    if (!data.role) errors.role = "Role wajib dipilih.";
    setEditErrors(errors);
    if (Object.keys(errors).length) return;
    setUsers((current) =>
      current.map((user) => (user.username === editingUser.originalUsername ? data : user)),
    );
    setEditingUser(null);
    setEditErrors({});
    notify("Perubahan akun berhasil disimpan.");
  };
  const updateEditingUser = (field: "name" | "username" | "phone" | "role", value: string) => {
    setEditingUser((current) =>
      current ? { ...current, data: { ...current.data, [field]: value } } : current,
    );
    setEditErrors((current) => ({ ...current, [field]: "" }));
  };
  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    setUsers((current) => current.filter((user) => user.username !== deletingUser.username));
    setDeletingUser(null);
    notify("Akun berhasil dihapus.");
  };
  return (
    <>
      <PageTitle
        title="Kelola Akun"
        desc="Tambah dan kelola akun Warga, Petugas, serta Admin."
        action={
          <Button onClick={() => setModal(true)}>
            <Plus size={17} /> Tambah akun
          </Button>
        }
      />
      <Card>
        <div className="mb-4 flex justify-between">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input w-44">
            <option>Semua</option>
            <option>Warga</option>
            <option>Petugas</option>
            <option>Admin</option>
          </select>
          <p className="self-center text-xs text-slate-400">Password tidak pernah ditampilkan</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Telepon</th>
                <th>Peran</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => role === "Semua" || u.role === role)
                .map((u) => (
                  <tr key={u.username}>
                    <td className="font-bold">{u.name}</td>
                    <td>{u.username}</td>
                    <td>{u.phone}</td>
                    <td>
                      <Badge
                        tone={
                          u.role === "Admin" ? "blue" : u.role === "Petugas" ? "amber" : "green"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex min-w-max items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser({ originalUsername: u.username, data: { ...u } });
                            setEditErrors({});
                          }}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 active:scale-[.97]"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingUser(u)}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-[.97]"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
      {modal && (
        <Modal title="Tambah akun baru" onClose={() => setModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUsers((u) => [
                ...u,
                {
                  name: "Pengguna Baru",
                  username: `pengguna${u.length}`,
                  phone: "08xx xxxx xxxx",
                  role: "Warga",
                },
              ]);
              setModal(false);
              notify("Akun baru berhasil ditambahkan.");
            }}
            className="space-y-4"
          >
            <Field label="Nama lengkap">
              <input required className="input" />
            </Field>
            <Field label="Username">
              <input required className="input" />
            </Field>
            <Field label="Nomor telepon">
              <input required className="input" />
            </Field>
            <Field label="Peran">
              <select className="input">
                <option>Warga</option>
                <option>Petugas</option>
                <option>Admin</option>
              </select>
            </Field>
            <Button type="submit" className="w-full">
              Simpan akun
            </Button>
          </form>
        </Modal>
      )}
      {editingUser && (
        <Modal title="Edit Akun" onClose={() => setEditingUser(null)}>
          <form onSubmit={saveUserChanges} className="space-y-4">
            <Field label="Nama lengkap">
              <input
                value={editingUser.data.name}
                onChange={(event) => updateEditingUser("name", event.target.value)}
                className={`input ${editErrors.name ? "border-red-400 ring-2 ring-red-100" : ""}`}
              />
              {editErrors.name && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{editErrors.name}</p>
              )}
            </Field>
            <Field label="Username">
              <input
                value={editingUser.data.username}
                onChange={(event) => updateEditingUser("username", event.target.value)}
                className={`input ${editErrors.username ? "border-red-400 ring-2 ring-red-100" : ""}`}
              />
              {editErrors.username && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{editErrors.username}</p>
              )}
            </Field>
            <Field label="Nomor telepon">
              <input
                value={editingUser.data.phone}
                onChange={(event) => updateEditingUser("phone", event.target.value)}
                className={`input ${editErrors.phone ? "border-red-400 ring-2 ring-red-100" : ""}`}
              />
              {editErrors.phone && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{editErrors.phone}</p>
              )}
            </Field>
            <Field label="Role">
              <select
                value={editingUser.data.role}
                onChange={(event) => updateEditingUser("role", event.target.value)}
                className="input"
              >
                <option>Warga</option>
                <option>Petugas</option>
                <option>Admin</option>
              </select>
            </Field>
            <p className="text-xs leading-5 text-slate-400">
              Password akun tidak ditampilkan dan tidak diubah melalui formulir ini.
            </p>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {deletingUser && (
        <Modal title="Hapus Akun?" onClose={() => setDeletingUser(null)}>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 shrink-0 text-red-700" size={20} />
              <div>
                <p className="text-sm leading-6 text-red-800">
                  Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.name}</strong>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <p className="mt-2 text-xs font-bold text-red-700">@{deletingUser.username}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setDeletingUser(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDeleteUser}>
              <Trash2 size={16} /> Ya, Hapus
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function MasterPage({ notify, categories, setCategories, minPickup, setMinPickup }: RouterProps) {
  const [tab, setTab] = useState("Kategori Sampah");
  const [minimum, setMinimum] = useState(minPickup);
  const [editingCategory, setEditingCategory] = useState<{
    index: number;
    data: (typeof categoriesSeed)[number];
  } | null>(null);
  const [deletingCategoryIndex, setDeletingCategoryIndex] = useState<number | null>(null);
  return (
    <>
      <PageTitle
        title="Data Master"
        desc="Perubahan data berlaku pada laporan dan perhitungan berikutnya."
      />
      <div className="mb-5 flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {["Kategori Sampah", "Batas Minimum Pickup", "Mitra Pengepul"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-bold ${tab === t ? "bg-green-700 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Kategori Sampah" && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold">Katalog kategori & harga</h2>
              <p className="mt-1 text-xs text-amber-700">Harga berikut adalah data demonstrasi.</p>
            </div>
            <Button
              onClick={() => {
                setCategories((c) => [
                  ...c,
                  {
                    name: "Kategori Baru",
                    desc: "Deskripsi kategori",
                    prices: {
                      "Sudah dipilah": 0,
                      "Sudah dibersihkan": 0,
                      "Tidak mudah didaur ulang": 0,
                      "Belum dipilah dan dibersihkan": 0,
                    },
                  },
                ]);
                notify("Kategori baru ditambahkan dan aktif untuk laporan berikutnya.");
              }}
            >
              <Plus size={16} /> Tambah
            </Button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Deskripsi</th>
                  {wasteConditions.map((condition) => (
                    <th key={condition}>{condition}/kg</th>
                  ))}
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c, i) => (
                  <tr key={`${c.name}-${i}`}>
                    <td className="font-bold">{c.name}</td>
                    <td>{c.desc}</td>
                    {wasteConditions.map((condition) => (
                      <td key={condition}>{money(c.prices[condition])}</td>
                    ))}
                    <td>
                      <div className="flex min-w-max items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCategory({ index: i, data: { ...c } })}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 active:scale-[.97]"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategoryIndex(i)}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-[.97]"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {tab === "Batas Minimum Pickup" && (
        <Card className="max-w-2xl">
          <h2 className="font-extrabold">Konfigurasi pickup</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pickup hanya tersedia jika estimasi berat sama dengan atau melebihi batas ini.
          </p>
          <div className="mt-6">
            <Field label="Minimum pickup (kg)" hint="Nilai ini adalah data demonstrasi.">
              <input
                type="number"
                min="1"
                value={minimum}
                onChange={(e) => setMinimum(Number(e.target.value))}
                className="input"
              />
            </Field>
          </div>
          <Button
            onClick={() => {
              setMinPickup(minimum);
              notify(`Batas minimum disimpan menjadi ${minimum} kg dan langsung aktif.`);
            }}
            className="mt-6"
          >
            Simpan konfigurasi
          </Button>
        </Card>
      )}
      {tab === "Mitra Pengepul" && (
        <Card>
          <div className="flex justify-between">
            <h2 className="font-extrabold">Daftar mitra pengepul</h2>
            <Button onClick={() => notify("Form tambah mitra dibuka.")}>
              <Plus size={16} /> Tambah mitra
            </Button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["PT Sriwijaya Daur Ulang", "Plastik PET dan plastik campur"],
              ["Mitra Kertas Musi", "Kardus dan kertas campur"],
              ["CV Logam Jaya", "Kaleng dan logam aluminium"],
            ].map((m) => (
              <div className="rounded-xl border border-slate-200 p-5" key={m[0]}>
                <Building2 className="text-green-700" />
                <h3 className="mt-4 font-extrabold">{m[0]}</h3>
                <p className="mt-1 text-sm text-slate-500">{m[1]}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" className="min-h-8 px-3 text-xs">
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="danger" className="min-h-8 px-3 text-xs">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {editingCategory && (
        <Modal title="Edit Kategori Sampah" onClose={() => setEditingCategory(null)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const updatedCategory = editingCategory.data;
              if (
                !updatedCategory.name.trim() ||
                !updatedCategory.desc.trim() ||
                wasteConditions.some((condition) => updatedCategory.prices[condition] < 0)
              ) {
                notify("Lengkapi data kategori dengan nilai harga yang valid.");
                return;
              }
              setCategories((current) =>
                current.map((category, index) =>
                  index === editingCategory.index
                    ? {
                        ...updatedCategory,
                        name: updatedCategory.name.trim(),
                        desc: updatedCategory.desc.trim(),
                      }
                    : category,
                ),
              );
              setEditingCategory(null);
              notify("Kategori sampah berhasil diperbarui.");
            }}
            className="space-y-4"
          >
            <Field label="Nama kategori">
              <input
                required
                value={editingCategory.data.name}
                onChange={(event) =>
                  setEditingCategory((current) =>
                    current
                      ? {
                          ...current,
                          data: { ...current.data, name: event.target.value },
                        }
                      : current,
                  )
                }
                className="input"
              />
            </Field>
            <Field label="Deskripsi">
              <textarea
                required
                value={editingCategory.data.desc}
                onChange={(event) =>
                  setEditingCategory((current) =>
                    current
                      ? {
                          ...current,
                          data: { ...current.data, desc: event.target.value },
                        }
                      : current,
                  )
                }
                className="input min-h-24 resize-none"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {wasteConditions.map((condition) => (
                <Field key={condition} label={`Harga ${condition.toLowerCase()} per kg`}>
                  <input
                    required
                    type="number"
                    min="0"
                    value={editingCategory.data.prices[condition]}
                    onChange={(event) =>
                      setEditingCategory((current) =>
                        current
                          ? {
                              ...current,
                              data: {
                                ...current.data,
                                prices: {
                                  ...current.data.prices,
                                  [condition]: Number(event.target.value),
                                },
                              },
                            }
                          : current,
                      )
                    }
                    className="input"
                  />
                </Field>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditingCategory(null)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {deletingCategoryIndex !== null && categories[deletingCategoryIndex] && (
        <Modal title="Hapus Kategori Sampah" onClose={() => setDeletingCategoryIndex(null)}>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 shrink-0 text-red-700" size={20} />
              <div>
                <p className="text-sm font-extrabold text-red-900">
                  {categories[deletingCategoryIndex].name}
                </p>
                <p className="mt-1 text-sm leading-6 text-red-700">
                  Kategori ini akan dihapus dari katalog dan tidak tersedia untuk laporan
                  berikutnya.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setDeletingCategoryIndex(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const categoryName = categories[deletingCategoryIndex].name;
                setCategories((current) =>
                  current.filter((_, index) => index !== deletingCategoryIndex),
                );
                setDeletingCategoryIndex(null);
                notify(`Kategori ${categoryName} berhasil dihapus.`);
              }}
            >
              <Trash2 size={16} /> Hapus
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function DistributionPage({
  notify,
  categories,
}: {
  notify: (t: string) => void;
  categories: typeof categoriesSeed;
}) {
  const [modal, setModal] = useState(false);
  const partners = ["PT Sriwijaya Daur Ulang", "Mitra Kertas Musi", "CV Logam Jaya"];
  const [rows, setRows] = useState(() =>
    readStoredState("simpanwaste-distributions", [
      {
        id: "DST-001",
        date: "2025-03-17",
        partner: "PT Sriwijaya Daur Ulang",
        category: "Botol Plastik PET",
        weight: 820,
      },
      {
        id: "DST-002",
        date: "2025-03-13",
        partner: "Mitra Kertas Musi",
        category: "Kardus",
        weight: 640,
      },
      {
        id: "DST-003",
        date: "2025-03-08",
        partner: "CV Logam Jaya",
        category: "Kaleng Aluminium",
        weight: 410,
      },
    ]),
  );
  const [editingRow, setEditingRow] = useState<(typeof rows)[number] | null>(null);
  const [deletingRow, setDeletingRow] = useState<(typeof rows)[number] | null>(null);
  const [distributionErrors, setDistributionErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    window.localStorage.setItem("simpanwaste-distributions", JSON.stringify(rows));
  }, [rows]);
  const totalWeight = rows.reduce((total, row) => total + row.weight, 0);
  const activePartners = new Set(rows.map((row) => row.partner)).size;
  const categoryTotals = rows.reduce<Record<string, number>>((totals, row) => {
    totals[row.category] = (totals[row.category] || 0) + row.weight;
    return totals;
  }, {});
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const formatDistributionDate = (date: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
  const saveDistribution = (event: FormEvent) => {
    event.preventDefault();
    if (!editingRow) return;
    const errors: Record<string, string> = {};
    if (!editingRow.date) errors.date = "Tanggal distribusi wajib diisi.";
    if (!partners.includes(editingRow.partner)) errors.partner = "Pilih mitra yang tersedia.";
    if (!categories.some((category) => category.name === editingRow.category))
      errors.category = "Pilih kategori dari Data Master.";
    if (!(editingRow.weight > 0)) errors.weight = "Berat harus lebih dari 0 kg.";
    setDistributionErrors(errors);
    if (Object.keys(errors).length) return;
    setRows((current) =>
      current.map((row) => (row.id === editingRow.id ? { ...editingRow } : row)),
    );
    setEditingRow(null);
    setDistributionErrors({});
    notify("Data distribusi berhasil diperbarui.");
  };
  return (
    <>
      <PageTitle
        title="Distribusi ke Mitra"
        desc="Kelola pencatatan sampah yang disalurkan ke mitra pengepul."
        action={
          <Button onClick={() => setModal(true)}>
            <Plus size={17} /> Tambah distribusi
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total bulan ini"
          value={`${totalWeight.toLocaleString("id-ID")} kg`}
          detail={`${rows.length} pengiriman`}
          icon={Truck}
        />
        <StatCard
          label="Mitra aktif"
          value={`${activePartners} mitra`}
          detail="Seluruhnya terverifikasi"
          icon={Building2}
          tone="blue"
        />
        <StatCard
          label="Kategori terbanyak"
          value={topCategory?.[0] || "Belum ada"}
          detail={`${(topCategory?.[1] || 0).toLocaleString("id-ID")} kg tersalurkan`}
          icon={Recycle}
          tone="amber"
        />
      </div>
      <Card className="mt-6">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Mitra pengepul</th>
                <th>Kategori</th>
                <th>Berat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{formatDistributionDate(r.date)}</td>
                  <td className="font-bold">{r.partner}</td>
                  <td>{r.category}</td>
                  <td className="font-bold">{r.weight} kg</td>
                  <td>
                    <div className="flex min-w-max items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRow({ ...r });
                          setDistributionErrors({});
                        }}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 active:scale-[.97]"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRow(r)}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-[.97]"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {modal && (
        <Modal title="Tambah distribusi" onClose={() => setModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setModal(false);
              notify("Distribusi berhasil ditambahkan ke dashboard.");
            }}
            className="space-y-4"
          >
            <Field label="Mitra pengepul">
              <select className="input">
                {partners.map((partner) => (
                  <option key={partner}>{partner}</option>
                ))}
              </select>
            </Field>
            <Field label="Kategori sampah">
              <select className="input">
                {categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Berat distribusi (kg)">
              <input required type="number" className="input" />
            </Field>
            <Field label="Tanggal distribusi">
              <input required type="date" className="input" />
            </Field>
            <Button type="submit" className="w-full">
              Simpan distribusi
            </Button>
          </form>
        </Modal>
      )}
      {editingRow && (
        <Modal title="Edit Data Distribusi" onClose={() => setEditingRow(null)}>
          <form onSubmit={saveDistribution} className="space-y-4">
            <Field label="Tanggal distribusi">
              <input
                type="date"
                value={editingRow.date}
                onChange={(event) => {
                  setEditingRow((current) =>
                    current ? { ...current, date: event.target.value } : current,
                  );
                  setDistributionErrors((current) => ({ ...current, date: "" }));
                }}
                className={`input ${distributionErrors.date ? "border-red-400 ring-2 ring-red-100" : ""}`}
              />
              {distributionErrors.date && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {distributionErrors.date}
                </p>
              )}
            </Field>
            <Field label="Mitra pengepul">
              <select
                value={editingRow.partner}
                onChange={(event) =>
                  setEditingRow((current) =>
                    current ? { ...current, partner: event.target.value } : current,
                  )
                }
                className="input"
              >
                {partners.map((partner) => (
                  <option key={partner}>{partner}</option>
                ))}
              </select>
            </Field>
            <Field label="Kategori sampah">
              <select
                value={editingRow.category}
                onChange={(event) =>
                  setEditingRow((current) =>
                    current ? { ...current, category: event.target.value } : current,
                  )
                }
                className="input"
              >
                {categories.map((category) => (
                  <option key={category.name}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Berat sampah (kg)">
              <input
                type="number"
                min=".1"
                step=".1"
                value={editingRow.weight || ""}
                onChange={(event) => {
                  setEditingRow((current) =>
                    current ? { ...current, weight: Number(event.target.value) } : current,
                  );
                  setDistributionErrors((current) => ({ ...current, weight: "" }));
                }}
                className={`input ${distributionErrors.weight ? "border-red-400 ring-2 ring-red-100" : ""}`}
              />
              {distributionErrors.weight && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {distributionErrors.weight}
                </p>
              )}
            </Field>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditingRow(null)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {deletingRow && (
        <Modal title="Hapus Data Distribusi?" onClose={() => setDeletingRow(null)}>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 shrink-0 text-red-700" size={20} />
              <div>
                <p className="text-sm font-bold text-red-900">
                  Apakah Anda yakin ingin menghapus catatan distribusi ini?
                </p>
                <dl className="mt-3 space-y-2 text-xs text-red-800">
                  <InfoRow label="Mitra" value={deletingRow.partner} />
                  <InfoRow label="Kategori" value={deletingRow.category} />
                  <InfoRow label="Berat" value={`${deletingRow.weight} kg`} />
                  <InfoRow label="Tanggal" value={formatDistributionDate(deletingRow.date)} />
                </dl>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setDeletingRow(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setRows((current) => current.filter((row) => row.id !== deletingRow.id));
                setDeletingRow(null);
                notify("Data distribusi berhasil dihapus.");
              }}
            >
              <Trash2 size={16} /> Ya, Hapus
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold">{value}</span>
    </div>
  );
}
function Empty({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className={`${compact ? "py-8" : "py-24"} text-center`}>
      <FileText className="mx-auto text-slate-300" size={36} />
      <p className="mt-3 text-sm font-bold text-slate-500">{title}</p>
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${
          wide ? "max-w-4xl" : "max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      const nextPath = window.location.pathname;
      setPath(nextPath);
      if (
        ["/", "/login", "/register", "/alur-penyetoran", "/impact-kami", "/about-us"].includes(
          nextPath,
        )
      )
        setRole(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextPath: string) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = (nextRole: Role) => {
    setRole(nextRole);
    const dashboardPath = `/${nextRole}/dashboard`;
    window.history.pushState({}, "", dashboardPath);
    setPath(dashboardPath);
  };

  if (role) {
    return (
      <Shell
        role={role}
        onLogout={() => {
          setRole(null);
          navigate("/login");
        }}
      />
    );
  }

  if (path === "/login") {
    return (
      <Login
        onLogin={login}
        onRegister={() => navigate("/register")}
        onHome={() => navigate("/")}
      />
    );
  }

  if (path === "/register") {
    return <Register onBack={() => navigate("/login")} />;
  }

  if (path === "/alur-penyetoran") {
    return <PublicInfoPage page="alur" navigate={navigate} />;
  }

  if (path === "/impact-kami") {
    return <PublicInfoPage page="impact" navigate={navigate} />;
  }

  if (path === "/about-us") {
    return <PublicInfoPage page="about" navigate={navigate} />;
  }

  return <LandingPage navigate={navigate} />;
}
