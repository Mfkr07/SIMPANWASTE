import Link from "next/link";
import { Leaf, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1E7E48] text-white flex items-center justify-center shadow-lg mb-6">
        <Leaf className="w-8 h-8 fill-current" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404 - Halaman Tidak Ditemukan</h1>
      <p className="mt-3 text-sm text-gray-600 max-w-md">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan ke rute lain.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E7E48] hover:bg-[#18663A] text-white text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
