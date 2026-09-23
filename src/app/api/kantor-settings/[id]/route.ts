import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { KANTOR_ID, kantorSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('kantorSettings', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID setting kantor tidak valid.');
    if (id !== KANTOR_ID) return apiError(404, 'Setting kantor tidak ditemukan.');
    const data = kantorSchema.parse(await readJson(req));
    const settings = await prisma.kantorSetting.upsert({
      where: { id: KANTOR_ID },
      create: { id: KANTOR_ID, ...data },
      update: data,
    });
    return NextResponse.json(settings);
  } catch (error) {
    return handleRouteError(error);
  }
}
