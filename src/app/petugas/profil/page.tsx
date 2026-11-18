"use client";

import { useState, useEffect, FormEvent } from "react";
import { Check, UserRound } from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Badge,
  Field,
} from "@/components/petugas/PetugasUI";
import { usePetugas, OfficerProfile } from "@/context/PetugasContext";

export default function PetugasProfilPage() {
  const { officerProfile, setOfficerProfile, notify } = usePetugas();

  const [draft, setDraft] = useState<OfficerProfile>(officerProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft(officerProfile);
  }, [officerProfile]);

  const initials = officerProfile?.name
    ? officerProfile.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "P";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!draft.name.trim()) newErrors.name = "Nama lengkap wajib diisi.";
    if (!draft.username.trim()) newErrors.username = "Username wajib diisi.";
    if (!draft.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi.";
    if (!draft.address.trim()) newErrors.address = "Alamat wajib diisi.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setOfficerProfile({
      ...draft,
      name: draft.name.trim(),
      username: draft.username.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
    });

    notify("Perubahan profil berhasil disimpan.");
  };

  return (
    <>
      <PageTitle
        title="Profil Saya"
        desc="Kelola informasi akun Anda sendiri."
      />

      <Card className="mx-auto max-w-3xl p-7">
        <div className="mb-8 flex items-center gap-4">
          <div
            suppressHydrationWarning
            className="grid h-16 w-16 place-items-center rounded-full bg-green-100 text-xl font-extrabold text-green-800"
          >
            {initials}
          </div>
          <div>
            <h2
              suppressHydrationWarning
              className="text-xl font-extrabold text-slate-900"
            >
              {officerProfile.name || "Petugas"}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone="amber">Petugas Lapangan</Badge>
              <span
                suppressHydrationWarning
                className="text-xs font-semibold text-slate-400"
              >
                @{officerProfile.username || "petugas"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <Field label="Nama lengkap">
            <input
              className={`input ${
                errors.name ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
              value={draft.name}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, name: e.target.value }));
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">
                {errors.name}
              </p>
            )}
          </Field>

          <Field label="Username">
            <input
              className={`input ${
                errors.username ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
              value={draft.username}
              onChange={(e) => {
                setDraft((prev) => ({
                  ...prev,
                  username: e.target.value.toLowerCase(),
                }));
                setErrors((prev) => ({ ...prev, username: "" }));
              }}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">
                {errors.username}
              </p>
            )}
          </Field>

          <Field label="Nomor telepon">
            <input
              className={`input ${
                errors.phone ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
              value={draft.phone}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, phone: e.target.value }));
                setErrors((prev) => ({ ...prev, phone: "" }));
              }}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">
                {errors.phone}
              </p>
            )}
          </Field>

          <div className="sm:col-span-2">
            <Field label="Alamat">
              <textarea
                className={`input min-h-24 resize-none ${
                  errors.address ? "border-red-400 ring-2 ring-red-100" : ""
                }`}
                value={draft.address}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, address: e.target.value }));
                  setErrors((prev) => ({ ...prev, address: "" }));
                }}
              />
              {errors.address && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.address}
                </p>
              )}
            </Field>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button type="submit" className="cursor-pointer">
              <Check size={16} /> Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
