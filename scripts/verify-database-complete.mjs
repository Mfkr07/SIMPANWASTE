import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bdohycgujirvxuljgchg.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkb2h5Y2d1amlydnh1bGpnY2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMzg5MjQsImV4cCI6MjEwOTgxNDkyNH0.OcSXxc7rwB9PnosYdBmC2Ewraifj0UWcO2b2KA3394E";

const dummyBase64PhotoTimbang = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
const dummyBase64ProofTransfer = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function runVerification() {
  console.log("===============================================================");
  console.log("  SIMPANWASTE - COMPREHENSIVE BACKEND VERIFICATION");
  console.log("===============================================================\n");

  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  // --------------------------------------------------------------------------
  // TEST 1: VERIFIKASI KOLOM BARU DI SCHEMA POSTGRESQL
  // --------------------------------------------------------------------------
  console.log("[TEST 1] Memeriksa keberadaan kolom-kolom baru di PostgreSQL...");

  // 1a. Laporan Setoran - catatan_lokasi
  const t1a = await anonClient.from("laporan_setoran").select("id, catatan_lokasi").limit(1);
  if (t1a.error) throw new Error("Gagal memeriksa laporan_setoran.catatan_lokasi: " + t1a.error.message);
  console.log("  ✓ Kolom 'laporan_setoran.catatan_lokasi' TERDETEKSI & VALID");

  // 1b. Penimbangan - foto_bukti_url
  const t1b = await anonClient.from("penimbangan").select("id, foto_bukti_url").limit(1);
  if (t1b.error) throw new Error("Gagal memeriksa penimbangan.foto_bukti_url: " + t1b.error.message);
  console.log("  ✓ Kolom 'penimbangan.foto_bukti_url' TERDETEKSI & VALID");

  // 1c. Penarikan Saldo - keterangan & bukti_transfer_url
  const t1c = await anonClient.from("penarikan_saldo").select("id, keterangan, bukti_transfer_url").limit(1);
  if (t1c.error) throw new Error("Gagal memeriksa penarikan_saldo (keterangan, bukti_transfer_url): " + t1c.error.message);
  console.log("  ✓ Kolom 'penarikan_saldo.keterangan' & 'bukti_transfer_url' TERDETEKSI & VALID");

  // 1d. Mitra Pengepul - fokus
  const t1d = await anonClient.from("mitra_pengepul").select("id, fokus").limit(1);
  if (t1d.error) throw new Error("Gagal memeriksa mitra_pengepul.fokus: " + t1d.error.message);
  console.log("  ✓ Kolom 'mitra_pengepul.fokus' TERDETEKSI & VALID");

  // --------------------------------------------------------------------------
  // TEST 2: AUTENTIKASI WARGA & PEMBUATAN LAPORAN DENGAN CATATAN LOKASI
  // --------------------------------------------------------------------------
  console.log("\n[TEST 2] Autentikasi Warga & Pembuatan Laporan Setoran Baru...");
  const { data: authWarga, error: errAuthWarga } = await anonClient.auth.signInWithPassword({
    email: "ayu.lestari@simpanwaste.local",
    password: "Password123!",
  });
  if (errAuthWarga) throw new Error("Login Warga gagal: " + errAuthWarga.message);
  console.log("  ✓ Warga login berhasil (ID: " + authWarga.user.id + ")");

  const wargaClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authWarga.session.access_token}` } },
  });

  const { data: saldoAwal } = await wargaClient.rpc("get_user_saldo", { p_user_id: authWarga.user.id });
  console.log("  ✓ Saldo awal nasabah: Rp " + saldoAwal);

  const catatanLokasiExpected = "Komplek Griya Sukarami Blok C-12, Pagar Hitam Dekat Masjid Al-Ikhlas";
  const { data: newReport, error: errNewReport } = await wargaClient
    .from("laporan_setoran")
    .insert({
      id_pengguna: authWarga.user.id,
      metode: "pickup",
      latitude: -2.9463,
      longitude: 104.7391,
      catatan_lokasi: catatanLokasiExpected,
      estimasi_berat: 6.0,
      status: "menunggu",
    })
    .select()
    .single();

  if (errNewReport) throw new Error("Gagal membuat laporan dengan catatan_lokasi: " + errNewReport.message);
  if (newReport.catatan_lokasi !== catatanLokasiExpected) {
    throw new Error("Catatan lokasi tidak tersimpan sesuai ekspektasi: " + newReport.catatan_lokasi);
  }
  console.log("  ✓ Laporan berhasil dibuat dengan catatan_lokasi tersimpan persis!");
  console.log("    -> ID: " + newReport.id);
  console.log("    -> Catatan Lokasi: '" + newReport.catatan_lokasi + "'");

  // --------------------------------------------------------------------------
  // TEST 3: PETUGAS MEMULAI PENJEMPUTAN (RPC mulai_penjemputan)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 3] Petugas Autentikasi & Menjalankan RPC mulai_penjemputan...");
  const { data: authPetugas, error: errAuthPetugas } = await anonClient.auth.signInWithPassword({
    email: "rizky.p@simpanwaste.local",
    password: "Password123!",
  });
  if (errAuthPetugas) throw new Error("Login Petugas gagal: " + errAuthPetugas.message);

  const petugasClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authPetugas.session.access_token}` } },
  });

  const { data: rpcJemput, error: errRpcJemput } = await petugasClient.rpc("mulai_penjemputan", {
    p_id_laporan: newReport.id,
  });
  if (errRpcJemput) throw new Error("Gagal menjalankan RPC mulai_penjemputan: " + errRpcJemput.message);
  console.log("  ✓ RPC 'mulai_penjemputan' BERHASIL: status -> " + rpcJemput.status);

  // --------------------------------------------------------------------------
  // TEST 4: PENIMBANGAN FISIK DENGAN FOTO BUKTI BASE64 (RPC proses_penimbangan)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 4] Petugas Memproses Penimbangan Fisik + Foto Bukti Base64...");
  const { data: rpcTimbang, error: errRpcTimbang } = await petugasClient.rpc("proses_penimbangan", {
    p_id_laporan: newReport.id,
    p_detail: [
      {
        id_kategori: "11111111-1111-1111-1111-111111111102", // Plastik
        berat_aktual: 4.0,
        kondisi: "bersih", // 4kg x 3000 = Rp 12.000
      },
      {
        id_kategori: "11111111-1111-1111-1111-111111111104", // Kertas
        berat_aktual: 2.0,
        kondisi: "bersih", // 2kg x 2000 = Rp 4.000
      },
    ],
    p_foto_bukti_url: dummyBase64PhotoTimbang,
  });

  if (errRpcTimbang) throw new Error("Gagal menjalankan RPC proses_penimbangan: " + errRpcTimbang.message);
  console.log("  ✓ RPC 'proses_penimbangan' BERHASIL:");
  console.log("    -> Total Berat: " + rpcTimbang.total_berat + " kg");
  console.log("    -> Total Nilai: Rp " + rpcTimbang.total_nilai);
  console.log("    -> Saldo Baru Nasabah: Rp " + rpcTimbang.saldo_baru);

  // Verifikasi foto tersimpan di tabel penimbangan
  const { data: rowPenimbangan } = await petugasClient
    .from("penimbangan")
    .select("id, foto_bukti_url")
    .eq("id", rpcTimbang.id_penimbangan)
    .single();

  if (!rowPenimbangan?.foto_bukti_url || !rowPenimbangan.foto_bukti_url.startsWith("data:image/jpeg;base64,")) {
    throw new Error("Foto bukti penimbangan tidak tersimpan dengan benar di kolom foto_bukti_url!");
  }
  console.log("  ✓ Foto bukti penimbangan (Base64) tersimpan sempurna di database!");

  // Verifikasi saldo nasabah dihitung akurat
  const { data: saldoSetelahTimbang } = await wargaClient.rpc("get_user_saldo", { p_user_id: authWarga.user.id });
  const selisihTimbang = Number(saldoSetelahTimbang) - Number(saldoAwal);
  if (selisihTimbang !== 16000) {
    throw new Error(`Perhitungan saldo tidak akurat. Ekspektasi selisih +16000, realita: +${selisihTimbang}`);
  }
  console.log("  ✓ Mutasi saldo atomik terverifikasi akurat: Saldo bertambah tepat Rp " + selisihTimbang);

  // --------------------------------------------------------------------------
  // TEST 5: PENARIKAN SALDO DENGAN KETERANGAN (RPC ajukan_penarikan)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 5] Warga Mengajukan Penarikan Saldo dengan Keterangan & PIN...");
  const keteranganPenarikanExpected = "Pencairan tabungan untuk beli perlengkapan sekolah";
  const jumlahTarik = 10000;

  // Verifikasi proteksi PIN salah
  const { error: errPinSalah } = await wargaClient.rpc("ajukan_penarikan", {
    p_jumlah: jumlahTarik,
    p_tujuan: "tarik_tabungan",
    p_pin: "999999", // PIN sengaja salah
    p_keterangan: keteranganPenarikanExpected,
  });
  if (!errPinSalah) {
    throw new Error("Validasi keamanan gagal: PIN salah tidak ditolak sistem!");
  }
  console.log("  ✓ Validasi keamanan PIN terkonfirmasi aktif (PIN salah berhasil ditolak)");

  // Ajukan dengan PIN benar
  const { data: rpcTarik, error: errRpcTarik } = await wargaClient.rpc("ajukan_penarikan", {
    p_jumlah: jumlahTarik,
    p_tujuan: "tarik_tabungan",
    p_pin: "123456",
    p_keterangan: keteranganPenarikanExpected,
  });
  if (errRpcTarik) throw new Error("Gagal ajukan penarikan: " + errRpcTarik.message);
  console.log("  ✓ RPC 'ajukan_penarikan' BERHASIL (ID Penarikan: " + rpcTarik.id_penarikan + ")");

  // Verifikasi kolom keterangan tersimpan
  const { data: rowTarik } = await wargaClient
    .from("penarikan_saldo")
    .select("id, keterangan, status")
    .eq("id", rpcTarik.id_penarikan)
    .single();

  if (rowTarik?.keterangan !== keteranganPenarikanExpected) {
    throw new Error("Keterangan penarikan tidak tersimpan di database: " + rowTarik?.keterangan);
  }
  console.log("  ✓ Kolom keterangan penarikan tersimpan sempurna: '" + rowTarik.keterangan + "'");

  // --------------------------------------------------------------------------
  // TEST 6: ADMIN MEMPROSES PENARIKAN DENGAN BUKTI TRANSFER (RPC proses_penarikan)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 6] Admin Memproses Penarikan Saldo + Bukti Transfer Base64...");
  const { data: authAdmin, error: errAuthAdmin } = await anonClient.auth.signInWithPassword({
    email: "admin.simpan@simpanwaste.local",
    password: "Password123!",
  });
  if (errAuthAdmin) throw new Error("Login Admin gagal: " + errAuthAdmin.message);

  const adminClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authAdmin.session.access_token}` } },
  });

  const { data: rpcProsesTarik, error: errRpcProsesTarik } = await adminClient.rpc("proses_penarikan", {
    p_id_penarikan: rpcTarik.id_penarikan,
    p_status: "selesai",
    p_alasan_penolakan: null,
    p_bukti_transfer_url: dummyBase64ProofTransfer,
  });

  if (errRpcProsesTarik) throw new Error("Gagal proses penarikan: " + errRpcProsesTarik.message);
  console.log("  ✓ RPC 'proses_penarikan' BERHASIL: status -> " + rpcProsesTarik.status);

  // Verifikasi bukti_transfer_url tersimpan di penarikan_saldo
  const { data: rowTarikSelesai } = await adminClient
    .from("penarikan_saldo")
    .select("id, status, bukti_transfer_url")
    .eq("id", rpcTarik.id_penarikan)
    .single();

  if (!rowTarikSelesai?.bukti_transfer_url || !rowTarikSelesai.bukti_transfer_url.startsWith("data:image/jpeg;base64,")) {
    throw new Error("Bukti transfer tidak tersimpan di database!");
  }
  console.log("  ✓ Bukti transfer (Base64) tersimpan sempurna di database!");

  // Verifikasi saldo terpotong atomik
  const { data: saldoAkhir } = await wargaClient.rpc("get_user_saldo", { p_user_id: authWarga.user.id });
  const saldoEkspektasi = Number(saldoSetelahTimbang) - jumlahTarik;
  if (Number(saldoAkhir) !== saldoEkspektasi) {
    throw new Error(`Saldo akhir tidak sesuai. Ekspektasi: ${saldoEkspektasi}, Realita: ${saldoAkhir}`);
  }
  console.log("  ✓ Potong saldo terverifikasi akurat: Saldo akhir Rp " + saldoAkhir);

  // --------------------------------------------------------------------------
  // TEST 7: VIEW DASHBOARD ADMIN (v_admin_dashboard_stats)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 7] Membaca View Dinamis Dashboard Admin (v_admin_dashboard_stats)...");
  const { data: stats, error: errStats } = await adminClient
    .from("v_admin_dashboard_stats")
    .select("*")
    .single();

  if (errStats) throw new Error("Gagal membaca v_admin_dashboard_stats: " + errStats.message);
  console.log("  ✓ View 'v_admin_dashboard_stats' BERFUNGSI SEMPURNA:");
  console.log("    -> Total Sampah Terkumpul  : " + stats.total_sampah_terkumpul_kg + " kg");
  console.log("    -> Total Pembayaran Sampah : Rp " + stats.total_pembayaran_sampah_rp);
  console.log("    -> Total Nasabah Aktif     : " + stats.total_nasabah_aktif + " orang");
  console.log("    -> Laporan Pending         : " + stats.laporan_pending);
  console.log("    -> Penarikan Pending       : " + stats.penarikan_pending);

  // --------------------------------------------------------------------------
  // TEST 8: MASTER DATA MITRA DENGAN KOLOM FOKUS
  // --------------------------------------------------------------------------
  console.log("\n[TEST 8] Memeriksa Master Mitra dengan Kolom Fokus...");
  const dummyMitraNama = "PT Palembang Recycle Mandiri " + Date.now().toString().slice(-4);
  const { data: mitraCreated, error: errMitra } = await adminClient
    .from("mitra_pengepul")
    .insert({
      nama: dummyMitraNama,
      alamat: "Kawasan Industri Keramasan, Kertapati",
      kontak: "0812-7000-8000",
      fokus: "Kardus, Kertas HVS, Duplex",
      is_aktif: true,
    })
    .select()
    .single();

  if (errMitra) throw new Error("Gagal insert mitra dengan fokus: " + errMitra.message);
  if (mitraCreated.fokus !== "Kardus, Kertas HVS, Duplex") {
    throw new Error("Kolom fokus pada mitra tidak tersimpan!");
  }
  console.log("  ✓ Master mitra dengan kolom 'fokus' tersimpan sempurna: '" + mitraCreated.fokus + "'");

  console.log("\n===============================================================");
  console.log("  HASIL AKHIR: 100% SEMPURNA! SELURUH BACKEND SIAP DEPLOY!");
  console.log("===============================================================");
}

runVerification().catch((err) => {
  console.error("\n❌ GAGAL PADA TAHAP PENGUJIAN:", err.message);
  process.exit(1);
});
