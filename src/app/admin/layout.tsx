import { ReactNode } from "react";
import { AdminProvider } from "@/context/AdminContext";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Panel Administrator - SIMPANWASTE",
  description: "Pusat kendali master data, distribusi mitra, kelola akun, dan verifikasi penarikan saldo.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
