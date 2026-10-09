import { revalidatePath } from 'next/cache';

// Dipanggil route tulis konten situs (Setting Kantor, Head Home, Master, Galeri) setelah data tersimpan, supaya semua
// halaman di grup (site) di-render ulang pada kunjungan berikutnya.
// Jangan memakai revalidatePath('/', 'layout'): itu ikut membatalkan halaman 404 (/_not-found). Halaman 404 yang
// dibuat ulang saat server berjalan menyimpan alamat permintaan pemicunya di dalam HTML yang lalu disajikan ke semua
// orang, sehingga alamat admin bisa ikut terbit.
export function revalidateLanding() {
  revalidatePath('/(site)', 'layout');
  // Sitemap ada di akar app, di luar grup (site), jadi disebut sendiri.
  revalidatePath('/sitemap.xml');
}
