/**
 * Helper untuk pemetaan username ke format email internal Supabase Auth.
 * Pengguna hanya berinteraksi dengan 'username'. Supabase Auth di belakang layar
 * menggunakan email internal, misalnya 'budi@simpanwaste.local'.
 */

export function getInternalDomain(): string {
  return process.env.AUTH_INTERNAL_EMAIL_DOMAIN || "simpanwaste.local";
}

export function usernameToEmail(username: string): string {
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9._]/g, "");
  return `${cleanUsername}@${getInternalDomain()}`;
}

export function emailToUsername(email: string): string {
  if (!email) return "";
  return email.split("@")[0].toLowerCase();
}
