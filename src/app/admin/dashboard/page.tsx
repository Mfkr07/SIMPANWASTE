"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  ClipboardCheck,
  Recycle,
  Truck,
  CalendarDays,
  Filter,
  ArrowUpRight,
  TrendingUp,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  PageTitle,
  StatCard,
  Card,
  Badge,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/context/AdminContext";

// Pemetaan nama bulan bahasa Indonesia
const INDO_MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
  jul: 6, agu: 7, ags: 7, sep: 8, okt: 9, nov: 10, des: 11,
};

function parseDateAny(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  // 1. Format ISO "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  // 2. Format teks "DD Mon YYYY" (misal: "21 Nov 2026", "19 Mar 2025")
  const parts = dateStr.trim().split(/[\s-]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1].toLowerCase().slice(0, 3);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(year) && INDO_MONTHS[monthKey] !== undefined) {
      return new Date(year, INDO_MONTHS[monthKey], day);
    }
  }
  // 3. Fallback konstruktor standar Date
  const direct = new Date(dateStr);
  return isNaN(direct.getTime()) ? null : direct;
}

interface TrendPoint {
  id: string;
  label: string;
  fullDate: string;
  dateObj: Date;
  weight: number;
  count: number;
  categories: string[];
}

export default function AdminDashboardPage() {
  const { reports, distributions } = useAdmin();

  // State Filter Rentang Waktu
  const [filterPreset, setFilterPreset] = useState<
    "all" | "today" | "7days" | "30days" | "thisMonth" | "custom"
  >("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Hitung rentang tanggal aktif
  const { startFilterDate, endFilterDate, filterLabel } = useMemo(() => {
    const now = new Date();

    if (filterPreset === "today") {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const label = `Hari Ini (${s.toLocaleDateString("id-ID", { day: "numeric", month: "short" })})`;
      return { startFilterDate: s, endFilterDate: e, filterLabel: label };
    }

    if (filterPreset === "7days") {
      const s = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      s.setHours(0, 0, 0, 0);
      return { startFilterDate: s, endFilterDate: now, filterLabel: "7 Hari Terakhir" };
    }

    if (filterPreset === "30days") {
      const s = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      s.setHours(0, 0, 0, 0);
      return { startFilterDate: s, endFilterDate: now, filterLabel: "30 Hari Terakhir" };
    }

    if (filterPreset === "thisMonth") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const label = `Bulan Ini (${now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })})`;
      return { startFilterDate: s, endFilterDate: now, filterLabel: label };
    }

    if (filterPreset === "custom") {
      const s = customStart ? new Date(customStart + "T00:00:00") : null;
      const e = customEnd ? new Date(customEnd + "T23:59:59") : null;
      const sText = s
        ? s.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "Awal";
      const eText = e
        ? e.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "Sekarang";
      return { startFilterDate: s, endFilterDate: e, filterLabel: `${sText} – ${eText}` };
    }

    return { startFilterDate: null, endFilterDate: null, filterLabel: "Semua Waktu" };
  }, [filterPreset, customStart, customEnd]);

  // Filter laporan berdasarkan rentang tanggal aktif
  const filteredReports = useMemo(() => {
    if (!startFilterDate && !endFilterDate) return reports;

    return reports.filter((r) => {
      const d = parseDateAny(r.date);
      if (!d) return true;
      if (startFilterDate && d < startFilterDate) return false;
      if (endFilterDate && d > endFilterDate) return false;
      return true;
    });
  }, [reports, startFilterDate, endFilterDate]);

  // Filter distribusi berdasarkan rentang tanggal aktif
  const filteredDistributions = useMemo(() => {
    if (!startFilterDate && !endFilterDate) return distributions;

    return distributions.filter((d) => {
      const dt = parseDateAny(d.date);
      if (!dt) return true;
      if (startFilterDate && dt < startFilterDate) return false;
      if (endFilterDate && dt > endFilterDate) return false;
      return true;
    });
  }, [distributions, startFilterDate, endFilterDate]);

  // Perhitungan Data Statistik Nyata
  const {
    totalCollectedKg,
    completedKg,
    completedCount,
    pendingCount,
    totalSetoran,
    sortedCategories,
    topCategoryName,
    topCategoryDetail,
    totalDistributedKg,
    distributedDetail,
  } = useMemo(() => {
    let collectedSum = 0;
    let verifiedSum = 0;
    let completed = 0;
    let pending = 0;
    const catTotals: Record<string, number> = {};

    filteredReports.forEach((r) => {
      const weight = Number(r.actual !== undefined ? r.actual : r.estimate) || 0;
      collectedSum += weight;

      if (r.status === "Selesai") {
        completed += 1;
        verifiedSum += weight;
      } else {
        pending += 1;
      }

      // Hitung berat per kategori sampah
      if (r.verifiedItems && r.verifiedItems.length > 0) {
        r.verifiedItems.forEach((item) => {
          const c = item.category || "Lainnya";
          catTotals[c] = (catTotals[c] || 0) + Number(item.actualWeight || 0);
        });
      } else if (r.categoryWeights && r.categoryWeights.length > 0) {
        r.categoryWeights.forEach((cw) => {
          const c = cw.category || "Lainnya";
          catTotals[c] = (catTotals[c] || 0) + Number(cw.estimate || 0);
        });
      } else {
        const cats = (r.category || "Lainnya")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
        const portion = weight / (cats.length || 1);
        cats.forEach((c) => {
          catTotals[c] = (catTotals[c] || 0) + portion;
        });
      }
    });

    const sortedCats = Object.entries(catTotals)
      .map(([name, w]) => ({ name, weight: Math.round(w * 10) / 10 }))
      .sort((a, b) => b.weight - a.weight);

    const topCat = sortedCats[0];
    const topName = topCat ? topCat.name : "-";
    const topPercent =
      collectedSum > 0 && topCat ? ((topCat.weight / collectedSum) * 100).toFixed(1) : "0";
    const topDetail = topCat
      ? `${topCat.weight.toLocaleString("id-ID")} kg · ${topPercent}% dari total`
      : "Belum ada data";

    // Hitung distribusi nyata
    const distSum = filteredDistributions.reduce(
      (sum, d) => sum + (Number(d.weight) || 0),
      0
    );
    const distPercent =
      collectedSum > 0 ? ((distSum / collectedSum) * 100).toFixed(1) : "0";
    const distText = `${filteredDistributions.length} distribusi · ${distPercent}% dari total`;

    return {
      totalCollectedKg: Math.round(collectedSum * 10) / 10,
      completedKg: Math.round(verifiedSum * 10) / 10,
      completedCount: completed,
      pendingCount: pending,
      totalSetoran: filteredReports.length,
      sortedCategories: sortedCats,
      topCategoryName: topName,
      topCategoryDetail: topDetail,
      totalDistributedKg: Math.round(distSum * 10) / 10,
      distributedDetail: distText,
    };
  }, [filteredReports, filteredDistributions]);

  // Data Rangkaian Tren Nyata untuk Grafik
  const trendData = useMemo<TrendPoint[]>(() => {
    if (filteredReports.length === 0) return [];

    const grouped: Record<
      string,
      {
        weight: number;
        count: number;
        dateObj: Date;
        categories: Set<string>;
        fullDate: string;
      }
    > = {};

    filteredReports.forEach((r) => {
      const d = parseDateAny(r.date) || new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      const weight = Number(r.actual !== undefined ? r.actual : r.estimate) || 0;

      if (!grouped[key]) {
        grouped[key] = {
          weight: 0,
          count: 0,
          dateObj: d,
          categories: new Set<string>(),
          fullDate: new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(d),
        };
      }

      grouped[key].weight += weight;
      grouped[key].count += 1;
      (r.category || "").split(",").forEach((c) => {
        const trimmed = c.trim();
        if (trimmed) grouped[key].categories.add(trimmed);
      });
    });

    const sortedKeys = Object.keys(grouped).sort();

    return sortedKeys.map((key) => {
      const item = grouped[key];
      const dayMonth = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
      }).format(item.dateObj);

      return {
        id: key,
        label: dayMonth,
        fullDate: item.fullDate,
        dateObj: item.dateObj,
        weight: Math.round(item.weight * 10) / 10,
        count: item.count,
        categories: Array.from(item.categories),
      };
    });
  }, [filteredReports]);

  // State Hover Interaktif pada Grafik
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const chartSvgRef = useRef<SVGSVGElement>(null);

  // Koordinat Titik-Titik SVG Grafik
  const { chartPoints, pathD, areaD, maxTrendWeight } = useMemo(() => {
    if (trendData.length === 0) {
      return { chartPoints: [], pathD: "", areaD: "", maxTrendWeight: 10 };
    }

    // Jika hanya ada 1 tanggal, tambahkan titik awal buatan agar garis bisa terbentuk
    let pointsInput = trendData;
    if (trendData.length === 1) {
      const first = trendData[0];
      const dummyStart: TrendPoint = {
        id: "start-point",
        label: "Mulai",
        fullDate: "Awal Pengamatan",
        dateObj: new Date(first.dateObj.getTime() - 24 * 60 * 60 * 1000),
        weight: 0,
        count: 0,
        categories: [],
      };
      pointsInput = [dummyStart, first];
    }

    const maxWeight = Math.max(...pointsInput.map((p) => p.weight), 10);
    const topY = 25;
    const bottomY = 165;
    const usableH = bottomY - topY;
    const startX = 35;
    const endX = 565;
    const usableW = endX - startX;

    const coords = pointsInput.map((p, idx) => {
      const x = startX + (idx / (pointsInput.length - 1)) * usableW;
      const ratio = maxWeight > 0 ? p.weight / maxWeight : 0;
      const y = bottomY - ratio * usableH;
      return { x, y, data: p };
    });

    // Buat kurva Bezier mulus
    let lineStr = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      lineStr += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(
        1
      )}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const areaStr = `${lineStr} L ${coords[coords.length - 1].x.toFixed(1)} ${bottomY} L ${coords[0].x.toFixed(
      1
    )} ${bottomY} Z`;

    return { chartPoints: coords, pathD: lineStr, areaD: areaStr, maxTrendWeight: maxWeight };
  }, [trendData]);

  // Handler gerak mouse di atas grafik
  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartSvgRef.current || chartPoints.length === 0) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * 600;

    let closestIdx = 0;
    let minDiff = Infinity;
    chartPoints.forEach((p, idx) => {
      const diff = Math.abs(p.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredIdx(closestIdx);
  };

  const activePoint = hoveredIdx !== null ? chartPoints[hoveredIdx] : null;

  return (
    <>
      <PageTitle
        title="Dashboard Kota Palembang"
        desc="Statistik agregat pengelolaan sampah berdasarkan data transaksi nyata sistem."
        action={
          <div className="relative" ref={filterDropdownRef}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800 active:scale-95 cursor-pointer"
                title="Buka menu filter rentang waktu"
              >
                <CalendarDays size={15} className="text-emerald-600 shrink-0" />
                <span>{filterLabel}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>

            {/* Menu Popover Filter */}
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Filter size={15} className="text-emerald-600" />
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                      Filter Rentang Waktu
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Pilihan Periode
                  </p>
                  {[
                    { id: "all", label: "Semua Waktu" },
                    { id: "thisMonth", label: "Bulan Ini" },
                    { id: "30days", label: "30 Hari Terakhir" },
                    { id: "7days", label: "7 Hari Terakhir" },
                    { id: "today", label: "Hari Ini" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setFilterPreset(item.id as any);
                        setFilterOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                        filterPreset === item.id
                          ? "bg-emerald-50 text-emerald-800 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{item.label}</span>
                      {filterPreset === item.id && (
                        <Check size={14} className="text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Rentang Tanggal Kustom
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Mulai
                      </label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Sampai
                      </label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (customStart || customEnd) {
                        setFilterPreset("custom");
                        setFilterOpen(false);
                      }
                    }}
                    disabled={!customStart && !customEnd}
                    className="mt-3 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Terapkan Rentang
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Aggregate StatCards - Dihitung Nyata dari Laporan & Transaksi */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sampah terkumpul"
          value={`${totalCollectedKg.toLocaleString("id-ID")} kg`}
          detail={`${completedCount} selesai (${completedKg.toLocaleString("id-ID")} kg terverifikasi)`}
          icon={Scale}
        />
        <StatCard
          label="Total setoran"
          value={totalSetoran.toLocaleString("id-ID")}
          detail={
            pendingCount > 0
              ? `${pendingCount} laporan menunggu verifikasi`
              : "Semua laporan terverifikasi"
          }
          icon={ClipboardCheck}
          tone="blue"
        />
        <StatCard
          label="Kategori terbanyak"
          value={topCategoryName}
          detail={topCategoryDetail}
          icon={Recycle}
          tone="amber"
        />
        <StatCard
          label="Didistribusikan"
          value={`${totalDistributedKg.toLocaleString("id-ID")} kg`}
          detail={distributedDetail}
          icon={Truck}
          tone="violet"
        />
      </div>

      {/* Two Column Visualizations */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1.1fr]">
        {/* Category Breakdown Nyata */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Sampah terkumpul per kategori
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Total berat riil terverifikasi & estimasi ({filterLabel})
              </p>
            </div>
            <Link
              href="/admin/master"
              className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 transition"
            >
              Lihat katalog <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {sortedCategories.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Belum ada data sampah pada periode yang dipilih.
              </div>
            ) : (
              sortedCategories.slice(0, 6).map((cat) => {
                const maxW = sortedCategories[0]?.weight || 1;
                const percent = Math.min(100, Math.round((cat.weight / maxW) * 100));
                return (
                  <div key={cat.name}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="font-bold text-slate-700">{cat.name}</span>
                      <span className="font-extrabold text-slate-900">
                        {cat.weight.toLocaleString("id-ID")} kg
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Collection Trend - Grafik Interaktif dengan Data Nyata & Hover Tooltip */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Tren pengumpulan
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Aktivitas penimbangan berkala ({filterLabel})
              </p>
            </div>
            <Badge tone="green">
              {totalCollectedKg > 0 ? `${totalCollectedKg.toLocaleString("id-ID")} kg total` : "0 kg"}
            </Badge>
          </div>

          {chartPoints.length === 0 ? (
            <div className="mt-6 flex h-52 flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
              <TrendingUp className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700">
                Belum ada data setoran di periode ini
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pilih filter waktu lain untuk melihat tren aktivitas
              </p>
            </div>
          ) : (
            <div className="relative mt-6">
              {/* Floating Tooltip saat Hover */}
              {activePoint && (
                <div
                  className="pointer-events-none absolute z-30 transform -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xs p-3 shadow-xl transition-all duration-75 text-left min-w-[155px]"
                  style={{
                    left: `${(activePoint.x / 600) * 100}%`,
                    top: `${Math.max(0, (activePoint.y / 200) * 100 - 32)}%`,
                  }}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <CalendarDays size={13} className="text-emerald-600 shrink-0" />
                    <span>{activePoint.data.fullDate}</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">
                      {activePoint.data.weight.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">kg sampah</span>
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                    {activePoint.data.count} transaksi setoran
                  </div>
                  {activePoint.data.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 max-w-[180px] border-t border-slate-100 pt-1.5">
                      {activePoint.data.categories.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="inline-block rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.5 text-[10px] font-semibold"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Area SVG Interaktif */}
              <div className="h-52 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60 p-2">
                <svg
                  ref={chartSvgRef}
                  viewBox="0 0 600 200"
                  preserveAspectRatio="none"
                  className="h-full w-full cursor-crosshair"
                  onMouseMove={handleChartMouseMove}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <defs>
                    <linearGradient id="adminLiveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Garis Horizontal Bantu (Grid) */}
                  <line x1="35" y1="25" x2="565" y2="25" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <line x1="35" y1="95" x2="565" y2="95" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <line x1="35" y1="165" x2="565" y2="165" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Area Warna Gradient */}
                  <path d={areaD} fill="url(#adminLiveGradient)" />

                  {/* Garis Kurva Tren */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Titik-Titik Data */}
                  {chartPoints.map((p, idx) => (
                    <circle
                      key={p.data.id}
                      cx={p.x}
                      cy={p.y}
                      r={hoveredIdx === idx ? 6 : 4}
                      fill={hoveredIdx === idx ? "#059669" : "#10b981"}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />
                  ))}

                  {/* Indikator Hover Garis Tegak & Marker */}
                  {activePoint && (
                    <g>
                      <line
                        x1={activePoint.x}
                        y1={20}
                        x2={activePoint.x}
                        y2={165}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.y}
                        r="9"
                        fill="#10b981"
                        fillOpacity="0.25"
                      />
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.y}
                        r="5"
                        fill="#047857"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}
                </svg>
              </div>

              {/* Label Sumbu X Tanggal */}
              <div className="mt-3 flex justify-between px-2 text-[11px] font-semibold text-slate-500">
                {chartPoints.slice(0, 7).map((p) => (
                  <span key={p.data.id}>{p.data.label}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Section: Recent Distributions to Partners Nyata */}
      <Card className="mt-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              Distribusi terbaru ke mitra
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Penyaluran sampah terpilah ke mitra pengepul ({filterLabel})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="green">
              {totalDistributedKg.toLocaleString("id-ID")} kg tersalurkan
            </Badge>
            <Link
              href="/admin/distribusi"
              className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 transition"
            >
              Kelola Distribusi <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div className="table-wrap mt-4">
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
              {filteredDistributions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    Belum ada data distribusi pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredDistributions.slice(0, 5).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3.5 text-slate-600 text-sm whitespace-nowrap font-medium">
                      {row.date}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                      {row.partner}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 text-sm font-medium">
                      {row.category}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 text-sm text-center whitespace-nowrap">
                      {row.weight.toLocaleString("id-ID")} kg
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <Badge tone="green">Selesai</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
