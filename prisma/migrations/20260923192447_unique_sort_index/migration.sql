-- Urutan lama bisa kembar (default 0), jadi dinomori ulang 1..n dengan urutan yang sama sebelum dibuat unik.
UPDATE "HeadHome" AS t SET "sortIndex" = r.rn
FROM (SELECT "id", (ROW_NUMBER() OVER (ORDER BY "sortIndex", "id"))::int AS rn FROM "HeadHome") AS r
WHERE t."id" = r."id";

UPDATE "GaleriFotoAlbum" AS t SET "sortIndex" = r.rn
FROM (SELECT "id", (ROW_NUMBER() OVER (ORDER BY "sortIndex", "id"))::int AS rn FROM "GaleriFotoAlbum") AS r
WHERE t."id" = r."id";

-- CreateIndex
CREATE UNIQUE INDEX "GaleriFotoAlbum_sortIndex_key" ON "GaleriFotoAlbum"("sortIndex");

-- CreateIndex
CREATE UNIQUE INDEX "HeadHome_sortIndex_key" ON "HeadHome"("sortIndex");
