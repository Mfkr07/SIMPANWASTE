import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIMPANWASTE",
  description: "Sistem Informasi Pengelolaan Sampah Berbasis Pemilahan Kota Palembang",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
