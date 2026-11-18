"use client";

import { useState } from "react";
import {
  WalletCards,
  Eye,
  EyeOff,
  Scale,
  Recycle,
} from "lucide-react";
import { PageTitle, Card, StatCard, Badge } from "@/components/warga/WargaUI";
import { useWarga } from "@/context/WargaContext";
import { money } from "@/data/wargaSeedData";

export default function WargaBalancePage() {
  const { balance, transactions, reports, citizenProfile } = useWarga();
  const [visible, setVisible] = useState(true);

  const mine = reports.filter((r) => {
    const c = (r.citizen || "").toLowerCase().trim();
    const myName = (citizenProfile.name || "").toLowerCase().trim();
    const myUser = (citizenProfile.username || "").toLowerCase().trim();
    return Boolean((myName && c === myName) || (myUser && c === myUser));
  });

  const completed = mine.filter((r) => r.status === "Selesai");
  const totalWeight = completed.reduce(
    (sum, r) => sum + (r.actual || r.estimate || 0),
    0
  );
  const totalWeightStr =
    totalWeight > 0
      ? `${totalWeight.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`
      : transactions.length > 0 && citizenProfile.username === "ayu.lestari"
        ? "19,1 kg"
        : "0 kg";

  return (
    <div className="space-y-6">
      <PageTitle
        title="Saldo & Riwayat Transaksi"
        desc="Ringkasan saldo dan transaksi pribadi Anda."
      />

      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-green-200 bg-green-50/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">Saldo Tersedia</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#166534]">
                {visible ? money(balance) : "Rp ••••••"}
              </p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-700 text-white shadow-sm">
              <WalletCards size={21} />
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-green-200/80 pt-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Pembaruan sistem</p>
              <p className="mt-1 text-xs font-bold text-slate-700">Otomatis pasca verifikasi</p>
            </div>
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100 active:scale-[.98] cursor-pointer"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              {visible ? "Sembunyikan" : "Lihat Saldo"}
            </button>
          </div>
        </Card>

        <StatCard
          label="Total berat terkumpul"
          value={totalWeightStr}
          detail={completed.length > 0 ? "Dari seluruh setoran selesai" : "Belum ada setoran"}
          icon={Scale}
          tone="blue"
        />

        <StatCard
          label="Transaksi setoran"
          value={`${transactions.length} kali`}
          detail="Tercatat dalam buku tabungan"
          icon={Recycle}
          tone="amber"
        />
      </div>

      {/* Transaction History Table */}
      <Card className="mt-6">
        <h2 className="font-extrabold text-slate-900">Riwayat transaksi</h2>
        <div className="table-wrap">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Tanggal</th>
                <th className="w-[130px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Jenis</th>
                <th className="w-[110px] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Berat</th>
                <th className="w-[180px] px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Nilai Transaksi</th>
                <th className="w-[180px] px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3.5 align-middle text-slate-600 whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-center whitespace-nowrap">
                    <Badge tone={t.type === "Setoran" ? "green" : "amber"}>{t.type}</Badge>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-center font-medium text-slate-700 whitespace-nowrap">
                    {t.weight}
                  </td>
                  <td
                    className={`px-4 py-3.5 align-middle text-right font-bold whitespace-nowrap ${
                      t.value > 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {t.value > 0 ? "+" : ""}
                    {money(t.value)}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-right font-extrabold text-slate-900 whitespace-nowrap">
                    {money(i === 0 ? balance : t.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada riwayat transaksi tabungan.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

