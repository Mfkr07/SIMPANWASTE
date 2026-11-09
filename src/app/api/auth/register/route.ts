import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerCompleteSchema } from "@/lib/validations/auth";
import { usernameToEmail } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerCompleteSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Data registrasi tidak valid",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { nama, username, no_hp, alamat, password, pin } = validatedData.data;
    const internalEmail = usernameToEmail(username);
    const supabase = await createClient();

    // 1. Cek apakah username sudah terdaftar di tabel profil
    const { data: existingUser } = await supabase
      .from("profil")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan, silakan pilih username lain" },
        { status: 409 }
      );
    }

    // 2. Buat akun di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: internalEmail,
      password: password,
      options: {
        data: {
          nama,
          username: username.toLowerCase(),
          no_hp,
          alamat,
          peran: "warga",
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Gagal mendaftarkan akun" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 3. Simpan PIN via RPC set_user_pin
    const { error: pinError } = await supabase.rpc("set_user_pin", {
      p_user_id: userId,
      p_pin: pin,
    });

    if (pinError) {
      console.error("Gagal mengeset PIN pengguna:", pinError);
      return NextResponse.json(
        {
          error: "Akun berhasil dibuat tetapi gagal menyimpan PIN: " + pinError.message,
          userId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi warga berhasil",
        user: {
          id: userId,
          nama,
          username: username.toLowerCase(),
          peran: "warga",
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Internal register error:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
