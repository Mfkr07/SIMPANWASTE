"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Truck,
  Scale,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Trash2,
} from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Badge,
  Field,
  Empty,
} from "@/components/petugas/PetugasUI";
import { usePetugas } from "@/context/PetugasContext";
import {
  Report,
  WasteCondition,
  wasteConditions,
  money,
} from "@/data/wargaSeedData";

function VerificationContent() {
  const searchParams = useSearchParams();
  const urlReportId = searchParams.get("id");

  const {
    officerProfile,
    reports,
    pickedUpReports,
    categories,
    completeVerification,
    addTrackerStage,
    notify,
  } = usePetugas();

  const myName = (officerProfile.name || "").toLowerCase().trim();

  const assignedReports = useMemo(() => {
    return reports.filter((r) => {
      const a = (r.assigned || "").toLowerCase().trim();
      return Boolean(a && (a === myName || a.includes("rizky")));
    });
  }, [reports, myName]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | Report["status"]>("Semua");

  // Determine initial selected report ID
  const initialReportId = useMemo(() => {
    if (urlReportId && assignedReports.some((r) => r.id === urlReportId)) {
      return urlReportId;
    }
    const firstReady =
      assignedReports.find(
        (r) =>
          r.status === "Menunggu" &&
          (r.method === "Drop-off" || pickedUpReports.includes(r.id))
      ) || assignedReports[0];
    return firstReady?.id || "";
  }, [urlReportId, assignedReports, pickedUpReports]);

  const [selectedId, setSelectedId] = useState(initialReportId);

  useEffect(() => {
    if (urlReportId && assignedReports.some((r) => r.id === urlReportId)) {
      setSelectedId(urlReportId);
    }
  }, [urlReportId, assignedReports]);

  const report = assignedReports.find((r) => r.id === selectedId);

  // Filtered queue reports
  const visibleReports = useMemo(() => {
    return assignedReports.filter(
      (item) =>
        (statusFilter === "Semua" || item.status === statusFilter) &&
        (item.id.toLowerCase().includes(search.toLowerCase()) ||
          item.citizen.toLowerCase().includes(search.toLowerCase()))
    );
  }, [assignedReports, statusFilter, search]);

  const isReady =
    report?.status === "Selesai" ||
    report?.method === "Drop-off" ||
    (report ? pickedUpReports.includes(report.id) : false);

  // Automatically update tracker to "Petugas Memverifikasi" if report is ready and waiting
  useEffect(() => {
    if (!report || report.status !== "Menunggu" || !isReady) return;
    addTrackerStage(report.id, "Petugas Memverifikasi");
  }, [selectedId, isReady, report, addTrackerStage]);

  // Extract categories inside selected report
  const reportItems = useMemo(() => {
    if (!report) return [];
    if (report.verifiedItems?.length) {
      return report.verifiedItems.map((item) => ({
        category: item.category,
        estimate: item.estimatedWeight,
        conditions: item.citizenConditions,
      }));
    }
    if (report.categoryWeights?.length) return report.categoryWeights;
    return [{ category: report.category, estimate: report.estimate, conditions: [] }];
  }, [report]);

  // Form states per report
  const [actualWeights, setActualWeights] = useState<Record<string, Record<string, number>>>({});
  const [verifiedConditions, setVerifiedConditions] = useState<
    Record<string, Record<string, WasteCondition[]>>
  >({});
  const [photos, setPhotos] = useState<
    Record<string, Record<string, { name: string; type: string; dataUrl: string }>>
  >({});

  // Initialize form state when report changes
  useEffect(() => {
    if (!report) return;
    const nextWeights: Record<string, number> = {};
    const nextConditions: Record<string, WasteCondition[]> = {};
    const nextPhotos: Record<string, { name: string; type: string; dataUrl: string }> = {};

    reportItems.forEach((item, index) => {
      const itemKey = `${index}:${item.category}`;
      const savedItem = report.verifiedItems?.[index];

      nextWeights[itemKey] = savedItem?.actualWeight ?? item.estimate;
      nextConditions[itemKey] =
        savedItem?.verifiedConditions ||
        (savedItem?.verifiedCondition ? [savedItem.verifiedCondition] : ["Sudah dipilah"]);
      if (savedItem?.weighingPhoto) {
        nextPhotos[itemKey] = savedItem.weighingPhoto;
      }
    });

    setActualWeights((prev) => (prev[report.id] ? prev : { ...prev, [report.id]: nextWeights }));
    setVerifiedConditions((prev) =>
      prev[report.id] ? prev : { ...prev, [report.id]: nextConditions }
    );
    setPhotos((prev) => (prev[report.id] ? prev : { ...prev, [report.id]: nextPhotos }));
  }, [selectedId, report, reportItems]);

  const reportActualWeights = actualWeights[selectedId] || {};
  const reportVerifiedConditions = verifiedConditions[selectedId] || {};
  const reportPhotos = photos[selectedId] || {};

  // Compute subtotals and price per item
  const itemCalculations = reportItems.map((item, index) => {
    const itemKey = `${index}:${item.category}`;
    const category = categories.find((c) => c.name === item.category);
    const selectedConditionsList = reportVerifiedConditions[itemKey] || [];
    const selectedPrices = category
      ? selectedConditionsList.map((cond) => category.prices[cond]).filter(Boolean)
      : [];
    const price = selectedPrices.length ? Math.min(...selectedPrices) : category?.clean || 3000;
    const actualWeight =
      reportActualWeights[itemKey] !== undefined ? reportActualWeights[itemKey] : item.estimate;
    const photo = reportPhotos[itemKey] || report?.verifiedItems?.[index]?.weighingPhoto;

    return {
      ...item,
      itemKey,
      actualWeight,
      verifiedConditions: selectedConditionsList,
      weighingPhoto: photo,
      price,
      subtotal: (actualWeight || 0) * price,
    };
  });

  const totalActualWeight = itemCalculations.reduce(
    (sum, item) => sum + (item.actualWeight || 0),
    0
  );
  const totalValue = itemCalculations.reduce((sum, item) => sum + item.subtotal, 0);

  const formValid =
    itemCalculations.length > 0 &&
    itemCalculations.every(
      (item) =>
        item.actualWeight > 0 &&
        item.verifiedConditions.length > 0 &&
        item.weighingPhoto
    );

  const toggleVerifiedCondition = (itemKey: string, condition: WasteCondition) => {
    if (!report || !isReady || report.status === "Selesai") return;
    setVerifiedConditions((prev) => {
      const reportConds = prev[report.id] || {};
      const selected = reportConds[itemKey] || [];
      const updated = selected.includes(condition)
        ? selected.filter((c) => c !== condition)
        : [...selected, condition];
      return {
        ...prev,
        [report.id]: {
          ...reportConds,
          [itemKey]: updated.length > 0 ? updated : [condition],
        },
      };
    });
  };

  const chooseWeighingPhoto = (itemKey: string, file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
      !["jpg", "jpeg", "png", "webp"].includes(extension || "")
    ) {
      return notify("Foto penimbangan harus berformat JPG, JPEG, atau PNG.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return notify("Ukuran foto penimbangan maksimum 5 MB.");
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setPhotos((prev) => ({
        ...prev,
        [report!.id]: {
          ...(prev[report!.id] || {}),
          [itemKey]: {
            name: file.name,
            type: file.type,
            dataUrl,
          },
        },
      }));
      notify("Foto penimbangan berhasil diunggah.");
    };
    reader.onerror = () => notify("Foto tidak dapat dibaca. Silakan pilih foto lain.");
    reader.readAsDataURL(file);
  };

  const removePhoto = (itemKey: string) => {
    if (!report || report.status === "Selesai") return;
    setPhotos((prev) => {
      const reportPhotosMap = { ...(prev[report.id] || {}) };
      delete reportPhotosMap[itemKey];
      return {
        ...prev,
        [report.id]: reportPhotosMap,
      };
    });
  };

  const handleComplete = () => {
    if (!report || report.status === "Selesai") return;
    if (!formValid) {
      return notify(
        "Lengkapi berat aktual, kondisi terverifikasi, dan foto penimbangan untuk setiap kategori."
      );
    }

    const verifiedItems = itemCalculations.map((item) => ({
      category: item.category,
      estimatedWeight: item.estimate,
      citizenConditions: item.conditions || [],
      actualWeight: item.actualWeight,
      verifiedConditions: item.verifiedConditions,
      weighingPhoto: item.weighingPhoto,
      price: item.price,
      subtotal: item.subtotal,
    }));

    completeVerification(
      report.id,
      verifiedItems,
      Number(totalActualWeight.toFixed(1)),
      totalValue
    );
  };

  return (
    <>
      <PageTitle
        title="Verifikasi & Penimbangan"
        desc="Kelola antrean laporan dan verifikasi setiap kategori hasil penimbangan fisik."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        {/* Left Column: Reports Queue */}
        <Card className="p-4 xl:sticky xl:top-24">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Total", assignedReports.length],
              [
                "Menunggu",
                assignedReports.filter((item) => item.status === "Menunggu").length,
              ],
              [
                "Selesai",
                assignedReports.filter((item) => item.status === "Selesai").length,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100"
              >
                <p className="text-lg font-extrabold text-slate-900">{value}</p>
                <p className="mt-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="input py-2.5 pl-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID atau nama warga..."
              />
            </div>
            <select
              className="input py-2.5 text-sm cursor-pointer"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "Semua" | Report["status"])
              }
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {visibleReports.map((item) => {
              const categoryCount = item.categoryWeights?.length || 1;
              const active = item.id === selectedId;
              const awaitingPickup =
                item.status === "Menunggu" &&
                item.method === "Pickup" &&
                !pickedUpReports.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-xl border p-4 text-left transition cursor-pointer ${
                    active
                      ? "border-green-600 bg-green-50/80 shadow-sm ring-1 ring-green-600/20"
                      : "border-slate-200 bg-white hover:border-green-200 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-green-700">{item.id}</p>
                      <p className="mt-1 text-sm font-extrabold text-slate-900">
                        {item.citizen}
                      </p>
                    </div>
                    <Badge tone={item.status === "Selesai" ? "green" : "amber"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                    <span>{item.date}</span>
                    <span>{categoryCount} kategori</span>
                    <span className="text-right font-bold text-slate-700">
                      {item.actual ? `${item.actual} kg` : `${item.estimate} kg`}
                    </span>
                  </div>
                  {awaitingPickup && (
                    <p className="mt-2 text-[10px] font-bold text-amber-700">
                      Menunggu konfirmasi penjemputan
                    </p>
                  )}
                </button>
              );
            })}
            {visibleReports.length === 0 && (
              <Empty title="Laporan tidak ditemukan" compact />
            )}
          </div>
        </Card>

        {/* Right Column: Verification Detail Form */}
        <Card className="p-5 sm:p-7">
          {report ? (
            <>
              {/* Report Header Information */}
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-extrabold text-green-700">{report.id}</p>
                    <Badge tone={report.status === "Selesai" ? "green" : "amber"}>
                      {report.status}
                    </Badge>
                  </div>
                  <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                    {report.citizen}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.phone} · {report.date} · {report.method}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    {report.location}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">Total estimasi warga</p>
                  <p className="text-xl font-extrabold text-slate-900">
                    {report.estimate} kg
                  </p>
                </div>
              </div>

              {!isReady && (
                <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <Truck size={18} className="shrink-0 mt-0.5" />
                  <span>
                    Laporan Pickup harus ditandai <strong>Sudah Dijemput</strong> pada menu
                    Tugas Penjemputan sebelum dapat ditimbang.
                  </span>
                </div>
              )}

              {/* Category Breakdown & Actual Inputs */}
              <div className="mt-6 space-y-4">
                {itemCalculations.map((item, index) => {
                  const savedItem = report.verifiedItems?.[index];
                  const savedConditions =
                    savedItem?.verifiedConditions ||
                    (savedItem?.verifiedCondition ? [savedItem.verifiedCondition] : []);
                  const readOnly = report.status === "Selesai";

                  return (
                    <section
                      key={`${item.category}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-green-700">
                            Kategori {index + 1}
                          </p>
                          <h3 className="mt-1 font-extrabold text-slate-900 text-base">
                            {item.category}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Estimasi Warga: <strong>{item.estimate} kg</strong>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:max-w-[55%] sm:justify-end">
                          {(item.conditions?.length ? item.conditions : []).map(
                            (condition) => (
                              <span
                                key={condition}
                                className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-800"
                              >
                                {condition}
                              </span>
                            )
                          )}
                          {!item.conditions?.length && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              Kondisi awal tidak tersedia
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <Field label="Berat aktual (kg)">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            disabled={readOnly || !isReady}
                            value={
                              readOnly
                                ? savedItem?.actualWeight ?? item.actualWeight
                                : item.actualWeight || ""
                            }
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setActualWeights((prev) => ({
                                ...prev,
                                [report.id]: {
                                  ...(prev[report.id] || {}),
                                  [item.itemKey]: val,
                                },
                              }));
                            }}
                            className="input disabled:bg-slate-100 disabled:text-slate-700 font-bold"
                            placeholder="Contoh: 3.5"
                          />
                        </Field>

                        <div>
                          <p className="mb-2 text-sm font-semibold text-slate-700">
                            Kondisi terverifikasi
                          </p>
                          {readOnly ? (
                            <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2">
                              {savedConditions.length ? (
                                savedConditions.map((condition) => (
                                  <span
                                    key={condition}
                                    className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 border border-slate-200"
                                  >
                                    {condition}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm font-bold text-slate-500">
                                  Tidak tersedia
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {wasteConditions.map((condition) => {
                                const selected = item.verifiedConditions.includes(condition);
                                return (
                                  <label
                                    key={condition}
                                    className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-bold leading-4 transition ${
                                      !isReady
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer"
                                    } ${
                                      selected
                                        ? "border-green-600 bg-green-50 text-green-900 ring-1 ring-green-600"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50/50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      disabled={!isReady}
                                      checked={selected}
                                      onChange={() =>
                                        toggleVerifiedCondition(item.itemKey, condition)
                                      }
                                      className="h-4 w-4 shrink-0 accent-green-700"
                                    />
                                    <span>{condition}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                          {!readOnly && item.verifiedConditions.length > 1 && (
                            <p className="mt-2 text-[10px] leading-4 text-slate-500">
                              Harga terbaik dari kondisi yang dipilih otomatis digunakan untuk perhitungan.
                            </p>
                          )}
                        </div>

                        <Field label="Harga per kilogram">
                          <input
                            disabled
                            className="input bg-slate-100 font-semibold text-slate-700"
                            value={money(savedItem?.price ?? item.price)}
                          />
                        </Field>

                        <Field label="Subtotal nilai kategori">
                          <input
                            disabled
                            className="input bg-green-50 font-extrabold text-green-800"
                            value={money(savedItem?.subtotal ?? item.subtotal)}
                          />
                        </Field>
                      </div>

                      {/* Photo Verification Upload */}
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <p className="text-sm font-semibold text-slate-700">
                          Foto Bukti Penimbangan
                        </p>

                        {item.weighingPhoto ? (
                          <div className="mt-3 rounded-xl border border-green-200 bg-white p-3">
                            <img
                              src={item.weighingPhoto.dataUrl}
                              alt={`Bukti penimbangan ${item.category}`}
                              className="max-h-56 w-full rounded-lg bg-slate-50 object-contain"
                            />
                            <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <p className="min-w-0 truncate text-xs font-bold text-slate-700">
                                {item.weighingPhoto.name}
                              </p>
                              {!readOnly && (
                                <div className="flex gap-2">
                                  <label className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 active:scale-[.97]">
                                    <UploadCloud size={14} /> Ganti Foto
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                      className="sr-only"
                                      disabled={!isReady}
                                      onChange={(e) =>
                                        chooseWeighingPhoto(
                                          item.itemKey,
                                          e.target.files?.[0]
                                        )
                                      }
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    disabled={!isReady}
                                    onClick={() => removePhoto(item.itemKey)}
                                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-[.97] cursor-pointer"
                                  >
                                    <Trash2 size={14} /> Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <label
                              className={`flex min-h-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 px-4 py-5 text-center transition ${
                                isReady
                                  ? "cursor-pointer hover:border-green-400"
                                  : "cursor-not-allowed opacity-50"
                              }`}
                            >
                              <UploadCloud className="text-green-700" size={23} />
                              <span className="mt-2 text-xs font-extrabold text-green-800">
                                Upload Foto Penimbangan
                              </span>
                              <span className="mt-1 text-[10px] text-slate-500">
                                JPG, JPEG, atau PNG · maks. 5 MB
                              </span>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                className="sr-only"
                                disabled={!isReady}
                                onChange={(e) =>
                                  chooseWeighingPhoto(
                                    item.itemKey,
                                    e.target.files?.[0]
                                  )
                                }
                              />
                            </label>
                            {isReady && report.status === "Menunggu" && (
                              <p className="mt-2 text-xs font-semibold text-red-600">
                                Foto bukti penimbangan wajib diunggah untuk verifikasi.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Totals Summary Card */}
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-green-700">Total berat aktual</p>
                    <p className="mt-1 text-xl font-extrabold text-green-950">
                      {report.actual ?? totalActualWeight.toFixed(1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Total nilai setoran</p>
                    <p className="mt-1 text-xl font-extrabold text-green-950">
                      {money(report.value ?? totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Saldo ditambahkan ke warga</p>
                    <p className="mt-1 text-xl font-extrabold text-green-950">
                      {money(report.value ?? totalValue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning if Incomplete */}
              {report.status === "Menunggu" && isReady && !formValid && (
                <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-800">
                  <XCircle size={17} className="mt-0.5 shrink-0" />
                  <span>
                    Lengkapi berat aktual, minimal satu kondisi terverifikasi, dan foto bukti
                    pada setiap kategori sebelum menyelesaikan laporan.
                  </span>
                </div>
              )}

              {/* Action Submit Button */}
              {report.status === "Menunggu" ? (
                <>
                  <Button
                    onClick={handleComplete}
                    disabled={!isReady || !formValid}
                    className="mt-6 w-full py-3 text-base cursor-pointer"
                  >
                    <CheckCircle2 size={18} /> Simpan & Selesaikan Laporan
                  </Button>
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Satu laporan diselesaikan sekaligus. Saldo nasabah warga akan otomatis bertambah secara real-time.
                  </p>
                </>
              ) : (
                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-4 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={18} className="text-green-700" />
                  Laporan telah diverifikasi dan berstatus hanya-baca
                </div>
              )}
            </>
          ) : (
            <Empty title="Pilih laporan dari antrean untuk memulai verifikasi" />
          )}
        </Card>
      </div>
    </>
  );
}

export default function PetugasVerifikasiPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-sm font-semibold text-slate-500">
          Memuat verifikasi...
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
