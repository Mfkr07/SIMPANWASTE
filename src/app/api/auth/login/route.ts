import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { usernameToEmail } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Data login tidak valid",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, password, peran } = validatedData.data;
    const internalEmail = usernameToEmail(username);
    const supabase = await createClient();

    // 1. Autentikasi dengan Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Username atau password yang Anda masukkan salah" },
        { status: 401 }
      );
    }

    // 2. Ambil data profil untuk verifikasi peran
    const { data: profil, error: profilError } = await supabase
      .from("profil")
      .select("id, nama, username, no_hp, alamat, peran")
      .eq("id", authData.user.id)
      .single();

    if (profilError || !profil) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Data profil pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Validasi kesesuaian peran dengan tab yang dipilih (AUTH-02)
    if (profil.peran !== peran) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error: `Akun ini terdaftar sebagai peran ${profil.peran.toUpperCase()}, tidak sesuai dengan tab ${peran.toUpperCase()} yang dipilih.`,
        },
        { status: 403 }
      );
    }

    // Tentukan route tujuan sesuai peran
    const redirectMap: Record<string, string> = {
      warga: "/warga/dashboard",
      petugas: "/petugas/dashboard",
      admin: "/admin/dashboard",
    };

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: profil,
      redirectUrl: redirectMap[profil.peran] || "/",
    });
  } catch (err: any) {
    console.error("Login internal error:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
