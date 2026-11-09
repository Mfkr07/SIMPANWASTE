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
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const { data: profil, error: profileError } = await supabase
      .from("profil")
      .select("id, nama, username, no_hp, alamat, peran, created_at")
      .eq("id", authUser.id)
      .single();

    if (profileError || !profil) {
      return NextResponse.json(
        { error: "Profil pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: profil,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data sesi" },
      { status: 500 }
    );
  }
}
