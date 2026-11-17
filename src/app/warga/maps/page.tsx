"use client";

import { useState } from "react";
import {
  MapPin,
  Building2,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { PageTitle, Card } from "@/components/warga/WargaUI";
import { banks } from "@/data/wargaSeedData";

export default function WargaMapsPage() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Maps Bank Sampah"
        desc="Lokasi bank sampah aktif dan terverifikasi di area pilot Palembang."
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_.75fr]">
        {/* Interactive Map Visual */}
        <Card className="p-3">
          <div className="map-full relative">
            <div className="map-road a" />
            <div className="map-road b" />

            {banks.map((b, i) => (
              <button
                key={b.name}
                type="button"
                onClick={() => setSelected(i)}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className={`map-pin absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform ${
                  selected === i ? "scale-125 ring-4 ring-green-300" : "hover:scale-110"
                }`}
                title={b.name}
              >
                <MapPin size={20} />
              </button>
            ))}

            {/* Selected Location Bottom Quick Info */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto rounded-xl bg-white p-4 shadow-lg border border-slate-100 max-w-sm">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider">
                Lokasi dipilih
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">{banks[selected].name}</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{banks[selected].address}</p>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock3 size={13} />
                  {banks[selected].hours}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    banks[selected].name + " " + banks[selected].address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-green-700 hover:underline flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* List of Waste Banks */}
        <div className="space-y-3">
          {banks.map((b, i) => (
            <button
              key={b.name}
              type="button"
              onClick={() => setSelected(i)}
              className={`w-full rounded-2xl border bg-white p-5 text-left transition cursor-pointer ${
                selected === i
                  ? "border-green-600 ring-2 ring-green-100 shadow-sm"
                  : "border-slate-200 hover:border-green-200"
              }`}
            >
              <div className="flex gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                  <Building2 size={19} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{b.name}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{b.address}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                    <Clock3 size={14} />
                    {b.hours}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

