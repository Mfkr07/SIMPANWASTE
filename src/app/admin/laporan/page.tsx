"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Phone, Calendar, Truck, FileText, MessageCircle } from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Badge,
  Modal,
  InfoRow,
  StatusDropdown,
  Pagination,
  usePagination,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/context/AdminContext";
import { Report } from "@/data/wargaSeedData";
import { getWhatsAppUrl } from "@/components/petugas/PetugasUI";

export default function AdminLaporanPage() {
  const { reports } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter((r) => {
    const matchesStatus =
      statusFilter === "Semua" ||
      r.status === statusFilter ||
      (statusFilter === "Semua Status" && true);
    const q = search.toLowerCase();
    const matchesSearch =
      r.id.toLowerCase().includes(q) ||
      r.citizen.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedReports,
    resetPage,
  } = usePagination(filteredReports, 10);

  useEffect(() => {
    resetPage();
  }, [search, statusFilter, resetPage]);

  return (
    <>
      <PageTitle
        title="Data Laporan Setoran"
        desc="Tampilan baca dan pemantauan seluruh laporan yang masuk ke sistem SIMPANWASTE."
      />

      <Card>
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID laporan, nama warga, kategori, atau lokasi..."
            />
          </div>
          <StatusDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            className="sm:w-52"
          />
        </div>

        {/* Reports Data Table */}
        <div className="table-wrap">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[130px] min-w-[130px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  ID Laporan
                </th>
                <th className="w-[180px] min-w-[180px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Warga
                </th>
                <th className="w-[240px] min-w-[220px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Kategori
                </th>
                <th className="w-[110px] min-w-[100px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  Berat
                </th>
                <th className="w-[120px] min-w-[110px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  Metode
                </th>
                <th className="w-[130px] min-w-[120px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tanggal
                </th>
                <th className="w-[130px] min-w-[120px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="w-[80px] min-w-[70px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((r) => (
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
                  <td className="w-[240px] min-w-[220px] max-w-[280px] px-4 py-3.5 align-middle">
                    <div className="text-sm font-medium leading-relaxed text-slate-800 break-words whitespace-normal">
                      {r.category}
                    </div>
                  </td>
                  <td className="w-[110px] min-w-[100px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <span className="font-bold text-slate-900">{r.estimate} kg</span>
                  </td>
                  <td className="w-[120px] min-w-[110px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <Badge tone={r.method === "Pickup" ? "blue" : "slate"}>
                      {r.method}
                    </Badge>
                  </td>
                  <td className="w-[130px] min-w-[120px] px-4 py-3.5 align-middle text-slate-600 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="w-[130px] min-w-[120px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <Badge tone={r.status === "Selesai" ? "green" : "amber"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="w-[80px] min-w-[70px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <button
                      type="button"
                      title="Lihat Detail Laporan"
                      aria-label="Lihat Detail Laporan"
                      onClick={() => setSelectedReport(r)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-green-500 hover:bg-green-50 hover:text-green-700 active:scale-95 cursor-pointer"
                    >
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada data laporan yang sesuai filter atau pencarian.
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

      {/* Detail Modal */}
      {selectedReport && (
        <Modal
          title={`Detail Laporan ${selectedReport.id}`}
          onClose={() => setSelectedReport(null)}
          wide
        >
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <InfoRow label="ID Laporan" value={selectedReport.id} />
            <InfoRow label="Nama Warga" value={selectedReport.citizen} />
            <InfoRow
              label="Nomor Telepon"
              value={
                selectedReport.phone && selectedReport.phone !== "-" ? (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{selectedReport.phone}</span>
                    <a
                      href={getWhatsAppUrl(selectedReport, selectedReport.assigned || "Admin Graha Pena")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 text-xs font-bold transition shadow-2xs"
                    >
                      <MessageCircle size={12} />
                      <span>Chat WA</span>
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">Belum ada nomor</span>
                )
              }
            />
            <InfoRow label="Kategori Sampah" value={selectedReport.category} />
            <InfoRow label="Estimasi Berat" value={`${selectedReport.estimate} kg`} />
            {selectedReport.actual !== undefined && (
              <InfoRow label="Berat Aktual" value={`${selectedReport.actual} kg`} />
            )}
            <InfoRow
              label="Metode Penyetoran"
              value={
                <Badge tone={selectedReport.method === "Pickup" ? "blue" : "slate"}>
                  {selectedReport.method}
                </Badge>
              }
            />
            <InfoRow label="Lokasi" value={selectedReport.location} />
            <InfoRow label="Tanggal Pengajuan" value={selectedReport.date} />
            <InfoRow
              label="Status"
              value={
                <Badge tone={selectedReport.status === "Selesai" ? "green" : "amber"}>
                  {selectedReport.status}
                </Badge>
              }
            />
            {selectedReport.assigned && (
              <InfoRow label="Petugas Ditugaskan" value={selectedReport.assigned} />
            )}
          </div>

          {/* Verification Breakdown if Available */}
          {selectedReport.verifiedItems && selectedReport.verifiedItems.length > 0 && (
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Rincian Verifikasi Petugas
              </h4>
              <div className="space-y-2">
                {selectedReport.verifiedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{item.category}</p>
                      <p className="text-slate-500">
                        {item.verifiedConditions?.join(", ") || "Terverifikasi"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{item.actualWeight} kg</p>
                      <p className="text-green-700 font-semibold">
                        Rp {item.subtotal?.toLocaleString("id-ID") || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => setSelectedReport(null)}>
              Tutup
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
