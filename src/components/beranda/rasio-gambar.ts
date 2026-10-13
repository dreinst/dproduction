// Khusus server.
import path from "node:path";
import sharp from "sharp";
import { readImage } from "@/lib/upload";

// Perbandingan lebar dan tinggi gambar di situs ini: berkas di public/assets atau unggahan /media. null untuk URL luar
// dan berkas yang tidak terbaca. Dipakai pita logo supaya lebar tiap kotak sudah benar sebelum gambarnya dimuat.
export async function rasioGambar(src: string) {
  try {
    const sumber = src.startsWith("/media/")
      ? (await readImage(src.slice("/media/".length)))?.bytes
      : /^\/assets\/[\w./-]+$/.test(src) && !src.includes("..")
        ? path.join(/*turbopackIgnore: true*/ process.cwd(), "public", src)
        : null;
    if (!sumber) return null;
    const { width, height } = await sharp(sumber).metadata();
    return width && height ? width / height : null;
  } catch {
    return null;
  }
}
