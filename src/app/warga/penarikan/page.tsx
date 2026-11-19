"use client";

import { useState, FormEvent } from "react";
import {
  WalletCards,
  Eye,
  EyeOff,
  HandCoins,
  ArrowRight,
  Check,
  Download,
  AlertCircle,
} from "lucide-react";
import {
  PageTitle,
  Card,
  Field,
  Button,
  Modal,
  Badge,
  InfoRow,
} from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { money, WithdrawalRequest } from "@/data/wargaSeedData";

export default function WargaWithdrawalPage() {
  const {
    balance,
    citizenProfile,
    withdrawalRequests,
    setWithdrawalRequests,
    notify,
    refreshData,
  } = useWarga();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinCode, setPinCode] = useState("123456");
  const [amount, setAmount] = useState(0);
  const [amountTouched, setAmountTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [previewRequest, setPreviewRequest] = useState<WithdrawalRequest | null>(
    null,
  );
  const type = "Penarikan manual";

  const currentBalance = balance;
  const amountValid = amount > 0 && amount <= currentBalance;
  const formValid = amountValid;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAmountTouched(true);
    if (!formValid) return;
    setConfirmOpen(true);
  };

  const sendRequest = async () => {
    // Kirim pengajuan penarikan ke database Supabase
    try {
      const res = await fetch("/api/penarikan/ajukan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jumlah: amount,
          tujuan: type.includes("Iuran") ? "potong_iuran" : "tarik_tabungan",
          pin: pinCode.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        notify("Gagal: " + (resData.error || "PIN tidak sesuai atau saldo kurang"));
        return;
      }

      notify("Pengajuan penarikan berhasil dikirim dan diverifikasi server.");
      refreshData();
    } catch {
      notify("Pengajuan penarikan dikirim (mode offline).");
    }

    const nextNumber =
      Math.max(
        0,
        ...withdrawalRequests.map(
          (request) => Number(request.id.replace(/\D/g, "")) || 0,
        ),
      ) + 1;

    const submittedDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());

    setWithdrawalRequests((current) => [
      {
        id: `WD-${String(nextNumber).padStart(3, "0")}`,
        citizenId: citizenProfile.username,
        citizenName: citizenProfile.name,
        type,
        amount,
        description: description.trim() || "Penarikan saldo manual",
        submittedDate,
        status: "Menunggu",
      },
      ...current,
    ]);

    setConfirmOpen(false);
    setAmount(0);
    setDescription("");
    setAmountTouched(false);
  };

  const citizenWithdrawals = withdrawalRequests.filter((request) => {
    const cId = (request.citizenId || "").toLowerCase().trim();
    const cName = (request.citizenName || "").toLowerCase().trim();
    const myName = (citizenProfile.name || "").toLowerCase().trim();
    const myUser = (citizenProfile.username || "").toLowerCase().trim();
    return Boolean((myUser && cId === myUser) || (myName && cName === myName));
  });

  return (
    <div className="space-y-6">
      <PageTitle
        title="Penarikan Saldo"
        desc="Seluruh permintaan diproses manual oleh bank sampah."
      />

      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        {/* Balance Card */}
        <Card className="border-green-200 bg-green-50/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">
                Saldo Tersedia
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#166534]">
                {balanceVisible ? money(currentBalance) : "Rp ••••••"}
              </p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
              <WalletCards size={21} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBalanceVisible((current) => !current)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100 active:scale-[.98] cursor-pointer"
          >
            {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            {balanceVisible ? "Sembunyikan Saldo" : "Lihat Saldo"}
          </button>

          <div className="mt-5 border-t border-green-200/80 pt-5 text-xs leading-5 text-slate-600">
            Permintaan hanya dicatat dan diproses secara manual oleh Admin Bank Sampah. Tidak ada
            payment gateway, e-wallet, transfer bank, atau pencairan otomatis.
          </div>
        </Card>

        {/* Withdrawal Form */}
        <Card>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Jenis permintaan
              </p>
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-700 text-white">
                  <HandCoins size={17} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-green-900">
                    Penarikan manual
                  </p>
                  <p className="mt-0.5 text-xs text-green-700">
                    Diproses langsung oleh pengelola bank sampah.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Field label="Nominal">
                <input
                  value={amount ? money(amount) : ""}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setAmount(digits ? Number(digits) : 0);
                    setAmountTouched(true);
                  }}
                  onBlur={() => setAmountTouched(true)}
                  type="text"
                  inputMode="numeric"
                  className={`input ${amountTouched && !amountValid
                      ? "border-red-400 ring-2 ring-red-100 focus:border-red-400"
                      : ""
                    }`}
                  placeholder="Rp0"
                  aria-invalid={amountTouched && !amountValid}
                />
                {amountTouched && amount <= 0 && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    Nominal wajib diisi.
                  </p>
                )}
                {amountTouched && amount > currentBalance && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    Saldo tabungan tidak mencukupi.
                  </p>
                )}
              </Field>
            </div>

            <div>
              <Field label="Keterangan">
                <textarea
                  className="input min-h-20 resize-none"
                  placeholder="Catatan opsional untuk petugas bank sampah"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>
            </div>

            <Button
              type="submit"
              disabled={!formValid}
              className="w-full cursor-pointer"
            >
              <span>Kirim permintaan</span>
              <ArrowRight size={17} />
            </Button>
          </form>
        </Card>
      </div>

      {/* History Card */}
      <Card className="mt-6">
        <div>
          <h2 className="font-extrabold text-slate-900">
            Riwayat Permintaan Penarikan
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Pantau proses manual dan bukti transaksi milik akun Anda.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {citizenWithdrawals.map((request) => (
            <article
              key={request.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-extrabold text-green-700">
                      {request.id}
                    </p>
                    <Badge
                      tone={request.status === "Selesai" ? "green" : "amber"}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-slate-900">
                    {request.type}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.submittedDate}
                  </p>
                  {request.description && (
                    <p className="mt-1 text-xs text-slate-600">
                      {request.description}
                    </p>
                  )}
                </div>
                <p className="text-lg font-extrabold text-slate-900">
                  {money(request.amount)}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                {request.status === "Selesai" ? (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs text-slate-500">Tanggal diproses</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {request.processedDate || "18 Mar 2025"}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-green-700">
                        {request.type === "Potong iuran bulanan"
                          ? "Bukti Pemotongan Iuran"
                          : "Bukti Transfer / Penyerahan Tunai"}
                      </p>
                    </div>
                    {request.proof ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="secondary"
                          onClick={() => setPreviewRequest(request)}
                          className="min-h-9 px-3 text-xs cursor-pointer"
                        >
                          <Eye size={15} /> Lihat Bukti
                        </Button>
                        <a
                          href={request.proof.dataUrl}
                          download={request.proof.name}
                          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-green-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-800"
                        >
                          <Download size={15} /> Unduh Bukti
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400">
                        Bukti transaksi dicatat secara internal
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-amber-700">
                    Sedang menunggu verifikasi dan persetujuan pengelola bank sampah.
                  </p>
                )}
              </div>
            </article>
          ))}

          {citizenWithdrawals.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              <AlertCircle className="mx-auto w-8 h-8 text-slate-300 mb-2" />
              Belum ada permintaan penarikan.
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <Modal
          title="Konfirmasi Permintaan"
          onClose={() => setConfirmOpen(false)}
        >
          <div className="rounded-xl bg-green-50 p-4">
            <InfoRow label="Jenis permintaan" value={type} />
            <div className="my-4 h-px bg-green-200" />
            <InfoRow label="Nominal" value={money(amount)} />
            {description && (
              <>
                <div className="my-4 h-px bg-green-200" />
                <InfoRow label="Keterangan" value={description} />
              </>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Masukkan PIN Keamanan 6-Digit (Wajib)
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-slate-300 p-2.5 focus:border-green-600 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              PIN Anda diverifikasi langsung oleh database keamanan Supabase.
            </p>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Permintaan akan diteruskan kepada Admin Bank Sampah dan diproses secara manual.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              className="cursor-pointer"
            >
              Periksa kembali
            </Button>
            <Button onClick={sendRequest} className="cursor-pointer">
              <Check size={17} />
              <span>Ya, kirim permintaan</span>
            </Button>
          </div>
        </Modal>
      )}

      {/* Proof Preview Modal */}
      {previewRequest?.proof && (
        <Modal
          title="Bukti Transaksi"
          onClose={() => setPreviewRequest(null)}
          wide
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {previewRequest.proof.type === "application/pdf" ? (
              <iframe
                title={`Bukti ${previewRequest.id}`}
                src={previewRequest.proof.dataUrl}
                className="h-[65vh] w-full border-0"
              />
            ) : (
              <img
                src={previewRequest.proof.dataUrl}
                alt={`Bukti transaksi ${previewRequest.id}`}
                className="max-h-[65vh] w-full object-contain"
              />
            )}
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setPreviewRequest(null)}
              className="cursor-pointer"
            >
              Tutup
            </Button>
            <a
              href={previewRequest.proof.dataUrl}
              download={previewRequest.proof.name}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
            >
              <Download size={16} /> Unduh Bukti
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}
