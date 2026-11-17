"use client";

import { useState, FormEvent } from "react";
import {
  WalletCards,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react";
import { PageTitle, Card, Field, Button, Modal, InfoRow } from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { money } from "@/data/wargaSeedData";

export default function WargaWithdrawalPage() {
  const { balance, setBalance, setTransactions, notify } = useWarga();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [type, setType] = useState("Penarikan manual");
  const [amount, setAmount] = useState(0);
  const [amountTouched, setAmountTouched] = useState(false);
  const [notes, setNotes] = useState("");

  const amountValid = amount > 0 && amount <= balance;
  const formValid = amountValid;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAmountTouched(true);
    if (!formValid) return;
    setConfirmOpen(true);
  };

  const sendRequest = () => {
    setConfirmOpen(false);

    const todayFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());

    // Deduct balance and record transaction
    const newBal = balance - amount;
    setBalance(newBal);
    setTransactions((prev) => [
      {
        date: todayFormatted,
        type: "Penarikan",
        weight: "—",
        value: -amount,
        balance: newBal,
      },
      ...prev,
    ]);

    notify("Permintaan penarikan saldo berhasil dikirim untuk diproses manual.");
    setAmount(0);
    setNotes("");
    setAmountTouched(false);
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Penarikan Saldo"
        desc="Seluruh permintaan diproses manual oleh bank sampah."
      />

      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        {/* Available Balance Card */}
        <Card className="border-green-200 bg-green-50/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">Saldo Tersedia</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#166534]">
                {balanceVisible ? money(balance) : "Rp ••••••"}
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
            Permintaan dicatat dalam sistem dan diproses secara langsung oleh petugas di bank sampah aktif (tunai saat drop-off atau pemotongan iuran sampah warga).
          </div>
        </Card>

        {/* Withdrawal Form */}
        <Card>
          <form onSubmit={submit}>
            <Field label="Jenis permintaan">
              <div className="grid gap-3 sm:grid-cols-2">
                {["Penarikan manual", "Potong iuran bulanan"].map((t) => (
                  <button
                    type="button"
                    onClick={() => setType(t)}
                    key={t}
                    className={`rounded-xl border-2 p-4 text-left text-sm font-bold transition cursor-pointer ${
                      type === t
                        ? "border-green-600 bg-green-50 text-green-800"
                        : "border-slate-200 hover:border-green-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <div className="mt-5">
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
                  className={`input ${
                    amountTouched && !amountValid
                      ? "border-red-400 ring-2 ring-red-100 focus:border-red-400"
                      : ""
                  }`}
                  placeholder="Rp0"
                />
                {amountTouched && amount <= 0 && (
                  <p className="mt-2 text-xs font-semibold text-red-600">Nominal wajib diisi.</p>
                )}
                {amountTouched && amount > balance && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    Saldo tabungan tidak mencukupi untuk penarikan ini.
                  </p>
                )}
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Keterangan">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-20 resize-none"
                  placeholder="Catatan opsional untuk petugas bank sampah"
                />
              </Field>
            </div>

            <Button type="submit" disabled={!formValid} className="mt-6 w-full cursor-pointer">
              <span>Kirim permintaan</span>
              <ArrowRight size={17} />
            </Button>
          </form>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <Modal title="Konfirmasi Permintaan" onClose={() => setConfirmOpen(false)}>
          <div className="rounded-xl bg-green-50 p-4">
            <InfoRow label="Jenis permintaan" value={type} />
            <div className="my-4 h-px bg-green-200" />
            <InfoRow label="Nominal" value={money(amount)} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Permintaan akan diteruskan kepada petugas bank sampah dan diproses secara manual.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} className="cursor-pointer">
              Periksa kembali
            </Button>
            <Button onClick={sendRequest} className="cursor-pointer">
              <Check size={17} />
              <span>Ya, kirim permintaan</span>
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

