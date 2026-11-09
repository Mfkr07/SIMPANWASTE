import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelLaporanSchema } from "@/lib/validations/laporan";

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
    const validated = cancelLaporanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "ID Laporan tidak valid" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("batalkan_laporan", {
      p_id_laporan: validated.data.id_laporan,
    });

    if (error) {
      return NextResponse.json(
        { error: "Gagal membatalkan laporan: " + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil dibatalkan",
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
