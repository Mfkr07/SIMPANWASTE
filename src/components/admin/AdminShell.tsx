"use client";

import { useState, useRef, useEffect, ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings2,
  PackageCheck,
  HandCoins,
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
import { Logo } from "./AdminUI";
import { useAdmin } from "@/context/AdminContext";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Data Laporan Setoran", href: "/admin/laporan", icon: ClipboardList },
  { label: "Kelola Akun", href: "/admin/akun", icon: Users },
  { label: "Data Master", href: "/admin/master", icon: Settings2 },
  { label: "Distribusi ke Mitra", href: "/admin/distribusi", icon: PackageCheck },
  { label: "Permintaan Penarikan", href: "/admin/permintaan", icon: HandCoins },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerPopover, setHeaderPopover] = useState<"notifications" | "profile" | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const headerActionsRef = useRef<HTMLDivElement>(null);

  const { adminProfile, reports, withdrawalRequests, toast, handleLogout } = useAdmin();

  const currentNavItem =
    navItems.find((item) => pathname.startsWith(item.href)) ||
    (pathname === "/admin/profil"
      ? { label: "Profil Saya", href: "/admin/profil", icon: UserRound }
      : navItems[0]);

  const initials = adminProfile?.name
    ? adminProfile.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

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

  // System notifications
  const notifications = useMemo(() => {
    const pendingReports = reports.filter((r) => r.status === "Menunggu");
    const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === "Menunggu");

    const list = [];
    if (pendingWithdrawals.length > 0) {
      list.push({
        id: `admin-wd-${pendingWithdrawals.length}`,
        title: "Permintaan Penarikan Menunggu",
        message: `${pendingWithdrawals.length} permintaan penarikan saldo warga perlu diverifikasi.`,
        time: "Hari ini",
        type: "alert",
      });
    }
    if (pendingReports.length > 0) {
      list.push({
        id: `admin-rep-${pendingReports.length}`,
        title: "Laporan Setoran Baru",
        message: `${pendingReports.length} laporan setoran warga menunggu penjemputan/verifikasi.`,
        time: "Hari ini",
        type: "update",
      });
    }
    list.push({
      id: "admin-sys-1",
      title: "Sistem SIMPANWASTE Aktif",
      message: "Operasional bank sampah Kota Palembang berjalan normal.",
      time: "18 Mar 2025",
      type: "success",
    });

    return list;
  }, [reports, withdrawalRequests]);

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
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
              (item.href === "/admin/dashboard" && pathname === "/admin");
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
            href="/admin/profil"
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
                  {adminProfile.name || "Administrator"}
                </p>
                <p className="text-xs font-semibold text-green-700">Administrator</p>
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
      <div className="lg:pl-[280px]">
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
                Pusat Kendali Pengelolaan Sampah Kota Palembang
              </p>
              <p className="text-sm font-bold text-slate-800">
                {currentNavItem?.label || "Panel Administrator"}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div ref={headerActionsRef} className="relative flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setHeaderPopover((cur) =>
                    cur === "notifications" ? null : "notifications"
                  )
                }
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-[10px] font-extrabold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {headerPopover === "notifications" && (
                <div className="absolute right-0 top-full z-40 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-slate-900/5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <p className="text-sm font-bold text-slate-900">Notifikasi Sistem</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={() =>
                          setReadNotificationIds(notifications.map((n) => n.id))
                        }
                        className="text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                    {notifications.map((n) => {
                      const isUnread = !readNotificationIds.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          className={`rounded-xl p-3 border transition ${
                            isUnread
                              ? "bg-amber-50/50 border-amber-100"
                              : "bg-slate-50/50 border-slate-100"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setHeaderPopover((cur) => (cur === "profile" ? null : "profile"))
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 text-left transition hover:bg-slate-50 cursor-pointer"
              >
                <div
                  suppressHydrationWarning
                  className="grid h-8 w-8 place-items-center rounded-lg bg-green-700 text-xs font-extrabold text-white"
                >
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p suppressHydrationWarning className="text-xs font-bold text-slate-800 leading-tight">
                    {adminProfile.name || "Nadia Putri"}
                  </p>
                  <p className="text-[10px] text-slate-400">Admin</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {headerPopover === "profile" && (
                <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-900/5">
                  <div className="border-b border-slate-100 p-2">
                    <p className="text-xs font-bold text-slate-900">{adminProfile.name}</p>
                    <p className="text-[10px] text-slate-400">@{adminProfile.username}</p>
                  </div>
                  <Link
                    href="/admin/profil"
                    onClick={() => setHeaderPopover(null)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <UserRound size={14} /> Profil Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <LogOut size={14} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-7">{children}</main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={16} className="text-green-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
