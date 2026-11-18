import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (!authError && authUser) {
      const { data: profil, error: profileError } = await supabase
        .from("profil")
        .select("id, nama, username, no_hp, alamat, peran, created_at")
        .eq("id", authUser.id)
        .single();

      if (!profileError && profil) {
        return NextResponse.json({
          authenticated: true,
          user: profil,
        });
      }
    }

    // Fallback: periksa cookie simpanwaste_user_session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("simpanwaste_user_session")?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        if (parsed && parsed.username) {
          return NextResponse.json({
            authenticated: true,
            user: parsed,
          });
        }
      } catch {}
    }

    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data sesi" },
      { status: 500 }
    );
  }
}
