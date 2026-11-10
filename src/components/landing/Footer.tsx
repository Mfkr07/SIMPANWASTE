import Link from "next/link";
import { Leaf, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F291E] text-gray-300 pt-16 pb-12 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12">
          {/* Column 1: Brand & Description (5 cols) */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#1E7E48] text-white flex items-center justify-center shadow-md">
                <Leaf className="w-5 h-5 fill-current" />
              </div>
              <span className="font-bold text-white tracking-tight text-xl">
                SIMPANWASTE
              </span>
            </Link>

            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Sistem Informasi Pengelolaan Sampah Berbasis Pemilahan untuk mendukung
              pengelolaan sampah anorganik yang lebih tertata, akuntabel, dan transparan.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-emerald-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pilot Project: Kota Palembang</span>
            </div>
          </div>

          {/* Column 2: Navigation Links (3 cols) */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#hero" className="hover:text-emerald-300 transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#tentang" className="hover:text-emerald-300 transition-colors">
                  Tentang Sistem
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-emerald-300 transition-colors">
                  Fitur Utama
                </a>
              </li>
              <li>
                <a href="#alur" className="hover:text-emerald-300 transition-colors">
                  Alur Penyetoran
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: System Access (4 cols) */}
          <div className="md:col-span-3 lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Akses Sistem
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/login" className="hover:text-emerald-300 transition-colors">
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-300 transition-colors">
                  Daftar Warga Baru
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-300 transition-colors">
                  Maps Bank Sampah (Login)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Demo Notice */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 SIMPANWASTE. Hak cipta dilindungi.</p>
          <p className="text-center sm:text-right text-gray-400">
            Prototipe sistem informasi. Data dan harga ditampilkan untuk keperluan demonstrasi.
          </p>
        </div>
      </div>
    </footer>
  );
}

