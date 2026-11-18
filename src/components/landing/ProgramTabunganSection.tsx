"use client";

import { WalletCards, BookOpen, HandCoins, Leaf } from "lucide-react";

export default function ProgramTabunganSection() {
  const programs = [
    {
      title: "Tabungan Sampah",
      description: "Nilai setoran tersimpan sebagai saldo nasabah.",
      icon: WalletCards,
    },
    {
      title: "Pendidikan",
      description: "Tabungan sampah dapat mendukung kebutuhan pendidikan.",
      icon: BookOpen,
    },
    {
      title: "Kurban",
      description: "Akumulasi tabungan membantu perencanaan ibadah kurban.",
      icon: HandCoins,
    },
    {
      title: "Umroh",
      description: "Tabungan jangka panjang dapat diarahkan untuk rencana umroh.",
      icon: Leaf,
    },
  ];

  return (
    <section className="bg-white px-5 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-green-700">
            Program Tabungan
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
            Sampah terpilah, manfaat lebih terarah.
          </h2>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-green-100 bg-[#f3f8f5] p-5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-100 text-green-700">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 font-extrabold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
