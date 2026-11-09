export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>SIMPANWASTE API & Backend</h1>
      <p>Sistem Informasi Pengelolaan Sampah Berbasis Pemilahan (Kota Palembang)</p>
      <ul>
        <li>Status Backend: Aktif</li>
        <li>Endpoint Auth: /api/auth/*</li>
        <li>Endpoint Laporan: /api/laporan</li>
        <li>Endpoint Penimbangan: /api/penimbangan/proses</li>
        <li>Endpoint Penarikan: /api/penarikan/*</li>
        <li>Endpoint Data Master: /api/bank-sampah, /api/kategori</li>
      </ul>
    </main>
  );
}
