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

    let query = supabase
      .from("penarikan_saldo")
      .select(`
        id,
        jumlah,
        tujuan,
        status,
        alasan_penolakan,
        tanggal_ajuan,
        tanggal_proses,
        profil:id_pengguna (id, nama, username, no_hp),
        petugas:id_petugas (nama)
      `)
      .order("tanggal_ajuan", { ascending: false });

    if (profil?.peran === "warga") {
      query = query.eq("id_pengguna", authUser.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
