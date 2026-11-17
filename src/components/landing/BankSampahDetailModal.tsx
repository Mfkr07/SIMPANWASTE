"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  X,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  CheckCircle2,
  Building2,
  ArrowRight,
  Layers,
  Scale,
} from "lucide-react";
import { BankSampahItem } from "@/data/bankSampahData";

interface BankSampahDetailModalProps {
  item: BankSampahItem | null;
  onClose: () => void;
}

export default function BankSampahDetailModal({
  item,
  onClose,
}: BankSampahDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div
          className={`p-6 sm:p-8 text-white relative overflow-hidden ${
            item.is_utama
              ? "bg-gradient-to-br from-[#0F291E] via-[#153626] to-[#1E7E48]"
              : "bg-gradient-to-br from-[#153626] to-[#1E7E48]"
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {item.is_utama ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 border border-white/20">
                Sentra Utama Palembang
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{item.status}</span>
              </span>
            )}
            <span className="text-xs text-emerald-200 font-medium">
              Kec. {item.kecamatan}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            {item.nama}
          </h3>

          {/* Official Endorsement Highlight */}
          {item.is_utama && (
            <div className="mt-4 p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-semibold text-white">
                  Kolaborasi DLHK Kota Palembang
                </p>
                <p className="text-gray-200 mt-0.5">
                  Sentra percontohan resmi Dinas Lingkungan Hidup dan Kebersihan Kota Palembang
                  untuk implementasi penimbangan digital dan pengelolaan sampah berbasis pemilahan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Profil & Peran Operasional
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {item.deskripsi}
            </p>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAF9] p-5 rounded-2xl border border-gray-200/80">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1E7E48] flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Jam Operasional
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {item.jam_operasional}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1E7E48] flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Narahubung / Kontak
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {item.telepon}
                </p>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-start gap-3 pt-2 border-t border-gray-200/60">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1E7E48] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Alamat Lengkap
                </p>
                <p className="text-sm text-gray-800 mt-0.5">
                  {item.alamat}
                </p>
              </div>
            </div>
          </div>

          {/* Services & Facilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#1E7E48]" />
              <span>Fasilitas & Layanan Unggulan</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.layanan.map((lay, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200/90 text-xs font-semibold text-gray-800 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#1E7E48] shrink-0" />
                  <span>{lay}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accepted Waste Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1E7E48]" />
              <span>Kategori Sampah Anorganik Diterima</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.kategori_diterima.map((kat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50/70 text-[#153626] border border-emerald-200/80 text-xs font-medium"
                >
                  {kat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <a
            href={item.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#1E7E48] bg-white border border-gray-300 hover:bg-gray-100 px-4 py-2.5 rounded-xl transition"
          >
            <span>Buka di Google Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Tutup
            </button>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#1E7E48] hover:bg-[#18663A] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              <span>Daftar untuk Setor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

