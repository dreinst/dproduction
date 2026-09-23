import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';

const schema = z.object({
  companyName: z.string().min(1),
  status: z.string().nullable().optional(),
  motto1: z.string().nullable().optional(),
  motto2: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  foundedDate: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  facebookUrl: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  tiktokUrl: z.string().nullable().optional(),
  aboutUs: z.string().nullable().optional(),
  googleMapsUrl: z.string().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole(['owner', 'superadmin']);
  if (!authorized) return response;

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    const item = await prisma.kantorSetting.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
