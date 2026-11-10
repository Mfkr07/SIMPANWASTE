# Design.md — Spesifikasi UI/UX & Sistem Desain SIMPANWASTE
Sistem Informasi Pengelolaan Sampah Berbasis Pemilahan (Kota Palembang)

Versi 1.0 · 10 November 2026 · Tim SIMPANWASTE
Sumber: `Project MPSI Figma.pdf` (4 Layar Utama Fase 1) & `PRD.md` v1.0.

> Untuk pengiriman via Telegram ke Agent Hermes: pecah file ini per heading `## ` (atau `### ` bila terlalu panjang). Dokumen ini berpasangan langsung dengan `PRD.md`.

---

## 0. Prinsip Desain & Aturan Implementasi Agent

1. **Kepatuhan Visual Fase 1 [OK]**: Keempat layar publik dan autentikasi (Landing Page, Login, Registrasi Langkah 1, dan Registrasi Langkah 2) wajib diimplementasikan secara presisi mengikuti tata letak, hierarki tipografi, teks salinan (*copywriting*), dan nuansa warna pada `Project MPSI Figma.pdf`.
2. **Ekstensi Konsisten Fase 2–7 [REK]**: Modul internal pasca-login (Dashboard Warga, Petugas, dan Admin) belum memiliki layar terpisah di PDF Figma, sehingga wajib dibangun menggunakan token warna, tipografi, gaya kartu, lencana (*badge*), dan komponen formulir yang sama dari Fase 1.
3. **Rekonsiliasi Teks Visual [DOC]**:
   - **Sub-label Logo**: Gunakan teks `KOTA PALEMBANG` pada panel kiri layar Login, dan gunakan teks `PALEMBANG PILOT` pada panel kiri layar Registrasi Langkah 1 & 2 (sesuai masing-masing layar Figma).
   - **Tahun Hak Cipta Footer**: Gunakan `© 2026 SIMPANWASTE` (diperbarui dari tahun 2025 di Figma sesuai kesepakatan `PRD.md` Bagian 11).
   - **Label Data Demonstrasi**: Seluruh statistik dan lokasi pada halaman publik maupun halaman login wajib menyertakan keterangan eksplisit bahwa angka tersebut adalah data demonstrasi.
4. **Bahasa Antarmuka**: 100% Bahasa Indonesia yang lugas, ramah warga, dan formal-modern.

---

## 1. Design Tokens & Konfigurasi Tailwind CSS

### 1.1 Palet Warna (Color Tokens)

Sistem desain menggunakan palet hijau hutan gelap (*Deep Forest Green*) untuk kesan institusional dan keberlanjutan lingkungan, dipadukan dengan hijau zamrud (*Emerald Green*) untuk aksi utama (CTA) serta latar netral hangat/bersih.

| Token Semantik | Kode Hex | Kelas Tailwind Setara | Penggunaan Utama |
|---|---|---|---|
| `brand-dark` | `#153626` | `bg-[#153626]` | Panel kiri halaman Login/Register, Banner CTA bawah, Footer |
| `brand-darker` | `#0F291E` | `bg-[#0F291E]` | Gradien gelap panel autentikasi, garis batas gelap |
| `brand-primary` | `#1E7E48` | `bg-[#1E7E48]` / `text-[#1E7E48]` | Tombol CTA utama, tab aktif, aksen teks judul ("Hijaukan Masa Depan"), ikon utama |
| `brand-primary-hover` | `#18663A` | `hover:bg-[#18663A]` | Status *hover* tombol utama |
| `brand-light` | `#EAF6EE` | `bg-[#EAF6EE]` | Latar kotak ikon, *pill badge* hijau muda, kotak info demo |
| `brand-border` | `#C6E6D1` | `border-[#C6E6D1]` | Garis tepi kotak info hijau muda dan *badge* aktif |
| `surface-page` | `#F8FAF9` | `bg-[#F8FAF9]` | Latar belakang halaman alternatif (seksi Fitur Utama, Maps, halaman autentikasi) |
| `surface-card` | `#FFFFFF` | `bg-white` | Kartu konten, panel kanan formulir, navbar |
| `text-primary` | `#111827` | `text-gray-900` | Judul utama, label input, angka statistik |
| `text-secondary` | `#4B5563` | `text-gray-600` | Paragraf deskripsi, subjudul seksi |
| `text-muted` | `#6B7280` | `text-gray-500` | Teks bantuan (*helper text*), *placeholder*, catatan kaki |
| `border-subtle` | `#E5E7EB` | `border-gray-200` | Garis tepi kartu, pembatas seksi, *border* input normal |

**Warna Status & Kondisi Sampah (Fase 2–7):**
- **Status `Aktif` / `selesai` / Kondisi `bersih`**: Teks `#15803D` (`text-green-700`), Latar `#DCFCE7` (`bg-green-100`), Border `#BBF7D0` (`border-green-200`).
- **Status `menunggu` / Kondisi `kotor`**: Teks `#B45309` (`text-amber-700`), Latar `#FEF3C7` (`bg-amber-100`), Border `#FDE68A` (`border-amber-200`).
- **Status `ditolak` / Error / Kondisi `tercampur_air`**: Teks `#B91C1C` (`text-red-700`), Latar `#FEE2E2` (`bg-red-100`), Border `#FECACA` (`border-red-200`).

### 1.2 Tipografi (`Inter`)

Muat font `Inter` melalui `next/font/google` dengan subset `latin`.

| Elemen | Ukuran Desktop | Ukuran Mobile | Ketebalan | Line Height & Tracking |
|---|---|---|---|---|
| **Hero Display** | `48px` (`text-5xl`) | `32px` (`text-3xl`) | `font-bold` (700) | `leading-[1.15] tracking-tight` |
| **Judul Seksi (H2)** | `32px` (`text-3xl`) | `24px` (`text-2xl`) | `font-bold` (700) | `leading-tight tracking-tight` |
| **Judul Panel Auth** | `28px` (`text-2xl`–`3xl`) | `22px` (`text-xl`) | `font-bold` (700) | `leading-snug` |
| **Judul Kartu (H3)** | `18px` (`text-lg`) | `16px` (`text-base`) | `font-semibold` (600) | `leading-snug` |
| **Label Seksi (Eyebrow)** | `12px` (`text-xs`) | `11px` (`text-[11px]`) | `font-semibold` (600) | `uppercase tracking-[0.08em] text-[#1E7E48]` |
| **Teks Paragraf (Body)** | `16px` (`text-base`) | `14px` (`text-sm`) | `font-normal` (400) | `leading-relaxed text-gray-600` |
| **Label Input Form** | `14px` (`text-sm`) | `14px` (`text-sm`) | `font-medium` (500) | `text-gray-800` |
| **Helper / Caption** | `12px` (`text-xs`) | `12px` (`text-xs`) | `font-normal` (400) | `text-gray-500` |

### 1.3 Radius, Bayangan, dan Grid

- **Kontainer Utama**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Radius Sudut**:
  - Kartu besar, panel split auth, gambar hero, banner CTA: `rounded-2xl` (`16px`) hingga `rounded-3xl` (`24px`).
  - Kartu fitur, kartu statistik, kotak info: `rounded-xl` (`12px`).
  - Input form & tombol: `rounded-lg` (`8px`) atau `rounded-xl` (`10px`).
  - Lencana (*pill badge*): `rounded-full`.
- **Bayangan (Shadows)**:
  - Kartu standar: `shadow-sm border border-gray-200/80`.
  - Kartu autentikasi / modal: `shadow-xl border border-gray-100`.

---

## 2. Spesifikasi Layar Fase 1 (Berdasarkan Figma PDF)

### 2.1 Layar 1: Landing Page Publik (`/`)

Halaman publik terdiri dari 8 seksi berurutan dari atas ke bawah:

#### A. Navbar (`sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100`)
- **Kiri (Brand)**: Kotak ikon hijau (`w-9 h-9 rounded-lg bg-[#1E7E48] flex items-center justify-center text-white`) berisi ikon daun/daur ulang (`Leaf` / `Recycle`), diikuti teks tebal `SIMPANWASTE` (`font-bold text-gray-900 tracking-tight`).
- **Tengah (Menu Navigasi — Desktop `hidden md:flex gap-8 text-sm font-medium text-gray-600`)**:
  - `Tentang Sistem` (anchor `#tentang`)
  - `Alur Penyetoran` (anchor `#alur`)
  - `Maps` (anchor `#maps`)
- **Kanan (Aksi Autentikasi)**:
  - Tautan teks `Masuk` (`/login`, `text-sm font-medium text-gray-700 hover:text-[#1E7E48] px-3 py-2`).
  - Tombol `Daftar` (`/register`, `bg-[#1E7E48] hover:bg-[#18663A] text-white text-sm font-medium px-4 py-2 rounded-lg transition`).

#### B. Hero Section (`py-12 lg:py-20`)
- **Tata Letak**: Grid 2 kolom pada desktop (`grid-cols-1 lg:grid-cols-12 gap-10 items-center`).
- **Kolom Kiri (7 kolom)**:
  - Judul Utama:
    ```text
    Pilah Hari Ini,
    Hijaukan Masa Depan.
    ```
    Baris `Pilah Hari Ini,` berwarna hitam (`text-gray-900`), sedangkan `Hijaukan Masa Depan.` berwarna hijau (`text-[#1E7E48]`).
  - Subjudul: `"Mulai kebiasaan memilah sampah dari rumah. Setorkan sampah anorganik bernilai ekonomis dan pantau hasilnya melalui SIMPANWASTE."`
  - Grup Tombol (`flex flex-wrap gap-3 mt-8`):
    - CTA Primer: `Mulai Sekarang` + ikon `ArrowRight` $\rightarrow$ mengarah ke `/register` (`bg-[#1E7E48] text-white px-6 py-3 rounded-xl font-medium`).
    - CTA Sekunder: `Pelajari Sistem` $\rightarrow$ mengarah ke `#tentang` (`bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium`).
- **Kolom Kanan (5 kolom)**:
  - Kontainer foto vertikal/persegi (`relative rounded-2xl overflow-hidden shadow-lg aspect-[4/4.2]`).
  - Gambar latar: Foto aktivitas memilah botol plastik ke dalam boks kontainer putih di dalam ruangan (`/images/hero-sorting.jpg`).
  - Kartu *Overlay* di bagian bawah gambar (`absolute bottom-4 left-4 right-4 bg-black/55 backdrop-blur-md text-white p-4 rounded-xl flex items-center gap-3`):
    - Ikon bulat hijau/putih (`Leaf`) di kiri.
    - Teks kecil: `Kebiasaan berkelanjutan` (`text-xs text-gray-200`).
    - Teks utama: `Pemilahan dimulai dari lingkungan terdekat` (`text-sm font-semibold`).
  - Teks catatan kecil di kanan bawah luar gambar: `Data di bawah menggunakan data demonstrasi` (`text-[11px] text-gray-400 text-right mt-2`).

#### C. Seksi Gambaran Sistem — Statistik Dampak (`py-10 border-y border-gray-100 bg-white`)
- **Header Seksi** (`flex justify-between items-end mb-6`):
  - Kiri: Eyebrow `GAMBARAN SISTEM`, Judul H2 `Dampak yang dapat dipantau`.
  - Kanan: Label kecil `Data demonstrasi` (`text-xs text-gray-400`).
- **Grid 4 Kartu Statistik** (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`):
  1. Angka: `12,8 ton` (`text-2xl font-bold text-[#1E7E48]`) · Label: `Total sampah anorganik tercatat`
  2. Angka: `1.240+` (`text-2xl font-bold text-[#1E7E48]`) · Label: `Transaksi penyetoran tercatat`
  3. Angka: `8 lokasi` (`text-2xl font-bold text-[#1E7E48]`) · Label: `Bank sampah aktif terdata`
  4. Angka: `Timbang manual` (`text-xl font-bold text-gray-900`) · Label: `Diverifikasi langsung oleh petugas`
  - Gaya tiap kartu: `bg-[#F8FAF9] border border-gray-200/70 rounded-xl p-5`.

#### D. Seksi Tentang Sistem (`#tentang`, `py-16 lg:py-24`)
- **Tata Letak**: Grid 2 kolom (`grid-cols-1 lg:grid-cols-12 gap-8 items-start`).
- **Kolom Kiri (5 kolom)**:
  - Eyebrow: `TENTANG SISTEM`
  - Judul H2: `Membangun kebiasaan memilah sampah melalui pengelolaan yang lebih terstruktur.`
- **Kolom Kanan (7 kolom, `space-y-4 text-gray-600`)**:
  - Paragraf 1: `"SIMPANWASTE merupakan sistem informasi berbasis web yang dirancang untuk membantu masyarakat dalam mengelola penyetoran sampah anorganik secara lebih mudah dan transparan."`
  - Paragraf 2: `"Melalui satu platform, warga dapat memperoleh informasi pemilahan sampah, mengetahui lokasi bank sampah aktif, serta memantau hasil penyetoran mereka. Sistem ini juga membantu petugas dalam pencatatan penimbangan dan membantu pengelola memantau data sampah terkumpul."`
  - Kotak *Highlight* (`bg-[#EAF6EE] border border-[#C6E6D1] rounded-xl p-4 flex items-center gap-3 text-sm font-medium text-[#153626]`):
    - Ikon `CheckCircle2` hijau + teks: `"Mendukung pengelolaan sampah anorganik berbasis pemilahan di Kota Palembang."`

#### E. Seksi Fitur Utama (`py-16 lg:py-24 bg-[#F8FAF9]`)
- **Header Tengah/Kiri**:
  - Eyebrow: `FITUR UTAMA`
  - Judul H2: `Dirancang untuk mendukung alur yang nyata`
  - Subjudul: `Fitur yang relevan bagi warga dalam mengelola setoran sampah anorganik.`
- **Grid 4 Kartu Fitur** (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10`):
  Setiap kartu berwarna putih (`bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm`), memiliki kotak ikon hijau muda (`w-10 h-10 rounded-lg bg-[#EAF6EE] text-[#1E7E48] flex items-center justify-center mb-4`):
  1. Ikon `BookOpen` · Judul: **Informasi & Edukasi Pemilahan** · Deskripsi: Panduan pemilahan sampah rumah tangga, pengolahan kompos organik mandiri, dan cara membersihkan sampah anorganik.
  2. Ikon `ClipboardList` · Judul: **Pelaporan Setoran Sampah** · Deskripsi: Kemudahan melaporkan rencana setoran sampah anorganik melalui metode penjemputan (*pickup*) maupun antar langsung (*drop-off*).
  3. Ikon `MapPin` · Judul: **Maps Bank Sampah** · Deskripsi: Pemetaan interaktif titik lokasi bank sampah yang aktif beroperasi di Kota Palembang beserta jam operasionalnya.
  4. Ikon `Wallet` · Judul: **Saldo & Riwayat Transaksi** · Deskripsi: Pencatatan transparan riwayat berat setoran terverifikasi dan saldo tabungan yang dilindungi PIN keamanan.

#### F. Seksi Alur Penyetoran (`#alur`, `py-16 lg:py-24 bg-white`)
- **Header**:
  - Eyebrow: `ALUR PENYETORAN`
  - Judul H2: `Empat langkah yang sederhana dan transparan`
- **Grid 4 Langkah** (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10`):
  Setiap kartu memiliki lencana nomor langkah (`LANGKAH 01` s.d. `LANGKAH 04` dalam teks kecil hijau), ikon bulat hijau di atas, judul tebal, dan deskripsi singkat:
  1. `LANGKAH 01` · Ikon `Recycle` · **Pilah Sampah dari Rumah**: Pisahkan sampah anorganik bernilai ekonomis dan pastikan kondisinya bersih.
  2. `LANGKAH 02` · Ikon `Send` · **Buat Laporan Setoran**: Pilih kategori sampah, isi estimasi berat, dan tentukan lokasi *pickup* atau *drop-off*.
  3. `LANGKAH 03` · Ikon `Scale` · **Verifikasi & Penimbangan**: Petugas memeriksa kondisi kebersihan dan menimbang berat aktual sampah.
  4. `LANGKAH 04` · Ikon `BadgeCheck` / `Coins` · **Saldo Diperbarui**: Sistem menghitung nilai konversi otomatis dan menambahkannya ke saldo akun Anda.

#### G. Seksi Pratinjau Maps Bank Sampah (`#maps`, `py-16 lg:py-24 bg-[#F4F8F5]`)
- **Tata Letak**: Grid 2 kolom (`grid-cols-1 lg:grid-cols-12 gap-8 items-center`).
- **Kolom Kiri (6 kolom)**:
  - Eyebrow: `MAPS BANK SAMPAH`
  - Judul H2: `Temukan lokasi penyetoran di Palembang`
  - Deskripsi: `Lihat lokasi yang tersedia beserta alamat dan jam operasionalnya.`
  - Kotak Info Demo (`bg-white/80 border border-gray-200 rounded-lg px-3.5 py-2 text-xs text-gray-600 my-4`): `"Data berikut mengikuti data demonstrasi yang digunakan di dalam sistem."`
  - **Daftar 3 Kartu Bank Sampah Demo** (`space-y-3`):
    1. **Bank Sampah Sejahtera** · Subteks alamat & jam: `08:00–16:00` · Badge kanan: `Aktif` (hijau).
    2. **Bank Sampah Melati** · Subteks alamat & jam: `09:00–14:00` · Badge kanan: `Aktif` (hijau).
    3. **Bank Sampah Kalidoni Hijau** · Subteks alamat & jam: `08:00–16:00` · Badge kanan: `Aktif` (hijau).
  - Tombol di bawah daftar: `Masuk untuk Buka Maps` (`/login`, `mt-6 inline-flex items-center gap-2 bg-[#1E7E48] hover:bg-[#18663A] text-white px-5 py-2.5 rounded-xl text-sm font-medium`).
- **Kolom Kanan (6 kolom)**:
  - Ilustrasi/Pratinjau Kartu Peta Statis (`rounded-2xl border border-gray-200 bg-[#E6F0EA] p-6 relative min-h-[360px] flex flex-col justify-between overflow-hidden`):
    - Pola garis jalan/grid lembut dengan label wilayah `Kota Palembang` dan 3 pin lokasi hijau (`MapPin`).
    - Kartu melayang di bagian bawah (`bg-white rounded-xl p-4 shadow-md flex items-center justify-between`):
      - Kiri: Logo kecil + `SIMPANWASTE` / `Kota Palembang`.
      - Kanan: Badge `8 titik tersedia`.

#### H. Banner CTA Bawah & Footer (`bg-white pt-12`)
- **Banner CTA** (`max-w-7xl mx-auto px-4 mb-16`):
  - Kotak hijau tua (`bg-[#153626] text-white rounded-3xl p-8 md:p-12 text-center`):
    - Judul: `Mulai Langkah Kecil untuk Lingkungan yang Lebih Baik.` (`text-2xl md:text-3xl font-bold`)
    - Subjudul: `Bergabung dengan SIMPANWASTE dan mulai kelola sampah anorganik secara lebih terstruktur.` (`text-gray-200 mt-3 max-w-2xl mx-auto text-sm md:text-base`)
    - Tombol Aksi (`flex justify-center gap-4 mt-8 flex-wrap`):
      - `Daftar sebagai Warga` (`/register`, `bg-white text-[#153626] hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl text-sm`)
      - `Masuk ke Sistem` (`/login`, `border border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl text-sm`)
- **Footer (`bg-[#0F291E] text-gray-300 py-12 text-sm`)**:
  - 3 Kolom:
    - Kolom 1: Brand `SIMPANWASTE` + deskripsi singkat sistem pengelolaan sampah berbasis pemilahan Kota Palembang.
    - Kolom 2 (`Navigasi`): Tentang Sistem, Fitur Utama, Alur Penyetoran, Maps.
    - Kolom 3 (`Akses Sistem`): Masuk, Daftar Warga.
  - Garis bawah (`border-t border-white/10 mt-8 pt-6 text-xs text-gray-400 flex justify-between`):
    - `© 2026 SIMPANWASTE. Hak cipta dilindungi.`

---

### 2.2 Layar 2: Halaman Login (`/login`)

- **Tata Letak**: Halaman terpusat (`min-h-screen bg-[#F4F7F5] flex items-center justify-center p-4 md:p-8`). Kontainer utama berupa kartu besar 2 kolom (`w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12`).
- **Panel Kiri — Informasi Brand (`lg:col-span-5 bg-[#153626] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden`)**:
  - **Header Brand**: Kotak ikon daun (`bg-white/10 p-2.5 rounded-xl`) + teks `SIMPANWASTE` (`font-bold text-base`) dan sub-label `KOTA PALEMBANG` (`text-[11px] tracking-widest text-emerald-300 uppercase`).
  - **Konten Tengah (`my-8`)**:
    - Pill Badge: `• Sistem pengelolaan sampah terpadu` (`inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-emerald-200 mb-5`).
    - Judul Besar:
      ```text
      Pilah hari ini,
      hijaukan masa depan.
      ```
    - Deskripsi: `"Kelola setoran sampah anorganik, pantau tabungan, dan terhubung dengan bank sampah terverifikasi dalam satu layanan."` (`text-sm text-gray-200 mt-4 leading-relaxed`).
    - **Grid 3 Kotak Statistik Kaca (*Glassmorphism*)** (`grid grid-cols-3 gap-2.5 mt-8`):
      1. `12,8 ton` / `Sampah terkelola`
      2. `1.240+` / `Setoran warga`
      3. `8` / `Bank sampah`
      - Gaya tiap kotak: `bg-white/10 border border-white/10 rounded-xl p-3`.
  - **Catatan Kaki Bawah**: `"Data pada prototipe ini merupakan data demonstrasi."` (`text-[11px] text-gray-400`).
- **Panel Kanan — Formulir Login (`lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white`)**:
  - Eyebrow: `Selamat datang kembali` (`text-xs font-semibold text-[#1E7E48]`)
  - Judul: `Masuk ke akun Anda` (`text-2xl md:text-3xl font-bold text-gray-900 mt-1`)
  - Subjudul: `Pilih peran demo lalu masukkan data untuk menjelajahi SIMPANWASTE.` (`text-sm text-gray-500 mt-1.5`)
  - **Pemilih Peran (Segmented Role Tabs — 3 Tab)**:
    - Kontainer: `grid grid-cols-3 bg-gray-100 p-1 rounded-xl my-6`.
    - Pilihan Tab: `Warga` | `Petugas` | `Admin`.
    - Tab Aktif: `bg-white text-[#1E7E48] font-semibold shadow-sm rounded-lg py-2 text-sm`.
    - Tab Non-aktif: `text-gray-600 hover:text-gray-900 font-medium py-2 text-sm`.
    - *Perilaku*: Sesuai `PRD.md` AUTH-02, peran akun yang login harus cocok dengan tab yang dipilih; jika tidak cocok, tampilkan pesan *error* yang jelas.
  - **Input Formulir (`space-y-4`)**:
    - **Username**: Label `Username`, ikon kiri `User`, placeholder/nilai contoh `ayu.lestari`.
    - **Password**: Label `Password`, ikon kiri `Lock`, placeholder `Masukkan password`, tombol ikon kanan `Eye` / `EyeOff` untuk tampilkan/sembunyikan sandi.
  - **Tombol Submit**: `Masuk ke SIMPANWASTE →` (`w-full bg-[#1E7E48] hover:bg-[#18663A] text-white font-semibold py-3 rounded-xl mt-6 transition flex items-center justify-center gap-2`).
  - **Kotak Info Akun Demo** (`mt-5 bg-[#EAF6EE] border border-[#C6E6D1] rounded-xl p-3.5 text-xs text-[#153626] flex items-start gap-2.5`):
    - Ikon `Info` + teks: `"Akun demo: Anda dapat masuk menggunakan data yang sudah terisi untuk setiap peran."`
  - **Tautan Bawah**: `Belum punya akun warga? ` + tautan `Daftar sekarang` (`/register`, `text-[#1E7E48] font-semibold hover:underline`).

---

### 2.3 Layar 3: Registrasi Warga — Langkah 1 Data Diri (`/register`)

- **Tata Letak**: Kartu split 2 kolom yang identik ukurannya dengan halaman Login (`max-w-5xl rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12`).
- **Panel Kiri (`lg:col-span-5 bg-[#153626] text-white p-8 md:p-10 flex flex-col justify-between`)**:
  - **Header Brand**: Ikon daun + `SIMPANWASTE` dan sub-label `PALEMBANG PILOT`.
  - **Konten Tengah**:
    - Pill Badge: `REGISTRASI WARGA` (`bg-white/10 text-emerald-200 text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full`).
    - Judul: `Mulai perjalananmu menuju lingkungan yang lebih bersih.` (`text-2xl md:text-3xl font-bold mt-4`).
    - Deskripsi: `Buat akun dan bergabung bersama gerakan pemilahan sampah melalui SIMPANWASTE.` (`text-sm text-gray-200 mt-3`).
    - **Indikator Langkah Vertikal (2 Kartu Stepper — `space-y-3 mt-8`)**:
      - **Kartu Step 01 (Aktif)**: `bg-white/15 border border-white/25 rounded-xl p-4 flex items-start gap-3.5`. Lingkaran nomor `01` (`bg-white text-[#153626] font-bold w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0`), judul `STEP 01 · DATA DIRI` (`text-xs font-bold tracking-wider text-emerald-200`), deskripsi `Lengkapi informasi pribadi untuk membuat akun.` (`text-xs text-white mt-0.5`).
      - **Kartu Step 02 (Non-aktif)**: `bg-white/5 border border-white/10 opacity-65 rounded-xl p-4 flex items-start gap-3.5`. Lingkaran nomor `02` (`border border-white/40 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0`), judul `STEP 02 · KEAMANAN AKUN`, deskripsi `Buat password dan PIN untuk melindungi akun serta saldo tabungan.`.
  - **Badge Kaki Kiri**: Pill `KHUSUS WARGA` (`inline-flex items-center gap-1.5 text-xs text-emerald-200 bg-white/10 px-3 py-1.5 rounded-full w-fit`).
- **Panel Kanan (`lg:col-span-7 p-8 md:p-12 bg-white`)**:
  - **Baris Navigasi Atas (`flex items-center justify-between mb-4`)**:
    - Kiri: Tautan `← Kembali ke login` (`/login`, `text-xs font-medium text-gray-500 hover:text-gray-800`).
    - Kanan: Pill `LANGKAH 1 DARI 2` (`bg-[#EAF6EE] text-[#1E7E48] text-xs font-semibold px-3 py-1 rounded-full`).
  - **Progress Bar**: Batang horizontal tipis (`w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6`) dengan isi `w-1/2 bg-[#1E7E48]`.
  - **Judul Form**: `Daftar sebagai Warga` (`text-2xl font-bold text-gray-900`)
  - **Subjudul Form**: `Lengkapi informasi berikut untuk membuat akun SIMPANWASTE.` (`text-sm text-gray-500 mt-1 mb-6`)
  - **Input Formulir Langkah 1**:
    - Baris 1 (`grid grid-cols-1 sm:grid-cols-2 gap-4`):
      - **Nama lengkap**: Ikon `User`, placeholder `Contoh: Ayu Lestari`.
      - **Username unik**: Ikon `AtSign`, placeholder `contoh.username`, teks bantuan di bawah input: `Huruf kecil, angka, titik, atau garis bawah.` (`Regex: ^[a-z0-9._]+$`).
    - Baris 2 (Lebar penuh):
      - **Nomor telepon**: Ikon `Phone`, placeholder `08xx xxxx xxxx`.
    - Baris 3 (Lebar penuh):
      - **Alamat lengkap**: Ikon `MapPin`, elemen `<textarea rows={3}>`, placeholder `Masukkan alamat domisili lengkap di Palembang`.
  - **Tombol Aksi**: `Lanjutkan →` (`w-full bg-[#1E7E48] hover:bg-[#18663A] text-white font-semibold py-3 rounded-xl mt-6`). Memvalidasi input Langkah 1 sebelum beralih ke Langkah 2.
  - **Tautan Bawah**: `Sudah memiliki akun? ` + `Masuk sekarang` (`/login`).

---

### 2.4 Layar 4: Registrasi Warga — Langkah 2 Keamanan Akun (`/register` Step 2)

- **Panel Kiri (`lg:col-span-5 bg-[#153626]`)**:
  - Sama dengan Langkah 1, namun status **Indikator Langkah Vertikal** berubah:
    - **Kartu Step 01 (Selesai)**: Lingkaran kiri menampilkan ikon centang `✓` (`Check` dengan latar hijau terang `bg-[#1E7E48] text-white`).
    - **Kartu Step 02 (Aktif)**: `bg-white/15 border border-white/25`, lingkaran nomor `02` menyala putih (`bg-white text-[#153626] font-bold`).
- **Panel Kanan (`lg:col-span-7 p-8 md:p-12 bg-white`)**:
  - **Baris Atas**: `← Kembali ke login` di kiri, pill `LANGKAH 2 DARI 2` di kanan.
  - **Progress Bar**: Terisi penuh 100% (`w-full bg-[#1E7E48]`).
  - **Judul & Subjudul**: `Daftar sebagai Warga` / `Lengkapi informasi berikut untuk membuat akun SIMPANWASTE.`
  - **Input Formulir Langkah 2 (`space-y-4`)**:
    - Baris 1 (`grid grid-cols-1 sm:grid-cols-2 gap-4`):
      - **Password**: Ikon `Lock`, placeholder `Minimal 8 karakter`, tombol `Eye`, teks bantuan: `Gunakan minimal 8 karakter.`
      - **Konfirmasi password**: Ikon `Lock`, placeholder `Ulangi password`, tombol `Eye`.
    - Baris 2 (Lebar penuh):
      - **PIN keamanan**: Ikon `ShieldCheck` / `KeyRound`, input `type="password"` dengan `inputMode="numeric" maxLength={6}`, placeholder `••••••`, teks bantuan: `Tepat 6 angka untuk melindungi akses saldo tabungan.`
  - **Baris Tombol Aksi Ganda (`flex items-center gap-3 mt-8`)**:
    - Tombol Kiri: `← Kembali` (`px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm`) $\rightarrow$ kembali ke Langkah 1 tanpa menghapus data yang sudah diketik.
    - Tombol Kanan: `Daftar Akun Warga →` (`flex-1 bg-[#1E7E48] hover:bg-[#18663A] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2`).
  - **Tautan Bawah**: `Sudah memiliki akun? Masuk sekarang`.

---

## 3. Arsitektur Layout & Navigasi Pasca-Login (Fase 1 Placeholder – Fase 7)

Setelah pengguna berhasil login, sistem mengarahkan pengguna ke rute sesuai perannya (`/warga`, `/petugas`, `/admin`) dengan tata letak aplikasi (*App Shell*) berikut:

### 3.1 App Shell Warga (`/warga/*`)
- **Desktop**: Sidebar kiri tetap (`w-64 bg-white border-r border-gray-200`) dengan logo `SIMPANWASTE`, lencana peran `Warga`, menu navigasi vertikal:
  1. `Beranda & Lapor Setoran` (`PlusCircle` / `Home`)
  2. `Riwayat & Saldo` (`Wallet` — ditandai ikon gembok kecil `Lock` karena membutuhkan PIN)
  3. `Penarikan Saldo` (`ArrowUpRight`)
  4. `Maps Bank Sampah` (`MapPin`)
  5. `Edukasi Pemilahan` (`BookOpen`)
  6. `Profil Saya` (`User`)
- **Mobile**: Header atas ringkas (Logo + Tombol Keluar) dan *Bottom Navigation Bar* 5 menu utama (`fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30`).

### 3.2 App Shell Petugas (`/petugas/*`)
- Dirancang *mobile-first* agar nyaman dioperasikan di lapangan menggunakan *smartphone*:
  1. `Daftar Tugas Setoran` (`ClipboardCheck` — menampilkan antrean *pickup* dan *drop-off* berstatus `menunggu`)
  2. `Antrean Penarikan Saldo` (`Banknote`)
  3. `Katalog Harga & Kondisi` (`Tags` — *read-only* referensi harga per kg)
  4. `Maps & Edukasi` (`Map`)
  5. `Profil Petugas` (`User`)

### 3.3 App Shell Admin (`/admin/*`)
- **Desktop-first** (`w-64 bg-[#153626] text-white` sidebar gelap agar kontras dengan tampilan Warga):
  1. `Dashboard Analitik` (`BarChart3`)
  2. `Data Master Sampah` (`Database` — Kategori, Harga $\times$ 3 Kondisi, Batas Minimum Pickup)
  3. `Mitra & Distribusi` (`Truck`)
  4. `Monitoring Setoran & Saldo` (`FileSpreadsheet` — *read-only* agregat)
  5. `Kelola Akun (Petugas/Admin)` (`Users`)
  6. `Maps & Konten Edukasi` (`MapPin`)

---

## 4. Spesifikasi Desain Modul Internal (Fase 2 – Fase 7)

### 4.1 Fase 2: Data Master & Kelola Akun (Admin)
- **Tabel Katalog & Matriks Harga**:
  - Tampilkan 28 kategori sampah dalam tabel bersih dengan kolom: `Nama Kategori`, `Harga Bersih (Rp/kg)`, `Harga Kotor (Rp/kg)`, `Harga Tercampur Air (Rp/kg)`, `Status Aktif`, dan tombol `Ubah`.
  - Editing harga ketiga kondisi dilakukan dalam satu baris atau satu modal sekaligus agar admin tidak perlu membuka 3 form berbeda untuk 1 jenis sampah.
- **Kartu Pengaturan Batas Pickup**:
  - Kartu menonjol di bagian atas halaman Data Master untuk mengatur `batas_minimum_pickup_kg` (input numerik dalam satuan `kg` beserta tombol `Simpan Perubahan`).

### 4.2 Fase 3: Informasi Edukasi & Maps Bank Sampah (`Leaflet`)
- **Halaman Edukasi**:
  - Menampilkan 4 tab atau 4 kartu akordeon terstruktur sesuai `PRD.md` 5.2: (1) Kompos Organik Mandiri, (2) Cara Membersihkan Sampah Anorganik, (3) Alur Penyetoran Pickup & Drop-off, (4) Alur Hilir Sampah.
- **Komponen Peta Interaktif (`Leaflet` Client-Only)**:
  - Wajib dibungkus dengan `dynamic(() => import('./BankSampahMap'), { ssr: false })`.
  - Sediakan *skeleton loader* abu-abu (`animate-pulse bg-gray-100 rounded-2xl h-[480px]`) saat peta dimuat.
  - Gunakan tata letak berdampingan (daftar kartu bank sampah di kiri `lg:col-span-4`, kanvas peta Leaflet di kanan `lg:col-span-8`). Klik kartu di kiri akan menggeser fokus (*flyTo*) ke pin bank sampah pada peta dan membuka *popup* berisi nama, alamat, jam operasional, dan lencana `Aktif`.

### 4.3 Fase 4: Pelaporan Setoran Warga & Daftar Tugas Petugas
- **Form Pelaporan Warga**:
  - **Pemilih Metode**: 2 kartu radio besar (`Pickup — Dijemput Petugas` vs `Drop-off — Antar ke Bank Sampah`).
  - **Pemilih Kategori Sampah**: Daftar *checkbox* atau *multi-select* kategori aktif dari database.
  - **Input Estimasi Berat Total (kg)**: Input angka desimal.
  - **Validasi Real-Time Batas Pickup**: Jika warga memilih `Pickup` tetapi `estimasi_berat` kurang dari `batas_minimum_pickup_kg` (misal $< 5\text{ kg}$), tampilkan *alert* kuning (`bg-amber-50 border-amber-200 text-amber-800`) yang menonaktifkan tombol kirim *Pickup* dan menyediakan tombol pintas `"Alihkan ke Drop-off"`.
  - **Penentu Lokasi**:
    - Jika `Pickup`: Peta mini *draggable marker* (atau tombol `"Gunakan Lokasi Saya"`) untuk mengisi `latitude` dan `longitude`.
    - Jika `Drop-off`: *Dropdown* pilihan Bank Sampah aktif beserta tampilan jam operasionalnya.

### 4.4 Fase 5: Penimbangan Petugas & Riwayat Saldo Warga (Modal PIN)
- **Form Verifikasi & Penimbangan Petugas**:
  - Menampilkan info pelapor, metode, titik lokasi (dengan tombol buka navigasi), dan tabel baris kategori sampah yang dilaporkan.
  - Pada setiap baris kategori, petugas mengisi:
    1. `Berat Aktual (kg)` (`input type="number" step="0.01"`)
    2. `Kondisi Sampah` (3 pilihan *segmented pill* atau *select*: `Bersih`, `Kotor`, `Tercampur Air`).
  - **Kalkulasi Pratinjau Langsung**: Sistem langsung menampilkan harga per kg yang berlaku dan `Subtotal (Rp)` per baris serta `Total Berat` dan `Total Nilai Saldo (Rp)` di bagian bawah sebelum petugas menekan tombol `Simpan & Selesaikan Penimbangan`.
- **Modal Verifikasi PIN 6 Angka (Warga)**:
  - Muncul saat warga membuka menu `Riwayat & Saldo` atau menekan tombol `Ajukan Penarikan`.
  - Desain modal terpusat (`max-w-sm rounded-2xl p-6 bg-white shadow-2xl`), ikon perisai hijau di tengah, input 6 kotak digit atau 1 input terfokus berformat `••••••` (`tracking-[0.5em] text-center text-2xl font-bold`).

### 4.5 Fase 6: Penarikan Saldo / Potong Iuran
- **Tampilan Warga**: Kartu saldo utama berwarna hijau tua (`bg-[#153626] text-white rounded-2xl p-6`), tombol `Ajukan Penarikan / Potong Iuran`, pilihan tujuan (`Tarik Tabungan` atau `Potong Iuran Sampah Bulanan`), input nominal Rupiah (maksimal senilai saldo saat ini), dan tabel status pengajuan (`menunggu` / `selesai`).
- **Tampilan Petugas**: Tabel antrean pengajuan berstatus `menunggu` dengan tombol konfirmasi `Tandai Selesai Diproses`.

### 4.6 Fase 7: Dashboard Analitik Admin (`Recharts`)
- **4 Kartu KPI Atas**: Total Berat Sampah Terkumpul (kg/ton), Total Nilai Saldo Terdistribusi (Rp), Jumlah Transaksi Selesai, dan Total Berat Tersalurkan ke Mitra Pengepul.
- **Filter Periode**: *Dropdown* atau *segmented button* (7 Hari Terakhir, Bulan Ini, Tahun Ini, Semua Waktu).
- **2 Grafik Utama (`Recharts`)**:
  1. *BarChart / AreaChart*: Tren berat sampah terkumpul per periode (warna batang utama `#1E7E48`).
  2. *PieChart / Horizontal BarChart*: Komposisi berat sampah per kategori anorganik.

---

## 5. Komponen UI Standar & Umpan Balik Pengguna

1. **Input Field Standar**:
   - Tinggi `h-11` (`py-2.5 px-3.5`), dengan ikon di sisi kiri (`pl-10 text-gray-400`).
   - State normal: `border border-gray-300 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400`.
   - State fokus: `focus:outline-none focus:ring-2 focus:ring-[#1E7E48]/20 focus:border-[#1E7E48]`.
   - State error: `border-red-500 focus:ring-red-500/20` diikuti teks merah `text-xs text-red-600 mt-1`.
2. **Tombol (*Buttons*)**:
   - Selalu tampilkan *spinner* (`Loader2 className="w-4 h-4 animate-spin"`) dan `disabled:opacity-60` saat form sedang mengirim data ke Supabase.
3. **Banner Data Demo**:
   - Untuk data *seed* (`is_demo = true`), tampilkan lencana kecil `DEMO` (`bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full`) agar penguji dapat membedakan data simulasi awal dengan transaksi baru saat pengujian Black-box dan UAT.

---

## 6. Pemetaan Ikon (`lucide-react`) & Aset Gambar

| Kebutuhan Visual | Nama Ikon `lucide-react` / Path Aset |
|---|---|
| Logo SIMPANWASTE | `Leaf` atau `Recycle` di dalam kotak hijau |
| Foto Hero Landing Page | `public/images/hero-sorting.jpg` (dengan *fallback* gradien hijau jika belum tersedia) |
| Statistik & Fitur | `Scale`, `BookOpen`, `ClipboardList`, `MapPin`, `Wallet`, `CheckCircle2` |
| Form Autentikasi | `User`, `AtSign`, `Phone`, `MapPin`, `Lock`, `Eye`, `EyeOff`, `ShieldCheck`, `ArrowRight`, `ArrowLeft`, `Info` |
| Navigasi & Dashboard | `LayoutDashboard`, `Database`, `Truck`, `Users`, `LogOut`, `Coins`, `Banknote`, `Loader2` |