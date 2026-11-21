// Mapping helper for Category UUIDs in Supabase

export const DB_CATEGORIES: Record<string, string> = {
  Kaca: "11111111-1111-1111-1111-111111111101",
  Plastik: "11111111-1111-1111-1111-111111111102",
  Besi: "11111111-1111-1111-1111-111111111103",
  Kertas: "11111111-1111-1111-1111-111111111104",
  Kayu: "11111111-1111-1111-1111-111111111105",
};

export function getCategoryUuid(name: string): string {
  const n = (name || "").toLowerCase();
  if (
    n.includes("kaca") ||
    n.includes("botol kaca") ||
    n.includes("toples") ||
    n.includes("sirup") ||
    n.includes("saus")
  ) {
    return DB_CATEGORIES.Kaca;
  }
  if (
    n.includes("plastik") ||
    n.includes("pet") ||
    n.includes("hdpe") ||
    n.includes("gelas") ||
    n.includes("ember") ||
    n.includes("minyak") ||
    n.includes("jelantah")
  ) {
    return DB_CATEGORIES.Plastik;
  }
  if (
    n.includes("besi") ||
    n.includes("kaleng") ||
    n.includes("logam") ||
    n.includes("seng") ||
    n.includes("tembaga") ||
    n.includes("aluminium")
  ) {
    return DB_CATEGORIES.Besi;
  }
  if (
    n.includes("kertas") ||
    n.includes("kardus") ||
    n.includes("arsip") ||
    n.includes("buku") ||
    n.includes("duplex")
  ) {
    return DB_CATEGORIES.Kertas;
  }
  if (n.includes("kayu") || n.includes("papan") || n.includes("palet")) {
    return DB_CATEGORIES.Kayu;
  }
  return DB_CATEGORIES.Plastik;
}

export const GRAHA_PENA_UUID = "22222222-2222-2222-2222-222222222201";
