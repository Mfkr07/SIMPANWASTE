"use client";

import { useState } from "react";
import {
  UserRound,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Building,
  KeyRound,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Badge,
  Field,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/context/AdminContext";

export default function AdminProfilePage() {
  const { adminProfile, handleLogout } = useAdmin();

  const initials = adminProfile?.name
    ? adminProfile.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <>
      <PageTitle
        title="Profil Administrator"
        desc="Informasi akun pengelola sistem dan kredensial administratif SIMPANWASTE."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left Column: Profile Details */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                suppressHydrationWarning
                className="grid h-20 w-20 place-items-center rounded-2xl bg-green-700 text-2xl font-black text-white shadow-md"
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    suppressHydrationWarning
                    className="text-xl font-extrabold text-slate-900 sm:text-2xl"
                  >
                    {adminProfile.name || "Nadia Putri"}
                  </h2>
                  <Badge tone="blue">Administrator</Badge>
                </div>
                <p suppressHydrationWarning className="mt-1 text-sm font-semibold text-slate-500">
                  @{adminProfile.username || "admin.simpan"} · Hak Akses Super Admin
                </p>
                <p className="mt-2 text-xs text-green-700 font-medium flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Terverifikasi sebagai Pengelola Pusat SIMPANWASTE
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Informasi Kontak & Penugasan
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <Phone className="text-green-700 shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 font-medium">Nomor Telepon</p>
                    <p className="text-sm font-bold text-slate-900">{adminProfile.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <Building className="text-green-700 shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 font-medium">Wilayah Operasional</p>
                    <p className="text-sm font-bold text-slate-900">Kota Palembang Pilot</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:col-span-2">
                  <MapPin className="text-green-700 shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 font-medium">Kantor Operasional</p>
                    <p className="text-sm font-bold text-slate-900">{adminProfile.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* System Authority Scope */}
          <Card>
            <h3 className="font-extrabold text-slate-900 text-base mb-3">
              Cakupan Wewenang Administrator
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: "Data Master & Katalog",
                  desc: "Menambah, mengubah, dan menghapus kategori sampah, serta menentukan formula harga per kondisi fisik.",
                },
                {
                  title: "Pengelolaan Akun Pengguna",
                  desc: "Mengelola hak akses Warga, Petugas Lapangan, dan Administrator dalam satu database terpusat.",
                },
                {
                  title: "Penyaluran Sampah ke Mitra",
                  desc: "Mencatat dan memverifikasi distribusi tonase sampah terpilah kepada mitra pengepul & industri daur ulang.",
                },
                {
                  title: "Verifikasi Penarikan Saldo Warga",
                  desc: "Memproses pengajuan penarikan tabungan warga dengan validasi upload bukti transfer perbankan.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs"
                >
                  <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Account Security & Logout */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2.5 mb-3">
              <KeyRound className="text-green-700" size={18} />
              <h3 className="font-extrabold text-slate-900 text-sm">Keamanan Akun</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Akun administrator ini dilindungi dengan proteksi sesi terenkripsi berbasis JWT dan autentikasi Supabase.
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-slate-400">Username:</p>
              <p className="font-mono font-bold text-slate-800">@{adminProfile.username}</p>
              <p className="mt-2 text-slate-400">Status Akun:</p>
              <p className="font-bold text-green-700">Aktif & Terotorisasi</p>
            </div>
          </Card>

          <Card className="border-red-100 bg-red-50/30">
            <h3 className="font-extrabold text-red-950 text-sm mb-1">Keluar Sesi</h3>
            <p className="text-xs text-red-700/80 mb-4">
              Akhiri sesi administratif Anda untuk menjaga keamanan sistem.
            </p>
            <Button
              variant="danger"
              className="w-full justify-center"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Keluar dari Sistem
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
