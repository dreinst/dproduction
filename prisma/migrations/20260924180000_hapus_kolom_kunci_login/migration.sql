-- Kunci login per username pindah ke memori server supaya username yang ada dan yang tidak ada diperlakukan sama.
ALTER TABLE "User" DROP COLUMN "failedLogins",
DROP COLUMN "lockedUntil";
