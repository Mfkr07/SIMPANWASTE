import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("kategori_sampah")
      .select(`
        id,
        nama_kategori,
        deskripsi,
        is_aktif,
        harga_sampah (
          id,
          kondisi,
          harga_per_kg
        )
      `)
      .eq("is_aktif", true)
      .order("nama_kategori", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
