"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Truck, Scale, MessageCircle } from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Badge,
  StatusDropdown,
  getWhatsAppUrl,
} from "@/components/petugas/PetugasUI";
import { usePetugas } from "@/context/PetugasContext";

export default function PetugasTugasPage() {
  const router = useRouter();
  const {
    officerProfile,
    reports,
    pickedUpReports,
    setPickedUpReports,
    addTrackerStage,
    notify,
  } = usePetugas();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");

  const myName = (officerProfile.name || "").toLowerCase().trim();

  const assigned = useMemo(() => {
    return reports.filter((r) => {
      const a = (r.assigned || "").toLowerCase().trim();
      const matchOfficer = Boolean(a && (a === myName || a.includes("rizky")));
      const matchStatus = status === "Semua" || r.status === status;
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.citizen.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase());
      return matchOfficer && matchStatus && matchSearch;
    });
  }, [reports, myName, status, search]);

  const handleStartPickup = (reportId: string) => {
    fetch("/api/laporan/jemput", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_laporan: reportId }),
    }).catch(() => {});
    addTrackerStage(reportId, "Petugas dalam Perjalanan");
    notify("Penjemputan dimulai dan tracker Warga diperbarui.");
  };

  const handleMarkPickedUp = (reportId: string) => {
    setPickedUpReports((prev) =>
      prev.includes(reportId) ? prev : [...prev, reportId]
    );
    notify("Sampah ditandai sudah dijemput. Lanjutkan ke penimbangan.");
  };

  const handleProcess = (reportId: string) => {
    router.push(`/petugas/verifikasi?id=${reportId}`);
  };

  return (
    <>
      <PageTitle
        title="Daftar Tugas Penjemputan"
        desc="Laporan yang ditugaskan khusus kepada Anda."
      />

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID, nama warga, atau alamat..."
            />
          </div>
          <StatusDropdown
            value={status}
            onChange={setStatus}
            className="sm:w-52"
          />
        </div>

        <div className="table-wrap">
          <table className="w-full min-w-[1360px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[125px] min-w-[125px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">ID Laporan</th>
                <th className="w-[160px] min-w-[150px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Warga</th>
                <th className="w-[170px] min-w-[160px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">No. WhatsApp</th>
                <th className="w-[260px] min-w-[240px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Lokasi</th>
                <th className="w-[220px] min-w-[200px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Kategori</th>
                <th className="w-[130px] min-w-[120px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Berat Estimasi</th>
                <th className="w-[140px] min-w-[130px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Status Laporan</th>
                <th className="w-[160px] min-w-[150px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Status Tugas</th>
                <th className="w-[170px] min-w-[160px] px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map((report) => {
                const pickedUp = pickedUpReports.includes(report.id);
                const needsPickup = report.method === "Pickup";
                const pickupStarted =
                  report.trackerHistory?.some(
                    (entry) => entry.stage === "Petugas dalam Perjalanan"
                  ) || false;
                const hasValidPhone = report.phone && report.phone !== "-";

                return (
                  <tr
                    key={report.id}
                    className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                  >
                    <td className="w-[125px] min-w-[125px] px-4 py-3.5 align-middle font-bold text-green-700 whitespace-nowrap">
                      {report.id}
                    </td>
                    <td className="w-[160px] min-w-[150px] px-4 py-3.5 align-middle">
                      <p className="font-bold text-slate-900">{report.citizen}</p>
                      <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-400">
                        Nasabah Warga
                      </span>
                    </td>
                    <td className="w-[170px] min-w-[160px] px-4 py-3.5 align-middle">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-800">
                          {hasValidPhone ? report.phone : "Belum ada nomor"}
                        </span>
                        {hasValidPhone ? (
                          <a
                            href={getWhatsAppUrl(report.phone, report.citizen, report.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 w-fit rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                            title={`Kirim pesan WhatsApp ke ${report.citizen}`}
                          >
                            <MessageCircle size={13} className="shrink-0" />
                            <span>Chat WA</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Nomor tidak tersedia</span>
                        )}
                      </div>
                    </td>
                    <td className="w-[260px] min-w-[240px] max-w-[280px] px-4 py-3.5 align-middle">
                      <div className="text-sm leading-relaxed text-slate-600 break-words whitespace-normal">
                        {report.location}
                      </div>
                    </td>
                    <td className="w-[240px] min-w-[220px] max-w-[260px] px-4 py-3.5 align-middle">
                      <div className="text-sm font-medium leading-relaxed text-slate-800 break-words whitespace-normal">
                        {report.category}
                      </div>
                    </td>
                    <td className="w-[130px] min-w-[120px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                      <span className="font-bold text-slate-900">{report.estimate} kg</span>
                    </td>
                    <td className="w-[140px] min-w-[130px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                      <Badge tone={report.status === "Selesai" ? "green" : "amber"}>
                        {report.status}
                      </Badge>
                    </td>
                    <td className="w-[160px] min-w-[150px] px-4 py-3.5 align-middle text-center whitespace-nowrap">
                      {report.status === "Selesai" ? (
                        <Badge tone="green">Tugas selesai</Badge>
                      ) : needsPickup ? (
                        <Badge
                          tone={
                            pickedUp
                              ? "green"
                              : pickupStarted
                              ? "amber"
                              : "slate"
                          }
                        >
                          {pickedUp
                            ? "Sudah dijemput"
                            : pickupStarted
                            ? "Dalam perjalanan"
                            : "Belum dijemput"}
                        </Badge>
                      ) : (
                        <Badge tone="blue">Drop-off diterima</Badge>
                      )}
                    </td>
                    <td className="w-[170px] min-w-[160px] px-4 py-3.5 align-middle text-right whitespace-nowrap">
                      {report.status === "Selesai" ? (
                        <span className="text-xs font-semibold text-slate-400">
                          Selesai
                        </span>
                      ) : needsPickup && !pickupStarted ? (
                        <Button
                          onClick={() => handleStartPickup(report.id)}
                          className="min-h-8 whitespace-nowrap px-3 py-1 text-xs cursor-pointer"
                        >
                          <Truck size={14} /> Mulai Penjemputan
                        </Button>
                      ) : needsPickup && !pickedUp ? (
                        <Button
                          onClick={() => handleMarkPickedUp(report.id)}
                          className="min-h-8 whitespace-nowrap px-3 py-1 text-xs cursor-pointer"
                        >
                          <Truck size={14} /> Tandai Dijemput
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleProcess(report.id)}
                          className="min-h-8 whitespace-nowrap px-3 py-1 text-xs cursor-pointer"
                        >
                          <Scale size={14} /> Proses
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {assigned.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada tugas yang sesuai filter.
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
