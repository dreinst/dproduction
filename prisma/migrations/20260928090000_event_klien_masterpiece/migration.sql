-- Master Event: klien penyelenggara dan tanda Masterpiece (event terbesar, tampil dengan foto).
ALTER TABLE "Event" ADD COLUMN "client" TEXT,
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
