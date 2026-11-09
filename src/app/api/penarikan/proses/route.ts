import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prosesPenarikanSchema } from "@/lib/validations/penarikan";

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
    const validated = prosesPenarikanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Data pemrosesan penarikan tidak valid",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id_penarikan, status, alasan_penolakan } = validated.data;

    const { data: result, error: rpcError } = await supabase.rpc("proses_penarikan", {
      p_id_penarikan: id_penarikan,
      p_status: status,
      p_alasan_penolakan: alasan_penolakan || null,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: "Gagal memproses penarikan: " + rpcError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        status === "selesai"
          ? "Penarikan saldo telah berhasil diproses dan saldo nasabah dipotong"
          : "Pengajuan penarikan saldo telah ditolak",
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
