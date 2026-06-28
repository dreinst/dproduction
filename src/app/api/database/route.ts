import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const { authorized, response } = await requireRole(['owner', 'superadmin']);
  if (!authorized) return response;

  try {
    const clientsCount = await prisma.client.count({ where: { deletedAt: null } });
    const eventsCount = await prisma.event.count({ where: { deletedAt: null } });
    const weddingsCount = await prisma.wedding.count({ where: { deletedAt: null } });
    const rentalsCount = await prisma.rental.count();
    const galeriFotoCount = await prisma.galeriFoto.count();
    const galeriVideoCount = await prisma.galeriVideo.count();

    const data = [
      { id: 1, name: "Tabel Klien", records: clientsCount, lastUpdated: new Date().toLocaleDateString('id-ID') },
      { id: 2, name: "Tabel Event", records: eventsCount, lastUpdated: new Date().toLocaleDateString('id-ID') },
      { id: 3, name: "Tabel Wedding", records: weddingsCount, lastUpdated: new Date().toLocaleDateString('id-ID') },
      { id: 4, name: "Tabel Rental", records: rentalsCount, lastUpdated: new Date().toLocaleDateString('id-ID') },
      { id: 5, name: "Tabel Galeri Foto", records: galeriFotoCount, lastUpdated: new Date().toLocaleDateString('id-ID') },
      { id: 6, name: "Tabel Galeri Video", records: galeriVideoCount, lastUpdated: new Date().toLocaleDateString('id-ID') },
    ];

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
