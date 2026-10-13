-- Katalog harga v2: kategori katalog, kolom tambahan item (kategori, harga lewat WhatsApp, penanda "Mulai",
-- harga tambahan, urutan), dan nomor WhatsApp kedua kantor.
-- Hanya menambah tabel dan kolom yang boleh kosong atau punya nilai bawaan, supaya versi aplikasi sebelumnya
-- tetap jalan di skema ini selama pergantian versi.
CREATE TABLE "RentalCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RentalCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RentalCategory_name_key" ON "RentalCategory"("name");

ALTER TABLE "Rental" ADD COLUMN "categoryId" INTEGER,
ADD COLUMN "priceHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "priceFrom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "extraPrices" JSONB,
ADD COLUMN "sortIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RentalCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "KantorSetting" ADD COLUMN "whatsapp2" TEXT;
