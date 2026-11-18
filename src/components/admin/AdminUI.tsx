"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import {
  Recycle,
  FileText,
  X,
  LucideIcon,
  Filter,
  ChevronDown,
  Check,
} from "lucide-react";

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
            PANEL ADMINISTRATOR
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
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${styles[variant]} ${className}`}
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
  tone?: "green" | "amber" | "slate" | "blue" | "violet";
}) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-100 text-slate-600",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
    violet: "border-purple-200 bg-purple-50 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}
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
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      </div>
      {action && <div>{action}</div>}
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
  tone?: "green" | "blue" | "amber" | "violet";
}) {
  const tones = {
    green: "bg-green-50 text-green-700",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-purple-50 text-purple-700",
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
    </Card>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {label}
        </label>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full ${
          wide ? "max-w-2xl" : "max-w-md"
        } rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-bold text-slate-900 text-right">{value}</span>
    </div>
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
            Pilih Opsi
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
