"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ClipboardList,
  Recycle,
  WalletCards,
  Eye,
  EyeOff,
  MapPin,
  Clock3,
  Plus,
} from "lucide-react";
import { Card, StatCard, Badge } from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { banks, money } from "@/data/wargaSeedData";

export default function WargaDashboardPage() {
  const { citizenProfile, reports, balance } = useWarga();
  const [balanceVisible, setBalanceVisible] = useState(false);

  const mine = reports.filter(
    (r) =>
      r.citizen === citizenProfile.name ||
      r.citizen === "Ayu Lestari" ||
      r.citizen === citizenProfile.username
  );

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const firstName = citizenProfile.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-green-800 p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm font-semibold text-green-200">{today}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            Selamat datang, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-green-100">
            Setiap sampah yang Anda pilah ikut membangun Palembang yang lebih bersih.
          </p>
        </div>
        <Link
          href="/warga/buat-laporan"
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-green-500/30 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500/45 active:scale-[.98] sm:mt-0"
        >
          <Plus size={18} className="shrink-0 text-white" />
          <span className="whitespace-nowrap">Buat laporan setoran</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
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
                {balanceVisible ? money(balance) : "Rp ••••••"}
              </p>
              <button
                type="button"
                onClick={() => setBalanceVisible((current) => !current)}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-700 transition hover:text-green-900 cursor-pointer"
              >
                {balanceVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                {balanceVisible ? "Sembunyikan Saldo" : "Lihat Saldo"}
              </button>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
              <WalletCards size={21} />
            </div>
          </div>
        </Card>
      </div>

      {/* 2-Column Section */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Latest Reports Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Laporan terbaru</h2>
              <p className="mt-1 text-xs text-slate-500">Pantau progres setoran Anda</p>
            </div>
            <Link href="/warga/riwayat" className="text-sm font-bold text-green-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {mine.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                href="/warga/riwayat"
                className="flex w-full items-center gap-4 rounded-xl border border-slate-100 p-3 text-left transition hover:border-green-200 hover:bg-green-50/50"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <Recycle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{r.category}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {r.id} · {r.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-slate-900">{r.estimate} kg</p>
                  <Badge tone={r.status === "Selesai" ? "green" : "amber"}>{r.status}</Badge>
                </div>
              </Link>
            ))}
            {mine.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">
                Belum ada laporan setoran terbaru.
              </p>
            )}
          </div>
        </Card>

        {/* Nearest Waste Bank Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Bank sampah terdekat</h2>
              <p className="mt-1 text-xs text-slate-500">Lokasi aktif dan terverifikasi</p>
            </div>
            <MapPin className="text-green-700" size={20} />
          </div>
          <div className="map-mini mt-5">
            <div className="map-road a" />
            <div className="map-road b" />
            <span className="map-pin left-[48%] top-[38%] absolute -translate-x-1/2 -translate-y-1/2">
              <MapPin size={18} />
            </span>
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900">{banks[0].name}</h3>
          <p className="mt-1 text-xs text-slate-500">{banks[0].address}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 size={14} />
              {banks[0].hours}
            </span>
            <Link href="/warga/maps" className="text-xs font-bold text-green-700 hover:underline">
              Buka maps
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
