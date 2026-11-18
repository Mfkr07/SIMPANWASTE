"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  UserRound,
  UserCog,
  Phone,
  MapPin,
  Pencil,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { PageTitle, Card, Button, Badge } from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { UserProfile } from "@/data/wargaSeedData";

export default function WargaProfilePage() {
  const { citizenProfile, setCitizenProfile, notify } = useWarga();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(citizenProfile);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft(citizenProfile);
  }, [citizenProfile]);

  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const initials = citizenProfile.name
    ? citizenProfile.name
        .split(" ")
        .filter(Boolean)
        .map((item) => item[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "W";

  const beginEdit = () => {
    setDraft(citizenProfile);
    setProfileErrors({});
    setEditing(true);
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!draft.name.trim()) nextErrors.name = "Nama lengkap wajib diisi.";
    if (!draft.username.trim()) nextErrors.username = "Username wajib diisi.";
    else if (!/^[a-z0-9._]{4,20}$/.test(draft.username))
      nextErrors.username =
        "Gunakan 4–20 karakter: huruf kecil, angka, titik, atau garis bawah.";
    if (!draft.phone.replace(/\D/g, ""))
      nextErrors.phone = "Nomor telepon wajib diisi.";
    else if (!/^08\d{8,11}$/.test(draft.phone.replace(/\D/g, "")))
      nextErrors.phone = "Gunakan nomor telepon Indonesia yang valid.";
    if (!draft.address.trim()) nextErrors.address = "Alamat lengkap wajib diisi.";

    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setCitizenProfile({
      ...draft,
      name: draft.name.trim(),
      username: draft.username.trim(),
      address: draft.address.trim(),
    });
    setEditing(false);
    notify("Perubahan profil berhasil disimpan.");
  };

  const updatePassword = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!newPassword) nextErrors.password = "Password baru wajib diisi.";
    else if (newPassword.length < 8)
      nextErrors.password = "Password harus terdiri dari minimal 8 karakter.";
    if (!passwordConfirmation)
      nextErrors.confirmation = "Konfirmasi password wajib diisi.";
    else if (passwordConfirmation !== newPassword)
      nextErrors.confirmation = "Konfirmasi password tidak sesuai.";

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setNewPassword("");
    setPasswordConfirmation("");
    setPasswordErrors({});
    notify("Password berhasil diperbarui.");
  };

  const personalItems = [
    { label: "Nama lengkap", value: citizenProfile.name, icon: UserRound },
    { label: "Username", value: `@${citizenProfile.username}`, icon: UserCog },
    { label: "Nomor telepon", value: citizenProfile.phone, icon: Phone },
    { label: "Alamat lengkap", value: citizenProfile.address, icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Profil Saya"
        desc="Kelola informasi akun Anda sendiri."
      />

      {/* Hero Profile Banner */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-green-100 bg-[#eaf7ed] p-6 sm:p-8">
        <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full border-[42px] border-green-600/[.055]" />
        <div className="absolute -bottom-28 left-[36%] h-60 w-60 rounded-full bg-green-300/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-white bg-green-700 text-2xl font-extrabold text-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                  {citizenProfile.name}
                </h1>
                <Badge tone="green">Warga</Badge>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                @{citizenProfile.username}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-800">
                <MapPin size={14} /> Palembang
              </p>
            </div>
          </div>
          <Button onClick={beginEdit} className="w-full sm:w-auto cursor-pointer">
            <Pencil size={16} /> Edit Profil
          </Button>
        </div>
      </section>

      {/* Main Details & Security Grid */}
      <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Informasi Pribadi
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Data utama akun warga Anda.
              </p>
            </div>
            {!editing && (
              <Button
                variant="secondary"
                onClick={beginEdit}
                className="min-h-9 px-3 text-xs cursor-pointer"
              >
                <Pencil size={14} /> Edit
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="mt-7 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama lengkap
                </span>
                <input
                  value={draft.name}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }));
                    setProfileErrors((current) => ({ ...current, name: "" }));
                  }}
                  className={`input ${profileErrors.name
                    ? "border-red-400 ring-2 ring-red-100"
                    : ""
                    }`}
                />
                {profileErrors.name && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {profileErrors.name}
                  </p>
                )}
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </span>
                <input
                  value={draft.username}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      username: event.target.value.toLowerCase(),
                    }));
                    setProfileErrors((current) => ({ ...current, username: "" }));
                  }}
                  className={`input ${profileErrors.username
                    ? "border-red-400 ring-2 ring-red-100"
                    : ""
                    }`}
                />
                {profileErrors.username && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {profileErrors.username}
                  </p>
                )}
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nomor telepon
                </span>
                <input
                  value={draft.phone}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      phone: event.target.value,
                    }));
                    setProfileErrors((current) => ({ ...current, phone: "" }));
                  }}
                  className={`input ${profileErrors.phone
                    ? "border-red-400 ring-2 ring-red-100"
                    : ""
                    }`}
                />
                {profileErrors.phone && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {profileErrors.phone}
                  </p>
                )}
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Alamat lengkap
                </span>
                <textarea
                  value={draft.address}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      address: event.target.value,
                    }));
                    setProfileErrors((current) => ({
                      ...current,
                      address: "",
                    }));
                  }}
                  className={`input min-h-24 resize-none ${profileErrors.address
                    ? "border-red-400 ring-2 ring-red-100"
                    : ""
                    }`}
                />
                {profileErrors.address && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {profileErrors.address}
                  </p>
                )}
              </label>

              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setDraft(citizenProfile);
                    setProfileErrors({});
                  }}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button type="submit" className="cursor-pointer">
                  <Check size={16} /> Simpan Perubahan
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {personalItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`rounded-xl bg-slate-50 p-4 ${item.label === "Alamat lengkap" ? "sm:col-span-2" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-50 text-green-700">
                        <ItemIcon size={17} />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[.11em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-1.5 text-sm font-bold leading-6 text-slate-800">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Security & Password Card */}
        <Card className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Keamanan Akun
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Perbarui password akun Anda.
              </p>
            </div>
          </div>

          <form onSubmit={updatePassword} className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password baru
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordErrors((current) => ({
                      ...current,
                      password: "",
                    }));
                  }}
                  className={`input pr-11 ${passwordErrors.password
                    ? "border-red-400 ring-2 ring-red-100"
                    : ""
                    }`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.password && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {passwordErrors.password}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Konfirmasi password
              </span>
              <div className="relative">
                <input
                  type={showConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(event) => {
                    setPasswordConfirmation(event.target.value);
                    setPasswordErrors((current) => ({
                      ...current,
                      confirmation: "",
                    }));
                  }}
                  className={`input pr-11 ${passwordErrors.confirmation
                    ? "border-red-400 ring-2 ring-red-100"
                    : ""
                    }`}
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={
                    showConfirmation
                      ? "Sembunyikan konfirmasi"
                      : "Tampilkan konfirmasi"
                  }
                >
                  {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.confirmation && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {passwordErrors.confirmation}
                </p>
              )}
            </label>

            <Button
              type="submit"
              disabled={!newPassword && !passwordConfirmation}
              className="w-full cursor-pointer"
            >
              Perbarui Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
