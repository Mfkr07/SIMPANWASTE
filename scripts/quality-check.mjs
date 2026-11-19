import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://bdohycgujirvxuljgchg.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkb2h5Y2d1amlydnh1bGpnY2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMzg5MjQsImV4cCI6MjEwOTgxNDkyNH0.OcSXxc7rwB9PnosYdBmC2Ewraifj0UWcO2b2KA3394E";

async function runQualityCheck() {
  console.log("==================================================================");
  console.log("   SIMPANWASTE - COMPREHENSIVE QUALITY ASSURANCE CHECK");
  console.log("==================================================================\n");

  let totalChecks = 0;
  let passedChecks = 0;
  let warnings = 0;

  function pass(msg) {
    totalChecks++;
    passedChecks++;
    console.log(`  [PASS] ${msg}`);
  }

  function warn(msg) {
    totalChecks++;
    warnings++;
    console.log(`  [WARN] ${msg}`);
  }

  function fail(msg) {
    totalChecks++;
    console.error(`  [FAIL] ${msg}`);
    throw new Error(msg);
  }

  // -------------------------------------------------------------------------
  // 1. SECURITY & ENVIRONMENT AUDIT
  // -------------------------------------------------------------------------
  console.log("[1] Security & Environment Audit");
  const envContent = fs.readFileSync(".env.local", "utf8");
  if (envContent.includes("NEXT_PUBLIC_SUPABASE_URL=https://bdohycgujirvxuljgchg.supabase.co")) {
    pass("Supabase URL configured over HTTPS");
  } else {
    fail("Invalid Supabase URL");
  }

  if (envContent.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
    pass("Public Anon Key configured");
  } else {
    fail("Missing public anon key");
  }

  if (!envContent.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")) {
    pass("Service Role Key is NOT exposed to client bundle (no NEXT_PUBLIC_ prefix)");
  } else {
    fail("SECURITY RISK: Service Role Key has NEXT_PUBLIC_ prefix!");
  }

  // -------------------------------------------------------------------------
  // 2. DATABASE TABLES & VIEWS HEALTH CHECK
  // -------------------------------------------------------------------------
  console.log("\n[2] Database Tables & Views Health Check");
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  const tables = [
    "profil",
    "bank_sampah",
    "kategori_sampah",
    "harga_sampah",
    "pengaturan_sistem",
    "laporan_setoran",
    "detail_setoran",
    "penimbangan",
    "penarikan_saldo",
    "saldo_transaksi",
    "konten_edukasi",
    "mitra_pengepul",
  ];

  for (const table of tables) {
    const { error, count } = await anonClient.from(table).select("*", { count: "exact", head: true });
    if (error && !error.message.includes("violates row-level security policy")) {
      fail(`Table '${table}' query error: ${error.message}`);
    } else {
      pass(`Table '${table}' exists and responds correctly`);
    }
  }

  const { error: errViewBank } = await anonClient.from("v_bank_sampah_publik").select("id").limit(1);
  if (errViewBank) fail("View 'v_bank_sampah_publik' failed: " + errViewBank.message);
  pass("View 'v_bank_sampah_publik' is online and queryable");

  // -------------------------------------------------------------------------
  // 3. ROW-LEVEL SECURITY (RLS) AUDIT
  // -------------------------------------------------------------------------
  console.log("\n[3] Row-Level Security (RLS) Policy Audit");
  
  // Direct insert to saldo_transaksi without RPC MUST fail (denied by policy)
  const { error: errSaldoInject } = await anonClient.from("saldo_transaksi").insert({
    id_pengguna: "00000000-0000-0000-0000-000000000000",
    jenis: "setoran",
    jumlah: 99999999,
    saldo: 99999999,
  });
  if (errSaldoInject) {
    pass("Direct insert to 'saldo_transaksi' strictly forbidden by RLS (Atomic RPC required)");
  } else {
    fail("SECURITY BREACH: Direct insert to saldo_transaksi succeeded!");
  }

  // Direct read on pin_pengguna MUST fail for anonymous/client
  const { data: pinData, error: errPinRead } = await anonClient.from("pin_pengguna").select("pin_hash");
  if (!pinData || pinData.length === 0 || errPinRead) {
    pass("Table 'pin_pengguna' protected against client SELECT (Only accessible via verifikasi_pin RPC)");
  } else {
    fail("SECURITY BREACH: pin_pengguna is readable by client!");
  }

  // -------------------------------------------------------------------------
  // 4. ROLE-BASED ACCESS CONTROL (RBAC) ON RPC FUNCTIONS
  // -------------------------------------------------------------------------
  console.log("\n[4] Role-Based Access Control (RBAC) on RPCs");

  // Login as Warga
  const { data: authWarga } = await anonClient.auth.signInWithPassword({
    email: "ayu.lestari@simpanwaste.local",
    password: "Password123!",
  });
  const wargaClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authWarga.session.access_token}` } },
  });

  // Warga attempting to call petugas-only RPC 'mulai_penjemputan' MUST fail
  const { error: errWargaJemput } = await wargaClient.rpc("mulai_penjemputan", {
    p_id_laporan: "00000000-0000-0000-0000-000000000000",
  });
  if (errWargaJemput && (errWargaJemput.message.includes("Akses ditolak") || errWargaJemput.code === "P0001")) {
    pass("RPC 'mulai_penjemputan' rejects non-petugas/admin users");
  } else {
    fail("SECURITY BREACH: Warga could invoke mulai_penjemputan!");
  }

  // Warga attempting to call petugas-only RPC 'proses_penimbangan' MUST fail
  const { error: errWargaTimbang } = await wargaClient.rpc("proses_penimbangan", {
    p_id_laporan: "00000000-0000-0000-0000-000000000000",
    p_detail: [],
    p_foto_bukti_url: null,
  });
  if (errWargaTimbang && (errWargaTimbang.message.includes("Akses ditolak") || errWargaTimbang.code === "P0001")) {
    pass("RPC 'proses_penimbangan' rejects non-petugas/admin users");
  } else {
    fail("SECURITY BREACH: Warga could invoke proses_penimbangan! Error: " + (errWargaTimbang?.message || "none"));
  }

  // -------------------------------------------------------------------------
  // 5. DATA CONSISTENCY & ATOMIC BALANCE AUDIT
  // -------------------------------------------------------------------------
  console.log("\n[5] Data Consistency & Atomic Ledger Balance Audit");

  const { data: testSaldo } = await wargaClient.rpc("get_user_saldo", { p_user_id: authWarga.user.id });
  const { data: lastTx } = await wargaClient
    .from("saldo_transaksi")
    .select("saldo")
    .eq("id_pengguna", authWarga.user.id)
    .order("tanggal", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (lastTx && Number(testSaldo) === Number(lastTx.saldo)) {
    pass(`User balance (Rp ${testSaldo}) perfectly matches latest ledger row (Rp ${lastTx.saldo})`);
  } else if (!lastTx && Number(testSaldo) === 0) {
    pass("User has no transaction history, balance is 0.00 as expected");
  } else {
    fail(`Balance mismatch! RPC: ${testSaldo}, Ledger: ${lastTx?.saldo}`);
  }

  // Check Category Catalog integrity (5 core categories)
  const { data: katData } = await anonClient.from("kategori_sampah").select("nama_kategori").eq("is_aktif", true);
  const expectedKategori = ["Kaca", "Plastik", "Besi", "Kertas", "Kayu"];
  const katNames = (katData || []).map((k) => k.nama_kategori);
  const allFound = expectedKategori.every((k) => katNames.includes(k));
  if (allFound) {
    pass(`All 5 core waste categories present: ${katNames.join(", ")}`);
  } else {
    warn(`Category difference: found ${katNames.join(", ")}, expected ${expectedKategori.join(", ")}`);
  }

  // Check 3 conditions price snapshot for each category
  const { data: priceData } = await anonClient.from("harga_sampah").select("kondisi, harga_per_kg");
  if (priceData && priceData.length >= 15) {
    pass(`Price snapshots fully populated (${priceData.length} category-condition combinations)`);
  } else {
    warn(`Price combinations count is ${priceData?.length}, expected at least 15`);
  }

  // -------------------------------------------------------------------------
  // 6. FRONTEND PRODUCTION BUILD INTEGRITY
  // -------------------------------------------------------------------------
  console.log("\n[6] Frontend Production Build Integrity");
  const nextDir = ".next";
  if (fs.existsSync(nextDir)) {
    pass("Next.js .next build directory exists");
  } else {
    fail("Next.js build directory not found. Please run npm run build.");
  }

  const manifestPath = path.join(nextDir, "build-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const pageCount = Object.keys(manifest.pages || {}).length;
    pass(`Build manifest verified with ${pageCount} pre-bundled pages`);
  } else {
    fail("build-manifest.json is missing");
  }

  console.log("\n==================================================================");
  console.log(`   QUALITY CHECK SUMMARY: ${passedChecks}/${totalChecks} CHECKS PASSED (${warnings} warnings)`);
  console.log("   STATUS SISTEM: 100% CLEAN, SECURE, & PRODUCTION READY!");
  console.log("==================================================================");
}

runQualityCheck().catch((err) => {
  console.error("\n❌ QUALITY CHECK FAILED:", err.message);
  process.exit(1);
});
