"use client";

import Link from "next/link";
import { BrandMark } from "./Navbar";
import { grahaPenaLocation } from "./MapsPreviewSection";

export default function Footer() {
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
          <p className="mt-2 text-xs leading-6 text-green-200/80">
            {grahaPenaLocation.landmark}
          </p>
        </div>
        <div>
          <p className="font-extrabold text-green-300">Kontak & Layanan</p>
          <p className="mt-4 text-xs leading-6">WhatsApp: +62 852-6700-2827 (Pak Martha)</p>
          <p className="text-xs leading-6">Kerja Sama: kemitraan@simpanwaste.id</p>
          <p className="text-xs leading-6">Jadwal: Senin–Jumat 09.00–16.00 WIB</p>
          <p className="mt-2 text-xs leading-6 text-green-200/80">Palembang, Sumatera Selatan</p>
        </div>
        <div>
          <p className="font-extrabold text-green-300">Tautan</p>
          <div className="mt-4 space-y-2 text-xs">
            <Link href="/alur-penyetoran" className="block hover:text-white transition">
              Jenis Sampah
            </Link>
            <Link href="/impact-kami" className="block hover:text-white transition">
              Berita & Impact
            </Link>
            <Link href="/login" className="block hover:text-white transition">
              Cek Saldo / Login Anggota
            </Link>
            <Link href="/login" className="block hover:text-white transition">
              Login Pengurus
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-green-50/50">
        © 2025 SIMPANWASTE. Sistem Pengelolaan Sampah Terintegrasi Bank Sampah Graha Pena Palembang.
      </div>
    </footer>
  );
}
