"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Truck, Scale } from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Badge,
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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input sm:w-48 cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID Laporan</th>
                <th>Warga</th>
                <th>Lokasi</th>
                <th>Kategori</th>
                <th>Berat Estimasi</th>
                <th>Status Laporan</th>
                <th>Status Tugas</th>
                <th>Aksi</th>
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

                return (
                  <tr key={report.id}>
                    <td className="font-bold text-green-700">{report.id}</td>
                    <td>
                      <p className="font-semibold text-slate-800">{report.citizen}</p>
                      <p className="text-xs text-slate-400">{report.phone}</p>
                    </td>
                    <td className="max-w-56 whitespace-normal leading-5 text-slate-600">
                      {report.location}
                    </td>
                    <td className="max-w-44 whitespace-normal">{report.category}</td>
                    <td className="font-bold text-slate-900">{report.estimate} kg</td>
                    <td>
                      <Badge tone={report.status === "Selesai" ? "green" : "amber"}>
                        {report.status}
                      </Badge>
                    </td>
                    <td>
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
                    <td>
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
