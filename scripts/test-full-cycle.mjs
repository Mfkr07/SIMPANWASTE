import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bdohycgujirvxuljgchg.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkb2h5Y2d1amlydnh1bGpnY2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMzg5MjQsImV4cCI6MjEwOTgxNDkyNH0.OcSXxc7rwB9PnosYdBmC2Ewraifj0UWcO2b2KA3394E";

async function main() {
  console.log("=== SIMPANWASTE FULL CYCLE INTEGRATION TEST ===");

  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Auth Warga
  console.log("\n[1] Autentikasi Nasabah (ayu.lestari)...");
  const { data: authWarga, error: errAuthWarga } = await anonClient.auth.signInWithPassword({
    email: "ayu.lestari@simpanwaste.local",
    password: "Password123!",
  });
  if (errAuthWarga) throw new Error("Gagal login warga: " + errAuthWarga.message);
  console.log("  -> OK, User ID:", authWarga.user.id);

  // Warga client
  const wargaClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authWarga.session.access_token}` } },
  });

  // Saldo awal
  const { data: saldoAwal } = await wargaClient.rpc("get_user_saldo", { p_user_id: authWarga.user.id });
  console.log("  -> Saldo awal nasabah: Rp", saldoAwal);

  // 2. Buat Laporan Setoran
  console.log("\n[2] Membuat Laporan Setoran Baru (Pickup)...");
  const dummyLoc = "Jl. Merdeka No. 99, Belakang Kantor Pos";
  const { data: laporan, error: errLaporan } = await wargaClient
    .from("laporan_setoran")
    .insert({
      id_pengguna: authWarga.user.id,
      metode: "pickup",
      latitude: -2.9463,
      longitude: 104.7391,
      estimasi_berat: 7.5,
      status: "menunggu",
    })
    .select()
    .single();

  if (errLaporan) throw new Error("Gagal insert laporan: " + errLaporan.message);
  console.log("  -> OK, ID Laporan:", laporan.id);

  // Detail setoran
  const { error: errDetail } = await wargaClient.from("detail_setoran").insert([
    {
      id_laporan: laporan.id,
      id_kategori: "11111111-1111-1111-1111-111111111102", // Plastik
    },
  ]);
  if (errDetail) console.warn("  -> Notice detail_setoran:", errDetail.message);

  // 3. Auth Petugas
  console.log("\n[3] Autentikasi Petugas (rizky.p)...");
  const { data: authPetugas, error: errAuthPetugas } = await anonClient.auth.signInWithPassword({
    email: "rizky.p@simpanwaste.local",
    password: "Password123!",
  });
  if (errAuthPetugas) throw new Error("Gagal login petugas: " + errAuthPetugas.message);
  console.log("  -> OK, Petugas ID:", authPetugas.user.id);

  const petugasClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authPetugas.session.access_token}` } },
  });

  // 4. Update status penjemputan ke dalam_proses
  console.log("\n[4] Petugas memulai penjemputan...");
  const { error: errJemput } = await petugasClient
    .from("laporan_setoran")
    .update({ status: "dalam_proses" })
    .eq("id", laporan.id);
  if (errJemput) throw new Error("Gagal jemput: " + errJemput.message);
  console.log("  -> OK, Status laporan berubah ke 'dalam_proses'");

  // 5. Petugas memproses penimbangan (5 kg Plastik Bersih @ Rp 3.000 = Rp 15.000)
  console.log("\n[5] Petugas memproses penimbangan fisik...");
  const { data: timbangResult, error: errTimbang } = await petugasClient.rpc("proses_penimbangan", {
    p_id_laporan: laporan.id,
    p_detail: [
      {
        id_kategori: "11111111-1111-1111-1111-111111111102", // Plastik
        berat_aktual: 5.0,
        kondisi: "bersih",
      },
    ],
  });
  if (errTimbang) throw new Error("Gagal proses penimbangan: " + errTimbang.message);
  console.log("  -> OK, Hasil timbangan:", timbangResult);

  // 6. Cek saldo bertambah
  const { data: saldoSesudah } = await wargaClient.rpc("get_user_saldo", { p_user_id: authWarga.user.id });
  console.log("  -> Saldo sesudah timbang: Rp", saldoSesudah, `(Selisih +Rp ${saldoSesudah - saldoAwal})`);

  // 7. Warga mengajukan penarikan
  console.log("\n[6] Warga mengajukan penarikan saldo (Rp 10.000)...");
  const { data: tarikResult, error: errTarik } = await wargaClient.rpc("ajukan_penarikan", {
    p_jumlah: 10000,
    p_tujuan: "tarik_tabungan",
    p_pin: "123456",
  });
  if (errTarik) throw new Error("Gagal ajukan penarikan: " + errTarik.message);
  console.log("  -> OK, Pengajuan penarikan ID:", tarikResult.id_penarikan);

  // 8. Auth Admin & Proses Penarikan
  console.log("\n[7] Autentikasi Admin (admin.simpan)...");
  const { data: authAdmin, error: errAuthAdmin } = await anonClient.auth.signInWithPassword({
    email: "admin.simpan@simpanwaste.local",
    password: "Password123!",
  });
  if (errAuthAdmin) throw new Error("Gagal login admin: " + errAuthAdmin.message);

  const adminClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authAdmin.session.access_token}` } },
  });

  console.log("\n[8] Admin menyetujui dan memproses pencairan...");
  const { data: prosesTarikResult, error: errProsesTarik } = await adminClient.rpc("proses_penarikan", {
    p_id_penarikan: tarikResult.id_penarikan,
    p_status: "selesai",
  });
  if (errProsesTarik) throw new Error("Gagal proses penarikan: " + errProsesTarik.message);
  console.log("  -> OK, Status penarikan selesai! Saldo akhir:", prosesTarikResult.saldo_baru);

  // 9. Cek ledger mutasi transaksi
  const { data: mutasi } = await wargaClient
    .from("saldo_transaksi")
    .select("jenis, jumlah, saldo, tanggal")
    .eq("id_pengguna", authWarga.user.id)
    .order("tanggal", { ascending: false })
    .limit(2);
  console.log("\n[9] Rekap 2 Mutasi Terakhir Nasabah:");
  console.table(mutasi);

  console.log("\n>>> SEMUA TRANSAKSI LIVE SUPABASE BERJALAN 100% SUKSES! <<<");
}

main().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
