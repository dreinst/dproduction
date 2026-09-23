# D'Production

Situs company profile D'Production (event organizer di Malang) beserta dashboard manajemen internal.

Teknologi: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, framer-motion, Prisma 7 dengan adapter `pg`, dan PostgreSQL.

## Kondisi saat ini

- Landing page satu halaman di `/`. Isinya masih ditulis langsung di `src/components/sections/`, belum dibaca dari database.
- Form kontak mengirim ke `POST /api/contact` dan menyimpan lead di tabel `Client`.
- `GET /api/health` menjalankan `SELECT 1` ke database dan membalas `{"ok":true}` (200) atau `{"ok":false}` (503). Endpoint ini untuk monitor eksternal.
- Dashboard `/management` dan API lainnya sedang diparkir di `src/app/_parked/`, jadi belum bisa diakses. Cara mengaktifkannya ada di `src/app/_parked/README.md`. Saat mengaktifkannya, cabut juga pengecualian lint untuk `src/components/management` dan `src/hooks/useCrud.ts` di `eslint.config.mjs`, lalu bereskan error lint di kedua tempat itu.

## Menjalankan di komputer lokal

Butuh Node.js 20.19, 22.12, atau 24 ke atas (syarat Prisma 7) dan PostgreSQL (CI memakai versi 16).

> Jangan pernah mengarahkan `.env.local` ke database produksi. Migrasi, seed, dan smoke test menulis ke database yang ditunjuk `DATABASE_URL`. Pakai database lokal atau database uji.

1. Pasang dependensi:
   ```bash
   npm ci
   ```
2. Salin contoh env lalu isi, minimal `DATABASE_URL`:
   ```bash
   cp .env.example .env.local
   ```
   `prisma.config.ts` memuat `.env.local` lalu `.env`, jadi CLI Prisma membaca env yang sama dengan Next.js.
3. Buat Prisma Client:
   ```bash
   npx prisma generate
   ```
4. Terapkan migrasi:
   ```bash
   npx prisma migrate deploy
   ```
   Jangan pakai `npx prisma db push`. Database yang dibuat dengan `db push` akan menolak `migrate deploy` berikutnya (error P3005).
5. Isi akun bawaan:
   ```bash
   npx prisma db seed
   ```
   Seed membuat akun `owner`, `superadmin`, `admin`, `staff`, dan `tester` kalau belum ada. Passwordnya diambil dari `SEED_PASSWORD`. Kalau `SEED_PASSWORD` kosong, seed membuat password acak dan mencetaknya sekali di terminal. Akun yang sudah ada tidak diubah, termasuk passwordnya. Seed menolak berjalan kalau host `DATABASE_URL` bukan `localhost` atau `127.0.0.1`, kecuali dijalankan dengan `ALLOW_REMOTE_SEED=1`.
6. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3005`.

Opsional: `npx tsx --env-file=.env.local scripts/seed-portfolio-events.ts` mengisi tabel `Event` dengan 14 event portofolio. Skrip ini hanya berjalan kalau tabel `Event` benar-benar kosong. Baris yang sudah dihapus lewat dashboard tetap dihitung. Kalau tabel sudah berisi, skrip tidak mengubah apa pun, karena nama event bisa diganti lewat dashboard dan tidak ada kunci lain untuk mencocokkannya. Setelah terisi, kelola event lewat dashboard. Skrip ini punya pengaman host yang sama dengan seed.

## Variabel lingkungan

Contoh lengkap ada di `.env.example`. Variabel berawalan `NEXT_PUBLIC_` dibaca saat build, jadi perlu build ulang setelah nilainya diubah.

| Nama | Wajib | Kegunaan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | Koneksi PostgreSQL. Kalau kosong, request yang memakai database gagal dengan pesan yang jelas, sedangkan build tetap jalan. |
| `JWT_SECRET` | Untuk dashboard | Kunci token login dashboard `/management`. |
| `NEXT_PUBLIC_SITE_URL` | Tidak | URL kanonik untuk metadata, `robots.txt`, dan `sitemap.xml`. Default `https://dproduction-iota.vercel.app`. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Tidak | Kode verifikasi Google Search Console. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Tidak | ID Google Ads (`AW-...`). Kalau kosong, tag Google Ads tidak dimuat. |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Tidak | Label konversi saat form kontak terkirim. |
| `NEXT_PUBLIC_GOOGLE_ADS_WA_CONVERSION_LABEL` | Tidak | Label konversi saat link WhatsApp diklik. |
| `LEAD_TELEGRAM_BOT_TOKEN` | Tidak | Token bot Telegram untuk notifikasi lead baru. |
| `LEAD_TELEGRAM_CHAT_ID` | Tidak | Chat tujuan notifikasi lead baru. |
| `SEED_PASSWORD` | Tidak | Password akun baru saat seed. |
| `ALLOW_REMOTE_SEED` | Tidak | Isi `1` untuk mengizinkan seed ke host selain `localhost` atau `127.0.0.1`. |

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan di port 3005. |
| `npm run build` | `prisma generate` lalu `next build`. |
| `npm start` | Menjalankan hasil build di port 3000. Untuk port lain: `npm start -- -p 3005`. |
| `npm run lint` | ESLint untuk seluruh repo, kecuali kode dashboard yang diparkir (daftarnya di `eslint.config.mjs`). |
| `npx tsc --noEmit` | Cek tipe TypeScript. |
| `node scripts/smoke-test.mjs` | Uji cepat terhadap server yang sedang jalan. |

Smoke test memeriksa `/`, `/robots.txt`, `/sitemap.xml`, gambar Open Graph (path-nya diambil dari meta `og:image` di beranda), `/api/health`, serta `POST /api/contact` yang valid dan tidak valid. Alamat server diambil dari `BASE_URL` (default `http://localhost:3000`) dan hanya boleh `localhost` atau `127.0.0.1`, karena uji form kontak menyimpan satu lead ke database.

## CI

`.github/workflows/ci.yml` berjalan di setiap push dan pull request: Postgres 16 sebagai service, `npm ci`, lint, cek tipe, `prisma migrate deploy`, seed, build dengan env dummy, `next start`, lalu smoke test. Vercel tetap men-deploy setiap push ke `main`. Supaya CI benar-benar menahan perubahan yang rusak, aktifkan branch protection di GitHub dan jadikan job CI sebagai required check.

## Header keamanan dan redirect

`next.config.ts` mengirim header keamanan dasar ke semua route (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Content-Security-Policy: frame-ancestors 'none'`, `Permissions-Policy`) dan mematikan header `X-Powered-By`.

URL dari situs lama diarahkan permanen (308) ke section yang sesuai:

| URL lama | Tujuan |
| --- | --- |
| `/tentang_kami`, `/team` | `/#tentang-kami` |
| `/masterpiece` | `/#masterpiece` |
| `/rental`, `/rental/detail`, `/event`, `/wedding` | `/#layanan` |
| `/galeri_foto`, `/galeri_video` | `/#galeri` |
| `/kontak` | `/#kontak` |
| `/login` | `/management/login` |

Garis miring di akhir URL dan query string (misalnya `/rental/detail/?id=1`) ikut tertangani. Selama dashboard masih diparkir, `/management/login` sendiri masih 404.

## Struktur folder

- `src/app`: route App Router (landing, `api/contact`, `api/health`, `opengraph-image`, `robots`, `sitemap`).
- `src/components/sections`: section landing page.
- `src/lib`: koneksi Prisma, helper situs (link WhatsApp dan konversi Google Ads), dan autentikasi.
- `prisma`: skema, migrasi, dan seed akun.
- `scripts`: seed portofolio, pengaman host database, dan smoke test.
