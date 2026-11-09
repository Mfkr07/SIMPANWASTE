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

    // 1. Ambil saldo terkini via RPC get_user_saldo
    const { data: saldoTerkini, error: saldoError } = await supabase.rpc("get_user_saldo", {
      p_user_id: authUser.id,
    });

    if (saldoError) {
      return NextResponse.json(
        { error: "Gagal memuat saldo: " + saldoError.message },
        { status: 500 }
      );
    }

    // 2. Ambil riwayat ledger transaksi
    const { data: transaksi, error: transaksiError } = await supabase
      .from("saldo_transaksi")
      .select(`
        id,
        jenis,
        jumlah,
        tanggal,
        saldo,
        penimbangan (
          id,
          total_berat,
          total_nilai,
          tanggal_timbang,
          laporan_setoran (metode)
        ),
        penarikan_saldo (
          id,
          tujuan,
          status,
          tanggal_ajuan
        )
      `)
      .eq("id_pengguna", authUser.id)
      .order("tanggal", { ascending: false });

    if (transaksiError) {
      return NextResponse.json(
        { error: "Gagal memuat riwayat transaksi: " + transaksiError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      saldo: Number(saldoTerkini || 0),
      transaksi: transaksi || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
