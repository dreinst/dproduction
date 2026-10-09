-- Kurasi Master Klien dan Master Event dari rekonsiliasi database situs lama dan database baru (10 Oktober 2026).
-- Semua langkah mencocokkan lewat nama atau nilai kolom, jadi aman kalau terulang dan tidak berbuat apa pun di database kosong.
-- Klien yang tidak dihitung tidak disebut di sini: mereka dikenali karena namanya tidak ada di daftar langkah 2.

-- 1. Nama tampilan klien. Baris lama hanya diganti kalau nama barunya belum dipakai baris lain.
UPDATE "Klien" SET "name" = 'OT Group', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Group OT' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'OT Group');
UPDATE "Klien" SET "name" = 'Kementerian Dalam Negeri', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Kemendagri' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Kementerian Dalam Negeri');
UPDATE "Klien" SET "name" = 'Kementerian Keuangan', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Kemenkeu' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Kementerian Keuangan');
UPDATE "Klien" SET "name" = 'Pemerintah Provinsi Jawa Timur', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Pemprov Jatim' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Pemerintah Provinsi Jawa Timur');
UPDATE "Klien" SET "name" = 'Kemenko Polhukam', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Kemenpolhukam' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Kemenko Polhukam');
UPDATE "Klien" SET "name" = 'Smara Wedding Organizer', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Smara WO' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Smara Wedding Organizer');
UPDATE "Klien" SET "name" = 'Emba', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'EMBA | Jetbus Run' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Emba');
UPDATE "Klien" SET "name" = 'Gereja Katolik Paroki Maria Ratu Damai Banyuwangi', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Gereja Katolik Paroki Maria Ratu Damai, Banyuwangi'
  AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Gereja Katolik Paroki Maria Ratu Damai Banyuwangi');
UPDATE "Klien" SET "name" = 'Universitas Airlangga', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'UNAIR' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Universitas Airlangga');
UPDATE "Klien" SET "name" = 'MS Glow', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'MS GLOW' AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'MS Glow');

-- 2. Hanya klien di daftar ini yang dihitung dan boleh tampil. Baris lain disembunyikan dan logonya dilepas,
--    supaya pita logo tidak pernah menampilkan baris yang belum diperiksa.
UPDATE "Klien" SET "active" = false, "logo" = NULL, "updatedAt" = CURRENT_TIMESTAMP
WHERE ("active" OR "logo" IS NOT NULL)
  AND "name" NOT IN (
    'OT Group', 'Bentoel Group', 'Astra Group', 'Universitas Brawijaya', 'Kementerian Dalam Negeri',
    'Bank Indonesia', 'Kementerian Keuangan', 'Pemerintah Provinsi Jawa Timur', 'Peksy 89', 'Kemenko Polhukam',
    'Kemendikbud', 'Smara Wedding Organizer', 'Emba', 'Gereja Katolik Paroki Maria Ratu Damai Banyuwangi',
    'Cuddle Me', 'Universitas Airlangga', 'Universitas Ma Chung', 'BRI', 'MS Glow', 'Aice',
    'G4S', 'KPU Kabupaten Malang', 'Smartfren', 'PT. Ustegra', 'eL Hotel'
  );

-- 3. Klien yang selama ini hanya tertulis di kolom klien Master Event. Hanya diisi kalau tabel sudah berisi.
INSERT INTO "Klien" ("name", "updatedAt")
SELECT 'G4S', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Klien") AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'G4S');
INSERT INTO "Klien" ("name", "updatedAt")
SELECT 'KPU Kabupaten Malang', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Klien") AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'KPU Kabupaten Malang');
INSERT INTO "Klien" ("name", "updatedAt")
SELECT 'Smartfren', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Klien") AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'Smartfren');
INSERT INTO "Klien" ("name", "updatedAt")
SELECT 'PT. Ustegra', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Klien") AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'PT. Ustegra');
INSERT INTO "Klien" ("name", "updatedAt")
SELECT 'eL Hotel', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Klien") AND NOT EXISTS (SELECT 1 FROM "Klien" WHERE "name" = 'eL Hotel');

-- 4. Logo. Lambang Kementerian Dalam Negeri memakai berkas 387 x 500 sebagai pengganti berkas 100 x 100.
--    Satu berkas lain dilepas: lambang acara reuni sebuah komunitas yang belum dipastikan boleh tampil.
UPDATE "Klien" SET "logo" = '/assets/klien/klien-Kemendagri1751908735230.png', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Kementerian Dalam Negeri'
  AND ("logo" IS NULL OR "logo" = '/assets/klien/klien-21745712848234.png');
UPDATE "Klien" SET "logo" = NULL, "updatedAt" = CURRENT_TIMESTAMP
WHERE "logo" = '/assets/klien/klien-logopeksy891751908125000.png';

-- 5. Dua pekerjaan persewaan dari database situs lama yang belum ada di Master Event. Hanya diisi kalau tabel sudah berisi,
--    supaya database kosong tetap memakai daftar cadangan di kode.
INSERT INTO "Event" ("name", "client", "year", "description", "photo", "active", "featured", "updatedAt")
SELECT 'Sound system untuk Jalan Sehat di Universitas Ma Chung', 'Universitas Ma Chung', 2025, NULL, NULL, true, false, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Event")
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Sound system untuk Jalan Sehat di Universitas Ma Chung');
INSERT INTO "Event" ("name", "client", "year", "description", "photo", "active", "featured", "updatedAt")
SELECT 'Sound system untuk Peluncuran Album di The Grove', NULL, 2025, NULL, NULL, true, false, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Event")
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Sound system untuk Peluncuran Album di The Grove');

-- 5b. Enam pekerjaan sound system lain dari database situs lama. Pekerjaannya tercatat lengkap dengan sesi kerja
--     dan absensi kru, tetapi nama acaranya tidak tertulis, jadi nama di sini hanya memuat peran dan tempat yang tercatat.
INSERT INTO "Event" ("name", "client", "year", "description", "photo", "active", "featured", "updatedAt")
SELECT 'Sound system untuk Bank Indonesia Malang', 'Bank Indonesia', 2025, NULL, NULL, true, false, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Event")
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Sound system untuk Bank Indonesia Malang');
INSERT INTO "Event" ("name", "client", "year", "description", "photo", "active", "featured", "updatedAt")
SELECT 'Sound system untuk Ngajum Sae', NULL, 2025, NULL, NULL, true, false, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Event")
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Sound system untuk Ngajum Sae');
INSERT INTO "Event" ("name", "client", "year", "description", "photo", "active", "featured", "updatedAt")
SELECT 'Sound system untuk acara di Tunjungsekar', NULL, 2025, NULL, NULL, true, false, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Event")
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Sound system untuk acara di Tunjungsekar');
INSERT INTO "Event" ("name", "client", "year", "description", "photo", "active", "featured", "updatedAt")
SELECT 'Sound system untuk acara di Double Tree', NULL, 2025, NULL, NULL, true, false, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Event")
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Sound system untuk acara di Double Tree');
INSERT INTO "Event" ("name", "client", "year", "description", "photo", "active", "featured", "updatedAt")
SELECT 'Sound system untuk acara di Ijen Suites', NULL, 2025, NULL, NULL, true, false, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Event")
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Sound system untuk acara di Ijen Suites');
INSERT INTO "Event" ("name", "client", "year", "description", "photo", "active", "featured", "updatedAt")
SELECT 'Sound system untuk acara di hotel ibis', NULL, 2025, NULL, NULL, true, false, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Event")
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Sound system untuk acara di hotel ibis');

-- 6. Event 2025 ini selama ini memakai foto dan keterangan edisi 2024 (spanduk di fotonya bertuliskan 2024).
UPDATE "Event" SET "photo" = NULL, "description" = NULL, "featured" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Pekan QRIS Nasional dan QRIS Jelajah Indonesia'
  AND "photo" = '/assets/portfolio/qris-jelajah-indonesia-coban-rondo.jpg';

-- 7. Nama event disesuaikan dengan pekerjaan yang tercatat dan ejaan di poster acaranya.
--    Kalau nama barunya sudah ada (misalnya dari seed), baris bernama lama disembunyikan supaya tidak terhitung dua kali.
UPDATE "Event" SET "name" = 'Booth Bank Indonesia di Pasar Santri Sidogiri', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Pasar Santri Sidogiri'
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Booth Bank Indonesia di Pasar Santri Sidogiri');
UPDATE "Event" SET "name" = 'Internet Starlink untuk BRI di Bromo', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Starlink BRI Bromo'
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Internet Starlink untuk BRI di Bromo');
UPDATE "Event" SET "name" = 'Digifes BI Ngalam 2023', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Digifest BI Ngalam 2023'
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "name" = 'Digifes BI Ngalam 2023');
UPDATE "Event" SET "active" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "active" AND "name" IN ('Pasar Santri Sidogiri', 'Starlink BRI Bromo', 'Digifest BI Ngalam 2023');

-- 8. Angka event dan klien di Setting Kantor masih angka situs lama (47 dan 17). Dikosongkan supaya dihitung dari tabel.
UPDATE "KantorSetting" SET "statEvents" = NULL, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 1 AND "statEvents" = 47;
UPDATE "KantorSetting" SET "statClients" = NULL, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 1 AND "statClients" = 17;

-- 9. Jumlah anggota kru sekarang lebih dari 200. Angka ini diisi tangan dan tampil sebagai "200+".
UPDATE "KantorSetting" SET "statMembers" = 200, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 1 AND "statMembers" = 179;
