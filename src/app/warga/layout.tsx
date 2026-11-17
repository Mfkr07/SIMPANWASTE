import { ReactNode } from "react";
import { WargaProvider } from "@/context/WargaContext";
import WargaShell from "@/components/warga/WargaShell";

export const metadata = {
  title: "Area Warga - SIMPANWASTE Palembang",
  description: "Dashboard dan portal layanan pemilahan sampah anorganik warga Kota Palembang.",
};

export default function WargaLayout({ children }: { children: ReactNode }) {
  return (
    <WargaProvider>
      <WargaShell>{children}</WargaShell>
    </WargaProvider>
  );
}

