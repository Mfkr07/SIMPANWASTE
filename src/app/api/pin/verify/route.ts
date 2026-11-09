import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPinSchema } from "@/lib/validations/auth";

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

    const body = await request.json();
    const validated = verifyPinSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Format PIN harus tepat 6 digit angka" },
        { status: 400 }
      );
    }

    const { data: isValid, error: rpcError } = await supabase.rpc("verifikasi_pin", {
      p_user_id: authUser.id,
      p_pin: validated.data.pin,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: "Gagal memverifikasi PIN: " + rpcError.message },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, valid: false, error: "PIN yang Anda masukkan salah" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: "PIN terverifikasi",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal memverifikasi PIN" },
      { status: 500 }
    );
  }
}
