"use client";

import { useState } from "react";
import Link from "next/link";
import { Recycle, Menu, X } from "lucide-react";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm ${className}`}
      aria-hidden="true"
    >
      <Recycle size={23} strokeWidth={2.35} />
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      {!compact && (
        <div className="text-left">
          <div className="font-extrabold tracking-tight text-slate-900 leading-tight">
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

export default function Navbar({ activePath = "/" }: { activePath?: string }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  const publicNav = [
    { label: "Beranda", href: "/" },
    { label: "Alur Penyetoran", href: "/alur-penyetoran" },
    { label: "Impact Kami", href: "/impact-kami" },
    { label: "About Us", href: "/about-us" },
  ];

  const openWhatsApp = () => {
    window.open(
      "https://wa.me/628127128799?text=Halo%20Bank%20Sampah%20Graha%20Pena,%20saya%20ingin%20menyetor%20sampah",
      "_blank"
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="Kembali ke beranda">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {publicNav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-semibold transition ${
                activePath === href
                  ? "text-green-700 font-bold"
                  : "text-slate-600 hover:text-green-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition active:scale-[.98]"
          >
            Masuk
          </Link>
          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 transition active:scale-[.98]"
          >
            Setor Sekarang
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenu((open) => !open)}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
          aria-label="Buka menu navigasi"
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
          mobileMenu ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="space-y-1 px-5 py-4">
          {publicNav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenu(false)}
              className={`block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold transition hover:bg-green-50 ${
                activePath === href ? "bg-green-50 text-green-700 font-bold" : "text-slate-700 hover:text-green-700"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <Link
              href="/login"
              onClick={() => setMobileMenu(false)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Masuk
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenu(false);
                openWhatsApp();
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition shadow-sm"
            >
              Setor Sekarang
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
