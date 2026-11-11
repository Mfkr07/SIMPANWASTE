"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { BankSampahItem } from "@/data/bankSampahData";

interface BankSampahMapProps {
  items: BankSampahItem[];
  selectedItem: BankSampahItem | null;
  onSelectItem: (item: BankSampahItem) => void;
  onOpenDetailModal: (item: BankSampahItem) => void;
}

export default function BankSampahMap({
  items,
  selectedItem,
  onSelectItem,
  onOpenDetailModal,
}: BankSampahMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bank Sampah Graha Pena Palembang [-2.9463, 104.7391]
    const grahaPena = items.find((i) => i.is_utama) || items[0];
    const initialCenter: [number, number] = [grahaPena.latitude, grahaPena.longitude];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    // Add modern, high-contrast Voyager tile layer from CartoDB
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Zoom control at top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    // Create custom markers
    items.forEach((item) => {
      let icon: L.DivIcon;

      if (item.is_utama) {
        // Graha Pena: Clean, institutional, distinct pin marker
        icon = L.divIcon({
          className: "custom-graha-pena-marker",
          html: `
            <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
              <!-- Label Tag -->
              <div class="whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#153626] text-white border border-emerald-500/40 shadow-md flex items-center gap-1.5 mb-1.5 transition-transform group-hover:scale-105">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Graha Pena &bull; Sentra Utama</span>
              </div>
              
              <!-- Clean Pin Body -->
              <div class="w-10 h-10 rounded-2xl bg-[#153626] text-white flex items-center justify-center shadow-lg border-2 border-emerald-500 transform group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-300">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                  <path d="M10 6h4"/>
                  <path d="M10 10h4"/>
                  <path d="M10 14h4"/>
                  <path d="M10 18h4"/>
                </svg>
              </div>
              
              <!-- Pin Pointer Triangle -->
              <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#153626] -mt-0.5"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
      } else {
        // Standard active Bank Sampah marker: Clean minimalist pin
        icon = L.divIcon({
          className: "custom-bank-sampah-marker",
          html: `
            <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
              <div class="w-8 h-8 rounded-full bg-white text-[#1E7E48] flex items-center justify-center shadow-md border-2 border-[#1E7E48] group-hover:scale-110 transition-transform">
                <div class="w-2.5 h-2.5 rounded-full bg-[#1E7E48]"></div>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1E7E48]"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
      }

      const marker = L.marker([item.latitude, item.longitude], {
        icon,
        zIndexOffset: item.is_utama ? 1000 : 100,
      }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div class="p-4 max-w-[280px]">
          ${
            item.is_utama
              ? `
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#153626] border border-emerald-200 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-[#1E7E48]"></span>
              <span>Sentra Utama</span>
            </div>
            `
              : `
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-[#1E7E48]"></span>
              <span>Aktif Beroperasi</span>
            </div>
            `
          }
          <h4 class="font-bold text-gray-900 text-sm leading-snug">${item.nama}</h4>
          <p class="text-xs text-gray-600 mt-1 leading-relaxed">${item.alamat}</p>
          <div class="mt-2 text-[11px] text-gray-500 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>${item.jam_operasional}</span>
          </div>
          ${
            item.is_utama
              ? `
            <div class="mt-2.5 p-2 bg-[#F8FAF9] rounded-lg border border-gray-200/90 text-[11px] text-gray-700">
              <span class="font-semibold text-gray-900">Didukung DLHK Kota Palembang:</span> Sentra studi integrasi timbangan digital.
            </div>
            `
              : ""
          }
          <button
            id="popup-btn-${item.id}"
            class="mt-3 w-full py-2 px-3 rounded-xl text-xs font-medium text-white bg-[#1E7E48] hover:bg-[#18663A] transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Lihat Detail Operasional</span>
            <span>&rarr;</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -36],
      });

      marker.on("click", () => {
        onSelectItem(item);
      });

      marker.on("popupopen", () => {
        const btn = document.getElementById(`popup-btn-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            onOpenDetailModal(item);
          };
        }
      });

      markersRef.current[item.id] = marker;
    });

    // Invalidate map size after animation
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [items]);

  // Handle selected item change: panTo and openPopup
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedItem) return;

    const marker = markersRef.current[selectedItem.id];
    if (marker) {
      mapInstanceRef.current.flyTo(
        [selectedItem.latitude, selectedItem.longitude],
        selectedItem.is_utama ? 15 : 14,
        { duration: 1.2 }
      );
      marker.openPopup();
    }
  }, [selectedItem]);

  const handleFocusGrahaPena = () => {
    const grahaPena = items.find((i) => i.is_utama);
    if (grahaPena) {
      onSelectItem(grahaPena);
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const group = L.featureGroup(Object.values(markersRef.current));
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15));
  };

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-gray-200/90 shadow-xl bg-gray-100">
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Action Floating Controls (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleFocusGrahaPena}
          className="bg-white/95 hover:bg-white text-gray-800 border border-gray-200/90 shadow-sm px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#1E7E48]"></span>
          <span>Fokus ke Graha Pena</span>
        </button>

        <button
          type="button"
          onClick={handleFitAll}
          className="bg-white/95 hover:bg-white text-gray-700 border border-gray-200/90 shadow-sm px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
        >
          <span>Tampilkan Semua Lokasi</span>
        </button>
      </div>

      {/* Bottom Floating Legend / Indicator */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-700 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-[#153626] border border-emerald-500 inline-block"></span>
              <span className="font-semibold text-gray-900">Graha Pena (Sentra Utama)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white border-2 border-[#1E7E48] inline-block"></span>
              <span className="text-gray-600">Bank Sampah Wilayah</span>
            </div>
          </div>

          <div className="text-[11px] text-gray-500">
            Klik penanda pada peta untuk detail operasional
          </div>
        </div>
      </div>
    </div>
  );
}

