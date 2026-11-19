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

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { nama_kategori, deskripsi, prices } = body;

    if (!nama_kategori) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    // Insert kategori
    const { data: kat, error: katErr } = await supabase
      .from("kategori_sampah")
      .insert({ nama_kategori, deskripsi: deskripsi || "", is_aktif: true })
      .select()
      .single();

    if (katErr) {
      return NextResponse.json({ error: katErr.message }, { status: 500 });
    }

    // Insert 3 condition prices if provided
    if (prices && typeof prices === "object") {
      const priceRows = [
        { id_kategori: kat.id, kondisi: "bersih", harga_per_kg: Number(prices.bersih ?? prices["Sudah dipilah"] ?? 1000) },
        { id_kategori: kat.id, kondisi: "kotor", harga_per_kg: Number(prices.kotor ?? prices["Belum dipilah dan dibersihkan"] ?? 600) },
        { id_kategori: kat.id, kondisi: "tercampur_air", harga_per_kg: Number(prices.tercampur_air ?? prices["Tidak mudah didaur ulang"] ?? 300) },
      ];
      await supabase.from("harga_sampah").insert(priceRows);
    }

    return NextResponse.json({ success: true, data: kat }, { status: 201 });
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
      return NextResponse.json({ error: "ID kategori wajib diberikan" }, { status: 400 });
    }

    const { error } = await supabase.from("kategori_sampah").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
