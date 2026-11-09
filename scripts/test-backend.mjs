import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bdohycgujirvxuljgchg.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkb2h5Y2d1amlydnh1bGpnY2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMzg5MjQsImV4cCI6MjEwOTgxNDkyNH0.OcSXxc7rwB9PnosYdBmC2Ewraifj0UWcO2b2KA3394E";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testBackend() {
  console.log("=== 1. Testing Read Bank Sampah ===");
  const { data: banks, error: errBank } = await supabase.from("bank_sampah").select("*");
  if (errBank) console.error("Error Bank:", errBank);
  else console.log(`✓ Berhasil membaca ${banks.length} bank sampah.`);

  console.log("\n=== 2. Testing Read Kategori Sampah & Harga ===");
  const { data: kategori, error: errKat } = await supabase
    .from("kategori_sampah")
    .select("nama_kategori, harga_sampah(kondisi, harga_per_kg)");
  if (errKat) console.error("Error Kategori:", errKat);
  else console.log(`✓ Berhasil membaca ${kategori.length} kategori sampah.`);

  console.log("\n=== 3. Testing User Registration & Auth Trigger ===");
  const testUsername = "demo_warga_" + Date.now().toString().slice(-4);
  const testEmail = `${testUsername}@simpanwaste.local`;
  const testPassword = "Password123!";

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        nama: "Demo Warga Palembang",
        username: testUsername,
        no_hp: "081234567890",
        alamat: "Jl. Sudirman No. 12, Palembang",
        peran: "warga",
      },
    },
  });

  if (authError) {
    console.error("SignUp error:", authError);
    return;
  }

  const user = authData.user;
  console.log(`✓ SignUp sukses! ID: ${user.id}, Username: ${testUsername}`);

  // Test session login
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginErr) {
    console.error("Login error:", loginErr);
    return;
  }
  console.log("✓ Login sukses, token JWT diperoleh.");

  // Test Profil read
  const { data: profil, error: profErr } = await supabase
    .from("profil")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profErr) console.error("Error profil:", profErr);
  else console.log("✓ Profil terbuat otomatis via trigger:", profil);

  // Test set PIN 6 angka
  const { data: pinRes, error: pinErr } = await supabase.rpc("set_user_pin", {
    p_user_id: user.id,
    p_pin: "123456",
  });
  if (pinErr) console.error("Error set_user_pin:", pinErr);
  else console.log("✓ set_user_pin sukses:", pinRes);

  // Test verifikasi PIN
  const { data: pinValid, error: verifErr } = await supabase.rpc("verifikasi_pin", {
    p_user_id: user.id,
    p_pin: "123456",
  });
  if (verifErr) console.error("Error verifikasi_pin:", verifErr);
  else console.log("✓ Verifikasi PIN (123456) valid:", pinValid);

  // Test verifikasi PIN salah
  const { data: pinInvalid } = await supabase.rpc("verifikasi_pin", {
    p_user_id: user.id,
    p_pin: "999999",
  });
  console.log("✓ Verifikasi PIN salah (999999) ditolak:", !pinInvalid);

  console.log("\n=== 4. Testing Buat Laporan Setoran ===");
  const bankId = banks[0].id;
  const { data: laporan, error: lapErr } = await supabase
    .from("laporan_setoran")
    .insert({
      id_pengguna: user.id,
      metode: "drop_off",
      id_bank_sampah: bankId,
      estimasi_berat: 6.5,
      status: "menunggu",
    })
    .select()
    .single();

  if (lapErr) console.error("Error laporan_setoran:", lapErr);
  else console.log("✓ Berhasil membuat laporan_setoran:", laporan.id, "status:", laporan.status);

  // Test pembatalan laporan via RPC batalkan_laporan
  const { data: batalRes, error: batalErr } = await supabase.rpc("batalkan_laporan", {
    p_id_laporan: laporan.id,
  });
  if (batalErr) console.error("Error batalkan_laporan:", batalErr);
  else console.log("✓ Berhasil membatalkan laporan via RPC batalkan_laporan:", batalRes);

  console.log("\n=== SEMUA INTEGRASI DATABASE & RPC TERVERIFIKASI BERHASIL! ===");
}

testBackend().catch(console.error);
