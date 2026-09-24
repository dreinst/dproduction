import { revalidatePath } from 'next/cache';

// Dipanggil route tulis konten landing (Setting Kantor, Head Home, Master, Galeri) setelah data tersimpan,
// supaya halaman depan di-render ulang pada kunjungan berikutnya.
export function revalidateLanding() {
  revalidatePath('/');
}
