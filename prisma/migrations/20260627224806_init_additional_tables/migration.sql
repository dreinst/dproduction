-- CreateTable
CREATE TABLE "WorkspaceEvent" (
    "id" SERIAL NOT NULL,
    "jobDesc" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "client" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "waktu" TEXT,
    "event" TEXT,
    "deskripsi" TEXT,
    "linkFoto" TEXT,
    "linkVideo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceReport" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GaleriFotoAlbum" (
    "id" SERIAL NOT NULL,
    "album" TEXT NOT NULL,
    "keterangan" TEXT,
    "tanggal" TEXT,
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GaleriFotoAlbum_pkey" PRIMARY KEY ("id")
);
