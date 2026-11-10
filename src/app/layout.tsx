import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIMPANWASTE — Sistem Pengelolaan Sampah Berbasis Pemilahan (Kota Palembang)",
  description:
    "Mulai kebiasaan memilah sampah dari rumah. Setorkan sampah anorganik bernilai ekonomis dan pantau hasilnya melalui SIMPANWASTE Kota Palembang.",
  keywords: [
    "SIMPANWASTE",
    "Bank Sampah",
    "Palembang",
    "Pengelolaan Sampah",
    "Sampah Anorganik",
    "Daur Ulang",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`scroll-smooth ${inter.variable}`}>
      <body className={`${inter.className} min-h-screen bg-[#F8FAF9] text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
