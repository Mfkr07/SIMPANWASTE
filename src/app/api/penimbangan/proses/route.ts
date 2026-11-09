import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prosesPenimbanganSchema } from "@/lib/validations/penimbangan";

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
    const validated = prosesPenimbanganSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Data penimbangan tidak valid",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id_laporan, items } = validated.data;

    const { data: result, error: rpcError } = await supabase.rpc("proses_penimbangan", {
      p_id_laporan: id_laporan,
      p_detail: items,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: "Gagal memproses penimbangan: " + rpcError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Penimbangan berhasil diproses dan saldo telah diperbarui",
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
