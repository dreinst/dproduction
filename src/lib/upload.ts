// Khusus server: menyimpan dan membaca gambar unggahan admin di volume persisten.
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { HttpError } from '@/lib/api';

// Batas yang sama dipakai src/proxy.ts (ditambah ruang untuk pembungkus multipart).
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
  const name = `${randomBytes(16).toString('hex')}.${ext}`;
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes, { flag: 'wx' });
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
