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
  Truck,
  Building2,
  Trash2,
  AlertCircle,
  LoaderCircle,
  X,
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
import { getCategoryUuid } from "@/lib/utils/categoryMapping";

const AVAILABLE_CATEGORIES = ["Plastik", "Kertas", "Besi", "Kaca", "Kayu"];

export default function WargaReportsPage() {
  const { citizenProfile, reports, setReports, minPickup, notify, refreshData } = useWarga();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<"Semua Status" | Report["status"]>(
    "Semua Status"
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Edit Report State
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editMethod, setEditMethod] = useState<"Pickup" | "Drop-off">("Pickup");
  const [editEstimate, setEditEstimate] = useState<string>("");
  const [editLocation, setEditLocation] = useState<string>("");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

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

  const handleOpenEdit = (report: Report) => {
    setEditingReport(report);
    setEditMethod(report.method);
    setEditEstimate(String(report.estimate));
    setEditLocation(
      report.method === "Pickup"
        ? report.location || citizenProfile.address || ""
        : ""
    );
    const existingCats = report.category
      .split(",")
      .map((c) => c.trim())
      .filter((c) => AVAILABLE_CATEGORIES.includes(c));
    setEditCategories(existingCats.length > 0 ? existingCats : ["Plastik"]);
    setShowConfirmCancel(false);
    setSelected(null);
  };

  const toggleCategory = (cat: string) => {
    setEditCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length <= 1) {
          notify("Pilih minimal 1 jenis kategori sampah.");
          return prev;
        }
        return prev.filter((c) => c !== cat);
      }
      return [...prev, cat];
    });
  };

  const handleSaveEdit = async () => {
    if (!editingReport) return;
    const estNum = parseFloat(editEstimate);
    if (isNaN(estNum) || estNum <= 0) {
      notify("Masukkan estimasi berat yang valid (lebih dari 0 kg).");
      return;
    }

    const minWeight = minPickup || 5.0;
    if (editMethod === "Pickup" && estNum < minWeight) {
      notify(
        `Estimasi berat (${estNum} kg) di bawah batas minimum penjemputan (${minWeight} kg). Silakan pilih metode Drop-off langsung ke Bank Sampah Graha Pena atau naikkan estimasi berat.`
      );
      return;
    }

    if (editMethod === "Pickup" && !editLocation.trim()) {
      notify("Mohon lengkapi alamat atau patokan penjemputan.");
      return;
    }

    if (editCategories.length === 0) {
      notify("Pilih minimal 1 jenis kategori sampah.");
      return;
    }

    setSaving(true);
    try {
      const categoryUuids = Array.from(new Set(editCategories.map(getCategoryUuid)));
      const res = await fetch("/api/laporan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_laporan: editingReport.id,
          metode: editMethod === "Pickup" ? "pickup" : "drop_off",
          estimasi_berat: estNum,
          catatan_lokasi: editMethod === "Pickup" ? editLocation.trim() : null,
          kategori_ids: categoryUuids,
        }),
      });

      const data = await res.json();
      if (!res.ok && data.error) {
        notify(data.error);
        setSaving(false);
        return;
      }

      // Update in local state
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === editingReport.id) {
            return {
              ...r,
              method: editMethod,
              estimate: estNum,
              category: editCategories.join(", "),
              location:
                editMethod === "Pickup"
                  ? editLocation.trim()
                  : "Bank Sampah Graha Pena Palembang",
              categoryWeights: editCategories.map((c) => ({
                category: c,
                estimate: estNum,
              })),
            };
          }
          return r;
        })
      );

      await refreshData();
      notify("Perubahan laporan berhasil disimpan!");
      setEditingReport(null);
    } catch (err: any) {
      console.error(err);
      notify("Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReport = async () => {
    if (!editingReport) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/laporan/batal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_laporan: editingReport.id }),
      });
      const data = await res.json();
      if (!res.ok && data.error) {
        notify(data.error);
        setCancelling(false);
        return;
      }

      setReports((prev) => prev.filter((r) => r.id !== editingReport.id));
      await refreshData();
      notify("Laporan setoran berhasil dibatalkan.");
      setEditingReport(null);
    } catch (err: any) {
      console.error(err);
      notify("Gagal membatalkan laporan.");
    } finally {
      setCancelling(false);
      setShowConfirmCancel(false);
    }
  };

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
                onClick={() => handleOpenEdit(selected)}
                className="mt-5 w-full cursor-pointer flex items-center justify-center gap-2"
              >
                <Pencil size={16} />
                <span>Edit Laporan</span>
              </Button>
            )}
          </Modal>
        );
      })()}

      {/* Modal Edit Laporan */}
      {editingReport && (
        <Modal
          title="Edit Laporan Setoran"
          onClose={() => {
            if (!saving && !cancelling) {
              setEditingReport(null);
            }
          }}
        >
          <div className="space-y-5">
            {/* Header Kode Laporan */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400">Kode Laporan:</span>{" "}
                <span className="font-mono font-bold text-slate-800">{editingReport.id}</span>
              </div>
              <Badge tone="amber">Menunggu</Badge>
            </div>

            {/* Metode Penyetoran */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Metode Penyetoran
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditMethod("Pickup")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition cursor-pointer ${editMethod === "Pickup"
                    ? "border-green-600 bg-green-50 text-green-900 font-bold ring-2 ring-green-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Truck size={20} className={editMethod === "Pickup" ? "text-green-700" : "text-slate-400"} />
                  <span className="text-xs">Pickup (Jemput)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditMethod("Drop-off")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition cursor-pointer ${editMethod === "Drop-off"
                    ? "border-green-600 bg-green-50 text-green-900 font-bold ring-2 ring-green-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Building2 size={20} className={editMethod === "Drop-off" ? "text-green-700" : "text-slate-400"} />
                  <span className="text-xs">Drop-off (Antar)</span>
                </button>
              </div>
            </div>

            {/* Pilihan Kategori Sampah */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Jenis Sampah (Minimal 1)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORIES.map((cat) => {
                  const active = editCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${active
                        ? "bg-green-700 text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {active && <Check size={13} strokeWidth={3} />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimasi Berat */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Estimasi Berat Total
                </label>
                {editMethod === "Pickup" && (
                  <span className="text-[11px] text-green-700 font-semibold">
                    Min. pickup: {minPickup || 5} kg
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={editEstimate}
                  onChange={(e) => setEditEstimate(e.target.value)}
                  className="input pr-12 text-sm font-semibold"
                  placeholder="Contoh: 5.5"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  kg
                </span>
              </div>
              {editMethod === "Pickup" && parseFloat(editEstimate) < (minPickup || 5) && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-700">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>
                    Di bawah batas minimum {minPickup || 5} kg. Petugas mungkin menyarankan Drop-off.
                  </span>
                </p>
              )}
            </div>

            {/* Lokasi / Patokan */}
            {editMethod === "Pickup" ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alamat &amp; Patokan Penjemputan
                </label>
                <textarea
                  rows={3}
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="input resize-none py-2.5 text-xs leading-relaxed"
                  placeholder="Contoh: Jl. Ki Merogan No. 12, pagar hitam samping pos ronda..."
                />
              </div>
            ) : (
              <div className="rounded-xl border border-green-200 bg-[#eef8f1] p-3.5 text-xs text-green-950 flex items-start gap-2.5">
                <Building2 size={18} className="text-green-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-green-900">Bank Sampah Graha Pena Palembang</p>
                  <p className="mt-0.5 text-slate-600">
                    Jl. Kol. H. Burlian No. 55, Karya Baru, Kec. Alang-Alang Lebar, Palembang
                  </p>
                  <p className="mt-1 text-[11px] text-green-700 font-semibold">
                    Senin – Sabtu: 08.00 – 16.00 WIB
                  </p>
                </div>
              </div>
            )}

            {/* Konfirmasi Pembatalan jika ditekan */}
            {showConfirmCancel ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs">
                <p className="font-bold text-red-900">Apakah Anda yakin ingin membatalkan laporan ini?</p>
                <p className="mt-1 text-red-700">
                  Laporan akan dihapus dari antrean penjemputan petugas.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancelReport}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 cursor-pointer disabled:opacity-50"
                  >
                    {cancelling ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>Membatalkan...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Ya, Batalkan Laporan</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={() => setShowConfirmCancel(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              {!showConfirmCancel && (
                <button
                  type="button"
                  onClick={() => setShowConfirmCancel(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 hover:text-red-800 cursor-pointer active:scale-95"
                >
                  <Trash2 size={14} />
                  <span>Batalkan Laporan</span>
                </button>
              )}

              <div className="w-full sm:w-auto flex items-center justify-end gap-2 ml-auto">
                <Button
                  variant="secondary"
                  type="button"
                  disabled={saving || cancelling}
                  onClick={() => setEditingReport(null)}
                >
                  Tutup
                </Button>
                <Button
                  type="button"
                  disabled={saving || cancelling}
                  onClick={handleSaveEdit}
                  className="min-w-28 flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} strokeWidth={2.5} />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

