"use client";

import { useState, FormEvent } from "react";
import {
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { PageTitle, Card, Field, Button, Badge } from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { UserProfile } from "@/data/wargaSeedData";

export default function WargaProfilePage() {
  const { citizenProfile, setCitizenProfile, notify } = useWarga();

  const [draft, setDraft] = useState<UserProfile>(citizenProfile);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Password update state
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = citizenProfile.name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!draft.name.trim()) nextErrors.name = "Nama lengkap wajib diisi.";
    if (!draft.username.trim()) nextErrors.username = "Username wajib diisi.";
    else if (!/^[a-z0-9._]{4,20}$/.test(draft.username))
      nextErrors.username = "Gunakan 4–20 karakter: huruf kecil, angka, titik, atau garis bawah.";
    if (!draft.phone.replace(/\D/g, "")) nextErrors.phone = "Nomor telepon wajib diisi.";
    else if (!/^08\d{8,11}$/.test(draft.phone.replace(/\D/g, "")))
      nextErrors.phone = "Gunakan nomor telepon Indonesia yang valid, diawali 08.";
    if (!draft.address.trim()) nextErrors.address = "Alamat lengkap wajib diisi.";

    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSavingProfile(true);
    setTimeout(() => {
      setCitizenProfile({
        name: draft.name.trim(),
        username: draft.username.trim().toLowerCase(),
        phone: draft.phone.trim(),
        address: draft.address.trim(),
      });
      setSavingProfile(false);
      notify("Perubahan profil berhasil disimpan.");
    }, 400);
  };

  const updatePassword = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!newPassword) nextErrors.password = "Password baru wajib diisi.";
    else if (newPassword.length < 8)
      nextErrors.password = "Password harus terdiri dari minimal 8 karakter.";
    if (!passwordConfirmation) nextErrors.confirmation = "Konfirmasi password wajib diisi.";
    else if (passwordConfirmation !== newPassword)
      nextErrors.confirmation = "Konfirmasi password tidak sesuai.";

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSavingPassword(true);
    setTimeout(() => {
      setNewPassword("");
      setPasswordConfirmation("");
      setPasswordErrors({});
      setSavingPassword(false);
      notify("Password berhasil diperbarui.");
    }, 400);
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Profil Saya"
        desc="Kelola informasi akun dan pengaturan keamanan tabungan Anda."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main Profile Info Form */}
        <Card className="p-7">
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100 text-xl font-extrabold text-green-800 shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{citizenProfile.name}</h2>
              <p className="text-xs text-slate-400 mb-1">@{citizenProfile.username}</p>
              <Badge tone="green">Warga Terverifikasi</Badge>
            </div>
          </div>

          <form onSubmit={saveProfile} className="grid gap-5 sm:grid-cols-2">
            <Field label="Nama lengkap">
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              {profileErrors.name && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{profileErrors.name}</p>
              )}
            </Field>

            <Field label="Username">
              <input
                className="input"
                value={draft.username}
                onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              />
              {profileErrors.username && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{profileErrors.username}</p>
              )}
            </Field>

            <Field label="Nomor telepon">
              <input
                className="input"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
              {profileErrors.phone && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{profileErrors.phone}</p>
              )}
            </Field>

            <div className="sm:col-span-2">
              <Field label="Alamat lengkap">
                <textarea
                  className="input min-h-24 resize-none"
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                />
                {profileErrors.address && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{profileErrors.address}</p>
                )}
              </Field>
            </div>

            <div className="sm:col-span-2 pt-2">
              <Button type="submit" disabled={savingProfile} className="cursor-pointer">
                {savingProfile ? "Menyimpan..." : "Simpan perubahan profil"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Password & Security Card */}
        <Card className="p-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-50 text-green-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Ganti Password</h3>
              <p className="text-xs text-slate-500">Perbarui kata sandi akun</p>
            </div>
          </div>

          <form onSubmit={updatePassword} className="space-y-4">
            <Field label="Password baru">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-11"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.password && (
                <p className="mt-1 text-xs font-semibold text-red-600">{passwordErrors.password}</p>
              )}
            </Field>

            <Field label="Konfirmasi password">
              <div className="relative">
                <input
                  type={showConfirmation ? "text" : "password"}
                  className="input pr-11"
                  placeholder="Ulangi password baru"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation(!showConfirmation)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showConfirmation ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.confirmation && (
                <p className="mt-1 text-xs font-semibold text-red-600">{passwordErrors.confirmation}</p>
              )}
            </Field>

            <Button
              type="submit"
              variant="secondary"
              disabled={savingPassword}
              className="w-full cursor-pointer"
            >
              <Check size={16} />
              <span>{savingPassword ? "Memperbarui..." : "Perbarui password"}</span>
            </Button>
          </form>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] leading-relaxed text-slate-500">
            PIN keamanan transaksi Anda terlindungi dan dapat direset langsung di kantor bank sampah mitra terdekat.
          </div>
        </Card>
      </div>
    </div>
  );
}

