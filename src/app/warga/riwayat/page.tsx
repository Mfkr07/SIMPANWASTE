"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Check,
  Pencil,
  ClipboardList,
} from "lucide-react";
import { PageTitle, Card, Badge, Button, Modal } from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { Report } from "@/data/wargaSeedData";
import { DepositTracker } from "@/components/warga/DepositTracker";

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
              className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2 text-sm font-semibold transition active:scale-[.98] cursor-pointer ${
                filterOpen
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
                className={`text-slate-400 transition-transform duration-200 ${
                  filterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              role="listbox"
              className={`absolute right-0 top-full z-20 mt-2 w-full min-w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all duration-200 ease-out ${
                filterOpen
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
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition cursor-pointer ${
                      active
                        ? "bg-green-50 text-green-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {option}
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full transition ${
                        active ? "bg-green-700 text-white" : "text-transparent"
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
                <th className="w-[110px] min-w-[100px] px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
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
                  <td className="w-[110px] min-w-[100px] px-4 py-3.5 align-middle text-right whitespace-nowrap">
                    <Button
                      variant="secondary"
                      className="min-h-8 px-3 py-1 text-xs cursor-pointer"
                      onClick={() => setSelected(r)}
                    >
                      Detail
                    </Button>
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
      </Card>

      {/* Detail Modal with Deposit Tracker */}
      {selected && (
        <Modal title="Detail Laporan" onClose={() => setSelected(null)} wide>
          <dl className="divide-y divide-slate-100">
            {[
              ["ID laporan", selected.id],
              ["Nama warga", selected.citizen],
              ["Kategori", selected.category],
              ["Estimasi", `${selected.estimate} kg`],
              ["Metode", selected.method],
              ["Lokasi", selected.location],
              ["Status", selected.status],
              ["Tanggal laporan", selected.date],
            ].map(([a, b]) => (
              <div className="flex justify-between gap-6 py-3 text-sm" key={a}>
                <dt className="text-slate-500">{a}</dt>
                <dd className="text-right font-bold text-slate-900">{b}</dd>
              </div>
            ))}
          </dl>

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
      )}
    </div>
  );
}

