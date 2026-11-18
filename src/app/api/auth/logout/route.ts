import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });

    response.cookies.delete("simpanwaste_role");
    response.cookies.delete("simpanwaste_user_session");

    return response;
  } catch (err: any) {
    const response = NextResponse.json(
      { error: err.message || "Gagal melakukan logout" },
      { status: 500 }
    );
    response.cookies.delete("simpanwaste_role");
    response.cookies.delete("simpanwaste_user_session");
    return response;
  }
}
