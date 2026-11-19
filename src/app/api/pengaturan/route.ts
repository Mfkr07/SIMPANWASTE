import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pengaturan_sistem")
      .select("id, batas_minimum_pickup_kg, updated_at")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      batas_minimum_pickup_kg: data?.batas_minimum_pickup_kg ?? 5.0,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const val = Number(body.batas_minimum_pickup_kg);

    if (isNaN(val) || val <= 0) {
      return NextResponse.json(
        { error: "Batas minimum pickup harus berupa angka lebih dari 0" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("pengaturan_sistem")
      .select("id")
      .limit(1)
      .single();

    let res;
    if (existing?.id) {
      res = await supabase
        .from("pengaturan_sistem")
        .update({ batas_minimum_pickup_kg: val, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      res = await supabase
        .from("pengaturan_sistem")
        .insert({ batas_minimum_pickup_kg: val })
        .select()
        .single();
    }

    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Batas minimum pickup berhasil diperbarui",
      data: res.data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
