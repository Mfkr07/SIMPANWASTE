import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client dengan Service Role Key.
 * Digunakan KHUSUS di sisi server (Route Handlers / Server Actions)
 * untuk aksi administratif yang membutuhkan bypass RLS (misal membuat akun petugas/admin, reset user, dll).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di environment (.env.local). " +
      "Silakan salin Service Role Key dari Supabase Dashboard -> Project Settings -> API."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
