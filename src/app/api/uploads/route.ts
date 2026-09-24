import { NextResponse } from 'next/server';
import { apiError, handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { MAX_IMAGE_BYTES, saveImage } from '@/lib/upload';

// Unggah satu gambar (field "file"). Hasilnya URL /media/... yang bisa diisikan ke kolom gambar mana pun.
export async function POST(req: Request) {
  try {
    const auth = await requireAccess('uploads', 'write');
    if (!auth.authorized) return auth.response;

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return apiError(400, 'Data unggahan tidak terbaca.');
    }
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) return apiError(400, 'Pilih file gambar dulu.');
    if (file.size > MAX_IMAGE_BYTES) return apiError(413, 'Ukuran gambar maksimal 5 MB.');

    const url = await saveImage(new Uint8Array(await file.arrayBuffer()));
    await audit(auth.user, 'tambah', 'Upload', null, url);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
