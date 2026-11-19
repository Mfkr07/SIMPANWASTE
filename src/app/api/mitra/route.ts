import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mitra_pengepul")
      .select("*")
      .order("nama", { ascending: true });

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

    const { nama, alamat, kontak } = body;
    if (!nama || !alamat || !kontak) {
      return NextResponse.json(
        { error: "Nama, alamat, dan kontak mitra wajib diisi" },
        { status: 400 }
      );
    }

    const fokus = body.fokus || (Array.isArray(body.materials) ? body.materials.join(", ") : body.materials) || null;
    const insertPayload: Record<string, any> = { nama, alamat, kontak, is_aktif: true };
    if (fokus) {
      insertPayload.fokus = fokus;
    }

    let { data, error } = await supabase
      .from("mitra_pengepul")
      .insert(insertPayload)
      .select()
      .single();

    if (error && error.message.includes("fokus")) {
      delete insertPayload.fokus;
      const retry = await supabase
        .from("mitra_pengepul")
        .insert(insertPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

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
      return NextResponse.json({ error: "ID mitra wajib diberikan" }, { status: 400 });
    }

    const { error } = await supabase.from("mitra_pengepul").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Mitra berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
