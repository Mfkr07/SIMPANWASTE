"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Recycle, FileText, X, LucideIcon, Filter, ChevronDown, Check, MessageCircle } from "lucide-react";
import { Report } from "@/data/wargaSeedData";

export function getWhatsAppUrl(phone: string, citizenName: string, reportId: string) {
  if (!phone || phone === "-") return "#";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (digits.startsWith("8")) {
    digits = "62" + digits;
  }
  const message = encodeURIComponent(
    `Halo ${citizenName}, saya petugas Bank Sampah Graha Pena terkait penjemputan sampah (ID: ${reportId}).`
  );
  return `https://wa.me/${digits}?text=${message}`;
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
        <Recycle size={22} />
      </div>
      {!compact && (
        <div>
          <div className="font-extrabold tracking-tight text-slate-900">
            SIMPAN<span className="text-green-700">WASTE</span>
          </div>
          <div className="text-[10px] font-semibold tracking-[.15em] text-slate-400">
            PALEMBANG PILOT
          </div>
        </div>
      )}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-green-700 text-white hover:bg-green-800 shadow-sm",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "blue" | "slate" | "red";
}) {
  const tones = {
    green: "bg-green-50 text-green-700 ring-green-600/15",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/15",
    slate: "bg-slate-100 text-slate-600 ring-slate-500/10",
    red: "bg-red-50 text-red-700 ring-red-600/15",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function PageTitle({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "green" | "blue" | "amber";
}) {
  const tones = {
    green: "bg-green-50 text-green-700",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
    </Card>
  );
}

export function Empty({
  title,
  compact = false,
}: {
  title: string;
  compact?: boolean;
}) {
  return (
    <div className={`${compact ? "py-8" : "py-24"} text-center`}>
      <FileText className="mx-auto text-slate-300" size={36} />
      <p className="mt-3 text-sm font-bold text-slate-500">{title}</p>
    </div>
  );
}

export function ReportTable({
  reports,
  actionLabel = "Detail",
  onAction,
}: {
  reports: Report[];
  actionLabel?: string;
  onAction: (r: Report) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="w-full min-w-[1220px] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
            <th className="w-[125px] min-w-[125px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">ID Laporan</th>
            <th className="w-[160px] min-w-[150px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Warga</th>
            <th className="w-[170px] min-w-[160px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">No. WhatsApp</th>
            <th className="w-[240px] min-w-[220px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Kategori</th>
            <th className="w-[110px] min-w-[100px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Berat</th>
            <th className="w-[120px] min-w-[110px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Metode</th>
            <th className="w-[130px] min-w-[120px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Tanggal</th>
            <th className="w-[130px] min-w-[120px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
            <th
              className={`${
                actionLabel === "Detail"
                  ? "w-[80px] min-w-[70px] text-center"
                  : "w-[160px] min-w-[150px] text-right"
              } px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600`}
            >
              {actionLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const hasPhone = r.phone && r.phone !== "-";
            return (
              <tr
                key={r.id}
                className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
              >
                <td className="w-[125px] min-w-[125px] px-4 py-3.5 align-middle font-bold text-green-700 whitespace-nowrap">
                  {r.id}
                </td>
                <td className="w-[160px] min-w-[150px] px-4 py-3.5 align-middle">
                  <p className="font-bold text-slate-900">{r.citizen}</p>
                  <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-400">
                    Nasabah Warga
                  </span>
                </td>
                <td className="w-[170px] min-w-[160px] px-4 py-3.5 align-middle">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-800">
                      {hasPhone ? r.phone : "Belum ada nomor"}
                    </span>
                    {hasPhone && (
                      <a
                        href={getWhatsAppUrl(r.phone, r.citizen, r.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 w-fit rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                        title={`Hubungi ${r.citizen} via WhatsApp`}
                      >
                        <MessageCircle size={13} className="shrink-0" />
                        <span>Chat WA</span>
                      </a>
                    )}
                  </div>
                </td>
                <td className="w-[240px] min-w-[220px] max-w-[260px] px-4 py-3.5 align-middle">
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
                <td
                  className={`${
                    actionLabel === "Detail"
                      ? "w-[80px] min-w-[70px] text-center"
                      : "w-[160px] min-w-[150px] text-right"
                  } px-4 py-3.5 align-middle whitespace-nowrap`}
                >
                  {actionLabel === "Detail" ? (
                    <button
                      type="button"
                      title="Lihat Detail Laporan"
                      aria-label="Lihat Detail Laporan"
                      onClick={() => onAction(r)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-green-500 hover:bg-green-50 hover:text-green-700 active:scale-95 cursor-pointer"
                    >
                      <FileText size={16} />
                    </button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="min-h-8 px-3 py-1 text-xs cursor-pointer"
                      onClick={() => onAction(r)}
                    >
                      {actionLabel}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {reports.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-500">Belum ada data laporan.</div>
      )}
    </div>
  );
}

export interface StatusOption {
  value: string;
  label: string;
  tone?: "slate" | "amber" | "green" | "blue";
}

export function StatusDropdown({
  value,
  onChange,
  options = [
    { value: "Semua", label: "Semua Status", tone: "slate" },
    { value: "Menunggu", label: "Menunggu", tone: "amber" },
    { value: "Selesai", label: "Selesai", tone: "green" },
  ],
  className = "",
  placeholder = "Pilih Status",
}: {
  value: string;
  onChange: (val: string) => void;
  options?: StatusOption[];
  className?: string;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedOption =
    options.find((opt) => opt.value === value) ||
    options.find((opt) => opt.label === value) ||
    { value, label: value || placeholder, tone: "slate" as const };

  const renderToneIndicator = (tone?: "slate" | "amber" | "green" | "blue") => {
    switch (tone) {
      case "amber":
        return (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 ring-2 ring-amber-100" />
        );
      case "green":
        return (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-600 ring-2 ring-green-100" />
        );
      case "blue":
        return (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500 ring-2 ring-sky-100" />
        );
      default:
        return <Filter size={14} className="shrink-0 text-slate-400" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 py-2 text-sm font-semibold transition cursor-pointer select-none shadow-sm ${
          isOpen
            ? "border-green-600 ring-4 ring-green-500/10 text-green-900"
            : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70"
        }`}
      >
        <span className="flex items-center gap-2.5 truncate">
          {renderToneIndicator(selectedOption.tone)}
          <span className="truncate">{selectedOption.label}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-green-700" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-40 mt-1.5 w-full min-w-[190px] rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Filter Status
          </div>
          {options.map((option) => {
            const isSelected =
              option.value === value || option.label === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition cursor-pointer ${
                  isSelected
                    ? "bg-green-50 font-bold text-green-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {renderToneIndicator(option.tone)}
                  <span>{option.label}</span>
                </span>
                {isSelected && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-green-700 text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
