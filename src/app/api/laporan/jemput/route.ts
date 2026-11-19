import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

    if (!profil || (profil.peran !== "petugas" && profil.peran !== "admin")) {
      return NextResponse.json(
        { error: "Akses ditolak: hanya petugas atau admin yang dapat memulai penjemputan" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_laporan } = body;

    if (!id_laporan) {
      return NextResponse.json({ error: "ID Laporan wajib diisi" }, { status: 400 });
    }

    // Coba via RPC mulai_penjemputan
    const { data: rpcData, error: rpcError } = await supabase.rpc("mulai_penjemputan", {
      p_id_laporan: id_laporan,
    });

    if (!rpcError) {
      return NextResponse.json(rpcData);
    }

    // Fallback bila RPC belum terpasang di database live
    const { data: updated, error: updateError } = await supabase
      .from("laporan_setoran")
      .update({ status: "dalam_proses" })
      .eq("id", id_laporan)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id_laporan,
      status: "dalam_proses",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
