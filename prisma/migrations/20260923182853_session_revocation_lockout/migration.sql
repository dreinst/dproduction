-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedLogins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- Login mencari username dalam huruf kecil. Baris yang bentrok setelah dinormalkan (misalnya 'Budi' dan 'budi') dibiarkan supaya migrasi tidak gagal; ubah manual lewat Setting Login.
UPDATE "User" AS u
SET "username" = lower(btrim(u."username"))
WHERE u."username" <> lower(btrim(u."username"))
  AND NOT EXISTS (
    SELECT 1 FROM "User" AS o
    WHERE o."id" <> u."id" AND lower(btrim(o."username")) = lower(btrim(u."username"))
  );
