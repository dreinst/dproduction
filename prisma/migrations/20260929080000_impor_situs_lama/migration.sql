-- Data situs PHP lama: rekening dan id lama crew, id lama event, absensi, dan daftar klien.
ALTER TABLE "Crew" ADD COLUMN "bankAccount" TEXT,
ADD COLUMN "legacyId" INTEGER;
CREATE UNIQUE INDEX "Crew_legacyId_key" ON "Crew"("legacyId");

ALTER TABLE "WorkspaceEvent" ADD COLUMN "legacyId" INTEGER;
CREATE UNIQUE INDEX "WorkspaceEvent_legacyId_key" ON "WorkspaceEvent"("legacyId");

CREATE TABLE "Absensi" (
    "id" SERIAL NOT NULL,
    "workspaceEventId" INTEGER NOT NULL,
    "crewId" INTEGER NOT NULL,
    "jobDescId" INTEGER,
    "kind" TEXT NOT NULL DEFAULT 'absen',
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "photo" TEXT,
    "note" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "legacyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Absensi_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Absensi_legacyKey_key" ON "Absensi"("legacyKey");
CREATE INDEX "Absensi_workspaceEventId_idx" ON "Absensi"("workspaceEventId");
CREATE INDEX "Absensi_crewId_idx" ON "Absensi"("crewId");
ALTER TABLE "Absensi" ADD CONSTRAINT "Absensi_workspaceEventId_fkey" FOREIGN KEY ("workspaceEventId") REFERENCES "WorkspaceEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Absensi" ADD CONSTRAINT "Absensi_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Klien" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "logo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Klien_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Klien_name_key" ON "Klien"("name");
