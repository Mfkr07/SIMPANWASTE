"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  Building2,
  CheckCircle2,
  Loader2,
  Search,
} from "lucide-react";
import { BANK_SAMPAH_PALEMBANG, BankSampahItem } from "@/data/bankSampahData";
import BankSampahDetailModal from "./BankSampahDetailModal";

// Client-only dynamic import of Leaflet Map
const BankSampahMap = dynamic(() => import("./BankSampahMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-3xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#1E7E48]" />
      <p className="text-sm font-semibold text-gray-700">
        Memuat Peta Interaktif Bank Sampah Palembang...
      </p>
      <p className="text-xs text-gray-500">Menghubungkan titik lokasi aktif...</p>
    </div>
  ),
});

export default function MapsPreviewSection() {
  const [selectedItem, setSelectedItem] = useState<BankSampahItem>(
    BANK_SAMPAH_PALEMBANG[0] // Graha Pena is active by default
  );
  const [modalItem, setModalItem] = useState<BankSampahItem | null>(null);
  const [filterMode, setFilterMode] = useState<"semua" | "utama">("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const grahaPena = BANK_SAMPAH_PALEMBANG.find((item) => item.is_utama)!;

  const filteredItems = BANK_SAMPAH_PALEMBANG.filter((item) => {
    if (filterMode === "utama" && !item.is_utama) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(q) ||
        item.alamat.toLowerCase().includes(q) ||
        item.kecamatan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section id="maps" className="py-16 lg:py-24 bg-[#F4F8F5] border-t border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#1E7E48] mb-2 block">
              Peta Lokasi Bank Sampah
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Temukan Lokasi Penyetoran di Kota Palembang
            </h2>
            <p className="text-base text-gray-600 mt-3 leading-relaxed">
              Jelajahi peta persebaran bank sampah yang terverifikasi aktif di Kota Palembang.
              Bank Sampah Graha Pena berperan sebagai sentra percontohan utama dalam sistem
              pengelolaan sampah berbasis pemilahan.
            </p>
          </div>

          {/* Official Endorsement Card */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3.5 max-w-md shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#1E7E48] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">
                Kolaborasi DLHK Kota Palembang
              </p>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                Sentra percontohan penimbangan terintegrasi SIMPANWASTE
              </p>
            </div>
          </div>
        </div>

        {/* 2 Columns: Directory & Detail on Left, Live Interactive Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pinned Graha Pena Card & Directory (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* FEATURED CARD: BANK SAMPAH GRAHA PENA */}
            <div
              className={`rounded-2xl p-6 transition-all duration-200 border ${
                selectedItem.id === grahaPena.id
                  ? "bg-[#153626] text-white border-[#153626] shadow-md ring-2 ring-[#1E7E48]/30"
                  : "bg-[#153626] text-white border-transparent"
              }`}
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-emerald-300 border border-white/15">
                  Sentra Utama
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Aktif Beroperasi
                </span>
              </div>

              {/* Title & Location */}
              <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
                {grahaPena.nama}
              </h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{grahaPena.alamat}</span>
              </p>

              {/* Schedule & Government Collaboration Info */}
              <div className="mt-4 pt-3.5 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-gray-200">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{grahaPena.jam_operasional}</span>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-white font-medium">Mitra DLHK Palembang:</strong> Sentra riset penimbangan digital dan percontohan pemilahan rumah tangga.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Graha Pena */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(grahaPena);
                    setModalItem(grahaPena);
                  }}
                  className="flex-1 bg-[#1E7E48] hover:bg-[#18663A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Lihat Detail Operasional</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItem(grahaPena)}
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-medium py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fokus di Peta</span>
                </button>
              </div>
            </div>

            {/* DIRECTORY LIST FILTER & SEARCH BAR */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Daftar Titik Bank Sampah Aktif ({filteredItems.length})</span>
                <span className="text-gray-400 font-normal">Kota Palembang</span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode("semua")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    filterMode === "semua"
                      ? "bg-[#1E7E48] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua (8)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("utama")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    filterMode === "utama"
                      ? "bg-[#1E7E48] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Sentra Utama
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kecamatan atau nama bank sampah..."
                  className="w-full h-9 pl-8 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]"
                />
              </div>
            </div>

            {/* SCROLLABLE LIST OF OTHER ACTIVE WASTE BANKS */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredItems
                .filter((item) => !item.is_utama)
                .map((item) => {
                  const isSelected = selectedItem.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-50/60 border-[#1E7E48] shadow-xs"
                          : "bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#1E7E48] shrink-0" />
                            <h4
                              className={`text-sm font-semibold ${
                                isSelected ? "text-[#1E7E48]" : "text-gray-900"
                              }`}
                            >
                              {item.nama}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {item.alamat}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                          {item.kecamatan}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="text-[11px] flex items-center gap-1.5 text-gray-500">
                          <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{item.jam_operasional}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setModalItem(item);
                          }}
                          className="text-[#1E7E48] font-medium hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <span>Detail</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Live Interactive Leaflet Map (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* The Live Interactive Map */}
            <BankSampahMap
              items={BANK_SAMPAH_PALEMBANG}
              selectedItem={selectedItem}
              onSelectItem={(item) => setSelectedItem(item)}
              onOpenDetailModal={(item) => setModalItem(item)}
            />

            {/* Selected Location Bottom Quick Info Card */}
            {selectedItem && (
              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        selectedItem.is_utama
                          ? "bg-emerald-50 text-[#153626] border border-emerald-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {selectedItem.is_utama
                        ? "Sentra Utama Palembang"
                        : "Bank Sampah Aktif"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Kec. {selectedItem.kecamatan}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base leading-tight">
                    {selectedItem.nama}
                  </h4>
                  <p className="text-xs text-gray-500">{selectedItem.alamat}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalItem(selectedItem)}
                    className="bg-[#1E7E48] hover:bg-[#18663A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Detail Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={selectedItem.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition"
                    title="Buka rute di Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal Component */}
      <BankSampahDetailModal
        item={modalItem}
        onClose={() => setModalItem(null)}
      />
    </section>
  );
}
