import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLaporanSchema, updateLaporanSchema } from "@/lib/validations/laporan";

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

    const { metode, id_bank_sampah, latitude, longitude, estimasi_berat, kategori_ids, catatan_lokasi, pickupLocation } =
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
            error: `Estimasi berat (${estimasi_berat} kg) di bawah batas minimum penjemputan (${batasMin} kg). Silakan gunakan metode Drop-off langsung ke Bank Sampah Graha Pena.`,
          },
          { status: 400 }
        );
      }
    }

    // Insert laporan_setoran
    const insertPayload: Record<string, any> = {
      id_pengguna: authUser.id,
      metode,
      id_bank_sampah: metode === "drop_off" ? id_bank_sampah : null,
      latitude: metode === "pickup" ? latitude : null,
      longitude: metode === "pickup" ? longitude : null,
      estimasi_berat,
      status: "menunggu",
    };

    const locationNote = catatan_lokasi || pickupLocation;
    if (locationNote) {
      insertPayload.catatan_lokasi = locationNote;
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

export async function PATCH(request: Request) {
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
    const validated = updateLaporanSchema.safeParse(body);
    if (!validated.success) {
      const firstIssue = validated.error.issues[0]?.message || "Payload tidak valid";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const { id_laporan, metode, estimasi_berat, catatan_lokasi, kategori_ids } = validated.data;

    let dbClient = supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        dbClient = createAdminClient();
      } catch {}
    }

    // Ambil laporan untuk memastikan status masih 'menunggu'
    const { data: currentLaporan, error: findError } = await dbClient
      .from("laporan_setoran")
      .select("id, id_pengguna, status, metode, estimasi_berat")
      .eq("id", id_laporan)
      .single();

    if (findError || !currentLaporan) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
    }

    if (currentLaporan.status !== "menunggu") {
      return NextResponse.json(
        { error: "Laporan hanya dapat diubah saat masih berstatus Menunggu." },
        { status: 400 }
      );
    }

    // Validasi batas minimum pickup jika metode pickup
    const effectiveMetode = metode || currentLaporan.metode;
    const effectiveBerat =
      estimasi_berat !== undefined ? estimasi_berat : Number(currentLaporan.estimasi_berat);

    if (effectiveMetode === "pickup") {
      const { data: settings } = await dbClient
        .from("pengaturan_sistem")
        .select("batas_minimum_pickup_kg")
        .single();
      const batasMin = settings?.batas_minimum_pickup_kg ?? 5.0;
      if (effectiveBerat < batasMin) {
        return NextResponse.json(
          {
            error: `Estimasi berat (${effectiveBerat} kg) di bawah batas minimum penjemputan (${batasMin} kg). Silakan gunakan metode Drop-off langsung ke Bank Sampah Graha Pena.`,
          },
          { status: 400 }
        );
      }
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (estimasi_berat !== undefined) updatePayload.estimasi_berat = estimasi_berat;
    if (metode !== undefined) updatePayload.metode = metode;
    if (effectiveMetode === "drop_off") {
      updatePayload.id_bank_sampah = "22222222-2222-2222-2222-222222222201";
      updatePayload.catatan_lokasi = null;
    } else if (catatan_lokasi !== undefined) {
      updatePayload.catatan_lokasi = catatan_lokasi;
    }

    const { data: updatedLaporan, error: updateError } = await dbClient
      .from("laporan_setoran")
      .update(updatePayload)
      .eq("id", id_laporan)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Gagal memperbarui laporan: " + updateError.message },
        { status: 500 }
      );
    }

    // Jika kategori_ids diubah
    if (kategori_ids && kategori_ids.length > 0) {
      await dbClient.from("detail_setoran").delete().eq("id_laporan", id_laporan);
      const detailRows = kategori_ids.map((id_kategori) => ({
        id_laporan,
        id_kategori,
      }));
      await dbClient.from("detail_setoran").insert(detailRows);
    }

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil diperbarui",
      laporan: updatedLaporan,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
