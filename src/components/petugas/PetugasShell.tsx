"use client";

import { useState, useRef, useEffect, ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Scale,
  UserRound,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Bell,
  Clock3,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Logo } from "./PetugasUI";
import { usePetugas } from "@/context/PetugasContext";

const navItems = [
  { label: "Dashboard", href: "/petugas/dashboard", icon: LayoutDashboard },
  { label: "Tugas Penjemputan", href: "/petugas/tugas", icon: Truck },
  { label: "Verifikasi & Penimbangan", href: "/petugas/verifikasi", icon: Scale },
  { label: "Profil Saya", href: "/petugas/profil", icon: UserRound },
];

export default function PetugasShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerPopover, setHeaderPopover] = useState<"notifications" | "profile" | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const headerActionsRef = useRef<HTMLDivElement>(null);

  const { officerProfile, reports, toast, handleLogout } = usePetugas();

  const currentNavItem =
    navItems.find((item) => pathname.startsWith(item.href)) || navItems[0];

  const initials = officerProfile?.name
    ? officerProfile.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "P";

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

  // Notifications calculation based on assigned reports
  const notifications = useMemo(() => {
    const myName = (officerProfile.name || "").toLowerCase().trim();
    const assignedReports = reports.filter((r) => {
      const assigned = (r.assigned || "").toLowerCase().trim();
      return Boolean(assigned && (assigned === myName || assigned.includes("rizky")));
    });

    return assignedReports.slice(0, 6).map((report) => {
      const isDone = report.status === "Selesai";
      const title = isDone
        ? "Laporan telah diselesaikan"
        : "Laporan menunggu tindakan";
      const message = `${report.id} · ${report.citizen} · ${report.estimate} kg`;
      return {
        id: `petugas-${report.id}-${report.status}-${report.trackerHistory?.length || 0}`,
        title,
        message,
        time: report.date,
        type: isDone ? "success" : "update",
      };
    });
  }, [officerProfile.name, reports]);

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
          <Link href="/petugas/dashboard" onClick={() => setSidebarOpen(false)}>
            <Logo />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 lg:hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/petugas/dashboard" && pathname === "/petugas");
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

        {/* Bottom Section: Profile Card & Logout */}
        <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
          {/* User Card */}
          <Link
            href="/petugas/profil"
            onClick={() => setSidebarOpen(false)}
            className="group block rounded-xl border border-green-100 bg-green-50/80 p-3 transition hover:bg-green-100/60"
          >
            <div className="flex items-center gap-3">
              <div
                suppressHydrationWarning
                className="grid h-9 w-9 place-items-center rounded-full bg-green-700 text-sm font-extrabold text-white shrink-0 group-hover:bg-green-800 transition"
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p suppressHydrationWarning className="truncate text-sm font-bold text-slate-900">
                  {officerProfile.name || "Petugas"}
                </p>
                <p className="text-xs font-semibold text-green-700">Petugas Lapangan</p>
              </div>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700 cursor-pointer transition"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
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
                {currentNavItem?.label || "Area Petugas"}
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
                      <p className="text-sm font-extrabold text-slate-900">Notifikasi Petugas</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                        {unreadCount} tugas belum ditinjau
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
                              <p className="text-xs font-bold text-slate-800">
                                {item.title}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {item.time}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                              {item.message}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Belum ada notifikasi tugas baru
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 p-2 text-center bg-slate-50">
                    <Link
                      href="/petugas/tugas"
                      onClick={() => setHeaderPopover(null)}
                      className="text-xs font-bold text-green-700 hover:text-green-800 transition"
                    >
                      Buka Semua Tugas Penjemputan &rarr;
                    </Link>
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
                <div
                  suppressHydrationWarning
                  className="grid h-9 w-9 place-items-center rounded-full bg-green-700 text-xs font-extrabold text-white"
                >
                  {initials}
                </div>
                <div className="text-left">
                  <p suppressHydrationWarning className="text-xs font-bold text-slate-800 leading-tight">
                    {officerProfile.name ? officerProfile.name.split(" ")[0] : "Petugas"}
                  </p>
                  <p className="text-[10px] text-slate-400">Petugas</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {headerPopover === "profile" && (
                <div className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150 p-2">
                  <div className="p-2 border-b border-slate-100">
                    <p suppressHydrationWarning className="text-xs font-bold text-slate-900 truncate">
                      {officerProfile.name || "Petugas"}
                    </p>
                    <p suppressHydrationWarning className="text-[11px] text-slate-500 truncate mt-0.5">
                      {officerProfile.phone || "-"}
                    </p>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/petugas/profil"
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

        {/* Page Inner Container */}
        <main className="p-4 sm:p-7 max-w-7xl mx-auto">{children}</main>
      </div>

      {/* Floating Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-5 py-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-green-50 text-green-700 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <span className="text-sm font-bold text-slate-900">{toast}</span>
        </div>
      )}
    </div>
  );
}
