import { z } from "zod";

export const ajukanPenarikanSchema = z.object({
  jumlah: z.number().positive("Jumlah penarikan harus lebih dari Rp 0"),
  tujuan: z.enum(["tarik_tabungan", "potong_iuran"], {
    errorMap: () => ({ message: "Tujuan penarikan harus tarik_tabungan atau potong_iuran" }),
  }),
  pin: z
    .string()
    .length(6, "PIN harus tepat 6 digit")
    .regex(/^[0-9]{6}$/, "PIN harus berupa angka"),
});

export const prosesPenarikanSchema = z
  .object({
    id_penarikan: z.string().uuid("ID Penarikan tidak valid"),
    status: z.enum(["selesai", "ditolak"]),
    alasan_penolakan: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === "ditolak") {
        return !!data.alasan_penolakan && data.alasan_penolakan.trim().length > 0;
      }
      return true;
    },
    {
      message: "Alasan penolakan wajib dicantumkan jika pengajuan ditolak",
      path: ["alasan_penolakan"],
    }
  );
