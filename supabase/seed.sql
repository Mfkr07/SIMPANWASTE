-- ==============================================================================
-- SIMPANWASTE - DATA SEED AWAL
-- Katalog 5 Kategori, Harga 3 Kondisi, Pengaturan, Bank Sampah, & Edukasi
-- ==============================================================================

-- 1. Pengaturan Sistem
insert into public.pengaturan_sistem (batas_minimum_pickup_kg)
values (5.00)
on conflict do nothing;

-- 2. Kategori Sampah (5 Kategori Terkonfirmasi)
insert into public.kategori_sampah (id, nama_kategori, deskripsi, is_aktif)
values
  ('11111111-1111-1111-1111-111111111101', 'Kaca', 'Botol kaca, toples, pecahan kaca bening atau berwarna', true),
  ('11111111-1111-1111-1111-111111111102', 'Plastik', 'Botol PET bening/warna, tutup botol, gelas plastik, plastik campuran', true),
  ('11111111-1111-1111-1111-111111111103', 'Besi', 'Kaleng makanan/minuman, besi pipa, rongsokan logam, seng, tembaga/alma', true),
  ('11111111-1111-1111-1111-111111111104', 'Kertas', 'Kardus cokelat, duplex, buku tulis, majalah, kertas arsip putih/bersih, koran', true),
  ('11111111-1111-1111-1111-111111111105', 'Kayu', 'Papan kayu bekas, balok kayu, sisa palet kayu tidak berlumut', true)
on conflict (nama_kategori) do nothing;

-- 3. Harga Sampah (Kombinasi 5 Kategori x 3 Kondisi)
insert into public.harga_sampah (id_kategori, kondisi, harga_per_kg)
values
  -- Kaca
  ('11111111-1111-1111-1111-111111111101', 'bersih', 800.00),
  ('11111111-1111-1111-1111-111111111101', 'kotor', 500.00),
  ('11111111-1111-1111-1111-111111111101', 'tercampur_air', 300.00),

  -- Plastik
  ('11111111-1111-1111-1111-111111111102', 'bersih', 3000.00),
  ('11111111-1111-1111-1111-111111111102', 'kotor', 2000.00),
  ('11111111-1111-1111-1111-111111111102', 'tercampur_air', 1200.00),

  -- Besi
  ('11111111-1111-1111-1111-111111111103', 'bersih', 4500.00),
  ('11111111-1111-1111-1111-111111111103', 'kotor', 3500.00),
  ('11111111-1111-1111-1111-111111111103', 'tercampur_air', 2500.00),

  -- Kertas
  ('11111111-1111-1111-1111-111111111104', 'bersih', 2000.00),
  ('11111111-1111-1111-1111-111111111104', 'kotor', 1500.00),
  ('11111111-1111-1111-1111-111111111104', 'tercampur_air', 1000.00),

  -- Kayu
  ('11111111-1111-1111-1111-111111111105', 'bersih', 600.00),
  ('11111111-1111-1111-1111-111111111105', 'kotor', 400.00),
  ('11111111-1111-1111-1111-111111111105', 'tercampur_air', 200.00)
on conflict (id_kategori, kondisi)
do update set harga_per_kg = excluded.harga_per_kg, updated_at = now();

-- 4. Bank Sampah (Mitra Utama & Lokasi Studi + Demo Palembang)
insert into public.bank_sampah (id, nama, alamat, latitude, longitude, jam_operasional, is_aktif, is_demo)
values
  (
    '22222222-2222-2222-2222-222222222201',
    'Bank Sampah Graha Pena Palembang',
    'Jl. Kol. H. Burlian No. 55, Karya Baru, Kec. Alang-Alang Lebar, Kota Palembang',
    -2.9463000,
    104.7391000,
    'Senin - Sabtu: 08.00 - 16.00 WIB',
    true,
    false
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Bank Sampah Berkah Ilir Barat (Demo)',
    'Jl. Demang Lebar Daun No. 12, Ilir Barat I, Kota Palembang',
    -2.9750000,
    104.7300000,
    'Senin - Jumat: 08.30 - 15.30 WIB',
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Bank Sampah Sukarami Mandiri (Demo)',
    'Jl. Sukabangun II No. 88, Sukarami, Kota Palembang',
    -2.9320000,
    104.7450000,
    'Selasa - Minggu: 09.00 - 16.00 WIB',
    true,
    true
  )
on conflict do nothing;

-- 5. Konten Edukasi (4 Topik Sesuai PRD EDU-01)
insert into public.konten_edukasi (judul, topik, urutan, isi)
values
  (
    'Pembuatan Kompos Mandiri dari Sampah Organik Rumah Tangga',
    'Kompos Organik',
    1,
    'Meskipun SIMPANWASTE berfokus pada konversi saldo untuk sampah anorganik terpilah, pemilahan di hulu dimulai dari dapur Anda. Sisihkan sisa sayur, kulit buah, dan dedaunan kering. Gunakan wadah komposter berventilasi dengan rasio 2 bagian bahan cokelat (daun kering/kardus tak berlapis) dan 1 bagian bahan hijau (sisa dapur) untuk menghasilkan pupuk kompos tanpa bau tak sedap.'
  ),
  (
    'Panduan Membersihkan & Mengeringkan Sampah Anorganik',
    'Pemilahan Anorganik',
    2,
    'Sampah anorganik dengan kondisi BERSIH memiliki nilai konversi rupiah tertinggi. Pastikan botol plastik dibilas dari sisa minuman, kaleng makanan dicuci bersih, dan kardus dijaga agar tidak basah terkena hujan atau genangan air. Sampah yang tercampur air akan dinilai lebih rendah karena beban kelembapan dan risiko penurunan mutu daur ulang.'
  ),
  (
    'Alur Penyetoran Sampah: Kapan Memilih Pickup vs Drop-off?',
    'Prosedur Setoran',
    3,
    'Layanan Pickup khusus melayani penjemputan langsung di lokasi warga dengan batas estimasi minimal 5 kg. Jika total sampah Anda di bawah 5 kg, sistem akan menyarankan metode Drop-off langsung ke Bank Sampah Graha Pena atau titik bank sampah terdekat. Pastikan Anda mengemas sampah secara terpilah sesuai kelompoknya.'
  ),
  (
    'Menuju Ekonomi Sirkular: Jejak Hilir Daur Ulang di Palembang',
    'Alur Hilir',
    4,
    'Sampah yang Anda setorkan ditimbang secara transparan oleh petugas dan langsung dicatat ke saldo tabungan. Selanjutnya, bank sampah mengelompokkan sampah terpilah untuk disalurkan ke mitra pengepul dan pabrik daur ulang resmi. Tiap kilogram sampah anorganik yang terselamatkan mengurangi beban TPA Sukawinatan Palembang.'
  )
on conflict do nothing;

-- 6. Mitra Pengepul Awal
insert into public.mitra_pengepul (nama, alamat, kontak, is_aktif)
values
  ('UD Daur Ulang Musi Indah', 'Jl. Soekarno Hatta No. 101, Palembang', '0812-7890-1234', true),
  ('CV Sriwijaya Logam Presisi', 'Kawasan Industri Gandus, Palembang', '0813-6789-5678', true)
on conflict do nothing;
