import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("distribusi_mitra")
      .select(`
        id,
        berat,
        tanggal,
        catatan,
        mitra:id_mitra (id, nama, alamat),
        kategori:id_kategori (id, nama_kategori)
      `)
      .order("tanggal", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id_mitra, id_kategori, berat, tanggal, catatan } = body;
    if (!id_mitra || !id_kategori || !berat) {
      return NextResponse.json(
        { error: "Mitra, kategori, dan berat wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("distribusi_mitra")
      .insert({
        id_mitra,
        id_kategori,
        berat: Number(berat),
        tanggal: tanggal || new Date().toISOString(),
        catatan: catatan || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID distribusi wajib diberikan" }, { status: 400 });
    }

    const { error } = await supabase.from("distribusi_mitra").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Catatan distribusi berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
