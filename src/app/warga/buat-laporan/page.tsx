"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Recycle,
  Truck,
  MapPin,
  ClipboardCheck,
  Check,
  Scale,
  Building2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Search,
  ChevronDown,
  Plus,
  Clock3,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { PageTitle, Button } from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import {
  Report,
  WasteCondition,
  wasteConditions,
  trackerTimestamp,
} from "@/data/wargaSeedData";
import { grahaPenaLocation } from "@/components/landing/MapsPreviewSection";
import { getCategoryUuid, GRAHA_PENA_UUID } from "@/lib/utils/categoryMapping";

function WasteCategoryCombobox({
  categories,
  onSelect,
}: {
  categories: Array<{ name: string; desc: string }>;
  onSelect: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    if (!normalizedQuery) return categories;
    return categories.filter((item) =>
      item.name.toLocaleLowerCase("id-ID").includes(normalizedQuery),
    );
  }, [categories, query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    setHighlightedIndex((current) =>
      Math.min(current, Math.max(filteredCategories.length - 1, 0)),
    );
  }, [filteredCategories.length]);

  const selectCategory = (name: string) => {
    onSelect(name);
    setQuery("");
    setOpen(false);
    setHighlightedIndex(0);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Cari dan pilih kategori sampah"
          aria-autocomplete="list"
          aria-controls="waste-category-options"
          aria-expanded={open}
          className="input bg-[#f8faf8] py-3 pl-11 pr-20"
          placeholder="Cari jenis sampah..."
          value={query}
          onClick={() => setOpen(true)}
          onFocus={() => {
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              if (filteredCategories.length) {
                setHighlightedIndex((current) =>
                  Math.min(current + 1, filteredCategories.length - 1),
                );
              }
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              if (filteredCategories.length) {
                setHighlightedIndex((current) => Math.max(current - 1, 0));
              }
            } else if (event.key === "Enter") {
              event.preventDefault();
              const highlighted = filteredCategories[highlightedIndex];
              if (open && highlighted) selectCategory(highlighted.name);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setQuery("");
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              setOpen(true);
              window.requestAnimationFrame(() => inputRef.current?.focus());
            }
          }}
          aria-label={open ? "Tutup daftar kategori" : "Buka daftar kategori"}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-green-700"
        >
          <ChevronDown
            size={17}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div
          id="waste-category-options"
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,.16)]"
        >
          {filteredCategories.length ? (
            filteredCategories.map((item, index) => {
              const highlighted = index === highlightedIndex;
              return (
                <button
                  key={item.name}
                  type="button"
                  role="option"
                  aria-selected="false"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCategory(item.name)}
                  className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${highlighted ? "bg-green-50" : "hover:bg-slate-50"
                    }`}
                >
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-green-50 text-green-700">
                      <Plus size={12} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        {item.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                        {item.desc}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-5 text-center text-sm font-semibold text-slate-500">
              Jenis sampah tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CreateReportPage() {
  const router = useRouter();
  const { citizenProfile, categories, minPickup, reports, setReports, notify, refreshData } =
    useWarga();

  const [step, setStep] = useState(1);
  const [wasteItems, setWasteItems] = useState<
    Array<{
      id: string;
      category: string;
      estimate: number;
      condition?: WasteCondition;
      conditions?: WasteCondition[];
    }>
  >([]);
  const wasteItemSequence = useRef(0);
  const [showStepOneErrors, setShowStepOneErrors] = useState(false);
  const [method, setMethod] = useState<"Pickup" | "Drop-off">("Drop-off");
  const [pickupLocation, setPickupLocation] = useState(
    citizenProfile.address || "Jl. Ki Merogan, Kertapati, Palembang",
  );
  const [pickupDetails, setPickupDetails] = useState("");
  const dropOffDestination = grahaPenaLocation.name;

  useEffect(() => {
    if (citizenProfile.address) {
      setPickupLocation(citizenProfile.address);
    }
  }, [citizenProfile.address]);

  const totalWeight = wasteItems.reduce(
    (total, item) => total + (item.estimate || 0),
    0,
  );
  const pickupOk = totalWeight >= minPickup;

  const hasValidCategories =
    wasteItems.length > 0 &&
    wasteItems.every((item) =>
      categories.some((category) => category.name === item.category),
    );
  const hasValidWeights = wasteItems.every((item) => item.estimate > 0);
  const hasValidConditions = wasteItems.every(
    (item) => (item.conditions && item.conditions.length > 0) || item.condition,
  );
  const combinationKeys = wasteItems
    .filter((item) => (item.conditions && item.conditions.length > 0) || item.condition)
    .map((item) => {
      const condList =
        item.conditions && item.conditions.length > 0
          ? item.conditions
          : item.condition
            ? [item.condition]
            : [];
      return `${item.category}::${condList.slice().sort().join("+")}`;
    });
  const hasUniqueCombinations =
    new Set(combinationKeys).size === combinationKeys.length;

  useEffect(() => {
    if (!pickupOk && method === "Pickup") setMethod("Drop-off");
  }, [method, pickupOk]);

  const addWasteItem = (name: string) => {
    if (!categories.some((item) => item.name === name)) return;
    wasteItemSequence.current += 1;
    setWasteItems((current) => [
      ...current,
      {
        id: `waste-item-${Date.now()}-${wasteItemSequence.current}`,
        category: name,
        estimate: 0,
        conditions: ["Sudah dipilah"],
        condition: "Sudah dipilah",
      },
    ]);
  };

  const toggleItemCondition = (itemId: string, condition: WasteCondition) => {
    setWasteItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;
        const currentList: WasteCondition[] =
          item.conditions && item.conditions.length > 0
            ? item.conditions
            : item.condition
              ? [item.condition]
              : [];
        const isSelected = currentList.includes(condition);

        let nextList: WasteCondition[];
        if (condition === "Belum dipilah dan dibersihkan") {
          if (isSelected) {
            nextList = currentList.filter((c) => c !== condition);
          } else {
            nextList = currentList.filter(
              (c) => c !== "Sudah dipilah" && c !== "Sudah dibersihkan"
            );
            nextList.push("Belum dipilah dan dibersihkan");
          }
        } else if (condition === "Sudah dipilah" || condition === "Sudah dibersihkan") {
          if (isSelected) {
            nextList = currentList.filter((c) => c !== condition);
          } else {
            nextList = currentList.filter((c) => c !== "Belum dipilah dan dibersihkan");
            nextList.push(condition);
          }
        } else if (condition === "Tidak mudah didaur ulang") {
          if (isSelected) {
            nextList = currentList.filter((c) => c !== condition);
          } else {
            nextList = [...currentList, condition];
          }
        } else {
          if (isSelected) {
            nextList = currentList.filter((c) => c !== condition);
          } else {
            nextList = [...currentList, condition];
          }
        }

        return {
          ...item,
          conditions: nextList,
          condition: nextList[0],
        };
      })
    );
  };

  const next = () => {
    if (step === 1) {
      setShowStepOneErrors(true);
      if (!hasValidCategories)
        return notify("Pilih minimal satu jenis sampah dari data master.");
      if (!hasValidWeights)
        return notify("Masukkan estimasi berat yang valid untuk setiap kategori.");
      if (!hasValidConditions)
        return notify("Pilih kondisi sampah untuk setiap kategori.");
      if (!hasUniqueCombinations)
        return notify("Kombinasi kategori dan kondisi yang sama tidak boleh diduplikasi.");
    }
    if (step === 2 && method === "Pickup" && !pickupOk) return;
    setStep(Math.min(4, step + 1));
  };

  const submit = () => {
    if (
      !hasValidCategories ||
      !hasValidWeights ||
      !hasValidConditions ||
      !hasUniqueCombinations
    ) {
      return notify(
        "Lengkapi kategori, estimasi berat, dan kondisi sebelum mengirim laporan.",
      );
    }

    const todayFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const newReport: Report = {
      id: `SW-261118-${String(reports.length + 35).padStart(3, "0")}`,
      citizen: citizenProfile.name,
      phone: citizenProfile.phone,
      category: wasteItems.map((item) => item.category).join(", "),
      estimate: totalWeight,
      method,
      status: "Menunggu",
      date: todayFormatted,
      location:
        method === "Pickup"
          ? pickupDetails.trim()
            ? `${pickupLocation.trim()} (Patokan: ${pickupDetails.trim()})`
            : pickupLocation.trim()
          : dropOffDestination,
      assigned: "Rizky Pratama",
      trackerHistory: [
        { stage: "Request Terkirim", timestamp: trackerTimestamp() },
      ],
      categoryWeights: wasteItems.map((item) => ({
        category: item.category,
        estimate: item.estimate,
        conditions:
          item.conditions && item.conditions.length > 0
            ? item.conditions
            : item.condition
              ? [item.condition]
              : [],
      })),
    };

    const kategoriUuids = Array.from(
      new Set(wasteItems.map((item) => getCategoryUuid(item.category)))
    );

    const kategoriItems = wasteItems.map((item) => {
      const condList =
        item.conditions && item.conditions.length > 0
          ? item.conditions
          : item.condition
            ? [item.condition]
            : ["Sudah dipilah"];

      let dbKondisi: "bersih" | "kotor" | "tercampur_air" = "bersih";
      if (condList.includes("Tidak mudah didaur ulang")) {
        dbKondisi = "tercampur_air";
      } else if (condList.includes("Belum dipilah dan dibersihkan")) {
        dbKondisi = "kotor";
      } else {
        dbKondisi = "bersih";
      }

      return {
        id_kategori: getCategoryUuid(item.category),
        kondisi: dbKondisi,
        conditions: condList,
      };
    });

    // Kirim laporan ke database Supabase secara real-time
    fetch("/api/laporan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metode: method === "Pickup" ? "pickup" : "drop_off",
        id_bank_sampah: method === "Drop-off" ? GRAHA_PENA_UUID : null,
        latitude: method === "Pickup" ? -2.9463 : null,
        longitude: method === "Pickup" ? 104.7391 : null,
        catatan_lokasi:
          method === "Pickup"
            ? pickupDetails.trim()
              ? `${pickupLocation.trim()} (Patokan: ${pickupDetails.trim()})`
              : pickupLocation.trim()
            : null,
        estimasi_berat: totalWeight,
        kategori_ids: kategoriUuids,
        kategori_items: kategoriItems,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.laporan) {
          refreshData();
        }
      })
      .catch((err) => {
        console.warn("Laporan disimpan ke cache lokal:", err);
      });

    setReports((r) => [newReport, ...r]);
    notify("Laporan berhasil dibuat dan diteruskan ke database Bank Sampah.");
    router.push("/warga/riwayat");
  };

  const steps = [
    { label: "Informasi", icon: Recycle },
    { label: "Metode", icon: Truck },
    { label: "Lokasi", icon: MapPin },
    { label: "Konfirmasi", icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Buat Laporan Setoran"
        desc="Lengkapi informasi sampah untuk membuat laporan baru."
      />

      {/* Stepper Header */}
      <div className="relative mb-7 rounded-2xl border border-slate-200 bg-white px-3 py-5 shadow-sm sm:px-7">
        <div className="absolute left-[12.5%] right-[12.5%] top-[38px] h-0.5 bg-slate-200" />
        <div
          className="absolute left-[12.5%] top-[38px] h-0.5 bg-green-500 transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 75}%` }}
        />
        <div className="relative grid grid-cols-4">
          {steps.map((item, index) => {
            const number = index + 1;
            const active = step === number;
            const complete = step > number;
            const StepIcon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full border-4 border-white shadow-sm transition-all duration-300 sm:h-11 sm:w-11 ${active
                    ? "bg-green-700 text-white ring-4 ring-green-100"
                    : complete
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-400"
                    }`}
                >
                  {complete ? (
                    <Check size={17} strokeWidth={3} />
                  ) : (
                    <StepIcon size={17} />
                  )}
                </div>
                <p
                  className={`mt-2 text-[10px] font-extrabold sm:text-xs ${active
                    ? "text-green-800"
                    : complete
                      ? "text-green-600"
                      : "text-slate-400"
                    }`}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,.06)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-green-600" />
          <div className="p-6 sm:p-8">
            {/* Step 1: Info Sampah */}
            {step === 1 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Recycle size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 01
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                      Informasi sampah
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Pilih kategori sampah dan masukkan estimasi berat untuk masing-masing.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <span
                      id="waste-category-label"
                      className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"
                    >
                      <Recycle size={16} className="text-green-700" /> Kategori sampah
                    </span>
                    <WasteCategoryCombobox
                      categories={categories}
                      onSelect={addWasteItem}
                    />
                    <span className="mt-2 block text-xs leading-5 text-slate-400">
                      Kategori yang sama dapat ditambahkan lagi dengan kondisi yang berbeda.
                    </span>
                    {showStepOneErrors && !hasValidCategories && (
                      <p className="mt-2 text-xs font-semibold text-red-600">
                        Pilih minimal satu jenis sampah.
                      </p>
                    )}
                  </div>

                  {wasteItems.length > 0 && (
                    <div>
                      <span className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Scale size={16} className="text-green-700" /> Daftar item sampah
                      </span>
                      <div className="space-y-3">
                        {wasteItems.map((item, itemIndex) => {
                          const invalid =
                            showStepOneErrors && !(item.estimate > 0);
                          const invalidCondition =
                            showStepOneErrors &&
                            !((item.conditions && item.conditions.length > 0) || item.condition);
                          const currentConditions =
                            item.conditions && item.conditions.length > 0
                              ? item.conditions
                              : item.condition
                                ? [item.condition]
                                : [];
                          return (
                            <div
                              key={item.id}
                              className="block rounded-xl border border-slate-200 bg-[#f8faf8] p-4"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-green-700">
                                    Item {itemIndex + 1}
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {item.category}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setWasteItems((current) =>
                                      current.filter(
                                        (candidate) => candidate.id !== item.id,
                                      ),
                                    )
                                  }
                                  className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-[.97] cursor-pointer"
                                >
                                  <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                              <label className="block">
                                <span className="mb-2 block text-xs font-semibold text-slate-600">
                                  Estimasi berat (kg)
                                </span>
                                <span className="relative block">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step=".1"
                                    inputMode="decimal"
                                    className={`input bg-white py-3 pr-14 ${invalid
                                      ? "border-red-400 ring-2 ring-red-100 focus:border-red-400"
                                      : ""
                                      }`}
                                    placeholder="Estimasi berat (kg)"
                                    value={item.estimate || ""}
                                    aria-invalid={invalid}
                                    onChange={(event) =>
                                      setWasteItems((current) =>
                                        current.map((candidate) =>
                                          candidate.id === item.id
                                            ? {
                                              ...candidate,
                                              estimate: Number(
                                                event.target.value,
                                              ),
                                            }
                                            : candidate,
                                        ),
                                      )
                                    }
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                    kg
                                  </span>
                                </span>
                              </label>
                              {invalid && (
                                <span className="mt-2 block text-xs font-semibold text-red-600">
                                  Estimasi berat harus lebih dari 0 kg.
                                </span>
                              )}
                              <fieldset className="mt-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <legend className="text-xs font-semibold text-slate-700">
                                    Estimasi kondisi sampah
                                  </legend>
                                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    (Dapat memilih lebih dari 1 kondisi)
                                  </span>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {wasteConditions.map((condition) => {
                                    const selected = currentConditions.includes(condition);
                                    return (
                                      <label
                                        key={condition}
                                        className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-semibold leading-5 transition ${selected
                                          ? "border-green-600 bg-green-50 text-green-900 ring-1 ring-green-600"
                                          : "border-slate-200 bg-white text-slate-600 hover:border-green-200 hover:bg-green-50/30"
                                          }`}
                                      >
                                        <input
                                          type="checkbox"
                                          name={`waste-condition-${item.id}-${condition}`}
                                          value={condition}
                                          checked={selected}
                                          onChange={() =>
                                            toggleItemCondition(item.id, condition)
                                          }
                                          className="mt-0.5 accent-green-700 cursor-pointer rounded"
                                        />
                                        <span>{condition}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                                {invalidCondition && (
                                  <span className="mt-2 block text-xs font-semibold text-red-600">
                                    Pilih minimal satu kondisi sampah.
                                  </span>
                                )}
                              </fieldset>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                        <span className="text-sm font-bold text-green-900">
                          Total estimasi berat
                        </span>
                        <span className="text-lg font-extrabold text-green-800">
                          {totalWeight.toLocaleString("id-ID", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          kg
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Kondisi yang dipilih merupakan informasi awal dari Warga. Petugas tetap
                        memverifikasi kondisi aktual saat penimbangan manual.
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                    <Scale size={17} className="mt-0.5 shrink-0" />
                    <p>
                      Minimum pickup yang berlaku adalah <strong>{minPickup} kg</strong>. Total seluruh kategori digunakan untuk menentukan ketersediaan layanan Pickup.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Metode Penyetoran */}
            {step === 2 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <Truck size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 02
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                      Metode penyetoran
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pilih cara penyerahan sampah yang sesuai kebutuhan Anda.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <button
                    disabled={!pickupOk}
                    onClick={() => setMethod("Pickup")}
                    className={`group rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer ${method === "Pickup" && pickupOk
                      ? "border-green-600 bg-green-50 shadow-sm"
                      : "border-slate-200 bg-slate-50/60 hover:border-green-200"
                      }`}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-green-700 shadow-sm">
                      <Truck size={21} />
                    </div>
                    <h3 className="mt-5 font-extrabold text-slate-900">Pickup</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Petugas menjemput sampah langsung ke titik lokasi Anda.
                    </p>
                  </button>

                  <button
                    onClick={() => setMethod("Drop-off")}
                    className={`group rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 cursor-pointer ${method === "Drop-off"
                      ? "border-green-600 bg-green-50 shadow-sm"
                      : "border-slate-200 bg-slate-50/60 hover:border-green-200"
                      }`}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-green-700 shadow-sm">
                      <Building2 size={21} />
                    </div>
                    <h3 className="mt-5 font-extrabold text-slate-900">Drop-off</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Antar langsung ke Bank Sampah Graha Pena Palembang.
                    </p>
                  </button>
                </div>

                {!pickupOk && (
                  <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <XCircle className="shrink-0 text-amber-700" size={20} />
                    <p>
                      Pickup belum tersedia karena total estimasi{" "}
                      <strong>{totalWeight} kg</strong> di bawah batas minimum {minPickup} kg. Disarankan memilih Drop-off.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Lokasi */}
            {step === 3 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <MapPin size={21} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 03
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                      {method === "Pickup"
                        ? "Tentukan Lokasi Penjemputan"
                        : "Tujuan Penyetoran"}
                    </h2>
                    {method === "Pickup" && (
                      <p className="mt-1 text-sm text-slate-500">
                        Tentukan titik penjemputan yang mudah diakses oleh armada petugas.
                      </p>
                    )}
                  </div>
                </div>

                {method === "Pickup" ? (
                  <div className="mt-6 space-y-5">
                    {/* Alamat Lengkap Penjemputan */}
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <MapPin size={16} className="text-green-700" />
                        Alamat lengkap penjemputan
                      </span>
                      <input
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="input bg-[#f8faf8] py-3 text-sm"
                        placeholder="Contoh: Jl. Ki Merogan No. 45, Kertapati, Palembang"
                      />
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Masukkan nama jalan, nomor bangunan, RT/RW, dan kelurahan/kecamatan.
                      </p>
                    </label>

                    {/* Detail Alamat / Patokan Tempat */}
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">
                        Detail alamat / patokan (opsional)
                      </span>
                      <textarea
                        value={pickupDetails}
                        onChange={(e) => setPickupDetails(e.target.value)}
                        rows={3}
                        className="input bg-[#f8faf8] py-2.5 text-sm resize-none"
                        placeholder="Contoh: Rumah pagar hitam samping warung Bu Siti, Blok B2 No. 14, masuk gang mawar"
                      />
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Tambahkan patokan khusus seperti warna pagar, toko/warung terdekat, atau nomor rumah untuk memudahkan petugas saat menjemput.
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="relative overflow-hidden rounded-2xl border border-green-200 bg-[#eef8f1] p-5 sm:p-6">
                      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[25px] border-green-600/[.055]" />
                      <div className="relative flex items-start gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
                          <Recycle size={23} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-extrabold tracking-tight text-slate-900">
                              {grahaPenaLocation.shortName}
                            </p>
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.1em] text-green-800">
                              Mitra SIMPANWASTE
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            Lokasi ini merupakan tujuan penyetoran resmi untuk metode Drop-off.
                          </p>
                        </div>
                      </div>
                      <div className="relative mt-5 space-y-3 border-t border-green-200 pt-4 text-xs leading-5 text-slate-600">
                        <p className="flex items-start gap-3">
                          <MapPin className="mt-0.5 shrink-0 text-green-700" size={17} />
                          <span>
                            {grahaPenaLocation.address}. {grahaPenaLocation.landmark}
                          </span>
                        </p>
                        <p className="flex items-start gap-3">
                          <Clock3 className="mt-0.5 shrink-0 text-green-700" size={17} />
                          <span>
                            <strong>Senin–Jumat:</strong> {grahaPenaLocation.weekdaySchedule}
                          </span>
                        </p>
                        <p className="flex items-start gap-3">
                          <CalendarDays className="mt-0.5 shrink-0 text-green-700" size={17} />
                          <span>
                            <strong>Sabtu:</strong> {grahaPenaLocation.saturdaySchedule}
                          </span>
                        </p>
                        <p className="flex items-start gap-3 pt-1">
                          <Recycle className="mt-0.5 shrink-0 text-green-700" size={17} />
                          <span className="font-semibold text-green-900">
                            Untuk metode Drop-off, sampah diantarkan secara langsung oleh warga ke Bank Sampah Graha Pena.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Konfirmasi */}
            {step === 4 && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                    <ClipboardCheck size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.13em] text-green-700">
                      Langkah 04
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Konfirmasi laporan</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pastikan rincian laporan setoran berikut sudah sesuai.
                    </p>
                  </div>
                </div>

                <dl className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-[#f8faf8] px-5">
                  {wasteItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 py-4 text-sm sm:flex-row sm:justify-between"
                    >
                      <dt>
                        <p className="font-bold text-slate-800">{item.category}</p>
                        <p className="mt-1 text-xs text-slate-500">Kondisi sampah</p>
                      </dt>
                      <dd className="sm:max-w-[65%] sm:text-right">
                        <p className="font-extrabold text-slate-800">{item.estimate} kg</p>
                        <div className="mt-2 flex flex-wrap gap-1.5 sm:justify-end">
                          {(
                            item.conditions && item.conditions.length > 0
                              ? item.conditions
                              : item.condition
                                ? [item.condition]
                                : []
                          ).map((c) => (
                            <span
                              key={c}
                              className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-800"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  ))}
                  {[
                    { label: "Total estimasi berat", value: `${totalWeight} kg` },
                    { label: "Metode", value: method },
                    {
                      label: method === "Pickup" ? "Titik penjemputan" : "Tujuan Drop-off",
                      value: method === "Pickup" ? pickupLocation : dropOffDestination,
                      isAddress: true,
                    },
                    ...(method === "Pickup" && pickupDetails.trim()
                      ? [{ label: "Detail / Patokan tempat", value: pickupDetails.trim(), isDetail: true }]
                      : []),
                    { label: "Status awal", value: "Menunggu", isStatus: true },
                  ].map((row) => {
                    if (row.isAddress || row.isDetail) {
                      return (
                        <div
                          key={row.label}
                          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6 py-4 text-sm"
                        >
                          <dt className="text-slate-500 font-medium shrink-0 sm:w-44 pt-1">
                            {row.label}
                          </dt>
                          <dd className="w-full sm:max-w-[65%] rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                            <div className="flex items-start gap-2.5">
                              {row.isAddress ? (
                                <MapPin size={15} className="text-green-700 shrink-0 mt-0.5" />
                              ) : (
                                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5 ring-2 ring-amber-100" />
                              )}
                              <span className="text-xs leading-relaxed font-semibold text-slate-800 break-words text-left">
                                {row.value}
                              </span>
                            </div>
                          </dd>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-4 py-3.5 text-sm"
                      >
                        <dt className="text-slate-500 font-medium">{row.label}</dt>
                        <dd className="text-right font-bold text-slate-900">
                          {row.isStatus ? (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                              {row.value}
                            </span>
                          ) : (
                            row.value
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                <div className="mt-5 flex gap-3 rounded-xl bg-sky-50 p-4 text-xs leading-5 text-sky-800">
                  <ShieldCheck size={17} className="shrink-0 text-sky-700 mt-0.5" />
                  {method === "Drop-off"
                    ? "Warga mengantarkan sampah secara langsung ke Bank Sampah Graha Pena Palembang. Nilai setoran dihitung setelah penimbangan manual oleh petugas."
                    : "Petugas akan menuju alamat penjemputan yang ditentukan. Nilai setoran dihitung setelah penimbangan manual oleh petugas."}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              <Button
                variant="secondary"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="cursor-pointer sm:min-w-28"
              >
                <ArrowLeft size={17} />
                <span>Kembali</span>
              </Button>

              {step < 4 ? (
                <Button onClick={next} className="cursor-pointer sm:min-w-32">
                  <span>Lanjutkan</span>
                  <ArrowRight size={17} />
                </Button>
              ) : (
                <Button onClick={submit} className="cursor-pointer sm:min-w-40">
                  <Check size={17} />
                  <span>Kirim Laporan</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Aside Summary & Quick Guide */}
        <aside className="rounded-[1.5rem] border border-green-100 bg-[#eff8f1] p-5 shadow-[0_8px_24px_rgba(22,101,52,.05)] xl:sticky xl:top-24">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-700 text-white">
              <BookOpen size={19} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-green-700">
                Panduan Singkat
              </p>
              <h2 className="mt-0.5 font-extrabold text-slate-900">Sebelum Melanjutkan</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Estimasi Berat",
                desc: "Masukkan perkiraan berat sampah. Berat final ditentukan petugas setelah penimbangan manual.",
                icon: Scale,
              },
              {
                title: "Ketentuan Pickup",
                desc: "Pickup tersedia apabila total estimasi berat memenuhi batas minimum 5 kg.",
                icon: Truck,
              },
              {
                title: "Proses Setoran",
                desc: "Petugas akan melakukan verifikasi dan penimbangan sebelum saldo tabungan diperbarui.",
                icon: ClipboardCheck,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white/80 p-4">
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-100 text-green-700">
                    <item.icon size={17} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
