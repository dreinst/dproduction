-- Foto hero Beranda mengikuti desain v2: garis start QRIS Fun Run menggantikan foto jeep Temu Responden.
-- Hanya baris Head Home yang masih memakai foto lama yang diganti, bersama judul dan keterangannya. Foto yang sudah
-- diganti lewat dashboard tidak tersentuh, berkas ini aman kalau terulang, dan di database kosong tidak ada baris yang
-- dibuat: di sana hero memakai konten cadangan di kode, atau diisi scripts/seed-landing-content.ts.
-- Cap waktu ditulis dalam UTC seperti yang ditulis aplikasi, apa pun zona waktu sesi database.
UPDATE "HeadHome"
SET "image" = '/assets/portfolio/qris-fun-run-start.jpg',
    "title" = 'QRIS Fun Run Bank Indonesia',
    "caption" = 'Pelari di garis start QRIS Fun Run Bank Indonesia di Malang.',
    "updatedAt" = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
WHERE "image" = '/assets/portfolio/temres-magelang-jeep-warna.jpg';
