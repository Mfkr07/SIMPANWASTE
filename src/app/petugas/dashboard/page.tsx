"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Clock3, CheckCircle2 } from "lucide-react";
import {
  PageTitle,
  StatCard,
  Card,
  Button,
  Badge,
  ReportTable,
} from "@/components/petugas/PetugasUI";
import { usePetugas } from "@/context/PetugasContext";

export default function PetugasDashboardPage() {
  const router = useRouter();
  const { officerProfile, reports } = usePetugas();

  const assigned = useMemo(() => {
    const myName = (officerProfile.name || "").toLowerCase().trim();
    return reports.filter((r) => {
      const a = (r.assigned || "").toLowerCase().trim();
      return Boolean(a && (a === myName || a.includes("rizky")));
    });
  }, [officerProfile.name, reports]);

  const pendingCount = assigned.filter((r) => r.status === "Menunggu").length;
  const completedCount = assigned.filter((r) => r.status === "Selesai").length;

  return (
    <>
      <PageTitle
        title="Dashboard Petugas"
        desc="Ringkasan tugas lapangan dan aktivitas verifikasi hari ini."
        action={
          <Link href="/petugas/tugas">
            <Button className="w-full sm:w-auto cursor-pointer">
              <Truck size={17} /> Lihat semua tugas
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Tugas ditugaskan"
          value={`${assigned.length} tugas`}
          detail={`Untuk ${officerProfile.name || "Petugas"}`}
          icon={Truck}
        />
        <StatCard
          label="Menunggu diproses"
          value={`${pendingCount} laporan`}
          detail="Perlu tindak lanjut"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Selesai bulan ini"
          value={`${completedCount} laporan`}
          detail="Verifikasi berhasil"
          icon={CheckCircle2}
          tone="blue"
        />
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900">Tugas terbaru</h2>
            <p className="mt-1 text-xs text-slate-500">
              Hanya laporan yang ditugaskan kepada Anda
            </p>
          </div>
          <Badge tone="amber">{pendingCount} menunggu</Badge>
        </div>

        <ReportTable
          reports={assigned.slice(0, 5)}
          actionLabel="Proses"
          onAction={(r) => {
            router.push(`/petugas/verifikasi?id=${r.id}`);
          }}
        />
      </Card>
    </>
  );
}
