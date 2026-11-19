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

    const { id_penarikan, status, alasan_penolakan, bukti_transfer_url } = validated.data;
    const proofUrl = bukti_transfer_url || (body.proof && typeof body.proof === "object" ? body.proof.dataUrl : body.proof) || null;

    let { data: result, error: rpcError } = await supabase.rpc("proses_penarikan", {
      p_id_penarikan: id_penarikan,
      p_status: status,
      p_alasan_penolakan: alasan_penolakan || null,
      p_bukti_transfer_url: proofUrl,
    });

    if (rpcError && rpcError.message.includes("proses_penarikan")) {
      const fallback = await supabase.rpc("proses_penarikan", {
        p_id_penarikan: id_penarikan,
        p_status: status,
        p_alasan_penolakan: alasan_penolakan || null,
      });
      result = fallback.data;
      rpcError = fallback.error;

      if (!rpcError && proofUrl) {
        try {
          await supabase
            .from("penarikan_saldo")
            .update({ bukti_transfer_url: proofUrl })
            .eq("id", id_penarikan);
        } catch {}
      }
    }

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
