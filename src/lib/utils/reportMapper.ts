import { Report, TrackerStage, WithdrawalRequest } from "@/data/wargaSeedData";

export function mapDbReportToUi(db: any): Report {
  const method = db.metode === "drop_off" ? "Drop-off" : "Pickup";
  const status = db.status === "selesai" ? "Selesai" : "Menunggu";
  const dateObj = db.tanggal_lapor ? new Date(db.tanggal_lapor) : new Date();
  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);

  const location =
    db.catatan_lokasi ||
    (db.metode === "drop_off"
      ? db.bank_sampah?.nama || "Bank Sampah Graha Pena Palembang"
      : db.profil?.alamat || "Lokasi Warga (Pickup)");

  const categories = (db.detail_setoran || [])
    .map((d: any) => d.kategori_sampah?.nama_kategori)
    .filter(Boolean);
  const categoryStr = categories.length > 0 ? categories.join(", ") : "Sampah Anorganik";

  const trackerHistory: { stage: TrackerStage; timestamp: string }[] = [
    { stage: "Request Terkirim", timestamp: dateFormatted },
  ];
  if (db.status === "dalam_proses") {
    trackerHistory.push({
      stage: "Petugas dalam Perjalanan",
      timestamp: dateFormatted + " (Proses)",
    });
  }
  if (db.status === "selesai") {
    trackerHistory.push({
      stage: "Petugas dalam Perjalanan",
      timestamp: dateFormatted,
    });
    trackerHistory.push({
      stage: "Petugas Memverifikasi",
      timestamp: dateFormatted,
    });
    trackerHistory.push({
      stage: "Poin Saldo Didapatkan",
      timestamp: dateFormatted,
    });
  }

  const verifiedItems = (db.detail_setoran || []).map((d: any) => ({
    category: d.kategori_sampah?.nama_kategori || "Sampah",
    estimatedWeight: Number(db.estimasi_berat || 0),
    actualWeight: Number(d.berat_aktual || 0),
    citizenConditions: [
      d.kondisi === "bersih"
        ? "Sudah dibersihkan"
        : d.kondisi === "kotor"
        ? "Belum dipilah dan dibersihkan"
        : "Tidak mudah didaur ulang",
    ],
    verifiedCondition:
      d.kondisi === "bersih"
        ? "Sudah dibersihkan"
        : d.kondisi === "kotor"
        ? "Belum dipilah dan dibersihkan"
        : "Tidak mudah didaur ulang",
    price:
      d.subtotal && d.berat_aktual ? Math.round(Number(d.subtotal) / Number(d.berat_aktual)) : 0,
    subtotal: Number(d.subtotal || 0),
    weighingPhoto: db.penimbangan?.foto_bukti_url
      ? { name: "bukti_penimbangan.jpg", type: "image/jpeg", dataUrl: db.penimbangan.foto_bukti_url }
      : undefined,
  }));

  return {
    id: db.id,
    citizen: db.profil?.nama || db.profil?.username || "Warga",
    phone: db.profil?.no_hp || "-",
    category: categoryStr,
    estimate: Number(db.estimasi_berat || 0),
    method,
    status,
    date: dateFormatted,
    location,
    assigned: db.penimbangan?.profil?.nama || "Rizky Pratama",
    actual: db.penimbangan?.total_berat ? Number(db.penimbangan.total_berat) : undefined,
    value: db.penimbangan?.total_nilai ? Number(db.penimbangan.total_nilai) : undefined,
    trackerHistory,
    categoryWeights: (db.detail_setoran || []).map((d: any) => ({
      category: d.kategori_sampah?.nama_kategori || "Sampah",
      estimate: Number(db.estimasi_berat || 0),
    })),
    verifiedItems: verifiedItems.length > 0 ? verifiedItems : undefined,
  };
}

export function mapDbWithdrawalToUi(w: any): WithdrawalRequest {
  const dateObj = w.tanggal_ajuan ? new Date(w.tanggal_ajuan) : new Date();
  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);

  return {
    id: w.id,
    citizenId: w.profil?.username || "warga",
    citizenName: w.profil?.nama || "Warga",
    amount: Number(w.jumlah || 0),
    type: w.tujuan === "tarik_tabungan" ? "Penarikan manual" : "Potong iuran bulanan",
    status: w.status === "selesai" ? "Selesai" : "Menunggu",
    description: w.keterangan || w.alasan_penolakan || "Permintaan penarikan saldo nasabah",
    submittedDate: dateFormatted,
    processedDate: w.tanggal_proses
      ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(w.tanggal_proses))
      : undefined,
    processedBy: w.petugas?.nama || undefined,
    proof: w.bukti_transfer_url
      ? { name: "bukti_transfer.jpg", type: "image/jpeg", dataUrl: w.bukti_transfer_url }
      : undefined,
  };
}
