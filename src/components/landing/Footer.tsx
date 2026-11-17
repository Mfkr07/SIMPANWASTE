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
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-green-50/40">
        © 2025 SIMPANWASTE. Prototype sistem informasi.
      </div>
    </footer>
  );
}
