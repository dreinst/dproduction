-- Model Workspace baru (Crew, penugasan, tarif, status administrasi), konten landing dari dashboard,
-- lead dengan status dan penanggung jawab, serta AuditLog yang benar-benar dipakai.
-- Kebijakan hapus sekarang satu: hapus permanen, jadi kolom deletedAt dibuang dari semua tabel.

-- Pengaman: tabel lama di bawah ini dibuang atau dibuat ulang. Di produksi semuanya kosong menurut audit
-- 24 September 2026; kalau ternyata sudah berisi, migrasi berhenti di sini sebelum ada yang berubah.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "WorkspaceEvent")
    OR EXISTS (SELECT 1 FROM "WorkspaceSalary")
    OR EXISTS (SELECT 1 FROM "WorkspaceReport")
    OR EXISTS (SELECT 1 FROM "GaleriFoto")
    OR EXISTS (SELECT 1 FROM "GaleriFotoAlbum")
    OR EXISTS (SELECT 1 FROM "AuditLog")
    OR EXISTS (SELECT 1 FROM "JobDesc" WHERE "levelA" IS NOT NULL OR "levelB" IS NOT NULL OR "levelC" IS NOT NULL)
  THEN
    RAISE EXCEPTION 'Migrasi workspace_konten_akun dibatalkan: tabel lama yang akan dibuang masih berisi data. Backup dan pindahkan datanya dulu.';
  END IF;
END $$;

-- CreateEnum
CREATE TYPE "WorkspaceEventStatus" AS ENUM ('berjalan', 'selesai', 'batal', 'ditunda');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('belum', 'invoice_terkirim', 'lunas', 'selesai');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('baru', 'dihubungi', 'penawaran', 'deal', 'batal');

-- Baris yang sudah dihapus lunak (soft delete) ikut dihapus permanen sebelum kolomnya dibuang.
DELETE FROM "Event" WHERE "deletedAt" IS NOT NULL;
ALTER TABLE "Event" DROP COLUMN "deletedAt";

DELETE FROM "Wedding" WHERE "deletedAt" IS NOT NULL;
ALTER TABLE "Wedding" DROP COLUMN "deletedAt";

DELETE FROM "Client" WHERE "deletedAt" IS NOT NULL;
ALTER TABLE "Client" DROP COLUMN "deletedAt",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "picId" INTEGER,
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'baru',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "workspaceEventId" INTEGER;

-- Harga teks lama seperti "Rp 1.500.000" menjadi 1500000; isian tanpa angka menjadi NULL (tampil "Hubungi Kami").
ALTER TABLE "Rental" ALTER COLUMN "price" TYPE INTEGER
  USING NULLIF(regexp_replace("price", '[^0-9]', '', 'g'), '')::integer;

-- Tanggal berdiri teks (misalnya "2016-01-01") disimpan sebagai tahun saja.
ALTER TABLE "KantorSetting" ADD COLUMN "foundedYear" INTEGER;
UPDATE "KantorSetting" SET "foundedYear" = substring("foundedDate" from '^([0-9]{4})')::integer;
ALTER TABLE "KantorSetting" DROP COLUMN "foundedDate",
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "statClients" INTEGER,
ADD COLUMN     "statEvents" INTEGER,
ADD COLUMN     "statRentalCategories" INTEGER,
ADD COLUMN     "statMembers" INTEGER,
ADD COLUMN     "statYears" INTEGER,
ALTER COLUMN "companyName" SET DEFAULT 'D''Production';

-- Tarif per level pindah ke tabel Tarif (JobDesc x GradeEvent).
ALTER TABLE "JobDesc" DROP COLUMN "levelA",
DROP COLUMN "levelB",
DROP COLUMN "levelC";

-- Tabel lama yang kosong dibuang; yang strukturnya berubah total dibuat ulang.
DROP TABLE "WorkspaceSalary";
DROP TABLE "WorkspaceReport";
DROP TABLE "WorkspaceEvent";
DROP TABLE "GaleriFoto";
DROP TABLE "GaleriFotoAlbum";
DROP TABLE "AuditLog";

-- CreateTable
CREATE TABLE "Tarif" (
    "jobDescId" INTEGER NOT NULL,
    "gradeEventId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarif_pkey" PRIMARY KEY ("jobDescId","gradeEventId")
);

-- CreateTable
CREATE TABLE "Crew" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceEvent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "location" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "gradeEventId" INTEGER,
    "status" "WorkspaceEventStatus" NOT NULL DEFAULT 'berjalan',
    "photoUrl" TEXT,
    "videoUrl" TEXT,
    "notes" TEXT,
    "adminStatus" "AdminStatus" NOT NULL DEFAULT 'belum',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "workspaceEventId" INTEGER NOT NULL,
    "crewId" INTEGER NOT NULL,
    "jobDescId" INTEGER NOT NULL,
    "honor" INTEGER NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GaleriAlbum" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GaleriAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GaleriFoto" (
    "id" SERIAL NOT NULL,
    "albumId" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "caption" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GaleriFoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "username" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "GaleriVideo" ADD COLUMN     "sortIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "HeadHome" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE INDEX "Assignment_crewId_idx" ON "Assignment"("crewId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_workspaceEventId_crewId_jobDescId_key" ON "Assignment"("workspaceEventId", "crewId", "jobDescId");

-- CreateIndex
CREATE UNIQUE INDEX "GaleriAlbum_name_key" ON "GaleriAlbum"("name");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Client_workspaceEventId_key" ON "Client"("workspaceEventId");

-- CreateIndex
CREATE INDEX "Client_status_createdAt_idx" ON "Client"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GaleriFoto_albumId_idx" ON "GaleriFoto"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "JobDesc_name_key" ON "JobDesc"("name");

-- CreateIndex
CREATE INDEX "WorkspaceEvent_startAt_idx" ON "WorkspaceEvent"("startAt");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_picId_fkey" FOREIGN KEY ("picId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_workspaceEventId_fkey" FOREIGN KEY ("workspaceEventId") REFERENCES "WorkspaceEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarif" ADD CONSTRAINT "Tarif_jobDescId_fkey" FOREIGN KEY ("jobDescId") REFERENCES "JobDesc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarif" ADD CONSTRAINT "Tarif_gradeEventId_fkey" FOREIGN KEY ("gradeEventId") REFERENCES "GradeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceEvent" ADD CONSTRAINT "WorkspaceEvent_gradeEventId_fkey" FOREIGN KEY ("gradeEventId") REFERENCES "GradeEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_workspaceEventId_fkey" FOREIGN KEY ("workspaceEventId") REFERENCES "WorkspaceEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_jobDescId_fkey" FOREIGN KEY ("jobDescId") REFERENCES "JobDesc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GaleriFoto" ADD CONSTRAINT "GaleriFoto_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GaleriAlbum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
