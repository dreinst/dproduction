-- Kolom deletedAt sudah ada di schema.prisma (Client, Event, Wedding, WorkspaceSalary,
-- WorkspaceEvent) sejak revisi "soft delete", tapi tidak pernah masuk ke migrasi manapun
-- (dulu ditambahkan langsung ke schema.prisma lewat skrip add-deletedat.js, tanpa migrate).
-- Migrasi ini menutup celah itu supaya prisma migrate deploy di database baru tidak gagal.
ALTER TABLE "Client" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Wedding" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "WorkspaceSalary" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "WorkspaceEvent" ADD COLUMN "deletedAt" TIMESTAMP(3);
