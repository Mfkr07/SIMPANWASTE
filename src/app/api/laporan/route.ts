import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    let dbClient = supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        dbClient = createAdminClient();
      } catch {}
    }

    let query = dbClient
      .from("laporan_setoran")
      .select(`
        *,
        profil:id_pengguna (id, nama, username, no_hp, alamat),
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
          *,
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

    const {
      metode,
      id_bank_sampah,
      latitude,
      longitude,
      estimasi_berat,
      kategori_ids,
      kategori_items,
      catatan_lokasi,
      pickupLocation,
    } = validated.data;

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
    // Siapkan catatan lokasi dan simpan mapping kondisi warga di metadata
    const conditionsMap: Record<string, string[]> = {};
    if (kategori_items && kategori_items.length > 0) {
      kategori_items.forEach((item) => {
        if (item.conditions?.length) {
          conditionsMap[item.id_kategori] = item.conditions;
        }
      });
    }

    let finalLocationNote = catatan_lokasi || pickupLocation || "";
    if (Object.keys(conditionsMap).length > 0) {
      finalLocationNote = (finalLocationNote ? `${finalLocationNote} ` : "") +
        `[KONDISI:${JSON.stringify(conditionsMap)}]`;
    }

    const insertPayload: Record<string, any> = {
      id_pengguna: authUser.id,
      metode,
      id_bank_sampah: metode === "drop_off" ? id_bank_sampah : null,
      latitude: metode === "pickup" ? latitude : null,
      longitude: metode === "pickup" ? longitude : null,
      estimasi_berat,
      status: "menunggu",
    };

    if (finalLocationNote) {
      insertPayload.catatan_lokasi = finalLocationNote;
    }

    let { data: laporan, error: laporanError } = await supabase
      .from("laporan_setoran")
      .insert(insertPayload)
      .select()
      .single();

    if (laporanError && laporanError.message.includes("catatan_lokasi")) {
      delete insertPayload.catatan_lokasi;
      const retry = await supabase
        .from("laporan_setoran")
        .insert(insertPayload)
        .select()
        .single();
      laporan = retry.data;
      laporanError = retry.error;
    }

    if (laporanError || !laporan) {
      return NextResponse.json(
        { error: "Gagal membuat laporan: " + (laporanError?.message || "") },
        { status: 500 }
      );
    }

    // Insert baris kategori ke detail_setoran beserta estimasi kondisi dari warga
    const detailRows =
      kategori_items && kategori_items.length > 0
        ? kategori_items.map((item) => ({
            id_laporan: laporan.id,
            id_kategori: item.id_kategori,
            kondisi: item.kondisi || "bersih",
          }))
        : (kategori_ids || []).map((id_kategori) => ({
            id_laporan: laporan.id,
            id_kategori,
            kondisi: "bersih",
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
