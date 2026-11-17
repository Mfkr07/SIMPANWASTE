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
  const { balance, transactions } = useWarga();
  const [visible, setVisible] = useState(true);

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
          value="19,1 kg"
          detail="Dari seluruh setoran selesai"
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
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Berat</th>
                <th>Nilai transaksi</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td>{t.date}</td>
                  <td>
                    <Badge tone={t.type === "Setoran" ? "green" : "amber"}>{t.type}</Badge>
                  </td>
                  <td>{t.weight}</td>
                  <td className={`font-bold ${t.value > 0 ? "text-green-700" : "text-red-600"}`}>
                    {t.value > 0 ? "+" : ""}
                    {money(t.value)}
                  </td>
                  <td className="font-extrabold">{money(i === 0 ? balance : t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

