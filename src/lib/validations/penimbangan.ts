import { z } from "zod";

export const detailPenimbanganItemSchema = z.object({
  id_kategori: z.string().uuid("ID Kategori tidak valid"),
  berat_aktual: z.number().min(0, "Berat aktual tidak boleh bernilai negatif"),
  kondisi: z.enum(["bersih", "kotor", "tercampur_air"], {
    errorMap: () => ({ message: "Kondisi harus bersih, kotor, atau tercampur_air" }),
  }),
});

export const prosesPenimbanganSchema = z.object({
  id_laporan: z.string().uuid("ID Laporan tidak valid"),
  items: z
    .array(detailPenimbanganItemSchema)
    .min(1, "Rincian penimbangan minimal memuat 1 jenis kategori sampah"),
});
