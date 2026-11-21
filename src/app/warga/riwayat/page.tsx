"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Check,
  Pencil,
  ClipboardList,
  FileText,
  MapPin,
  MessageCircle,
} from "lucide-react";
import {
  PageTitle,
  Card,
  Badge,
  Button,
  Modal,
  Pagination,
  usePagination,
} from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { Report, WasteCondition } from "@/data/wargaSeedData";
import { DepositTracker } from "@/components/warga/DepositTracker";
import { getWhatsAppUrl } from "@/components/petugas/PetugasUI";

export default function WargaReportsPage() {
  const { citizenProfile, reports, notify } = useWarga();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<"Semua Status" | Report["status"]>(
    "Semua Status"
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const statusOptions: Array<"Semua Status" | Report["status"]> = [
    "Semua Status",
    "Menunggu",
    "Selesai",
  ];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const data = reports.filter((r) => {
    const c = (r.citizen || "").toLowerCase().trim();
    const myName = (citizenProfile.name || "").toLowerCase().trim();
    const myUser = (citizenProfile.username || "").toLowerCase().trim();
    const matchesUser = Boolean((myName && c === myName) || (myUser && c === myUser));
    const matchesStatus = statusFilter === "Semua Status" || r.status === statusFilter;
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());

    return matchesUser && matchesStatus && matchesSearch;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedData,
    resetPage,
  } = usePagination(data, 10);

  useEffect(() => {
    resetPage();
  }, [search, statusFilter, resetPage]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Riwayat Laporan"
        desc="Pantau laporan setoran milik Anda."
      />

      <Card>
        {/* Search & Filter Controls */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Cari ID atau kategori..."
            />
          </div>

          <div ref={filterRef} className="relative sm:w-48">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((open) => !open)}
              className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2 text-sm font-semibold transition active:scale-[.98] cursor-pointer ${filterOpen
                ? "border-green-500 text-green-700 ring-4 ring-green-50"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
            >
              <span className="flex items-center gap-2">
                <Filter size={17} />
                {statusFilter}
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${filterOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            <div
              role="listbox"
              className={`absolute right-0 top-full z-20 mt-2 w-full min-w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all duration-200 ease-out ${filterOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible -translate-y-1 scale-[.98] opacity-0"
                }`}
            >
              {statusOptions.map((option) => {
                const active = statusFilter === option;
                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => {
                      setStatusFilter(option);
                      setFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition cursor-pointer ${active
                      ? "bg-green-50 text-green-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {option}
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full transition ${active ? "bg-green-700 text-white" : "text-transparent"
                        }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrap">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[130px] min-w-[130px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">ID Laporan</th>
                <th className="w-[180px] min-w-[180px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Warga</th>
                <th className="w-[260px] min-w-[240px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Kategori</th>
                <th className="w-[110px] min-w-[100px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Berat</th>
                <th className="w-[120px] min-w-[110px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Metode</th>
                <th className="w-[130px] min-w-[120px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Tanggal</th>
                <th className="w-[130px] min-w-[120px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                <th className="w-[80px] min-w-[70px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Detail</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                >
                  <td className="w-[130px] min-w-[130px] px-4 py-3.5 align-middle font-bold text-green-700 whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="w-[180px] min-w-[180px] px-4 py-3.5 align-middle">
                    <p className="font-semibold text-slate-800">{r.citizen}</p>
                    <p className="text-xs text-slate-400">{r.phone}</p>
                  </td>
                  <td className="w-[260px] min-w-[240px] max-w-[280px] px-4 py-3.5 align-middle">
                    <div className="text-sm font-medium leading-relaxed text-slate-800 break-words whitespace-normal">
                      {r.category}
                    </div>
                  </td>
                  <td className="w-[110px] min-w-[100px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <span className="font-bold text-slate-900">{r.estimate} kg</span>
                  </td>
                  <td className="w-[120px] min-w-[110px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <Badge tone={r.method === "Pickup" ? "blue" : "slate"}>{r.method}</Badge>
                  </td>
                  <td className="w-[130px] min-w-[120px] px-4 py-3.5 align-middle text-slate-600 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="w-[130px] min-w-[120px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <Badge tone={r.status === "Selesai" ? "green" : "amber"}>{r.status}</Badge>
                  </td>
                  <td className="w-[80px] min-w-[70px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <button
                      type="button"
                      title="Lihat Detail Laporan"
                      aria-label="Lihat Detail Laporan"
                      onClick={() => setSelected(r)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-green-500 hover:bg-green-50 hover:text-green-700 active:scale-95 cursor-pointer"
                    >
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              <ClipboardList className="mx-auto w-10 h-10 text-slate-300 mb-2" />
              Tidak ditemukan data laporan yang sesuai.
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="laporan"
        />
      </Card>

      {/* Detail Modal with Deposit Tracker */}
      {selected && (() => {
        const categoryItems =
          selected.status === "Selesai" && selected.verifiedItems?.length
            ? selected.verifiedItems.map((v) => ({
              category: v.category,
              estimate: v.estimatedWeight,
              actual: v.actualWeight,
              citizenConditions: v.citizenConditions || ["Sudah dipilah"],
              verifiedConditions: v.verifiedConditions?.length
                ? v.verifiedConditions
                : v.verifiedCondition
                  ? [v.verifiedCondition]
                  : [],
              price: v.price,
              subtotal: v.subtotal,
            }))
            : selected.categoryWeights?.length
              ? selected.categoryWeights.map((c) => ({
                category: c.category,
                estimate: c.estimate,
                actual: undefined,
                citizenConditions: c.conditions?.length ? c.conditions : ["Sudah dipilah"],
                verifiedConditions: [] as WasteCondition[],
                price: undefined,
                subtotal: undefined,
              }))
              : selected.verifiedItems?.length
                ? selected.verifiedItems.map((v) => ({
                  category: v.category,
                  estimate: v.estimatedWeight,
                  actual: v.actualWeight,
                  citizenConditions: v.citizenConditions || ["Sudah dipilah"],
                  verifiedConditions: v.verifiedConditions?.length
                    ? v.verifiedConditions
                    : v.verifiedCondition
                      ? [v.verifiedCondition]
                      : [],
                  price: v.price,
                  subtotal: v.subtotal,
                }))
                : [
                  {
                    category: selected.category,
                    estimate: selected.estimate,
                    actual: selected.actual,
                    citizenConditions: ["Sudah dipilah"] as WasteCondition[],
                    verifiedConditions: [] as WasteCondition[],
                    price: undefined,
                    subtotal: selected.value,
                  },
                ];

        const allCitizenConditions = Array.from(
          new Set(categoryItems.flatMap((item) => item.citizenConditions))
        );

        return (
          <Modal title="Detail Laporan" onClose={() => setSelected(null)} wide>
            <dl className="divide-y divide-slate-100">
              {[
                { label: "ID laporan", value: selected.id, isId: true },
                { label: "Nama warga", value: selected.citizen },
                {
                  label: "No. WhatsApp",
                  value: selected.phone && selected.phone !== "-" ? selected.phone : "-",
                  isPhone: true,
                },
                { label: "Kategori", value: selected.category },
                {
                  label: "Kondisi sampah",
                  value: allCitizenConditions,
                  isConditions: true,
                },
                { label: "Estimasi", value: `${selected.estimate} kg` },
                { label: "Metode", value: selected.method },
                { label: "Lokasi", value: selected.location, isLocation: true },
                { label: "Status", value: selected.status, isStatus: true },
                { label: "Tanggal laporan", value: selected.date },
              ].map((row) => {
                if (row.isLocation) {
                  return (
                    <div
                      key={row.label}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6 py-3.5 text-sm"
                    >
                      <dt className="text-slate-500 font-medium shrink-0 sm:w-36 pt-1">
                        {row.label}
                      </dt>
                      <dd className="w-full sm:max-w-[70%] rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 text-left">
                        <div className="flex items-start gap-2.5">
                          <MapPin size={15} className="text-green-700 shrink-0 mt-0.5" />
                          <span className="text-xs leading-relaxed font-semibold text-slate-800 break-words">
                            {row.value as string}
                          </span>
                        </div>
                      </dd>
                    </div>
                  );
                }

                if (row.isPhone) {
                  const phoneVal = selected.phone && selected.phone !== "-" ? selected.phone : null;

                  return (
                    <div
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                      key={row.label}
                    >
                      <dt className="text-slate-500 font-medium">{row.label}</dt>
                      <dd className="text-right">
                        {phoneVal ? (
                          <a
                            href={getWhatsAppUrl(selected, selected.assigned || "Petugas Lapangan")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 cursor-pointer"
                            title={`Hubungi ${selected.citizen} via WhatsApp`}
                          >
                            <MessageCircle size={13} className="text-emerald-600 shrink-0" />
                            <span>{selected.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ada nomor</span>
                        )}
                      </dd>
                    </div>
                  );
                }

                if (row.isConditions) {
                  return (
                    <div
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                      key={row.label}
                    >
                      <dt className="text-slate-500 font-medium">{row.label}</dt>
                      <dd className="flex flex-wrap items-center justify-end gap-1.5 max-w-[65%]">
                        {allCitizenConditions.length > 0 ? (
                          allCitizenConditions.map((cond) => (
                            <span
                              key={cond}
                              className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800"
                            >
                              {cond}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sudah dipilah</span>
                        )}
                      </dd>
                    </div>
                  );
                }

                return (
                  <div
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                    key={row.label}
                  >
                    <dt className="text-slate-500 font-medium">{row.label}</dt>
                    <dd
                      className={`text-right font-bold text-slate-900 ${row.isId ? "font-mono text-xs break-all text-slate-700" : ""
                        }`}
                    >
                      {row.isStatus ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          {row.value as string}
                        </span>
                      ) : (
                        row.value as string
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {/* Rincian Kategori & Kondisi Sampah */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Rincian Sampah &amp; Kondisi
              </h4>
              <div className="space-y-2.5">
                {categoryItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">{item.category}</p>
                        <p className="text-slate-500 mt-0.5">
                          Estimasi: <span className="font-semibold text-slate-700">{item.estimate} kg</span>
                          {item.actual !== undefined && item.actual > 0 && (
                            <span className="ml-2 font-bold text-green-700">
                              • Aktual: {item.actual} kg
                            </span>
                          )}
                        </p>
                      </div>
                      {item.subtotal !== undefined && item.subtotal > 0 && (
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-700 text-sm">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Kondisi dilaporkan warga:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.citizenConditions.length > 0 ? (
                          item.citizenConditions.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sudah dipilah</span>
                        )}
                      </div>
                    </div>

                    {item.verifiedConditions.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-200/60">
                        <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                          Hasil verifikasi petugas:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.verifiedConditions.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <DepositTracker report={selected} />
            </div>

            {selected.status === "Menunggu" && (
              <Button
                onClick={() => {
                  notify("Mode edit laporan setoran dibuka.");
                  setSelected(null);
                }}
                className="mt-5 w-full cursor-pointer"
              >
                <Pencil size={16} />
                <span>Edit Laporan</span>
              </Button>
            )}
          </Modal>
        );
      })()}
    </div>
  );
}

