import type { MetadataRoute } from "next";
import { readLanding } from "@/lib/landing-content";
import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

// Sitemap dirender ulang berkala seperti halaman publik, dan segera setelah admin menyimpan (revalidateLanding).
export const revalidate = 300;

// Dipakai kalau database dan salinan datanya tidak terbaca (misalnya saat build image), dan untuk halaman yang
// tabelnya belum punya baris. Perbarui saat merilis perubahan isi besar.
const LASTMOD_CADANGAN = new Date("2026-10-10T00:00:00+07:00");

// Hanya halaman publik. Halaman admin, /offline, dan 404 tidak masuk sitemap.
const HALAMAN = ["/", "/layanan", "/portofolio", "/katalog", "/tentang"] as const;

// Waktu ubah terakhir per halaman sebagai teks ISO, supaya selamat lewat salinan JSON. null kalau tabelnya kosong.
type Lastmod = Record<(typeof HALAMAN)[number], string | null>;

async function bacaLastmod(): Promise<Lastmod> {
  // Cap waktu yang jatuh di masa depan dilewati. Baris yang ditulis migrasi data memakai jam sesi database, yang bisa
  // lebih maju dari UTC, dan lastmod tidak boleh menunjuk ke masa depan.
  const terbaru = { where: { updatedAt: { lte: new Date() } }, _max: { updatedAt: true } } as const;
  const [kantor, hero, event, klien, wedding, rental, kategori, album, foto, video] = await Promise.all([
    prisma.kantorSetting.aggregate(terbaru),
    prisma.headHome.aggregate(terbaru),
    prisma.event.aggregate(terbaru),
    prisma.klien.aggregate(terbaru),
    prisma.wedding.aggregate(terbaru),
    prisma.rental.aggregate(terbaru),
    prisma.rentalCategory.aggregate(terbaru),
    prisma.galeriAlbum.aggregate(terbaru),
    prisma.galeriFoto.aggregate(terbaru),
    prisma.galeriVideo.aggregate(terbaru),
  ]);
  const paling = (...rows: { _max: { updatedAt: Date | null } }[]) => {
    const waktu = rows.flatMap((row) => (row._max.updatedAt ? [row._max.updatedAt.getTime()] : []));
    return waktu.length ? new Date(Math.max(...waktu)).toISOString() : null;
  };
  // Tabel yang mengisi tiap halaman. Menghapus baris tidak menaikkan waktu ini; lastmod memang hanya petunjuk.
  return {
    "/": paling(kantor, hero, event, klien, rental, kategori),
    "/layanan": paling(kantor, wedding, rental, kategori),
    "/portofolio": paling(event),
    "/katalog": paling(rental, kategori),
    "/tentang": paling(kantor, album, foto, video),
  };
}

const tanpaData = (): Lastmod => ({ "/": null, "/layanan": null, "/portofolio": null, "/katalog": null, "/tentang": null });

// lastmod dibaca lewat readLanding, jadi saat database mati sitemap tetap terjawab dengan salinan data terakhir.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastmod = await readLanding("sitemap", bacaLastmod, tanpaData);
  return HALAMAN.map((path) => ({ url: absoluteUrl(path), lastModified: lastmod[path] ?? LASTMOD_CADANGAN }));
}
