import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profil } = await supabase
      .from("profil")
      .select("peran")
      .eq("id", authUser.id)
      .single();

    if (profil?.peran !== "admin") {
      return NextResponse.json({ error: "Akses khusus admin" }, { status: 403 });
    }

    // Coba ambil dari View v_admin_dashboard_stats
    const { data: viewData, error: viewError } = await supabase
      .from("v_admin_dashboard_stats")
      .select("*")
      .limit(1)
      .single();

    if (!viewError && viewData) {
      return NextResponse.json({ data: viewData });
    }

    // Fallback agregasi langsung bila view belum terpasang
    const [
      { data: penimbangan },
      { data: setoranTx },
      { count: totalNasabah },
      { count: laporanPending },
      { count: penarikanPending },
    ] = await Promise.all([
      supabase.from("penimbangan").select("total_berat"),
      supabase.from("saldo_transaksi").select("jumlah").eq("jenis", "setoran"),
      supabase.from("profil").select("*", { count: "exact", head: true }).eq("peran", "warga"),
      supabase.from("laporan_setoran").select("*", { count: "exact", head: true }).eq("status", "menunggu"),
      supabase.from("penarikan_saldo").select("*", { count: "exact", head: true }).eq("status", "menunggu"),
    ]);

    const totalSampah = (penimbangan || []).reduce((acc, row: any) => acc + Number(row.total_berat || 0), 0);
    const totalBayar = (setoranTx || []).reduce((acc, row: any) => acc + Number(row.jumlah || 0), 0);

    return NextResponse.json({
      data: {
        total_sampah_terkumpul_kg: Number(totalSampah.toFixed(2)),
        total_pembayaran_sampah_rp: totalBayar,
        total_nasabah_aktif: totalNasabah || 0,
        laporan_pending: laporanPending || 0,
        penarikan_pending: penarikanPending || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
