"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  ClipboardList,
  MapPin,
  WalletCards,
  HandCoins,
  UserRound,
  ChevronRight,
  LogOut,
  X,
  Menu,
  Bell,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "./WargaUI";
import { useWarga } from "@/context/WargaContext";

const navItems = [
  { label: "Dashboard", href: "/warga/dashboard", icon: LayoutDashboard },
  { label: "Informasi & Edukasi", href: "/warga/edukasi", icon: BookOpen },
  { label: "Buat Laporan Setoran", href: "/warga/buat-laporan", icon: Plus },
  { label: "Riwayat Laporan", href: "/warga/riwayat", icon: ClipboardList },
  { label: "Maps Bank Sampah", href: "/warga/maps", icon: MapPin },
  { label: "Saldo & Transaksi", href: "/warga/saldo", icon: WalletCards },
  { label: "Penarikan Saldo", href: "/warga/penarikan", icon: HandCoins },
  { label: "Profil Saya", href: "/warga/profil", icon: UserRound },
];

export default function WargaShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { citizenProfile, toast, handleLogout } = useWarga();

  const currentNavItem = navItems.find((item) => pathname.startsWith(item.href)) || navItems[0];

  const initials = citizenProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-800">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/warga/dashboard">
            <Logo />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 lg:hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-2 mt-6 rounded-xl border border-green-100 bg-green-50 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-green-700 text-sm font-extrabold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{citizenProfile.name}</p>
              <p className="text-xs font-medium text-green-700">Warga</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/warga/dashboard" && pathname === "/warga");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight size={15} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700 cursor-pointer transition"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-[276px]">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="hidden text-xs font-medium text-slate-400 sm:block">
                Sistem Informasi Pengelolaan Sampah
              </p>
              <p className="text-sm font-bold text-slate-800">
                {currentNavItem?.label || "Area Warga"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Notifikasi"
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="ml-1 hidden h-8 w-px bg-slate-200 sm:block" />
            <Link
              href="/warga/profil"
              className="hidden items-center gap-2 sm:flex hover:opacity-80 transition"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700">
                {initials}
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page View */}
        <main className="mx-auto max-w-[1440px] p-4 sm:p-7 lg:p-8">{children}</main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={19} className="text-green-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

