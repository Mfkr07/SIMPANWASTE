import { ReactNode } from "react";
import { PetugasProvider } from "@/context/PetugasContext";
import PetugasShell from "@/components/petugas/PetugasShell";

export const metadata = {
  title: "Area Petugas - SIMPANWASTE Palembang",
  description:
    "Portal operasional penjemputan dan verifikasi penimbangan sampah anorganik.",
};

export default function PetugasLayout({ children }: { children: ReactNode }) {
  return (
    <PetugasProvider>
      <PetugasShell>{children}</PetugasShell>
    </PetugasProvider>
  );
}
