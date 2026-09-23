# D'Production

Situs company profile D'Production (event organizer di Malang) beserta dashboard manajemen internal.

Teknologi: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, framer-motion, Prisma 7 dengan adapter `pg`, dan PostgreSQL.

## Kondisi saat ini

- Landing page satu halaman di `/`. Isinya masih ditulis langsung di `src/components/sections/`, belum dibaca dari database.
- Form kontak mengirim ke `POST /api/contact` dan menyimpan lead di tabel `Client`.
- `GET /api/health` menjalankan `SELECT 1` ke database dan membalas `{"ok":true}` (200) atau `{"ok":false}` (503). Endpoint ini untuk monitor eksternal.
- Dashboard admin ada di `/management` (login di `/management/login`) dengan API di `src/app/api/*`. Pembagian hak akses ada di bagian Hak akses dashboard. Dashboard butuh `DATABASE_URL` dan `JWT_SECRET`.
- Subpage publik lama (klien, team, katalog, detail-event) masih diparkir di `src/app/_parked/` dan tidak dirutekan. Beberapa berisi data karangan, jangan diaktifkan tanpa diperiksa.

## Menjalankan di komputer lokal

Butuh Node.js 20.19, 22.12, atau 24 ke atas (syarat Prisma 7) dan PostgreSQL (CI memakai versi 16).

> Jangan pernah mengarahkan `.env.local` ke database produksi. Migrasi, seed, dan smoke test menulis ke database yang ditunjuk `DATABASE_URL`. Pakai database lokal atau database uji.

1. Pasang dependensi:
   ```bash
   npm ci
   ```
2. Salin contoh env lalu isi `DATABASE_URL`, dan `JWT_SECRET` kalau ingin memakai dashboard:
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
| `JWT_SECRET` | Untuk dashboard | Kunci tanda tangan token login dashboard `/management`. Dibaca saat aplikasi berjalan, jadi build tetap jalan tanpa nilai ini, tetapi harus terpasang sebagai env runtime di hosting. Isi string acak minimal 32 byte, misalnya hasil `openssl rand -hex 32`. Kalau kosong atau kurang dari 32 karakter, login membalas 500 (pesan jelas di log server), API dashboard lain membalas 401, dan halaman admin kembali ke login. Mengganti nilainya membuat semua sesi login lama tidak berlaku. |
| `NEXT_PUBLIC_SITE_URL` | Tidak | URL kanonik untuk metadata, `robots.txt`, dan `sitemap.xml`. Default `https://dproduction-iota.vercel.app`. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Tidak | Kode verifikasi Google Search Console. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Tidak | ID Google Ads (`AW-...`). Kalau kosong, tag Google Ads tidak dimuat. |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Tidak | Label konversi saat form kontak terkirim. |
| `NEXT_PUBLIC_GOOGLE_ADS_WA_CONVERSION_LABEL` | Tidak | Label konversi saat link WhatsApp diklik. |
| `LEAD_TELEGRAM_BOT_TOKEN` | Tidak | Token bot Telegram untuk notifikasi lead baru. |
| `LEAD_TELEGRAM_CHAT_ID` | Tidak | Chat tujuan notifikasi lead baru. |
| `SEED_PASSWORD` | Tidak | Password akun baru saat seed. |
| `ALLOW_REMOTE_SEED` | Tidak | Isi `1` untuk mengizinkan seed ke host selain `localhost` atau `127.0.0.1`. |

## Hak akses dashboard

Role resmi hanya `owner`, `superadmin`, `admin`, `staff`, dan `tester`. Role lain (misalnya `Superuser` atau `Owner` berhuruf besar) ditolak saat login, di proxy, dan di API. Aturannya ditulis sekali di `src/lib/rbac.ts`: `API_ACCESS` untuk API dan `NAV` untuk menu serta halaman. Proxy, route API (`requireAccess`), Sidebar, dan tombol di halaman (`useAdminUser().can`) membaca file yang sama. Pembagian di bawah masih sementara dan menunggu keputusan akhir pemilik.

| Modul | Halaman | Boleh melihat | Boleh mengubah |
| --- | --- | --- | --- |
| Dashboard | `/management` | semua role | tidak ada |
| Workspace Event | `/management/workspace/event` | semua role | owner, superadmin, admin |
| Workspace Report | `/management/workspace/report` | owner, superadmin | owner, superadmin |
| Workspace Salary | `/management/workspace/salary` | owner, superadmin | owner, superadmin |
| Master (Foto, Event, Wedding, Rental, Grade Event, JobDesc) | `/management/master/*` | owner, superadmin, admin | owner, superadmin, admin |
| Galeri Foto dan Video | `/management/galeri/*` | owner, superadmin, admin | owner, superadmin, admin |
| Lead Masuk (tabel `Client`) | `/management/leads` | owner, superadmin, admin | owner, superadmin, admin |
| Setting Kantor dan Head Home | `/management/setting/kantor`, `/management/setting/head-home` | owner, superadmin | owner, superadmin |
| Database | `/management/database` | owner, superadmin | owner, superadmin |
| Setting Login (akun user) | `/management/setting/login` | owner | owner |

- Halaman di bawah `/management` yang tidak ada di daftar ini ditolak dan dialihkan ke `/management`.
- Staff dan tester hanya membaca. Tombol tambah, edit, hapus, dan tandai selesai disembunyikan untuk mereka.
- Token login berumur 24 jam dan dicocokkan ke database di setiap request API. Logout, ganti password, ganti level, menonaktifkan, dan menghapus user langsung memutus sesi lama user itu. Logout berarti keluar dari semua perangkat yang memakai akun itu, jadi sebaiknya satu akun untuk satu orang.
- Lima kali gagal login berturut mengunci akun selama 15 menit, juga kalau percobaannya dikirim bersamaan. Username yang tidak ada diperlakukan sama (hitungannya di memori server) supaya keberadaan akun tidak bisa ditebak. Satu IP dibatasi 20 percobaan login per 15 menit; hitungan per IP juga di memori, jadi berlaku per instance server dan dilewati kalau IP klien tidak diketahui.
- Owner membuka kunci akun lain dengan mengganti password atau mengaktifkan ulang akun itu di Setting Login. Kalau satu-satunya owner terkunci, tunggu 15 menit atau buka lewat SQL: `UPDATE "User" SET "failedLogins" = 0, "lockedUntil" = NULL WHERE username = '...';`. Karena itu siapkan minimal dua akun owner di produksi.
- Username disimpan dalam huruf kecil, 3 sampai 50 karakter, berisi huruf, angka, titik, garis bawah, atau tanda hubung. Password minimal 12 karakter.
- Owner tidak bisa menurunkan level, menonaktifkan, atau menghapus akunnya sendiri, dan setiap perubahan yang membuat owner aktif tinggal nol ditolak.
- `npx tsx scripts/smoke-admin.ts` menguji matriks ini terhadap server yang sedang jalan (butuh `SEED_PASSWORD` dan `JWT_SECRET` yang sama dengan server, `BASE_URL` default `http://localhost:3000`). Skrip ini membuat lalu menghapus satu user uji, jadi hanya boleh diarahkan ke localhost.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan di port 3005. |
| `npm run build` | `prisma generate` lalu `next build`. |
| `npm start` | Menjalankan hasil build di port 3000. Untuk port lain: `npm start -- -p 3005`. |
| `npm run lint` | ESLint untuk seluruh repo, kecuali `src/app/_parked`. |
| `npx tsc --noEmit` | Cek tipe TypeScript. |
| `node scripts/smoke-test.mjs` | Uji cepat terhadap server yang sedang jalan. |

Smoke test memeriksa `/`, `/robots.txt`, `/sitemap.xml`, gambar Open Graph (path-nya diambil dari meta `og:image` di beranda), `/api/health`, serta `POST /api/contact` yang valid dan tidak valid. Alamat server diambil dari `BASE_URL` (default `http://localhost:3000`) dan hanya boleh `localhost` atau `127.0.0.1`, karena uji form kontak menyimpan satu lead ke database.

## CI

`.github/workflows/ci.yml` berjalan di setiap push dan pull request: Postgres 16 sebagai service, `npm ci`, lint, cek tipe, `prisma migrate deploy`, seed, build dengan env dummy, `next start`, lalu `scripts/smoke-test.mjs` dan `scripts/smoke-admin.ts`. Vercel tetap men-deploy setiap push ke `main`. Supaya CI benar-benar menahan perubahan yang rusak, aktifkan branch protection di GitHub dan jadikan job CI sebagai required check.

## Header keamanan dan redirect

`next.config.ts` mengirim header keamanan dasar ke semua route (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Content-Security-Policy: frame-ancestors 'none'`, `Permissions-Policy`) dan mematikan header `X-Powered-By`.

URL dari situs lama diarahkan permanen (308) ke section yang sesuai. Pengecualian: `/login` diarahkan sementara (307) ke `/management/login`, karena lokasi final dashboard belum diputuskan.

| URL lama | Tujuan |
| --- | --- |
| `/tentang_kami`, `/team` | `/#tentang-kami` |
| `/masterpiece` | `/#masterpiece` |
| `/rental`, `/rental/detail`, `/event`, `/wedding` | `/#layanan` |
| `/galeri_foto`, `/galeri_video` | `/#galeri` |
| `/kontak` | `/#kontak` |

Garis miring di akhir URL dan query string (misalnya `/rental/detail/?id=1`) ikut tertangani. Semua respons `/api/*` dikirim dengan `Cache-Control: no-store` karena memuat data pribadi.

## Deploy ke produksi

Hosting final (Vercel atau VPS lewat Coolify) belum diputuskan. Apa pun pilihannya, urutannya sama:

1. Backup database produksi dulu.
2. Terapkan migrasi ke database produksi SEBELUM kode baru tayang, dari mesin yang bisa menjangkau database (misalnya lewat Tailscale atau dari dalam jaringan VPS): `DATABASE_URL=<url-produksi> npx prisma migrate deploy`. Build tidak menjalankan migrasi. Migrasi `grade_event_unique` gagal kalau tabel `GradeEvent` sudah berisi grade kembar, jadi cek dulu `SELECT grade, count(*) FROM "GradeEvent" GROUP BY grade HAVING count(*) > 1;`.
3. Pasang env runtime di hosting: `DATABASE_URL` dan `JWT_SECRET` (acak, minimal 32 byte). Jangan jadikan keduanya env saat build, supaya nilainya tidak tertanam di image.
4. Jangan jalankan `prisma db seed` di produksi. Buat akun owner lewat dashboard oleh owner yang sudah ada, dan pastikan ada dua owner.
5. Setelah tayang: cek `/api/health` (200), login ke `/management`, dan buka satu halaman tiap modul.

Catatan: port PgBouncer 6433 di VPS hanya terbuka lewat Tailscale. Kalau hosting final Vercel, database perlu jalur lain yang bisa dijangkau Vercel.

## Struktur folder

- `src/app/(site)`: layout dan halaman landing publik (Navbar, Footer, tag Ads hanya dimuat di sini).
- `src/app/management`: halaman dashboard admin. `src/app/api`: route API (kontak, health, auth, users, dan tiap modul).
- `src/components/sections`: section landing page. `src/components/management`: Sidebar, Header, Modal, AdminThumb, Pagination.
- `src/lib`: `prisma.ts` (koneksi), `site.ts` (WhatsApp, opsi form kontak, konversi Ads), `rbac.ts` (role dan hak akses), `session.ts` (token dan cookie), `auth.ts` (sesi dari database, `requireAccess`), `api.ts` (validasi dan penanganan error route), `rate-limit.ts`, `notify.ts`.
- `src/hooks`: `useCrud` dan `usePagination` untuk halaman admin.
- `prisma`: skema, migrasi, dan seed akun.
- `scripts`: seed portofolio, pengaman host database, dan smoke test.
