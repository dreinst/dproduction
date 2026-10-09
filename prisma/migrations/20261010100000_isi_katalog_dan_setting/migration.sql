-- Isi katalog harga v2 (4 kategori, 22 item), nomor WhatsApp kedua kantor, dan foto dua kartu Masterpiece.
-- Baris dicocokkan lewat nama, dan yang diisi hanya nilai yang masih kosong atau masih nilai lama. Jadi berkas ini aman
-- kalau terulang dan tidak menimpa perubahan dari dashboard. Di database kosong tidak ada baris yang dibuat: di sana
-- katalog memakai konten cadangan di kode, atau diisi scripts/seed-landing-content.ts.

-- 1. Empat kategori dan 18 item dari pricelist (13 efek panggung, 5 fireworks). Keduanya hanya diisi sekali, yaitu saat
--    Master Rental sudah berisi dan belum ada kategori sama sekali, supaya kategori atau item yang nanti diganti nama
--    atau dihapus admin tidak muncul lagi. "unit" berisi keterangan harga yang tampil apa adanya di samping nominal.
WITH "kategori" AS (
  INSERT INTO "RentalCategory" ("name", "description", "sortIndex", "updatedAt")
  SELECT v."name", v."description", v."sortIndex", CURRENT_TIMESTAMP
  FROM (VALUES
    ('Efek Panggung', 'Untuk momen pembuka, puncak acara, first dance, sampai penutupan.', 1),
    ('Fireworks', 'Harga awal. Jumlah shot menyesuaikan durasi dan lokasi acara.', 2),
    ('Sound dan Lighting', 'Menyesuaikan ukuran venue dan jumlah tamu.', 3),
    ('Tenda dan Perlengkapan', 'Untuk acara luar ruang maupun dalam ruang.', 4)
  ) AS v("name", "description", "sortIndex")
  WHERE EXISTS (SELECT 1 FROM "Rental") AND NOT EXISTS (SELECT 1 FROM "RentalCategory")
  ORDER BY v."sortIndex"
  RETURNING "id", "name"
)
INSERT INTO "Rental" ("name", "categoryId", "price", "unit", "priceFrom", "extraPrices", "photo", "sortIndex", "updatedAt")
SELECT v."name", k."id", v."price", v."unit", v."priceFrom", v."extraPrices"::jsonb, v."photo", v."sortIndex", CURRENT_TIMESTAMP
FROM (VALUES
  ('Snow', 'Efek Panggung', 400000, 'per mesin', false, NULL, NULL, 1),
  ('Bubble', 'Efek Panggung', 300000, 'per mesin', false, NULL, '/assets/katalog/bubble.jpg', 2),
  ('Smoke', 'Efek Panggung', 300000, 'per mesin', false, NULL, NULL, 3),
  ('Dry Ice', 'Efek Panggung', 1500000, 'per momen', false, '[{"amount": 2000000, "unit": "per 2 momen"}]', '/assets/katalog/dry-ice.jpg', 4),
  ('Confetti Mortar', 'Efek Panggung', 300000, 'per mesin', false, NULL, '/assets/katalog/confetti-mortar.jpg', 5),
  ('Giant Confetti', 'Efek Panggung', 1500000, 'per 1 kg', false, '[{"amount": 2500000, "unit": "per 2 kg"}]', '/assets/katalog/giant-confetti.jpg', 6),
  ('Silver Jet', 'Efek Panggung', 300000, 'per titik', false, NULL, '/assets/katalog/silver-jet.jpg', 7),
  ('Single Jet Fire', 'Efek Panggung', 900000, 'per mesin', false, NULL, '/assets/katalog/single-jet-fire.jpg', 8),
  ('Rotary Sparkle', 'Efek Panggung', 1200000, 'per mesin', false, NULL, '/assets/katalog/rotary-sparkle.jpg', 9),
  ('Pyro', 'Efek Panggung', 300000, 'per titik', false, NULL, NULL, 10),
  ('Pyro Wheel', 'Efek Panggung', 2500000, 'per mesin', false, NULL, '/assets/katalog/pyro-wheel.jpg', 11),
  ('CO2 Gun', 'Efek Panggung', 1000000, 'per mesin', false, NULL, '/assets/katalog/co2-gun.jpg', 12),
  ('CO2 Jet', 'Efek Panggung', 1000000, 'per 8 kg', false, '[{"amount": 2500000, "unit": "per 25 kg"}]', '/assets/katalog/co2-jet.jpg', 13),
  ('Waterfall Fireworks', 'Fireworks', 2500000, 'per 25 titik', true, NULL, NULL, 14),
  ('Daylight Firework', 'Fireworks', 4000000, 'per 100 shot', true, NULL, '/assets/katalog/daylight-firework.jpg', 15),
  ('Paket Fireworks A', 'Fireworks', 12000000, '300 sampai 400 shot', true, NULL, '/assets/katalog/paket-fireworks-a.jpg', 16),
  ('Paket Fireworks B', 'Fireworks', 15000000, '400 sampai 500 shot', true, NULL, '/assets/katalog/paket-fireworks-b.jpg', 17),
  ('Paket Fireworks C', 'Fireworks', 20000000, '500 sampai 700 shot', true, NULL, '/assets/katalog/paket-fireworks-c.jpg', 18)
) AS v("name", "category", "price", "unit", "priceFrom", "extraPrices", "photo", "sortIndex")
JOIN "kategori" k ON k."name" = v."category"
WHERE NOT EXISTS (SELECT 1 FROM "Rental" r WHERE r."name" = v."name")
ORDER BY v."sortIndex";

-- 2. Empat item sewa lama: nama mengikuti desain v2, masuk kategorinya, dan harganya hanya lewat WhatsApp (harga lama
--    tetap tersimpan). Hanya untuk item yang belum berkategori dan belum diberi urutan, jadi pengaturan yang nanti
--    diubah admin tidak tertimpa. Keterangan "hari" menjadi "per hari", dan foto hanya dipasang kalau masih kosong.
UPDATE "Rental" r
SET "name" = v."name", "categoryId" = c."id", "priceHidden" = true, "sortIndex" = v."sortIndex",
    "unit" = CASE WHEN r."unit" = 'hari' THEN 'per hari' ELSE r."unit" END,
    "photo" = COALESCE(NULLIF(r."photo", ''), v."photo"),
    "updatedAt" = CURRENT_TIMESTAMP
FROM (VALUES
  ('Sound System Pro', 'Sound System', 'Sound dan Lighting', '/assets/portfolio/pekan-qris-nasional-panggung.jpg', 19),
  ('Lighting Stage', 'Lighting Stage', 'Sound dan Lighting', '/assets/portfolio/ustegra-panggung-peresmian.jpg', 20),
  ('Tenda Premium', 'Tenda', 'Tenda dan Perlengkapan', '/assets/portfolio/qris-fun-run-start.jpg', 21),
  ('Kursi & Meja', 'Kursi dan Meja', 'Tenda dan Perlengkapan', '/assets/portfolio/ustegra-aula-perayaan.jpg', 22)
) AS v("oldName", "name", "category", "photo", "sortIndex")
JOIN "RentalCategory" c ON c."name" = v."category"
WHERE r."name" IN (v."oldName", v."name") AND r."categoryId" IS NULL AND r."sortIndex" = 0;

-- 3. Nomor WhatsApp kedua kantor. Hanya diisi kalau masih kosong.
UPDATE "KantorSetting" SET "whatsapp2" = '082132370811', "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 1 AND "whatsapp2" IS NULL;

-- 4. Foto dua kartu Masterpiece disamakan dengan desain v2. Hanya diganti kalau masih memakai foto lama.
UPDATE "Event" SET "photo" = '/assets/portfolio/temres-magelang-gala-kostum.jpg', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Temu Responden Bank Indonesia (Magelang)'
  AND "photo" = '/assets/portfolio/temres-magelang-drone-silancur.jpg';
UPDATE "Event" SET "photo" = '/assets/portfolio/ustegra-gedung-udara.jpg', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'Peresmian Gedung Ekstensi PT. Ustegra'
  AND "photo" = '/assets/portfolio/ustegra-perayaan-karyawan.jpg';
