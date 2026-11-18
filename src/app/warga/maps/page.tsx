"use client";

import Link from "next/link";
import {
  MapPin,
  Clock3,
  CalendarDays,
  ExternalLink,
  Recycle,
  Leaf,
  Navigation,
} from "lucide-react";
import { PageTitle, Card, Badge, Button } from "@/components/warga/WargaUI";
import { grahaPenaLocation } from "@/components/landing/MapsPreviewSection";

export default function WargaMapsPage() {
  const encodedGrahaAddress = encodeURIComponent(grahaPenaLocation.address);
  const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedGrahaAddress}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedGrahaAddress}`;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Maps Bank Sampah"
        desc="Lokasi bank sampah aktif dan terverifikasi di area pilot Palembang."
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_.75fr] items-start">
        {/* Kolom Kiri: Peta Google Maps Embed */}
        <Card className="p-3 overflow-hidden">
          <div className="relative overflow-hidden rounded-2xl bg-slate-100">
            <iframe
              title={`Peta ${grahaPenaLocation.name}`}
              src={`https://www.google.com/maps?q=${encodedGrahaAddress}&z=16&output=embed`}
              className="h-full min-h-[580px] w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {/* Floating Info Tag di Bawah Peta */}
            <div className="absolute bottom-4 left-4 right-4 max-w-sm rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur border border-slate-100">
              <p className="text-xs font-bold text-green-700">Mitra Utama SIMPANWASTE</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {grahaPenaLocation.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {grahaPenaLocation.address}
              </p>
            </div>
          </div>
        </Card>

        {/* Kolom Kanan: Detail Bank Sampah Graha Pena */}
        <div className="space-y-4">
          <article className="rounded-2xl border-2 border-green-600 bg-green-50/70 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-800 text-white">
                <MapPin size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {grahaPenaLocation.name}
                  </h3>
                  <Badge tone="green">Mitra Utama SIMPANWASTE</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {grahaPenaLocation.address}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-700 flex items-start gap-1.5">
                  <Leaf size={14} className="mt-0.5 text-green-700 shrink-0" />
                  <span>{grahaPenaLocation.landmark}</span>
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-green-200/60 pt-3">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <Clock3 size={14} className="text-green-700 shrink-0" />
                    <span>Senin–Jumat: {grahaPenaLocation.weekdaySchedule}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-semibold">
                    <CalendarDays size={14} className="text-green-700 shrink-0" />
                    <span>Sabtu: {grahaPenaLocation.saturdaySchedule}</span>
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                  <Link href="/warga/buat-laporan" className="flex-1">
                    <Button className="w-full flex items-center justify-center gap-2">
                      <Recycle size={16} />
                      <span>Setor Sekarang</span>
                    </Button>
                  </Link>
                  <a
                    href={googleMapsDirUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Navigation size={14} />
                    <span>Petunjuk Arah</span>
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Panduan & Info Operasional */}
          <Card className="p-5">
            <h4 className="text-sm font-extrabold text-slate-900">Ketentuan Drop-off di Lokasi</h4>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 mt-2 shrink-0" />
                <span>Bawa sampah anorganik yang sudah dipilah dan dalam keadaan bersih/kering.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 mt-2 shrink-0" />
                <span>Tidak ada minimum berat untuk penyetoran langsung (Drop-off) ke Graha Pena.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 mt-2 shrink-0" />
                <span>Petugas akan melakukan penimbangan manual dan saldo langsung tercatat ke akun Anda.</span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800"
              >
                <span>Buka di Google Maps Penuh</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
