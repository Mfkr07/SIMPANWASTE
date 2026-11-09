import { z } from "zod";

export const createLaporanSchema = z
  .object({
    metode: z.enum(["pickup", "drop_off"]),
    id_bank_sampah: z.string().uuid("ID Bank Sampah tidak valid").optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    estimasi_berat: z.number().positive("Estimasi berat harus lebih dari 0 kg"),
    kategori_ids: z.array(z.string().uuid()).min(1, "Pilih minimal 1 kategori sampah"),
  })
  .refine(
    (data) => {
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
