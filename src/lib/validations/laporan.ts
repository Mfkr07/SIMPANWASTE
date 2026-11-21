import { z } from "zod";

export const createLaporanSchema = z
  .object({
    metode: z.enum(["pickup", "drop_off"]),
    id_bank_sampah: z.string().uuid("ID Bank Sampah tidak valid").optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    estimasi_berat: z.number().positive("Estimasi berat harus lebih dari 0 kg"),
    catatan_lokasi: z.string().optional().nullable(),
    pickupLocation: z.string().optional().nullable(),
    kategori_ids: z.array(z.string().uuid()).optional(),
    kategori_items: z
      .array(
        z.object({
          id_kategori: z.string().uuid("ID Kategori tidak valid"),
          kondisi: z.enum(["bersih", "kotor", "tercampur_air"]).optional(),
          conditions: z.array(z.string()).optional(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      const hasCategories =
        (data.kategori_items && data.kategori_items.length > 0) ||
        (data.kategori_ids && data.kategori_ids.length > 0);
      if (!hasCategories) return false;
      if (data.metode === "drop_off") {
        return !!data.id_bank_sampah;
      }
      if (data.metode === "pickup") {
        return (
          data.latitude !== null &&
          data.latitude !== undefined &&
          data.longitude !== null &&
          data.longitude !== undefined
        );
      }
      return false;
    },
    {
      message: "Data lokasi tidak lengkap sesuai metode yang dipilih",
      path: ["metode"],
    }
  );

export const cancelLaporanSchema = z.object({
  id_laporan: z.string().uuid("ID Laporan tidak valid"),
});
