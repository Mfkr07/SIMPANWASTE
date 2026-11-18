"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ClipboardCheck,
  Recycle,
  Truck,
  CalendarDays,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import {
  PageTitle,
  StatCard,
  Card,
  Button,
  Badge,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/context/AdminContext";

export default function AdminDashboardPage() {
  const { distributions } = useAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState("1–18 Mar 2025");

  return (
    <>
      <PageTitle
        title="Dashboard Kota Palembang"
        desc="Statistik agregat pengelolaan sampah berdasarkan data transaksi."
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="text-xs">
              <CalendarDays size={15} /> {selectedPeriod}
            </Button>
            <Button variant="secondary" className="text-xs">
              <Filter size={15} /> Filter
            </Button>
          </div>
        }
      />

      {/* Aggregate StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sampah terkumpul"
          value="12.840 kg"
          detail="+12,4% dari periode lalu"
          icon={Scale}
        />
        <StatCard
          label="Total setoran"
          value="1.246"
          detail="+86 transaksi bulan ini"
          icon={ClipboardCheck}
          tone="blue"
        />
        <StatCard
          label="Kategori terbanyak"
          value="Plastik PET"
          detail="4.208 kg · 32,8%"
          icon={Recycle}
          tone="amber"
        />
        <StatCard
          label="Didistribusikan"
          value="10.760 kg"
          detail="83,8% dari total"
          icon={Truck}
          tone="violet"
        />
      </div>

      {/* Two Column Visualizations */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        {/* Category Breakdown */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Sampah terkumpul per kategori
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Total berat terverifikasi (kg)
              </p>
            </div>
            <Link
              href="/admin/master"
              className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 transition"
            >
              Lihat katalog <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-6 space-y-5">
            {[
              ["Plastik PET", 4208, 82],
              ["Kardus", 3150, 63],
              ["Kertas Campur", 2420, 48],
              ["Kaleng Aluminium", 1862, 37],
              ["Plastik Campur", 1200, 24],
            ].map(([n, v, p]) => (
              <div key={String(n)}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{n}</span>
                  <span className="font-extrabold text-slate-900">
                    {Number(v).toLocaleString("id-ID")} kg
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all duration-500"
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Collection Trend */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Tren pengumpulan
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Januari–Juni 2025
              </p>
            </div>
            <Badge tone="green">+18,6% YTD</Badge>
          </div>

          <div className="relative mt-6 h-48 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60 p-2">
            <svg
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id="adminChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 185 C80 165,90 130,155 145 S250 80,315 105 S420 45,470 70 S550 25,600 35 L600 220 L0 220Z"
                fill="url(#adminChartGradient)"
              />
              <path
                d="M0 185 C80 165,90 130,155 145 S250 80,315 105 S420 45,470 70 S550 25,600 35"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="mt-3 flex justify-between px-1 text-[11px] font-semibold text-slate-400">
            {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Recent Distributions to Partners */}
      <Card className="mt-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              Distribusi terbaru ke mitra
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Ringkasan data distribusi sampah bulan berjalan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="green">2.460 kg tersalurkan</Badge>
            <Link
              href="/admin/distribusi"
              className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 transition"
            >
              Kelola Distribusi <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div className="table-wrap">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tanggal
                </th>
                <th className="w-[240px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Mitra pengepul
                </th>
                <th className="w-[200px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Kategori
                </th>
                <th className="w-[120px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
                  Berat
                </th>
                <th className="w-[120px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {distributions.slice(0, 5).map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3.5 text-slate-600 text-sm whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                    {row.partner}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 text-sm">
                    {row.category}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm text-center whitespace-nowrap">
                    {row.weight} kg
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <Badge tone="green">Selesai</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
