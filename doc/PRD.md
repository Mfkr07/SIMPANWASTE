# PRD — SIMPANWASTE
Sistem Informasi Pengelolaan Sampah Berbasis Pemilahan (Kota Palembang)

Versi 1.0 (draf) · 10 November 2026 · Tim SIMPANWASTE
Sumber: Project Scope Statement v1.0, Figma (4 layar), Context Diagram, DFD, ERD, Flowchart, Pemetaan Hak Akses, dan wawancara dengan pemilik proyek.

> Untuk pengiriman via Telegram: pecah file ini per heading `## ` (atau `### ` bila terlalu panjang). Setiap bagian dibuat berdiri sendiri.

---

## 0. Cara membaca dokumen

Setiap keputusan diberi label:
- **[OK]** dikonfirmasi pemilik proyek saat wawancara.
- **[DOC]** berasal dari dokumen proyek (Scope, DFD, ERD, Flowchart, Hak Akses).
- **[REK]** rekomendasi penulis PRD, belum dikonfirmasi. Boleh diikuti, tetapi laporkan di ringkasan fase.
- **[OPEN]** belum diputuskan. **Agent wajib berhenti dan bertanya sebelum mengerjakan bagian yang bergantung padanya. Jangan menebak.**

---

## 1. Ringkasan produk

**Masalah** [DOC]: Dari sekitar 105 bank sampah terdaftar di Palembang, hanya sekitar 25 yang aktif. Warga belum terbiasa memilah, setoran tidak rutin, informasi prosedur dan lokasi bank sampah sulit diakses, dan saldo tabungan nasabah tidak transparan.

**Solusi**: aplikasi web responsif tempat warga (nasabah) belajar memilah, melaporkan setoran sampah anorganik (pickup atau drop-off), melihat riwayat dan saldo secara privat, serta menemukan bank sampah aktif. Petugas menimbang manual dan menginput hasilnya. Admin mengelola data master dan memantau dashboard.

**Mitra dan lokasi studi**: Bank Sampah Graha Pena Palembang.

**Tujuan terukur** [DOC]: laporan, penjemputan, penimbangan, perhitungan saldo, dan pemantauan berjalan di satu sistem, tanpa error pada skenario uji, dengan angka dashboard konsisten dengan data transaksi.

**Tenggat**: 6 Desember 2026. Metode Waterfall. Pengujian terbatas pada Black-box dan UAT.

---

## 2. Keputusan terkonfirmasi (hasil wawancara)

| # | Keputusan | Label |
|---|---|---|
| 1 | Dibangun penuh: frontend + backend + database | [OK] |
| 2 | Eksekutor: agent Hermes via gateway Telegram, model Gemini Flash | [OK] |
| 3 | Stack: Next.js (TypeScript) + Supabase + Vercel | [OK] |
| 4 | Login memakai **username**; dipetakan ke email internal lewat Supabase Auth | [OK] |
| 5 | Kondisi sampah ada 3: `bersih`, `kotor`, `tercampur_air` | [OK] |
| 6 | Katalog awal berisi jenis sampah dari Batasan Proyek (lihat 7.4), admin dapat mengubah | [OK] |
| 7 | Semua petugas melihat semua laporan; tidak ada penugasan khusus | [OK] |
| 8 | Petugas tidak terikat bank sampah; dapat menerima drop-off di mana pun | [OK] |
| 9 | Penarikan saldo: warga ajukan (PIN) → status `menunggu` → petugas proses → saldo berkurang saat selesai diproses | [OK] |
| 10 | PIN 6 angka, **tanpa penguncian** (hanya validasi) | [OK] |
| 11 | Fase 1 hanya 4 layar Figma (landing, login, registrasi 2 langkah) + auth + skema DB lengkap + RLS + seed; setelah login masuk halaman placeholder per peran | [OK] |
| 12 | Data seed berupa data dummy yang ditandai jelas sebagai demo | [OK] |
| 13 | Status laporan: `menunggu`, `dalam_proses`, `selesai`, `dibatalkan` | [OK] |
| 14 | Status penarikan: `menunggu`, `selesai`, `ditolak` (dengan `alasan_penolakan`) | [OK] |
| 15 | Katalog sampah awal disederhanakan menjadi 5 kategori: `kaca`, `plastik`, `besi`, `kertas`, `kayu` | [OK] |

---

## 3. Tech stack

| Lapisan | Pilihan | Label |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript strict | [OK] |
| Backend/DB/Auth | Supabase (PostgreSQL, Auth, RLS) | [OK] |
| Hosting | Vercel | [OK] |
| Peta | Leaflet + OpenStreetMap (sesuai Scope). Di Next.js wajib dimuat client-only (`dynamic` dengan `ssr: false`) | [DOC] |
| Klien Supabase | `@supabase/ssr` untuk sesi berbasis cookie | [REK] |
| Styling | Tailwind CSS | [REK] |
| Ikon | lucide-react (gaya ikon Figma mirip) | [REK] |
| Font | Inter | [REK] (terbaca dari Figma) |
| Validasi form | Zod (+ React Hook Form) | [REK] |
| Grafik dashboard | Recharts | [REK] (dipakai Fase 7) |
| Pengujian otomatis | **[OPEN]** (Scope hanya mewajibkan Black-box + UAT) | [OPEN] |

Aturan teknis:
- Gunakan versi stabil terbaru dan **ikuti dokumentasi versi yang terpasang**; API Next.js dan Supabase sering berubah.
- `SUPABASE_SERVICE_ROLE_KEY` hanya di server (Route Handler). Jangan pernah memakai prefiks `NEXT_PUBLIC_`.
- RLS aktif di semua tabel. Pengaman akses sesungguhnya ada di database, bukan di UI.
- Proteksi route per peran lewat middleware ditambah pengecekan di server.

---

## 4. Peran dan hak akses [DOC]

C = create, R = read, U = update, D = delete, `-` = tidak ada akses.

| Modul | Warga | Petugas | Admin |
|---|---|---|---|
| Akun dan login | C,R,U (profil dan password sendiri) | R,U (profil sendiri) | C,R,U,D (semua akun) |
| Informasi dan edukasi | R | R | R |
| Pelaporan setoran | C,R,U (milik sendiri, sebelum dijemput) | R,U (status) | R (semua) |
| Verifikasi dan penimbangan | R (milik sendiri) | C,R,U (berat aktual, kondisi) | R |
| Perhitungan saldo | R (milik sendiri) | R (hasil per setoran) | R |
| Maps bank sampah | R | R | R |
| Riwayat dan saldo pribadi | R (wajib PIN) | - | - (hanya agregat) |
| Penarikan saldo / potong iuran | C,R (milik sendiri, wajib PIN) | R,U (memproses) | R |
| Data master (jenis, harga, batas pickup, mitra) | R (katalog, batas minimum) | R (harga per kondisi) | C,R,U,D |
| Dashboard sampah terkumpul | - | - | R |
| Distribusi ke mitra pengepul | - | - | C,R,U,D |

Catatan:
- Warga mendaftar sendiri. Akun **petugas dan admin dibuat oleh admin**. Admin pertama dibuat lewat seed.
- Saldo tidak bisa diubah manual oleh peran mana pun; hanya dihitung otomatis oleh sistem.
- **[OPEN]** Matriks menandai admin `R` pada Perhitungan saldo dan Penarikan, tetapi `-` pada Riwayat pribadi ("admin hanya melihat agregat"). Default sementara: admin tidak membuka riwayat atau saldo per orang, hanya agregat.

---

## 5. Persyaratan fungsional

### 5.1 Akun dan hak akses (pendukung)
- **AUTH-01 Registrasi warga (2 langkah)**. Langkah 1: nama lengkap, username unik (huruf kecil, angka, titik, garis bawah), nomor telepon, alamat lengkap. Langkah 2: password (min 8 karakter), konfirmasi password, PIN tepat 6 angka. Hanya warga yang bisa mendaftar mandiri.
- **AUTH-02 Login**. Username + password, dengan tab pilihan peran (Warga/Petugas/Admin). Peran akun harus sama dengan tab; jika tidak, tampilkan error. Setelah login arahkan ke halaman peran masing-masing.
- **AUTH-03 Logout** dan sesi aman via cookie.
- **AUTH-04 Admin kelola akun** (Fase 2): buat, lihat, ubah, hapus akun petugas dan admin. Butuh Route Handler server-side dengan service-role key.
- **AUTH-05 Profil sendiri**: baca dan ubah profil serta password sendiri (warga dan petugas).
- **AUTH-06 PIN**: disimpan sebagai hash (bcrypt/argon2), terpisah dari tabel profil dan tidak pernah dikirim ke klien. Verifikasi dilakukan server-side.
- **[OPEN]** Lupa password / lupa PIN / ubah PIN: belum ada di dokumen.
- **[OPEN]** Seberapa sering PIN diminta. Default sementara: sekali per sesi untuk membuka riwayat dan saldo, dan diminta lagi saat mengajukan penarikan.

### 5.2 Informasi dan edukasi (Fase 3)
- **EDU-01** Warga, petugas, dan admin membaca 4 topik: (1) kompos dari sampah organik, (2) cara membersihkan sampah anorganik sebelum disetor, (3) alur dan tata cara penyetoran (pickup dan drop-off), (4) alur hilir sampah. Konten read-only dari tabel `konten_edukasi`.
- **[OPEN]** Isi teks edukasi asli. Sementara pakai teks placeholder bertanda demo.

### 5.3 Pelaporan setoran (Fase 4)
- **LAP-01 Warga membuat laporan**: pilih metode `pickup` atau `drop_off`; pilih satu atau lebih kategori sampah; isi estimasi berat total (kg).
  - Pickup: tentukan titik jemput pada peta (latitude, longitude).
  - Drop-off: pilih bank sampah tujuan; lihat peta dan jam operasional.
  - Validasi: pickup hanya diterima jika `estimasi_berat >= batas_minimum_pickup`. Di bawah batas, sistem mengarahkan warga ke drop-off dan menolak pickup.
- **LAP-02** Warga dapat melihat dan mengubah laporan miliknya selama status `menunggu`. Tidak ada hapus.
- **LAP-03 Daftar tugas petugas**: semua laporan berstatus `menunggu` dan `dalam_proses` (pickup dan drop-off), terlihat oleh semua petugas, dengan filter metode dan tampilan detail.
- **[OK]** Status laporan mencakup: `menunggu`, `dalam_proses`, `selesai`, dan `dibatalkan`. Warga dapat membatalkan laporan saat status masih `menunggu`. Petugas dapat menandai status `dalam_proses` saat penjemputan.
- **[OPEN]** Apakah titik jemput harus berada di wilayah percontohan, dan bagaimana validasinya.

### 5.4 Verifikasi, penimbangan, dan saldo (Fase 5)
- **TMB-01** Petugas membuka laporan, menimbang manual, lalu menginput berat aktual (kg) dan kondisi (`bersih`/`kotor`/`tercampur_air`) **per baris kategori**.
- **TMB-02** Sistem menghitung `subtotal = berat_aktual × harga(kategori, kondisi)`, `total_berat`, `total_nilai`. Harga diambil saat penimbangan dan disimpan sebagai snapshot, sehingga perubahan harga tidak mengubah transaksi lama.
- **TMB-03** Dalam **satu transaksi database**: simpan penimbangan, isi detail, ubah status laporan menjadi `selesai`, tambah baris `saldo_transaksi` jenis `setoran` dengan saldo berjalan. Satu laporan hanya boleh ditimbang sekali (`id_laporan` UNIQUE); jika dua petugas bersamaan, yang kedua mendapat error.
- **SAL-01 Warga (dengan PIN)** melihat riwayat setoran, total berat, dan saldo. Data harus sama dengan yang diinput petugas.
- **[OPEN]** Boleh tidaknya petugas menambah, mengubah, atau menghapus baris kategori saat menimbang. Default sementara: hanya mengisi berat dan kondisi pada baris yang dipilih warga.

### 5.5 Penarikan saldo / potong iuran (Fase 6)
- **WDR-01** Warga mengajukan penarikan (jumlah ≤ saldo, wajib PIN) dengan tujuan `tarik_tabungan` atau `potong_iuran`. Status awal `menunggu`.
- **WDR-02** Petugas melihat antrean penarikan dan menandainya diproses. Saat selesai, sistem membuat `saldo_transaksi` jenis `penarikan` dan saldo berkurang. Cek ulang saldo cukup saat pemrosesan (bisa ada beberapa pengajuan bersamaan).
- Tanpa payment gateway atau e-wallet. Uang diserahkan manual oleh bank sampah.
- **[OK]** Status penarikan mencakup `menunggu`, `selesai`, dan `ditolak`. Jika ditolak, petugas mengisi alasan penolakan dan saldo warga tidak terpotong. Batas minimum penarikan dapat diatur pada data master/pengaturan.

### 5.6 Maps bank sampah (Fase 3)
- **MAP-01** Peta Leaflet/OSM untuk pengguna login, menampilkan bank sampah **aktif** (nama, alamat, jam operasional). Pengguna melihat lokasi. Data lokasi disiapkan di luar fitur data master (asumsi Scope).
- **[OPEN]** Data asli bank sampah (nama, alamat, koordinat, jam). Sementara pakai data demo.

### 5.7 Data master (Fase 2)
- **MST-01** Admin CRUD: katalog jenis sampah; harga per kg untuk setiap kombinasi jenis × kondisi; batas minimum pickup (kg); data mitra pengepul. Perubahan langsung berlaku untuk laporan dan perhitungan berikutnya.
- **[OPEN]** Nilai awal harga dan batas minimum "ditetapkan bersama Bank Sampah Graha Pena". Sementara pakai placeholder bertanda demo.

### 5.8 Dashboard dan distribusi (Fase 7)
- **DSH-01** Admin melihat statistik dan grafik total sampah terkumpul per kategori dan periode, real-time, konsisten dengan data transaksi.
- **DSH-02** Admin CRUD laporan distribusi ke mitra pengepul.
- **[OPEN]** Metrik, filter periode, dan struktur laporan distribusi yang tepat.

### 5.9 Landing publik (Fase 1)
- **LND-01** Sesuai Figma (lihat Design.md). Tombol "Masuk untuk Buka Maps" mengarah ke login karena peta khusus pengguna login. Statistik di landing berupa angka demo statis yang diberi label demonstrasi.

---

## 6. Aturan bisnis

1. Hanya sampah **anorganik** terpilah bernilai ekonomis yang dijemput dan dikonversi menjadi saldo. Sampah organik hanya edukasi. B3, limbah medis, dan sampah berukuran besar tidak dilayani. [DOC]
2. Pickup hanya jika estimasi berat ≥ batas minimum yang diatur admin; selain itu warga diarahkan drop-off. [DOC]
3. Saldo murni insentif internal. Tidak ada payment gateway, e-wallet, atau pencairan tunai otomatis. [DOC]
4. Penimbangan manual oleh petugas; berat aktual diinput ke sistem. Tidak ada IoT. [DOC]
5. Warga dan petugas harus online; tidak ada mode offline. [DOC]
6. Akses saldo dan riwayat dilindungi PIN. Data pribadi hanya dipakai untuk kebutuhan sistem. [DOC]
7. Sistem standalone dan tidak terhubung ke sistem DLH Kota Palembang. [DOC]
8. Satuan: berat dalam kg (2 desimal), uang dalam Rupiah (`numeric`, bukan float).
9. Seluruh UI berbahasa Indonesia. [DOC/Figma]

---

## 7. Model data (ERD revisi)

### 7.1 Prinsip
Berdasarkan ERD dokumen dengan perbaikan hasil rekonsiliasi (bagian 11). Nama tabel `snake_case`. Password dikelola Supabase Auth, tidak disimpan di tabel aplikasi.

### 7.2 Enum
`peran`: warga, petugas, admin · `metode_setoran`: pickup, drop_off · `status_laporan`: menunggu, dalam_proses, selesai, dibatalkan · `kondisi_sampah`: bersih, kotor, tercampur_air · `jenis_transaksi`: setoran, penarikan · `status_penarikan`: menunggu, selesai, ditolak · `tujuan_penarikan`: tarik_tabungan, potong_iuran.

### 7.3 Tabel

**profil** (1:1 dengan `auth.users`): `id` uuid PK = auth uid, `nama`, `username` UNIQUE (lowercase), `no_hp`, `alamat`, `peran`, `created_at`.

**pin_pengguna**: `id_pengguna` PK/FK, `pin_hash`, `updated_at`. Tidak ada policy SELECT untuk klien.

**bank_sampah**: `id`, `nama`, `alamat`, `latitude`, `longitude` (decimal), `jam_operasional`, `is_aktif` (boolean), `is_demo` (boolean).

**kategori_sampah**: `id`, `nama_kategori`, `deskripsi`, `is_aktif`. (Kolom `harga_per_kg` dari ERD lama dipindah ke `harga_sampah`.)

**harga_sampah**: `id`, `id_kategori` FK, `kondisi` kondisi_sampah, `harga_per_kg` numeric. UNIQUE (`id_kategori`, `kondisi`).

**pengaturan_sistem**: satu baris; `batas_minimum_pickup_kg` numeric, `updated_at`.

**laporan_setoran**: `id`, `id_pengguna` FK, `metode`, `id_bank_sampah` FK nullable (wajib bila drop_off), `latitude`/`longitude` nullable (wajib bila pickup), `estimasi_berat` numeric, `status`, `tanggal_lapor`. CHECK konsistensi metode vs kolom lokasi.

**detail_setoran**: `id`, `id_laporan` FK, `id_kategori` FK, `berat_aktual` nullable, `kondisi` nullable (diisi saat penimbangan), `subtotal` nullable.

**penimbangan**: `id`, `id_laporan` FK **UNIQUE**, `id_petugas` FK, `tanggal_timbang`, `total_berat`, `total_nilai`.

**penarikan_saldo** (baru): `id`, `id_pengguna`, `jumlah`, `tujuan`, `status`, `alasan_penolakan` text nullable, `tanggal_ajuan`, `id_petugas` nullable, `tanggal_proses` nullable.

**saldo_transaksi**: `id`, `id_pengguna`, `id_penimbangan` nullable, `id_penarikan` nullable, `jenis`, `jumlah`, `tanggal`, `saldo` (saldo setelah transaksi). Hanya dibuat oleh fungsi server; klien tidak boleh INSERT/UPDATE/DELETE.

**konten_edukasi**: `id`, `judul`, `topik`, `isi`, `urutan`.

**Draf [OPEN], buat minimal dan ubah lewat migrasi setelah dikonfirmasi:**
**mitra_pengepul**: `id`, `nama`, `alamat`, `kontak`, `is_aktif`.
**distribusi_mitra**: `id`, `id_mitra`, `id_kategori`, `berat`, `tanggal`, `catatan`.

### 7.4 Seed katalog jenis sampah
Katalog awal disederhanakan menjadi **5 kategori utama** [OK]:
1. **kaca** (botol, pecahan kaca bening/berwarna)
2. **plastik** (PET, botol, plastik campuran, gelas plastik)
3. **besi** (kaleng, besi tua, rongsokan logam)
4. **kertas** (kardus, duplex, buku tulis, arsip/koran)
5. **kayu** (papan, balok kayu bekas)

Setiap kategori memiliki 3 kombinasi harga snapshot per kondisi: `bersih`, `kotor`, `tercampur_air`. Admin dapat menambah sub-kategori atau mengubah harga di data master (Fase 2).

### 7.5 Ringkasan RLS
- `profil`: pengguna membaca dan mengubah miliknya; admin penuh. Pembuatan akun petugas/admin lewat server.
- `laporan_setoran` dan `detail_setoran`: warga CRU miliknya (U hanya saat `menunggu`); petugas dan admin membaca semua; petugas mengubah status hanya lewat fungsi penimbangan.
- `penimbangan`, `saldo_transaksi`, `penarikan_saldo`: warga membaca miliknya; penulisan hanya lewat fungsi server (RPC `security definer`). [REK]
- `kategori_sampah`, `harga_sampah`, `pengaturan_sistem`, `bank_sampah`, `konten_edukasi`: semua pengguna login baca; hanya admin menulis (kecuali konten edukasi: baca saja).
- Landing publik membaca `bank_sampah` aktif lewat view atau endpoint yang hanya mengekspos nama, alamat, dan jam.

---

## 8. Non-fungsional dan keamanan

- Responsif (desktop dan smartphone); diakses via browser. Tanpa aplikasi native. [DOC]
- Semua tabel ber-RLS; diuji dengan akun tiap peran.
- Perubahan saldo atomik dan aman terhadap permintaan bersamaan (kunci baris pengguna).
- Password diatur Supabase Auth; PIN di-hash. Jangan pernah mencatat password atau PIN ke log.
- Validasi di klien **dan** di server.
- Email konfirmasi Supabase dinonaktifkan karena email internal bukan alamat sungguhan. Domain email internal harus diverifikasi diterima Supabase. Pemetaan username → email dilakukan di server, pengguna tidak pernah melihatnya.
- Kinerja: tidak ada load/performance testing (di luar lingkup). [DOC]
- Aksesibilitas dasar: label form, fokus terlihat, kontras teks memadai.

---

## 9. Di luar lingkup [DOC]

Aplikasi native, IoT timbangan, payment gateway/e-wallet, penjemputan sampah organik/B3/medis/besar, integrasi API ke DLH, mode offline, wilayah di luar percontohan Palembang, load/performance testing, serta pemeliharaan setelah 6 Desember 2026.

---

## 10. Rencana fase

Kerjakan **satu fase per sesi**. Setiap fase diakhiri ringkasan singkat, daftar centang kriteria, dan commit.

**Prasyarat manual (dilakukan pemilik proyek)**: membuat repo GitHub, proyek Supabase, proyek Vercel; mengisi env var (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`); menonaktifkan konfirmasi email; mengekspor aset gambar dari Figma ke `public/`.

| Fase | Isi | Selesai bila |
|---|---|---|
| 1 | Fondasi: Next.js + Tailwind + token desain; landing, login, registrasi 2 langkah; Supabase Auth dengan username; **skema DB lengkap + RLS + seed demo**; admin seed; halaman placeholder per peran + logout; route guard | Warga bisa daftar dan login, tiap peran masuk halamannya, akses lintas peran ditolak, UI sesuai Figma |
| 2 | Data master admin (kategori, harga × kondisi, batas pickup, mitra) + kelola akun petugas/admin | Admin CRUD berfungsi, RLS terbukti |
| 3 | Edukasi + Maps bank sampah | 4 topik tampil, peta menampilkan bank sampah aktif |
| 4 | Pelaporan warga + validasi batas pickup + daftar tugas petugas | Laporan tersimpan dan muncul di petugas |
| 5 | Penimbangan, perhitungan saldo (RPC), riwayat dan saldo warga dengan PIN | Hitungan benar di semua skenario uji |
| 6 | Penarikan saldo / potong iuran | Alur status benar, saldo konsisten |
| 7 | Dashboard admin + distribusi mitra | Angka dashboard = data transaksi |
| 8 | Black-box test, skrip UAT, perbaikan, deploy produksi, README dan manual singkat | Demo di Vercel berjalan |

---

## 11. Rekonsiliasi dokumen (ketidakkonsistenan yang ditemukan)

| Temuan | Penyelesaian |
|---|---|
| ERD `pengguna` tidak punya PIN, padahal Scope mewajibkan | Tambah `pin_pengguna` (hash, terpisah) |
| ERD kondisi 2 nilai, Flowchart 3 nilai | 3 nilai [OK] |
| ERD hanya satu `harga_per_kg` per kategori, Scope meminta harga per kondisi | Tabel `harga_sampah` (kategori × kondisi) |
| Kriteria Penerimaan: 5 kategori; Batasan: 28 butir | Seed 28 butir, lihat 7.4 [OK], dengan catatan kaca/kayu/upah pilah |
| Tidak ada penugasan petugas di ERD, Flowchart menyebut "daftar tugas" | Semua petugas melihat semua laporan [OK] |
| Penarikan saldo tidak punya tabel/status | Tabel `penarikan_saldo` [OK] |
| `detail_setoran.kondisi` dan `berat_aktual` wajib padahal terisi saat timbang | Dibuat nullable |
| ERD `latitude : NULL` ambigu | Dimaknai `decimal`, nullable |
| `bank_sampah` tanpa penanda aktif | Tambah `is_aktif` |
| Scope kadang menyebut "poin", fitur lain "saldo" | Dipakai "saldo" (Rupiah) |
| DFD 8.0 berlabel ganda ("…SampahTampilkan Maps Bank Sampah") | Dibaca "Dashboard dan Distribusi Sampah" |
| Hak akses: admin `R` pada saldo vs `-` pada riwayat pribadi | Default agregat saja, [OPEN] |
| Footer Figma "© 2025", proyek berjalan 2026 | Pakai © 2026 |
| Login Figma berlabel "KOTA PALEMBANG", registrasi "PALEMBANG PILOT" | Ikuti Figma per layar |

---

## 12. Open questions (dikumpulkan)

1. Harga awal per kg (jenis × kondisi) dan batas minimum pickup (sebelum Fase 2 produksi).
2. Field mitra pengepul dan struktur laporan distribusi (Fase 7).
3. Metrik dan filter periode dashboard (Fase 7).
4. ~~Status penarikan `ditolak`, alasan, batas minimum penarikan~~ -> **[OK] Diputuskan**: status `ditolak` dimasukkan bersama `alasan_penolakan`.
5. ~~Status laporan tambahan (`dibatalkan`, `dijemput`) dan validasi wilayah titik jemput~~ -> **[OK] Diputuskan**: status `dibatalkan` dan `dalam_proses` dimasukkan.
6. Teks asli konten edukasi (Fase 3).
7. Data asli bank sampah beserta koordinat (Fase 3).
8. Lupa password / lupa PIN / ubah PIN; frekuensi permintaan PIN (Fase 5).
9. Apakah petugas boleh menambah atau mengubah baris kategori saat menimbang (Fase 5).
10. ~~Dimasukkannya "upah pilah sampah", "kaca", "kayu" ke katalog~~ -> **[OK] Diputuskan**: 5 kategori utama (`kaca`, `plastik`, `besi`, `kertas`, `kayu`).
11. Akses admin ke saldo per orang atau hanya agregat (Fase 5).
12. Kebijakan password awal akun petugas/admin yang dibuat admin (Fase 2).
13. Strategi pengujian otomatis (Fase 8).
14. Konfirmasi rekomendasi [REK] pada bagian 3.

---

## 13. Risiko

| Risiko | Mitigasi |
|---|---|
| PIN 6 angka tanpa penguncian dapat ditebak lewat percobaan berulang (10⁶ kemungkinan) [keputusan pemilik] | Dicatat sebagai risiko yang diketahui; sangat disarankan minimal rate-limit endpoint verifikasi PIN dan tinjau ulang |
| RLS salah konfigurasi membocorkan data lintas pengguna | Uji RLS dengan akun tiap peran di akhir tiap fase |
| Saldo tidak konsisten karena permintaan bersamaan | RPC transaksional + UNIQUE `id_laporan` + kunci baris |
| Leaflet gagal di SSR Next.js | Komponen peta client-only (`ssr: false`) |
| Konteks agent terbatas | Satu fase per sesi, dokumen dipecah, ringkasan di akhir fase |
| Domain email internal ditolak Supabase | Verifikasi di awal Fase 1 sebelum membangun hal lain |
| Waktu sempit (tenggat 6 Desember 2026) | Fase terurut menurut nilai bisnis; Fase 8 tidak dilewati |
