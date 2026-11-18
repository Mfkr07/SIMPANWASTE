"use client";

import { useState, useRef, useEffect, ReactNode, useMemo } from "react";
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
  CheckCircle2,
  ChevronDown,
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
  const [headerPopover, setHeaderPopover] = useState<"notifications" | "profile" | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const headerActionsRef = useRef<HTMLDivElement>(null);

  const { citizenProfile, reports, toast, handleLogout } = useWarga();

  const currentNavItem =
    navItems.find((item) => pathname.startsWith(item.href)) || navItems[0];

  const initials = citizenProfile.name
    ? citizenProfile.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "W";

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerActionsRef.current && !headerActionsRef.current.contains(e.target as Node)) {
        setHeaderPopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Notifications calculation based on citizen's reports
  const notifications = useMemo(() => {
    const relevantReports = reports.filter((r) => {
      const c = (r.citizen || "").toLowerCase().trim();
      const myName = (citizenProfile.name || "").toLowerCase().trim();
      const myUser = (citizenProfile.username || "").toLowerCase().trim();
      return Boolean((myName && c === myName) || (myUser && c === myUser));
    });

    return relevantReports.slice(0, 5).map((report) => {
      const title =
        report.status === "Selesai"
          ? "Setoran Selesai & Terverifikasi"
          : "Progres Setoran Diperbarui";
      const message = `${report.id} · ${report.category} (${report.estimate} kg)`;
      return {
        id: `warga-${report.id}-${report.status}`,
        title,
        message,
        time: report.date,
        type: report.status === "Selesai" ? "success" : "update",
      };
    });
  }, [citizenProfile.name, citizenProfile.username, reports]);

  const unreadCount = notifications.filter(
    (n) => !readNotificationIds.includes(n.id)
  ).length;

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
          <Link href="/warga/dashboard" onClick={() => setSidebarOpen(false)}>
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
              <p className="text-xs font-semibold text-green-700">Warga Nasabah</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/warga/dashboard" && pathname === "/warga");
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

          <div ref={headerActionsRef} className="relative flex items-center gap-2">
            {/* Notification Bell Button & Popover */}
            <div className="relative">
              <button
                type="button"
                aria-label="Buka notifikasi"
                onClick={() =>
                  setHeaderPopover((cur) => (cur === "notifications" ? null : "notifications"))
                }
                className={`relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 cursor-pointer ${
                  headerPopover === "notifications" ? "bg-slate-100 text-green-700" : ""
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-extrabold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {headerPopover === "notifications" && (
                <div className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">Notifikasi</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                        {unreadCount} belum dibaca
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={unreadCount === 0}
                      onClick={() =>
                        setReadNotificationIds(notifications.map((n) => n.id))
                      }
                      className="text-[11px] font-extrabold text-green-700 transition hover:text-green-900 disabled:cursor-default disabled:text-slate-300 cursor-pointer"
                    >
                      Tandai semua dibaca
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map((item) => {
                        const unread = !readNotificationIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl transition ${
                              unread ? "bg-green-50/60" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-slate-900">{item.title}</p>
                              {unread && (
                                <span className="h-2 w-2 rounded-full bg-green-600 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                              {item.message}
                            </p>
                            <p className="mt-1.5 text-[10px] text-slate-400 font-medium">
                              {item.time}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="py-6 text-center text-xs text-slate-400">
                        Tidak ada notifikasi baru.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="ml-1 hidden h-8 w-px bg-slate-200 sm:block" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setHeaderPopover((cur) => (cur === "profile" ? null : "profile"))
                }
                className="hidden items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 cursor-pointer sm:flex"
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-green-700 text-xs font-extrabold text-white">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {citizenProfile.name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] text-slate-400">Warga</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {headerPopover === "profile" && (
                <div className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150 p-2">
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {citizenProfile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {citizenProfile.phone}
                    </p>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/warga/profil"
                      onClick={() => setHeaderPopover(null)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <UserRound size={15} className="text-slate-500" />
                      <span>Profil Saya</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderPopover(null);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
