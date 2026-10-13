import type { Instrumentation } from 'next';

// Dipanggil Next untuk setiap galat di server (render halaman, route handler, proxy), termasuk galat render ulang ISR
// yang tidak terlihat pengunjung karena halaman lama tetap disajikan. Satu baris JSON supaya mudah dicari di log
// Coolify. Hanya nama, digest, dan lokasi yang dicatat: pesan galat Prisma bisa memuat data isian.
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const e = (error ?? {}) as { name?: unknown; digest?: unknown };
  console.error(
    JSON.stringify({
      galat: 'onRequestError',
      nama: typeof e.name === 'string' ? e.name : 'tidak diketahui',
      digest: typeof e.digest === 'string' ? e.digest : undefined,
      metode: request.method,
      // Tanpa query supaya data di alamat (misalnya token) tidak ikut tercatat.
      alamat: request.path.split('?')[0],
      rute: context.routePath,
      jenis: context.routeType,
      sebab: context.revalidateReason,
    }),
  );
};
