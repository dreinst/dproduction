import { readImage } from '@/lib/upload';

// Menyajikan gambar unggahan admin untuk publik. Nama file acak dan isinya tidak pernah berubah, jadi boleh di-cache lama.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const image = await readImage((await params).name);
  if (!image) return new Response('Gambar tidak ditemukan.', { status: 404 });
  return new Response(image.bytes, {
    headers: { 'Content-Type': image.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
