import fs from 'fs';
import path from 'path';

const basePath = path.join(process.cwd(), 'src', 'app', 'api');

const entities = [
  {
    name: 'wedding',
    model: 'wedding',
    plural: 'weddings',
    schema: `name: z.string().min(1),
  description: z.string().nullable().optional(),
  photo: z.string().nullable().optional(),
  active: z.boolean().default(true),`
  },
  {
    name: 'rental',
    model: 'rental',
    plural: 'rentals',
    schema: `name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  waCart: z.string().nullable().optional(),
  photo: z.string().nullable().optional(),
  active: z.boolean().default(true),`
  },
  {
    name: 'grade-event',
    model: 'gradeEvent',
    plural: 'grade-events',
    schema: `grade: z.string().min(1),`
  },
  {
    name: 'jobdesc',
    model: 'jobDesc',
    plural: 'jobdescs',
    schema: `name: z.string().min(1),
  icon: z.string().nullable().optional(),
  levelA: z.string().nullable().optional(),
  levelB: z.string().nullable().optional(),
  levelC: z.string().nullable().optional(),`
  },
  {
    name: 'galeri-foto',
    model: 'galeriFoto',
    plural: 'galeri-foto',
    schema: `image: z.string().min(1),
  link: z.string().nullable().optional(),`
  },
  {
    name: 'galeri-video',
    model: 'galeriVideo',
    plural: 'galeri-video',
    schema: `url: z.string().min(1),
  active: z.boolean().default(true),`
  },
  {
    name: 'client',
    model: 'client',
    plural: 'clients',
    schema: `name: z.string().min(1),
  whatsapp: z.string().min(1),
  eventType: z.string().min(1),
  message: z.string().min(1),`
  },
  {
    name: 'head-home',
    model: 'headHome',
    plural: 'head-home',
    schema: `image: z.string().min(1),
  active: z.boolean().default(true),
  sortIndex: z.number().int().default(0),`
  },
  {
    name: 'workspace-salary',
    model: 'workspaceSalary',
    plural: 'workspace-salary',
    schema: `waktu: z.string().min(1),
  klien: z.string().min(1),
  event: z.string().min(1),
  deskripsi: z.string().nullable().optional(),
  active: z.boolean().default(true),`
  },
  {
    name: 'workspace-event',
    model: 'workspaceEvent',
    plural: 'workspace-events',
    schema: `jobDesc: z.string().min(1),
  date: z.string().transform((str) => new Date(str)),
  client: z.string().min(1),
  status: z.string().default('running'),
  waktu: z.string().nullable().optional(),
  event: z.string().nullable().optional(),
  deskripsi: z.string().nullable().optional(),
  linkFoto: z.string().nullable().optional(),
  linkVideo: z.string().nullable().optional(),
  active: z.boolean().default(true),`
  },
  {
    name: 'workspace-report',
    model: 'workspaceReport',
    plural: 'workspace-reports',
    schema: `title: z.string().min(1),
  date: z.number().int(),
  month: z.string().min(1),
  time: z.string().min(1),
  client: z.string().min(1),
  status: z.string().default('admin'),`
  },
  {
    name: 'galeri-foto-album',
    model: 'galeriFotoAlbum',
    plural: 'galeri-foto-albums',
    schema: `album: z.string().min(1),
  keterangan: z.string().nullable().optional(),
  tanggal: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  active: z.boolean().default(true),
  sortIndex: z.number().int().default(0),`
  }
];

const generateBaseRoute = (entity) => `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';

const schema = z.object({
  ${entity.schema}
});

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    const items = await prisma.${entity.model}.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    const item = await prisma.${entity.model}.create({
      data: validatedData,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
`;

const generateIdRoute = (entity) => `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';

const schema = z.object({
  ${entity.schema}
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

  try {
    const item = await prisma.${entity.model}.findUnique({
      where: { id },
    });
    
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    const item = await prisma.${entity.model}.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

  try {
    await prisma.${entity.model}.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
`;

for (const entity of entities) {
  const dirPath = path.join(basePath, entity.plural);
  const idDirPath = path.join(dirPath, '[id]');
  
  fs.mkdirSync(idDirPath, { recursive: true });
  
  fs.writeFileSync(path.join(dirPath, 'route.ts'), generateBaseRoute(entity));
  fs.writeFileSync(path.join(idDirPath, 'route.ts'), generateIdRoute(entity));
  console.log('Generated routes for', entity.plural);
}
