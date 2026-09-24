import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { HttpError, apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { MESSAGES, followUpSchema, leadSelect } from '../schema';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('leads', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID lead tidak valid.');

    const lead = await prisma.client.findUnique({ where: { id }, select: leadSelect });
    return lead ? NextResponse.json(lead) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

// Mengubah tindak lanjut saja: status, catatan, dan penanggung jawab.
export async function PATCH(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('leads', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID lead tidak valid.');
    const data = followUpSchema.parse(await readJson(req));

    const { lead, changes } = await prisma.$transaction(async (tx) => {
      const current = await tx.client.findUnique({ where: { id }, select: { status: true, notes: true, picId: true } });
      if (!current) throw new HttpError(404, MESSAGES.P2025);
      const changes: string[] = [];
      if (data.status !== undefined && data.status !== current.status) {
        changes.push(`status ${current.status} menjadi ${data.status}`);
      }
      if (data.notes !== undefined && data.notes !== current.notes) changes.push('catatan tindak lanjut diubah');
      if (data.picId !== undefined && data.picId !== current.picId) {
        if (data.picId !== null) {
          const pic = await tx.user.findFirst({ where: { id: data.picId, active: true }, select: { id: true } });
          if (!pic) throw new HttpError(400, 'Penanggung jawab tidak ditemukan atau nonaktif.');
        }
        changes.push('penanggung jawab diubah');
      }
      const lead = await tx.client.update({ where: { id }, data, select: leadSelect });
      return { lead, changes };
    });

    if (changes.length) await audit(auth.user, 'ubah', 'Client', id, changes.join(', '));
    return NextResponse.json(lead);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('leads', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID lead tidak valid.');

    await prisma.client.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'Client', id, 'lead dihapus permanen');
    return NextResponse.json({ message: 'Lead dihapus.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
