import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ajukanPenarikanSchema } from "@/lib/validations/penarikan";

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
    const validated = ajukanPenarikanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Data pengajuan penarikan tidak valid",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { jumlah, tujuan, pin } = validated.data;

    const { data: result, error: rpcError } = await supabase.rpc("ajukan_penarikan", {
      p_jumlah: jumlah,
      p_tujuan: tujuan,
      p_pin: pin,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: "Gagal mengajukan penarikan: " + rpcError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pengajuan penarikan saldo berhasil dikirim dan menunggu verifikasi petugas",
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
