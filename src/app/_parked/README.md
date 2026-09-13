# Route yang diparkir sementara

Folder berawalan underscore (`_parked`) tidak dirutekan oleh Next.js App Router,
jadi semua halaman dan API di sini tidak bisa diakses lewat browser.
Dipindah ke sini pada 13 September 2026 supaya pengerjaan fokus ke landing page dulu.

Isi:
- `management/` : dashboard admin (`/management/*`)
- `klien/`, `team/`, `katalog/`, `detail-event/` : subpage publik lama
- `api/*` : semua endpoint kecuali `/api/contact` (masih dipakai form kontak landing page)
- `middleware.ts` : proteksi login `/management` (Next 16 minta ganti nama ke `proxy.ts` dengan `export function proxy` saat diaktifkan lagi)

Cara mengaktifkan kembali, contoh untuk dashboard admin:

    git mv src/app/_parked/management src/app/management
    git mv src/app/_parked/api/auth src/app/api/auth

Kode di dalamnya tidak diubah, hanya dipindah.

Folder ini juga dikecualikan dari type-check (`tsconfig.json` > `exclude`) dan lint
(`eslint.config.mjs` > `globalIgnores`). Saat diaktifkan kembali, hapus dua pengecualian itu.
Catatan: ada 38 error TypeScript lama di dalamnya (kebanyakan `error.errors` pada ZodError,
yang di zod v4 bernama `error.issues`, plus beberapa tipe form di halaman workspace). Itu perlu
dibereskan sebelum dashboard bisa di-build lagi.
