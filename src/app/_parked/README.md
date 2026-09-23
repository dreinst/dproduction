# Route yang diparkir sementara

Folder berawalan underscore (`_parked`) tidak dirutekan oleh Next.js App Router,
jadi semua halaman dan API di sini tidak bisa diakses lewat browser.
Dipindah ke sini pada 13 September 2026 supaya pengerjaan fokus ke landing page dulu.

Update 23 September 2026: dashboard admin (`management/` + semua API pendukungnya)
sudah diaktifkan kembali di branch `enable-management-review` untuk direview Donny,
lihat `src/app/management/` dan `src/app/api/*`. Yang MASIH diparkir di sini tinggal
subpage publik lama yang tidak diminta:

- `klien/`, `team/`, `katalog/`, `detail-event/` : subpage publik lama, belum ada yang minta ini dihidupkan lagi.

Cara mengaktifkan salah satu subpage yang masih parkir, contoh:

    git mv src/app/_parked/klien src/app/klien

Kode di dalamnya tidak diubah, hanya dipindah.

Folder ini masih dikecualikan dari type-check (`tsconfig.json` > `exclude`) dan lint
(`eslint.config.mjs` > `globalIgnores`) karena isinya kode lama yang belum diaudit.
