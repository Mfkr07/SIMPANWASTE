import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLaporanSchema } from "@/lib/validations/laporan";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profil } = await supabase
      .from("profil")
      .select("peran")
      .eq("id", authUser.id)
      .single();

    let query = supabase
      .from("laporan_setoran")
      .select(`
        id,
        metode,
        id_bank_sampah,
        latitude,
        longitude,
        estimasi_berat,
        status,
        tanggal_lapor,
        bank_sampah (id, nama, alamat),
        detail_setoran (
          id,
          id_kategori,
          berat_aktual,
          kondisi,
          subtotal,
          kategori_sampah (id, nama_kategori)
        ),
        penimbangan (
          id,
          tanggal_timbang,
          total_berat,
          total_nilai,
          id_petugas,
          profil:id_petugas (nama)
        )
      `)
      .order("tanggal_lapor", { ascending: false });

    // Jika warga, hanya tampilkan laporannya sendiri
    if (profil?.peran === "warga") {
      query = query.eq("id_pengguna", authUser.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const validated = createLaporanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Data laporan tidak valid", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { metode, id_bank_sampah, latitude, longitude, estimasi_berat, kategori_ids } =
      validated.data;

    // Jika metode pickup, validasi batas minimum pickup dari pengaturan sistem
    if (metode === "pickup") {
      const { data: settings } = await supabase
        .from("pengaturan_sistem")
        .select("batas_minimum_pickup_kg")
        .limit(1)
        .single();

      const batasMin = settings?.batas_minimum_pickup_kg ?? 5.0;

      if (estimasi_berat < batasMin) {
        return NextResponse.json(
          {
            error: `Estimasi berat (${estimasi_berat} kg) di bawah batas minimum penjemputan (${batasMin} kg). Silakan gunakan metode Drop-off ke bank sampah terdekat.`,
          },
          { status: 400 }
        );
      }
    }

    // Insert laporan_setoran
    const { data: laporan, error: laporanError } = await supabase
      .from("laporan_setoran")
      .insert({
        id_pengguna: authUser.id,
        metode,
        id_bank_sampah: metode === "drop_off" ? id_bank_sampah : null,
        latitude: metode === "pickup" ? latitude : null,
        longitude: metode === "pickup" ? longitude : null,
        estimasi_berat,
        status: "menunggu",
      })
      .select()
      .single();

    if (laporanError || !laporan) {
      return NextResponse.json(
        { error: "Gagal membuat laporan: " + (laporanError?.message || "") },
        { status: 500 }
      );
    }

    // Insert placeholder baris kategori ke detail_setoran
    const detailRows = kategori_ids.map((id_kategori) => ({
      id_laporan: laporan.id,
      id_kategori,
    }));

    const { error: detailError } = await supabase
      .from("detail_setoran")
      .insert(detailRows);

    if (detailError) {
      console.error("Gagal menambahkan kategori ke detail_setoran:", detailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Laporan setoran berhasil dibuat",
        laporan,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
