"use client";

import { Check } from "lucide-react";
import { Badge } from "./WargaUI";

export type TrackerStage =
  | "Request Terkirim"
  | "Petugas dalam Perjalanan"
  | "Petugas Memverifikasi"
  | "Poin Saldo Didapatkan";

export interface TrackerHistoryItem {
  stage: TrackerStage;
  timestamp: string;
}

export interface DepositReport {
  id: string;
  category: string;
  estimate: number;
  method: "Pickup" | "Drop-off";
  status: "Menunggu" | "Selesai" | "Dibatalkan" | string;
  date: string;
  location?: string;
  assigned?: string;
  trackerHistory?: TrackerHistoryItem[];
}

export function DepositTracker({ report }: { report: DepositReport }) {
  const stages: Array<{
    stage: TrackerStage;
    description: string;
  }> =
    report.method === "Pickup"
      ? [
          {
            stage: "Request Terkirim",
            description: "Laporan setoran berhasil diterima sistem.",
          },
          {
            stage: "Petugas dalam Perjalanan",
            description: "Petugas menuju lokasi penjemputan.",
          },
          {
            stage: "Petugas Memverifikasi",
            description: "Sampah sedang ditimbang dan diverifikasi.",
          },
          {
            stage: "Poin Saldo Didapatkan",
            description: "Nilai setoran telah ditambahkan ke saldo.",
          },
        ]
      : [
          {
            stage: "Request Terkirim",
            description: "Laporan Drop-off berhasil diterima sistem.",
          },
          {
            stage: "Petugas Memverifikasi",
            description: "Sampah sedang ditimbang dan diverifikasi.",
          },
          {
            stage: "Poin Saldo Didapatkan",
            description: "Nilai setoran telah ditambahkan ke saldo.",
          },
        ];

  const fallbackHistory: TrackerHistoryItem[] = [
    { stage: "Request Terkirim", timestamp: report.date },
  ];

  if (report.status === "Selesai") {
    if (report.method === "Pickup") {
      fallbackHistory.push({
        stage: "Petugas dalam Perjalanan",
        timestamp: report.date,
      });
    }
    fallbackHistory.push(
      { stage: "Petugas Memverifikasi", timestamp: report.date },
      { stage: "Poin Saldo Didapatkan", timestamp: report.date }
    );
  }

  const history = report.trackerHistory?.length
    ? report.trackerHistory
    : fallbackHistory;
  const historyByStage = new Map(history.map((entry) => [entry.stage, entry]));

  const currentIndex = stages.reduce(
    (latest, item, index) => (historyByStage.has(item.stage) ? index : latest),
    0
  );

  return (
    <section aria-label={`Tracker status ${report.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.12em] text-green-700">
            Tracker Status Setoran
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">{report.id}</p>
        </div>
        <Badge tone={report.method === "Pickup" ? "blue" : "green"}>
          {report.method}
        </Badge>
      </div>

      <div className="relative mt-6">
        <span className="absolute bottom-6 left-[17px] top-5 w-px bg-slate-200 md:hidden" />
        <span className="absolute left-[12%] right-[12%] top-[17px] hidden h-px bg-slate-200 md:block" />

        <div
          className={`relative grid gap-0 ${
            stages.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"
          }`}
        >
          {stages.map((item, index) => {
            const historyItem = historyByStage.get(item.stage);
            const reached = Boolean(historyItem);
            const current = index === currentIndex;

            return (
              <div
                key={item.stage}
                className="relative flex gap-3 pb-6 last:pb-0 md:block md:px-2 md:pb-0 md:text-center"
              >
                <span
                  className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 md:mx-auto ${
                    reached
                      ? "border-green-700 bg-green-700 text-white"
                      : "border-slate-300 bg-white text-slate-400"
                  } ${current ? "ring-4 ring-green-100" : ""}`}
                >
                  {reached ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-extrabold">{index + 1}</span>
                  )}
                </span>
                <div className="pt-0.5 md:pt-3">
                  <p
                    className={`text-xs font-extrabold ${
                      current
                        ? "text-green-800"
                        : reached
                          ? "text-slate-800"
                          : "text-slate-400"
                    }`}
                  >
                    {item.stage}
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    {item.description}
                  </p>
                  {historyItem && (
                    <p className="mt-1.5 text-[10px] font-bold text-green-700">
                      {historyItem.timestamp}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default DepositTracker;
