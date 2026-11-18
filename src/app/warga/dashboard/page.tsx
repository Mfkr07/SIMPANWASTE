"use client";

import { useState, useRef } from "react";
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
  CalendarDays,
  Plus,
  Leaf,
} from "lucide-react";
import { Card, StatCard, Badge } from "@/components/warga/WargaUI";
import DepositTracker from "@/components/warga/DepositTracker";
import { useWarga } from "@/context/WargaContext";
import { grahaPenaLocation } from "@/components/landing/MapsPreviewSection";
import { money } from "@/data/wargaSeedData";

export default function WargaDashboardPage() {
  const { citizenProfile, reports, balance } = useWarga();
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [partnerMapKey, setPartnerMapKey] = useState(0);
  const partnerMapRef = useRef<HTMLDivElement>(null);

  const mine = reports.filter((r) => {
    const c = (r.citizen || "").toLowerCase().trim();
    const myName = (citizenProfile.name || "").toLowerCase().trim();
    const myUser = (citizenProfile.username || "").toLowerCase().trim();
    return Boolean((myName && c === myName) || (myUser && c === myUser));
  });

  const [trackerId, setTrackerId] = useState("");
  const activeTrackerId = trackerId || mine[0]?.id || "";
  const trackedReport = mine.find((report) => report.id === activeTrackerId) || mine[0];

  const encodedPartnerAddress = encodeURIComponent(grahaPenaLocation.address);

  const focusPartnerMap = () => {
    setPartnerMapKey((cur) => cur + 1);
    partnerMapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const firstName = citizenProfile.name ? citizenProfile.name.split(" ")[0] : "Warga";

  const completedReports = mine.filter((r) => r.status === "Selesai");
  const totalWeight = completedReports.reduce(
    (sum, r) => sum + (r.actual || r.estimate || 0),
    0
  );
  const totalWeightStr =
    totalWeight > 0
      ? `${totalWeight.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`
      : "0 kg";

  const lastFinished = completedReports[0];
  const lastDepositValue = lastFinished
    ? `${lastFinished.actual || lastFinished.estimate} kg`
    : mine[0]
      ? `${mine[0].estimate} kg`
      : "0 kg";
  const lastDepositDetail = lastFinished
    ? lastFinished.date
    : mine[0]
      ? `${mine[0].date} (Proses)`
      : "Belum ada setoran";

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
          value={totalWeightStr}
          detail={completedReports.length > 0 ? "Dari setoran selesai" : "Belum ada setoran"}
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
          value={lastDepositValue}
          detail={lastDepositDetail}
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
        {/* Kolom Kiri: Laporan Terbaru & Deposit Tracker */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Laporan terbaru</h2>
              <p className="mt-1 text-xs text-slate-500">Pantau progres setoran Anda</p>
            </div>
            <Link
              href="/warga/riwayat"
              className="text-sm font-bold text-green-700 hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {mine.slice(0, 3).map((r) => {
              const isSelected = r.id === (trackedReport?.id || trackerId);
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setTrackerId(r.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition cursor-pointer ${
                    isSelected
                      ? "border-green-600 bg-green-50/70 shadow-sm"
                      : "border-slate-100 hover:border-green-200 hover:bg-green-50/50"
                  }`}
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
                    <Badge tone={r.status === "Selesai" ? "green" : "amber"}>
                      {r.status}
                    </Badge>
                  </div>
                </button>
              );
            })}

            {mine.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500 space-y-3">
                <p>Belum ada laporan setoran.</p>
                <Link
                  href="/warga/buat-laporan"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-800"
                >
                  <Plus size={14} /> Buat Laporan Pertama
                </Link>
              </div>
            )}
          </div>

          {/* Stepper Deposit Tracker */}
          {trackedReport && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <DepositTracker report={trackedReport} />
            </div>
          )}
        </Card>

        {/* Kolom Kanan: Bank Sampah Mitra (Graha Pena Palembang) */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Bank Sampah Mitra</h2>
              <p className="mt-1 text-xs text-slate-500">
                Lokasi mitra penyetoran SIMPANWASTE.
              </p>
            </div>
            <MapPin className="text-green-700" size={20} />
          </div>

          {/* Iframe Peta Mini Graha Pena */}
          <div
            ref={partnerMapRef}
            className="mt-5 h-48 sm:h-52 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner"
          >
            <iframe
              key={partnerMapKey}
              title={`Peta ${grahaPenaLocation.name}`}
              src={`https://www.google.com/maps?q=${encodedPartnerAddress}&z=16&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          {/* Kartu Detail Graha Pena */}
          <button
            type="button"
            onClick={focusPartnerMap}
            className="mt-4 w-full rounded-xl p-1 text-left transition hover:bg-green-50/80 cursor-pointer"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                {grahaPenaLocation.name}
              </h3>
              <Badge tone="green">Mitra SIMPANWASTE</Badge>
            </div>

            <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-green-700" />
                <span>{grahaPenaLocation.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <Leaf size={14} className="mt-0.5 shrink-0 text-green-700" />
                <span>{grahaPenaLocation.landmark}</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock3 size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <span>
                  <strong className="text-slate-700">Senin–Jumat:</strong>{" "}
                  {grahaPenaLocation.weekdaySchedule}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CalendarDays size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <span>
                  <strong className="text-slate-700">Sabtu:</strong>{" "}
                  {grahaPenaLocation.saturdaySchedule}
                </span>
              </p>
            </div>
          </button>

          {/* Tautan Navigasi Bawah */}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodedPartnerAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-slate-500 transition hover:text-green-700"
            >
              Petunjuk arah
            </a>
            <Link
              href="/warga/maps"
              className="text-xs font-bold text-green-700 hover:text-green-800"
            >
              Buka Maps
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
