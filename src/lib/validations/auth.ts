import { z } from "zod";

export const registerStep1Schema = z.object({
  nama: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama terlalu panjang"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(
      /^[a-z0-9._]+$/,
      "Username hanya boleh huruf kecil, angka, titik (.), dan garis bawah (_)"
    ),
  no_hp: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9+]+$/, "Nomor telepon hanya boleh berisi angka"),
  alamat: z
    .string()
    .min(5, "Alamat lengkap minimal 5 karakter")
    .max(255, "Alamat maksimal 255 karakter"),
});

export const registerStep2BaseSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
  pin: z
    .string()
    .length(6, "PIN harus tepat 6 angka")
    .regex(/^[0-9]{6}$/, "PIN hanya boleh berupa angka"),
});

export const registerStep2Schema = registerStep2BaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  }
);

export const registerCompleteSchema = registerStep1Schema.and(
  registerStep2BaseSchema.omit({ confirmPassword: true })
);

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  peran: z.enum(["warga", "petugas", "admin"], {
    errorMap: () => ({ message: "Pilihan peran tidak valid" }),
  }),
});

export const verifyPinSchema = z.object({
  pin: z
    .string()
    .length(6, "PIN harus tepat 6 digit")
    .regex(/^[0-9]{6}$/, "PIN hanya boleh berupa angka"),
});
