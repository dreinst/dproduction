import { revalidatePath } from 'next/cache';

// Dipanggil route tulis konten landing (Setting Kantor, Head Home, Master, Galeri) setelah data tersimpan,
// supaya halaman depan dan halaman 404 (Navbar dan Footer memakai Setting Kantor) di-render ulang pada kunjungan berikutnya.
export function revalidateLanding() {
  revalidatePath('/', 'layout');
}
