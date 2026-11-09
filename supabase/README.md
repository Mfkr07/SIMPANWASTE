# Panduan Setup Database & Backend Supabase - SIMPANWASTE

File migrasi database dan konfigurasi backend telah disiapkan secara lengkap.

---

## 1. Menjalankan Migrasi di Supabase

1. Buka dashboard proyek Supabase Anda:
   **[https://supabase.com/dashboard/project/bdohycgujirvxuljgchg](https://supabase.com/dashboard/project/bdohycgujirvxuljgchg)**
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Buka file **`supabase/all_in_one_setup.sql`** yang ada di repository ini, salin seluruh isinya, lalu tempel (paste) ke SQL Editor Supabase.
4. Klik tombol **Run** (atau `Ctrl + Enter`).
5. Skema database, relasi, RLS (Row Level Security), fungsi RPC atomik, serta data awal (5 kategori sampah, snapshot harga 3 kondisi, bank sampah, dan edukasi) akan langsung terpasang.

*(Catatan: Anda juga bisa menjalankan file secara terpisah melalui folder `supabase/migrations/` dan `supabase/seed.sql` bila menggunakan Supabase CLI).*

---

## 2. Pengaturan Supabase Auth

Sesuai spesifikasi **PRD Bagian 8**:
1. Masuk ke **Authentication** -> **Providers** -> **Email**.
2. **Nonaktifkan "Confirm email"** (karena email akun merupakan pemetaan internal format username, misal `warga1@simpanwaste.local`).
3. Simpan perubahan.

---

## 3. Menyiapkan Akun Admin Pertama

Untuk akun admin awal, Anda dapat mendaftarkannya langsung via SQL Editor Supabase atau melalui dashboard Authentication:

```sql
-- Contoh membuat akun Admin pertama lewat SQL Supabase:
-- 1. Buat user di auth.users (atau daftar via aplikasi), lalu ubah perannya:
UPDATE public.profil
SET peran = 'admin'
WHERE username = '<username_admin_anda>';
```

---

## 4. Konfigurasi Environment (`.env.local`)

Salin file `.env.example` ke `.env.local` dan isi `SUPABASE_SERVICE_ROLE_KEY`:
- `NEXT_PUBLIC_SUPABASE_URL=https://bdohycgujirvxuljgchg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=<service_role_key_dari_dashboard>` *(Project Settings -> API -> service_role secret)*
