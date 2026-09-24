// Khusus server: menyimpan dan membaca gambar unggahan admin di volume persisten.
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { HttpError } from '@/lib/api';
import prisma from '@/lib/prisma';

// Batas yang sama dipakai src/proxy.ts (ditambah ruang untuk pembungkus multipart).
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Batas resolusi saat gambar di-encode ulang, supaya file kecil beresolusi raksasa tidak menghabiskan memori server.
const MAX_IMAGE_PIXELS = 60_000_000;

const CONTENT_TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const;
export type ImageExt = keyof typeof CONTENT_TYPES;

const FILE_NAME = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

// Di VPS diarahkan ke volume persisten lewat UPLOAD_DIR; tanpa itu dipakai folder uploads di root proyek.
export function uploadDir() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
}

// Jenis file dibaca dari magic bytes, bukan dari file.type atau ekstensi yang bisa dipalsukan klien.
export function detectImageType(bytes: Uint8Array): ImageExt | null {
  const ascii = (start: number, text: string) => [...text].every((c, i) => bytes[start + i] === c.charCodeAt(0));
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(1, 'PNG\r\n\x1a\n')) return 'png';
  if (bytes.length >= 12 && ascii(0, 'RIFF') && ascii(8, 'WEBP')) return 'webp';
  return null;
}

// Menyimpan gambar dengan nama acak dan membalas URL publiknya, misalnya /media/<32 hex>.jpg.
export async function saveImage(bytes: Uint8Array) {
  if (bytes.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Ukuran gambar maksimal 5 MB.');
  const ext = detectImageType(bytes);
  if (!ext) throw new HttpError(415, 'Format gambar harus JPG, PNG, atau WebP.');
  // Di-encode ulang dengan format yang sama supaya metadata EXIF dan XMP (koordinat GPS, model HP, waktu foto) tidak ikut
  // tersimpan dan tersaji publik. rotate() memutar gambar sesuai tag orientasi sebelum tag itu ikut dibuang.
  let clean: Buffer;
  try {
    clean = await sharp(bytes, { limitInputPixels: MAX_IMAGE_PIXELS }).rotate().toBuffer();
  } catch {
    throw new HttpError(415, 'Gambar rusak atau resolusinya terlalu besar (maksimal 60 megapiksel).');
  }
  const name = `${randomBytes(16).toString('hex')}.${ext}`;
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), clean, { flag: 'wx' });
  return `/media/${name}`;
}

// Hanya nama hasil saveImage yang diterima, jadi path seperti ../ tidak mungkin lolos.
export async function readImage(name: string) {
  const match = FILE_NAME.exec(name);
  if (!match) return null;
  try {
    const bytes = await readFile(path.join(uploadDir(), name));
    return { bytes, contentType: CONTENT_TYPES[match[1] as ImageExt] };
  } catch (error) {
    if ((error as { code?: unknown }).code === 'ENOENT') return null;
    throw error;
  }
}

// Dipanggil setelah baris dengan kolom gambar dihapus atau gambarnya diganti. File /media yang tidak lagi dipakai
// kolom gambar mana pun ikut dihapus, supaya foto yang dihapus admin tidak tersaji publik lagi.
// Gagal menghapus file hanya dicatat, karena perubahan database sudah tersimpan.
export async function removeUnusedImages(...urls: (string | null | undefined)[]) {
  for (const url of new Set(urls)) {
    const name = url?.startsWith('/media/') ? url.slice('/media/'.length) : null;
    if (!url || !name || !FILE_NAME.test(name)) continue;
    try {
      const used = await Promise.all([
        prisma.event.count({ where: { photo: url } }),
        prisma.wedding.count({ where: { photo: url } }),
        prisma.rental.count({ where: { photo: url } }),
        prisma.galeriFoto.count({ where: { image: url } }),
        prisma.headHome.count({ where: { image: url } }),
      ]);
      if (used.some(Boolean)) continue;
      await unlink(path.join(/*turbopackIgnore: true*/ uploadDir(), name));
    } catch (error) {
      const code = (error as { code?: unknown }).code;
      const detail = code ?? (error as { name?: unknown } | null)?.name;
      if (code !== 'ENOENT') console.error(`Gagal menghapus gambar unggahan ${name}: ${String(detail)}`);
    }
  }
}
