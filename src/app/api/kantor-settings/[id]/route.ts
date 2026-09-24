import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { KANTOR_ID, kantorSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('kantorSettings', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID setting kantor tidak valid.');
    if (id !== KANTOR_ID) return apiError(404, 'Setting kantor tidak ditemukan.');
    const parsed = kantorSchema.safeParse(await readJson(req));
    // Data lama bisa salah di beberapa field sekaligus, jadi semua pesan dikirim agar bisa dibetulkan dalam sekali simpan.
    if (!parsed.success) {
      const { issues } = parsed.error;
      return apiError(400, [...new Set(issues.map((issue) => issue.message))].join('\n'), { issues });
    }
    const data = parsed.data;
    const before = await prisma.kantorSetting.findUnique({ where: { id: KANTOR_ID } });
    const settings = await prisma.kantorSetting.upsert({
      where: { id: KANTOR_ID },
      create: { id: KANTOR_ID, ...data },
      update: data,
    });
    const changed = (Object.keys(data) as (keyof typeof data)[]).filter((key) => before?.[key] !== settings[key]);
    await audit(auth.user, 'ubah', 'KantorSetting', KANTOR_ID, changed.length ? changed.join(', ') : 'tanpa perubahan');
    revalidateLanding();
    return NextResponse.json(settings);
  } catch (error) {
    return handleRouteError(error);
  }
}
