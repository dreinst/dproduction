# D'Production

Situs company profile D'Production (event organizer di Malang) beserta dashboard manajemen internal.

Teknologi: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, framer-motion, Prisma 7 dengan adapter `pg`, dan PostgreSQL.

## Kondisi saat ini

- Landing page satu halaman di `/`. Isinya dibaca dari database lewat `src/lib/landing-content.ts`: Setting Kantor (nama, alamat, WhatsApp, email, link sosial, Google Maps, Tentang Kami, angka statistik hero, JSON-LD), Head Home (gambar dan kartu hero), Master Event (section Masterpiece), Master Wedding, Master Rental, Galeri Foto, dan Galeri Video. Section Klien dan FAQ tetap ditulis di kode.
- Kalau tabel kosong atau database tidak bisa dijangkau, landing memakai konten cadangan `FALLBACK` di file yang sama, jadi halaman tetap tampil.
- Beranda di-render ulang paling lama tiap 5 menit, dan pada kunjungan berikutnya setelah admin menyimpan konten landing di dashboard (`revalidateLanding()` di `src/lib/revalidate.ts`). Build tidak tersambung ke database, jadi HTML hasil build berisi konten cadangan sampai render ulang pertama setelah container baru jalan.
- Form kontak mengirim ke `POST /api/contact`, menyimpan lead di tabel `Client`, dan mengirim notifikasi Telegram kalau `LEAD_TELEGRAM_*` terisi.
- `GET /api/health` menjalankan `SELECT 1` ke database dan membalas `{"ok":true}` (200) atau `{"ok":false}` (503). Endpoint ini untuk monitor eksternal.
- Dashboard admin ada di `/management` (login di `/management/login`) dengan API di `src/app/api/*`. Dashboard butuh `DATABASE_URL` dan `JWT_SECRET`.
- Hosting produksi adalah VPS lewat Coolify, dengan domain resmi `https://www.dpro.events`. Lihat bagian Deploy ke produksi.

## Menjalankan di komputer lokal

Butuh Node.js 20.19, 22.12, atau 24 ke atas (syarat Prisma 7) dan PostgreSQL (CI memakai versi 16, image produksi memakai Node 24).

> Jangan pernah mengarahkan `.env.local` ke database produksi. Migrasi, seed, skrip isi konten, dan smoke test menulis ke database yang ditunjuk `DATABASE_URL`. Pakai database lokal atau database uji.

1. Pasang dependensi:
   ```bash
   npm ci
   ```
2. Salin contoh env, lalu isi `DATABASE_URL` dan `JWT_SECRET`:
   ```bash
   cp .env.example .env.local
   ```
   Contoh `DATABASE_URL` untuk Postgres.app di port 5433: `postgresql://postgres@localhost:5433/dproduction?schema=public`. Buat database-nya dulu (`createdb -h localhost -p 5433 -U postgres dproduction`). `prisma.config.ts` memuat `.env.local` lalu `.env`, jadi CLI Prisma membaca env yang sama dengan Next.js.
3. Buat Prisma Client:
   ```bash
   npx prisma generate
   ```
4. Terapkan migrasi:
   ```bash
   npx prisma migrate deploy
   ```
   Jangan pakai `npx prisma db push`. Database yang dibuat dengan `db push` akan menolak `migrate deploy` berikutnya (error P3005).
5. Isi akun lokal:
   ```bash
   npx prisma db seed
   ```
   Seed membuat akun `owner`, `superadmin`, `admin`, `staff`, dan `tester` kalau belum ada, semuanya dengan password dari `SEED_PASSWORD`. Password itu harus lolos aturan password dashboard (minimal 8 karakter, memuat huruf dan angka); kalau tidak, seed berhenti dengan kode 1. Kalau `SEED_PASSWORD` kosong, seed membuat password acak dan mencetaknya sekali di terminal. Akun yang sudah ada tidak diubah, termasuk passwordnya. Seed menolak berjalan kalau host `DATABASE_URL` bukan `localhost` atau `127.0.0.1`, kecuali dijalankan dengan `ALLOW_REMOTE_SEED=1`.
6. Isi konten landing (opsional, tanpa ini landing memakai konten cadangan):
   ```bash
   npx tsx --env-file=.env.local scripts/seed-landing-content.ts
   ```
   Skrip ini mengisi Setting Kantor id 1 dan tabel konten landing (HeadHome, Wedding, Rental, GaleriAlbum dan GaleriFoto, Event) dengan isi `FALLBACK`, sehingga tampilan tidak berubah dan konten tinggal diedit dari dashboard. Tabel yang sudah berisi dilewati, dan skrip mencetak ringkasan per tabel. Dengan `--awal`, baris Setting Kantor id 1 yang sudah ada juga ditimpa data resmi dan 4 event dokumentasi di Master Event dinonaktifkan. Pengaman host-nya sama dengan seed.
7. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3005`. Gambar yang diunggah dari dashboard tersimpan di folder `uploads/` di root proyek (sudah di `.gitignore`), kecuali `UPLOAD_DIR` diisi.

## Variabel lingkungan

Contoh lengkap ada di `.env.example`. Kolom "Dibaca" menunjukkan kapan nilainya dipakai. Nilai build tertanam di hasil build (termasuk bundle browser), jadi perlu build ulang setelah diubah dan hanya boleh berisi data publik. Nilai runtime dibaca saat aplikasi berjalan dan tidak boleh ikut build.

| Nama | Dibaca | Wajib | Kegunaan |
| --- | --- | --- | --- |
| `DATABASE_URL` | runtime | Ya | Koneksi PostgreSQL. Juga dipakai CLI Prisma dan skrip di `scripts/`. Kalau kosong, request yang memakai database gagal dengan pesan yang jelas, landing memakai konten cadangan, dan build tetap jalan. |
| `JWT_SECRET` | runtime | Untuk dashboard | Kunci tanda tangan token login. String acak minimal 32 karakter, misalnya hasil `openssl rand -hex 32`. Kalau kosong atau lebih pendek, login membalas 500 (pesan jelas di log server), API dashboard lain membalas 401, dan halaman admin kembali ke login. Mengganti nilainya membuat semua sesi lama tidak berlaku. |
| `UPLOAD_DIR` | runtime | Tidak | Folder gambar unggahan. Default `uploads/` di root proyek. Image Docker memakai `/app/uploads`. |
| `LEAD_TELEGRAM_BOT_TOKEN` | runtime | Tidak | Token bot Telegram untuk notifikasi lead baru. |
| `LEAD_TELEGRAM_CHAT_ID` | runtime | Tidak | Chat tujuan notifikasi lead baru. Kalau salah satu dari dua variabel Telegram kosong, notifikasi tidak dikirim dan lead tetap tersimpan. |
| `NEXT_PUBLIC_SITE_URL` | build | Tidak | URL kanonik untuk metadata, JSON-LD, `robots.txt`, dan `sitemap.xml`. Default `https://www.dpro.events`. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | build | Tidak | Kode verifikasi Google Search Console. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | build | Tidak | ID Google Ads (`AW-...`). Kalau kosong, tag Google Ads tidak dimuat. |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | build | Tidak | Label konversi saat form kontak terkirim. |
| `NEXT_PUBLIC_GOOGLE_ADS_WA_CONVERSION_LABEL` | build | Tidak | Label konversi saat link WhatsApp diklik. |
| `SEED_PASSWORD` | seed | Tidak | Password akun baru saat `prisma db seed`, juga dibaca `scripts/smoke-admin.ts`. Hanya untuk database lokal dan CI. |
| `ALLOW_REMOTE_SEED` | seed | Tidak | Isi `1` untuk mengizinkan seed dan `seed-landing-content.ts` ke host selain `localhost` atau `127.0.0.1`. |

## Hak akses dashboard

Role resmi ada lima: `owner` (Pemilik), `superadmin` (Super Admin), `admin` (Admin), `staff` (Staf), dan `tester` (Penguji). Role lain ditolak saat login, di proxy, dan di API. Aturannya ditulis sekali di `src/lib/rbac.ts`: `API_ACCESS` untuk API dan `NAV` untuk menu serta halaman. Proxy (`src/proxy.ts`), route API (`requireAccess`), Sidebar, dan tombol di halaman membaca file yang sama. Owner dan superadmin setara, sama dengan aturan Produksia.

| Modul | Halaman atau API | Boleh melihat | Boleh mengubah |
| --- | --- | --- | --- |
| Dashboard | `/management` | semua role | tidak ada |
| Workspace Event dan penugasan crew | `/management/workspace/event` | semua role | owner, superadmin, admin |
| Workspace Crew | `/management/workspace/crew` | owner, superadmin, admin | owner, superadmin, admin |
| Workspace Report | `/management/workspace/report` | owner, superadmin | owner, superadmin |
| Workspace Salary | `/management/workspace/salary` | owner, superadmin | owner, superadmin |
| Master Tarif | `/management/master/tarif` | owner, superadmin | owner, superadmin |
| Master Event, Wedding, Rental, Grade Event, JobDesc | `/management/master/*` selain Tarif | owner, superadmin, admin | owner, superadmin, admin |
| Galeri Foto dan Video | `/management/galeri/foto`, `/management/galeri/video` | owner, superadmin, admin | owner, superadmin, admin |
| Lead Masuk (tabel `Client`) | `/management/leads` | owner, superadmin, admin | owner, superadmin, admin |
| Setting Kantor dan Head Home | `/management/setting/kantor`, `/management/setting/head-home` | owner, superadmin | owner, superadmin |
| Database | `/management/database` | owner, superadmin | owner, superadmin |
| Setting Login (akun user) | `/management/setting/login` | owner, superadmin | owner, superadmin |
| Unggah gambar | `POST /api/uploads` | tidak ada | owner, superadmin, admin |

- Halaman di bawah `/management` yang tidak ada di daftar ini ditolak dan dialihkan ke `/management`.
- Staff dan tester hanya membaca Workspace Event. Tombol tambah, edit, dan hapus disembunyikan untuk mereka.
- Honor dan status bayar penugasan hanya dikirim ke owner dan superadmin. Admin bisa menugaskan crew, dan honornya otomatis diambil dari Master Tarif sesuai JobDesc dan level event. Mengisi honor secara manual hanya bisa dilakukan owner dan superadmin.
- Lead Masuk: pesan asli (nama, WhatsApp, jenis acara, pesan) tidak bisa diedit. Yang bisa diubah hanya status (baru, dihubungi, penawaran, deal, batal), catatan tindak lanjut, dan penanggung jawab. Lead bisa dijadikan Workspace Event.
- Token login berumur 24 jam dan dicocokkan ke database di setiap request API. Logout, ganti password, ganti level, menonaktifkan, dan menghapus user langsung memutus sesi lama user itu. Logout berarti keluar dari semua perangkat yang memakai akun itu, jadi sebaiknya satu akun untuk satu orang.
- Lima kali gagal login berturut mengunci akun selama 15 menit, juga kalau percobaannya dikirim bersamaan. Username yang tidak ada diperlakukan sama (hitungannya di memori server) supaya keberadaan akun tidak bisa ditebak. Satu IP dibatasi 20 percobaan login per 15 menit; hitungan per IP juga di memori, jadi berlaku per instance server dan dilewati kalau IP klien tidak diketahui.
- Owner atau superadmin membuka kunci akun lain dengan mengganti password atau mengaktifkan ulang akun itu di Setting Login. Kalau semua akun teratas terkunci, tunggu 15 menit atau jalankan `scripts/set-account.ts simpan` untuk akun itu (lihat Runbook akun), yang sekaligus membuka kuncinya.
- `npx tsx scripts/smoke-admin.ts` menguji matriks ini terhadap server yang sedang jalan. Skrip ini butuh `SEED_PASSWORD` dan `JWT_SECRET` yang sama dengan server, `BASE_URL` default `http://localhost:3000`, dan hanya boleh diarahkan ke localhost karena membuat lalu menghapus satu user uji.

### Aturan akun

- Hanya owner dan superadmin yang boleh membuat, mengubah, mereset password, dan menghapus akun, termasuk akun owner dan superadmin lain.
- Harus selalu tersisa minimal satu akun owner atau superadmin yang aktif. Perubahan yang membuatnya nol ditolak, baik lewat dashboard maupun lewat `scripts/set-account.ts`.
- Akun sendiri tidak bisa diubah levelnya, dinonaktifkan, atau dihapus.
- Username disimpan dalam huruf kecil, 3 sampai 32 karakter, berisi huruf, angka, titik, garis bawah, atau strip, dan diawali huruf atau angka.
- Password minimal 8 karakter dan harus memuat huruf dan angka.
- Password baru di-hash dengan scrypt dalam format yang sama dengan Produksia (`scrypt$garam$hash`), sehingga hash dari Produksia bisa disalin apa adanya. Login tetap menerima hash bcrypt lama (`$2b$...`).
- Akun produksi disamakan dengan Produksia: `superadmin` (Andrew Steine), `owner` (Donny Donatus), dan `owner2` (Nadia Yuliana). Caranya ada di Runbook akun.

### Hapus data dan riwayat perubahan

- Semua hapus di dashboard bersifat permanen, tidak ada tempat sampah. Tombol hapus selalu meminta konfirmasi.
- Data yang masih dipakai data lain tidak bisa dihapus, dan API membalas 409 dengan pesan yang menyebut penyebabnya. Contohnya crew atau JobDesc yang punya penugasan, Workspace Event yang masih punya crew bertugas, Grade Event yang dipakai event, dan album galeri yang masih berisi foto. Untuk crew, nonaktifkan saja. Tarif ikut terhapus saat JobDesc atau Grade Event-nya dihapus.
- Setiap tambah, ubah, dan hapus dari dashboard, unggahan gambar, dan perubahan akun lewat `scripts/set-account.ts` dicatat di tabel `AuditLog`: siapa, kapan, aksi, tabel, id baris, dan ringkasan tanpa data pribadi (tanpa nomor WhatsApp, isi pesan lead, atau password). Nama user disalin, jadi catatan tetap terbaca setelah user dihapus. Belum ada halaman untuk membacanya; jumlah barisnya tampil di halaman Database, dan isinya dibaca lewat SQL, misalnya `SELECT * FROM "AuditLog" ORDER BY id DESC LIMIT 50;`.

### Unggah gambar

- Kolom gambar di Master, Galeri Foto, dan Head Home punya tombol unggah (`src/components/management/ImageField.tsx`) yang mengirim ke `POST /api/uploads` (field `file`).
- Ukuran maksimal 5 MB. Format yang diterima JPG, PNG, dan WebP, dicek dari isi file, bukan dari nama atau tipe yang dikirim browser.
- File disimpan di `UPLOAD_DIR` dengan nama acak dan disajikan publik di `/media/<nama>` dengan cache panjang. Di produksi folder ini adalah volume persisten `/app/uploads`.
- Kolom gambar tetap menerima path di situs ini (misalnya `/assets/...` atau `/media/...`) atau URL `https://`.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan di port 3005. |
| `npm run build` | `prisma generate` lalu `next build`. Tidak butuh `DATABASE_URL` maupun `JWT_SECRET`. |
| `npm start` | Menjalankan hasil build di port 3000. Untuk port lain: `npm start -- -p 3005`. |
| `npm run lint` | ESLint untuk seluruh repo. |
| `npx tsc --noEmit` | Cek tipe TypeScript. |
| `node scripts/smoke-test.mjs` | Uji cepat bagian publik terhadap server yang sedang jalan. |
| `npx tsx scripts/smoke-admin.ts` | Uji hak akses dan sesi dashboard terhadap server yang sedang jalan. |
| `npx tsx --env-file=.env.local scripts/seed-landing-content.ts` | Mengisi konten landing ke database (lihat Menjalankan di komputer lokal). |
| `npx tsx --env-file=.env.local scripts/set-account.ts ...` | Membuat, mengganti, atau menghapus akun dashboard langsung di database (lihat Runbook akun). |

Smoke test memeriksa `/` (termasuk header `X-Robots-Tag: noindex` di localhost), `/robots.txt`, `/sitemap.xml`, gambar Open Graph (path-nya diambil dari meta `og:image` di beranda), `/api/health`, serta `POST /api/contact` yang valid dan tidak valid. Alamat server diambil dari `BASE_URL` (default `http://localhost:3000`) dan hanya boleh `localhost` atau `127.0.0.1`, karena uji form kontak menyimpan satu lead ke database.

## CI

`.github/workflows/ci.yml` berjalan di setiap push dan pull request, dengan satu job bernama `ci`: Postgres 16 sebagai service, `npm ci`, lint, `prisma generate`, cek tipe, `prisma migrate deploy`, seed, `npm run build`, `next start`, lalu `scripts/smoke-test.mjs` dan `scripts/smoke-admin.ts`. Semua nilai env di workflow adalah dummy khusus CI.

Build di CI hanya mendapat `NEXT_PUBLIC_SITE_URL` dan `NEXT_TELEMETRY_DISABLED`, sama dengan build di Coolify. `DATABASE_URL`, `JWT_SECRET`, dan `SEED_PASSWORD` dipasang per langkah yang membutuhkannya, sehingga CI membuktikan build jalan tanpa rahasia.

Auto deploy produksi hanya men-deploy SHA `main` yang check `ci`-nya hijau. Di GitHub, lindungi `main` dari force push dan penghapusan, lalu jadikan `ci` sebagai required check supaya perubahan yang merah tidak bisa digabung.

## Header keamanan dan redirect

`next.config.ts` mengirim header keamanan dasar ke semua route (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Content-Security-Policy: frame-ancestors 'none'`, `Permissions-Policy`) dan mematikan header `X-Powered-By`. Semua respons `/api/*` dikirim dengan `Cache-Control: no-store` karena memuat data pribadi.

- Host selain `www.dpro.events` (domain review sslip.io, apex `dpro.events`, `dproduction-iota.vercel.app`, localhost) mendapat `X-Robots-Tag: noindex`, supaya hanya domain resmi yang diindeks.
- `www.dpro.events` mendapat `Strict-Transport-Security: max-age=86400`. Nilai ini sengaja pendek; setelah domain resmi stabil seminggu dengan sertifikat valid, naikkan ke `31536000` lewat commit biasa.
- Redirect http ke https dan apex ke www diatur di Coolify, bukan di kode. Keduanya harus permanen (301 atau 308).

URL dari situs lama diarahkan permanen (308):

| URL lama | Tujuan |
| --- | --- |
| `/tentang_kami`, `/team` | `/#tentang-kami` |
| `/masterpiece` | `/#masterpiece` |
| `/rental`, `/rental/detail`, `/event`, `/wedding` | `/#layanan` |
| `/galeri_foto`, `/galeri_video` | `/#galeri` |
| `/kontak` | `/#kontak` |
| `/gbr/*`, `/images/*` (folder gambar situs lama) | `/` |
| `/login` | `/management/login` |
| `/apple-touch-icon.png`, `/apple-touch-icon-precomposed.png` | `/apple-icon.png` |

Garis miring di akhir URL dan query string (misalnya `/rental/detail/?id=1`) ikut tertangani.

## Deploy ke produksi

Produksi adalah app Coolify `dproduction` (uuid `c7ezyfbcfz1buariz99ktals`) di VPS 187.53.129.205, dibangun dari `Dockerfile` di root repo dengan build pack Dockerfile. Database-nya container `dproduction-db-1` di VPS yang sama. PgBouncer di port 6433 hanya untuk keperluan operasional dan hanya boleh dibuka lewat Tailscale. Vercel tidak lagi membangun apa pun: `vercel.json` berisi `"ignoreCommand": "exit 0"`.

### Env dan volume di Coolify

- Env build (ditandai sebagai build variable): `NEXT_PUBLIC_SITE_URL=https://www.dpro.events`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, dan env Google Ads kalau akunnya sudah siap. Dockerfile meneruskannya sebagai build arg.
- Env runtime (jangan ditandai sebagai build variable): `DATABASE_URL` ke role `dproduction_app` lewat jaringan internal docker, `JWT_SECRET` (hasil `openssl rand -hex 32`), `LEAD_TELEGRAM_BOT_TOKEN`, dan `LEAD_TELEGRAM_CHAT_ID`. `UPLOAD_DIR` sudah bernilai `/app/uploads` di image. `DATABASE_URL` dan `JWT_SECRET` tidak pernah menjadi ARG atau ENV di Dockerfile, jadi tidak tertanam di image.
- Persistent storage: folder host `/data/dproduction/uploads` dipasang ke `/app/uploads`. Container berjalan sebagai user `node` (uid 1000), jadi jalankan `chown 1000:1000 /data/dproduction/uploads` sekali. Folder ini harus ikut backup harian ke NAS bersama dump database.
- Matikan auto deploy bawaan Coolify (deploy diatur skrip di bawah) dan aktifkan healthcheck di `/`, supaya container baru yang gagal start tidak menggantikan container lama.

### Yang terjadi saat container start

Container menjalankan `prisma migrate deploy` lalu `next start` (lihat `CMD` di `Dockerfile`). Migrasi selalu jalan sebelum kode baru melayani request. Kalau migrasi gagal, `next start` tidak dijalankan, dan dengan healthcheck aktif container lama tetap melayani.

`prisma migrate deploy` membuat database baru kalau database di `DATABASE_URL` belum ada, misalnya karena nama database salah ketik. Aplikasi lalu jalan di database kosong tanpa akun dan tanpa konten. Periksa nama database sebelum menyimpan env. Dengan role `dproduction_app` (tanpa hak CREATEDB) kesalahan ini membuat migrasi gagal, sehingga container baru tidak start.

### Auto deploy

`deploy/dproduction-autodeploy.sh` dipasang di VPS sebagai `/usr/local/bin/dproduction-autodeploy.sh` dan dipanggil systemd timer tiap 2 menit. Cara pasang dan isi `/etc/dproduction-autodeploy.env` ada di komentar atas skrip. Alurnya:

1. Ambil SHA terbaru `main` dari GitHub.
2. Kalau SHA itu sudah pernah sukses di-deploy, selesai.
3. Cek check run `ci` untuk SHA itu. Belum selesai berarti tunggu putaran berikutnya; gagal berarti dicatat dan tidak di-deploy.
4. Kalau hijau, set commit app Coolify ke SHA itu, picu deploy, lalu tunggu status deployment (maksimal 20 menit). SHA dicatat sukses hanya kalau deployment berstatus finished. Tiap SHA dicoba paling banyak 3 kali; hapus `/var/lib/dproduction-autodeploy/attempts` untuk mencoba lagi.

Mode lain:

- `DRY_RUN=1 dproduction-autodeploy.sh` hanya mencetak SHA `main`, status check `ci`, dan langkah yang akan dijalankan, tanpa memanggil Coolify.
- `ROLLBACK_SHA=<sha 40 karakter> dproduction-autodeploy.sh` men-deploy SHA itu tanpa cek `main` dan CI. SHA `main` saat itu ditahan (tidak di-deploy otomatis) sampai ada commit baru di `main`; hapus `/var/lib/dproduction-autodeploy/hold` untuk melepasnya.

Nama field dan endpoint Coolify yang dipakai skrip harus dicocokkan dulu dengan versi Coolify di VPS sebelum skrip dipakai (lihat komentar di skrip).

### Sebelum menggabungkan perubahan yang membawa migrasi

1. Backup database produksi dulu, di luar jadwal harian:
   ```bash
   docker exec dproduction-db-1 pg_dump -U dproduction -Fc dproduction > /root/backups/dproduction/manual-$(date +%Y%m%d-%H%M).dump
   ```
   Pastikan ukurannya lebih dari 0 dan `pg_restore --list` pada file itu berhasil.
2. Baca SQL migrasi baru di `prisma/migrations/`. Untuk deploy pertama dengan migrasi `20260924120000_workspace_konten_akun`, pastikan tabel yang dibuang masih kosong dan tidak ada grade kembar:
   ```sql
   SELECT (SELECT count(*) FROM "WorkspaceEvent") AS workspace_event,
          (SELECT count(*) FROM "WorkspaceSalary") AS workspace_salary,
          (SELECT count(*) FROM "WorkspaceReport") AS workspace_report,
          (SELECT count(*) FROM "GaleriFoto") AS galeri_foto,
          (SELECT count(*) FROM "GaleriFotoAlbum") AS galeri_foto_album,
          (SELECT count(*) FROM "AuditLog") AS audit_log,
          (SELECT count(*) FROM "JobDesc" WHERE "levelA" IS NOT NULL OR "levelB" IS NOT NULL OR "levelC" IS NOT NULL) AS jobdesc_level;
   SELECT grade, count(*) FROM "GradeEvent" GROUP BY grade HAVING count(*) > 1;
   ```
   Baris Event, Wedding, dan Client yang `deletedAt`-nya terisi akan dihapus permanen oleh migrasi itu.
3. Setelah tayang: cek `/api/health` (200), login ke `/management`, dan buka satu halaman tiap modul.

Jangan jalankan `prisma db seed` di produksi. Akun produksi dibuat lewat Runbook akun.

### Mengisi konten landing di produksi

Dijalankan sekali oleh orang yang berwenang setelah backup terbaru dipastikan ada, dari clone repo di commit yang sama dengan produksi dan dari mesin yang bisa menjangkau database produksi lewat Tailscale. Simpan `DATABASE_URL` produksi di file `.env.produksi` (mode 600, sudah diabaikan git lewat pola `.env*`), jangan di `.env.local`:

```bash
ALLOW_REMOTE_SEED=1 npx tsx --env-file=.env.produksi scripts/seed-landing-content.ts --awal
```

Baris KantorSetting produksi masih berisi placeholder (nama `DPro`, deskripsi bahasa Inggris, link Facebook yang salah, Google Maps berisi teks `Google Maps Embed`), dan `--awal` menimpanya dengan data resmi serta menonaktifkan 4 event dokumentasi. Tabel yang sudah berisi (HeadHome, Wedding, Rental, galeri, Event) dilewati, jadi baca ringkasan yang dicetak skrip dan cek landing setelahnya.

### Migrasi gagal

Di PostgreSQL satu file migrasi dijalankan utuh atau tidak sama sekali, jadi migrasi yang gagal tidak meninggalkan perubahan setengah jadi. Prisma tetap mencatatnya sebagai gagal di `_prisma_migrations`, dan setiap `migrate deploy` berikutnya berhenti dengan error P3009 sampai catatan itu dibereskan.

1. Baca log container di Coolify untuk melihat pernyataan yang gagal.
2. Bereskan penyebabnya di database (misalnya backup lalu pindahkan data dari tabel yang akan dibuang).
3. Dari clone repo di commit yang sama, tandai migrasi itu batal dengan `DATABASE_URL` produksi dari `.env.produksi`. Tanda kurung membuat subshell, jadi env produksi tidak tertinggal di terminal:
   ```bash
   ( set -a; . ./.env.produksi; npx prisma migrate resolve --rolled-back <nama folder migrasi> )
   ```
   Contoh nama folder: `20260924120000_workspace_konten_akun`.
4. Redeploy di Coolify. Migrasi dijalankan ulang saat container start.

### Rollback

Rollback berarti men-deploy ulang SHA sebelumnya dengan `ROLLBACK_SHA`. Migrasi tidak ikut mundur: SHA lama berjalan di atas skema yang sudah berubah. Kalau migrasi terakhir hanya menambah kolom atau tabel, kode lama biasanya tetap jalan. Kalau migrasi membuang atau mengubah kolom yang dipakai kode lama, rollback kode tidak cukup. Perbaiki dengan migrasi maju (commit baru di `main` yang mengembalikan kolom atau datanya), atau restore dari backup yang dibuat sebelum deploy (lihat Runbook restore).

## Runbook migrasi DNS dan TLS

Domain `dpro.events` masih menunjuk ke server situs lama. Let's Encrypt membatasi 5 validasi gagal per hostname per jam, dan setiap deploy di Coolify selama DNS belum pindah memicu percobaan sertifikat yang gagal. Karena itu urutannya:

1. Selama DNS belum pindah, kolom domain (fqdn) app di Coolify hanya berisi domain review sslip.io. Keluarkan `dpro.events` dan `www.dpro.events` dari kolom itu sampai hari pindah. Uji aplikasi di domain review; header `X-Robots-Tag: noindex` harus ada di sana.
2. Sehari sebelum pindah, Donny menurunkan TTL A record `dpro.events` dan `www` ke 300 detik di Hostinger.
3. Hari pindah: Donny mengubah A record apex `dpro.events` dan `www` ke `187.53.129.205`.
4. Tunggu sampai DNS otoritatif sudah benar:
   ```bash
   dig +short NS dpro.events
   dig +short A www.dpro.events @<salah satu nameserver di atas>
   dig +short A dpro.events @<salah satu nameserver di atas>
   ```
   Keduanya harus membalas `187.53.129.205`.
5. Baru setelah itu masukkan `https://www.dpro.events` dan `https://dpro.events` ke kolom domain app di Coolify, lalu Redeploy satu kali.
6. Cek sertifikat sampai issuer-nya Let's Encrypt:
   ```bash
   openssl s_client -connect www.dpro.events:443 -servername www.dpro.events </dev/null 2>/dev/null | openssl x509 -noout -issuer -dates
   openssl s_client -connect dpro.events:443 -servername dpro.events </dev/null 2>/dev/null | openssl x509 -noout -issuer -dates
   ```
   Kalau masih `TRAEFIK DEFAULT CERT`, tunggu beberapa menit lalu cek lagi. Jangan Redeploy berulang sebelum DNS benar, karena setiap percobaan yang gagal dihitung ke batas 5 per jam.
7. Di Coolify, jadikan redirect apex ke `www` dan http ke https permanen (301 atau 308), lalu cek `curl -sI http://dpro.events` dan `curl -sI https://dpro.events`.
8. Di project Vercel, lepaskan `dpro.events` dan `www.dpro.events`, lalu alihkan `dproduction-iota.vercel.app` ke `https://www.dpro.events` dengan redirect 308. Jangan pasang `DATABASE_URL` di Vercel.
9. Kirim sitemap `https://www.dpro.events/sitemap.xml` di Google Search Console, dan kembalikan TTL ke nilai normal setelah semuanya stabil.

## Runbook akun

`scripts/set-account.ts` membuat atau mengganti akun (level, nama lengkap, password), mengaktifkannya, membuka kuncinya, dan mencabut semua sesinya. Skrip juga bisa menghapus akun. Minimal satu owner atau superadmin aktif selalu dijaga, dan setiap perubahan dicatat di AuditLog atas nama `skrip set-account`.

```bash
npx tsx --env-file=.env.local scripts/set-account.ts simpan <username> <role> "<Nama lengkap>" [--hash-stdin] [--yakin]
npx tsx --env-file=.env.local scripts/set-account.ts hapus <username> [--yakin]
```

- Tanpa `--hash-stdin`, password diminta dua kali di terminal tanpa ditampilkan dan dicek dengan aturan password dashboard.
- Dengan `--hash-stdin`, skrip membaca satu baris hash scrypt format Produksia dari stdin. Kalau stdin adalah terminal, hash ditempel di prompt tersembunyi.
- `--yakin` wajib kalau host database bukan `localhost` atau `127.0.0.1`. Skrip selalu mencetak nama database dan host-nya dulu.

Menyamakan akun produksi dengan Produksia (dikerjakan Andrew atau Donny setelah versi baru tayang, dari clone repo di commit yang sama dan mesin yang bisa menjangkau kedua database lewat Tailscale):

1. Siapkan `.env.produksi` berisi `DATABASE_URL` produksi dproduction (mode 600, lihat Mengisi konten landing di produksi).
2. Simpan URL database Produksia di variabel shell tanpa masuk riwayat. Pakai format yang diterima `psql`, tanpa `?schema=public`:
   ```bash
   read -rs PRODUKSIA_DB_URL
   ```
3. Salin hash tiap akun lewat pipe, jadi hash tidak pernah muncul di layar maupun di riwayat shell:
   ```bash
   psql "$PRODUKSIA_DB_URL" -Atc "SELECT \"kataSandiHash\" FROM \"Pengguna\" WHERE \"namaPengguna\" = 'superadmin'" \
     | npx tsx --env-file=.env.produksi scripts/set-account.ts simpan superadmin superadmin "Andrew Steine" --hash-stdin --yakin
   psql "$PRODUKSIA_DB_URL" -Atc "SELECT \"kataSandiHash\" FROM \"Pengguna\" WHERE \"namaPengguna\" = 'owner'" \
     | npx tsx --env-file=.env.produksi scripts/set-account.ts simpan owner owner "Donny Donatus" --hash-stdin --yakin
   psql "$PRODUKSIA_DB_URL" -Atc "SELECT \"kataSandiHash\" FROM \"Pengguna\" WHERE \"namaPengguna\" = 'owner2'" \
     | npx tsx --env-file=.env.produksi scripts/set-account.ts simpan owner2 owner "Nadia Yuliana" --hash-stdin --yakin
   ```
   Kalau query tidak menemukan akunnya, skrip berhenti dengan pesan "Hash tidak dikenali" dan tidak mengubah apa pun. Cara lain: jalankan perintah `simpan ... --hash-stdin --yakin` tanpa pipe, lalu tempel hash di prompt tersembunyi.
4. Uji login ketiga akun di `/management/login` dengan password Produksia masing-masing.
5. Hapus akun sementara `donny`:
   ```bash
   npx tsx --env-file=.env.produksi scripts/set-account.ts hapus donny --yakin
   ```
6. Hapus `.env.produksi` dan tutup terminal kalau sudah selesai.

## Runbook role database aplikasi

Role `dproduction` di produksi adalah superuser dan juga pemilik bawaan cluster (dibuat dari `POSTGRES_USER`), jadi `REASSIGN OWNED BY dproduction` ditolak Postgres. Aplikasi dipindah ke role `dproduction_app` yang bukan superuser dan menjadi pemilik semua objek di schema `public`, supaya `prisma migrate deploy` saat container start tetap bisa membuat dan mengubah tabel.

Kerjakan di jendela maintenance setelah backup, sebagai `dproduction`:

```bash
docker exec -i dproduction-db-1 psql -v ON_ERROR_STOP=1 -U dproduction -d dproduction <<'SQL'
BEGIN;
CREATE ROLE dproduction_app LOGIN PASSWORD '<password acak, misalnya hasil openssl rand -hex 24>'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
ALTER SCHEMA public OWNER TO dproduction_app;
DO $$
DECLARE r record;
BEGIN
  -- Tabel dan view. Sequence milik kolom tabel ikut pindah bersama tabelnya.
  FOR r IN SELECT c.oid::regclass AS obj FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm') LOOP
    EXECUTE format('ALTER TABLE %s OWNER TO dproduction_app', r.obj);
  END LOOP;
  -- Sequence yang tidak terikat kolom tabel.
  FOR r IN SELECT c.oid::regclass AS obj FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'public' AND c.relkind = 'S'
             AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.deptype IN ('a', 'i')) LOOP
    EXECUTE format('ALTER SEQUENCE %s OWNER TO dproduction_app', r.obj);
  END LOOP;
  -- Enum buatan Prisma.
  FOR r IN SELECT t.oid::regtype AS typ FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
           WHERE n.nspname = 'public' AND t.typtype = 'e' LOOP
    EXECUTE format('ALTER TYPE %s OWNER TO dproduction_app', r.typ);
  END LOOP;
END $$;
COMMIT;
SQL
```

Password ditulis di heredoc, jadi tidak masuk riwayat shell. Setelah itu:

1. Cek hasilnya. Semua baris harus menunjuk `dproduction_app`, dan `rolsuper` harus `f`:
   ```sql
   SELECT tableowner, count(*) FROM pg_tables WHERE schemaname = 'public' GROUP BY 1;
   SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls FROM pg_roles WHERE rolname LIKE 'dproduction%';
   ```
2. Ganti `DATABASE_URL` runtime di Coolify ke `postgresql://dproduction_app:<password>@<host db internal>:5432/dproduction?schema=public`, lalu Redeploy. Log start harus menampilkan `migrate deploy` tanpa error.
3. Keluarkan `dproduction` dari `admin_users` di `/data/dproduction/pgbouncer/pgbouncer.ini` dan rotasi password role `dproduction`. Role itu tetap ada untuk pekerjaan admin (backup, restore, runbook ini).
4. PgBouncer 6433 tetap hanya lewat Tailscale. Aplikasi tidak memakainya, karena tersambung ke database lewat jaringan internal docker.

## Runbook restore

Dump harian ada di `/root/backups/dproduction` di VPS (dan salinannya di NAS setelah sinkron backup aktif). Restore dilakukan ke database baru dulu, jadi database lama tetap utuh sampai hasilnya dicek.

1. Salin dump ke container database lalu restore ke database baru milik role aplikasi:
   ```bash
   docker cp /root/backups/dproduction/<file>.dump dproduction-db-1:/tmp/pulih.dump
   docker exec dproduction-db-1 createdb -U dproduction -O dproduction_app dproduction_pulih
   docker exec dproduction-db-1 pg_restore -U dproduction --no-owner --role=dproduction_app -d dproduction_pulih /tmp/pulih.dump
   ```
   `--no-owner --role=dproduction_app` membuat semua objek dimiliki role aplikasi, termasuk dump yang dibuat sebelum role itu ada. Kalau Runbook role database aplikasi belum dijalankan, ganti `dproduction_app` dengan `dproduction` di dua perintah terakhir.
2. Cek jumlah baris dan bandingkan dengan yang diharapkan:
   ```bash
   docker exec dproduction-db-1 psql -U dproduction -d dproduction_pulih -c 'SELECT (SELECT count(*) FROM "User") AS akun, (SELECT count(*) FROM "Event") AS event, (SELECT count(*) FROM "KantorSetting") AS kantor, (SELECT count(*) FROM "Client") AS lead, (SELECT max(migration_name) FROM _prisma_migrations) AS migrasi_terakhir;'
   ```
3. Arahkan `DATABASE_URL` runtime di Coolify ke `dproduction_pulih` lalu Redeploy. `prisma migrate deploy` saat start menerapkan migrasi yang belum ada di dump.
4. Uji: `/api/health` 200, login ke `/management`, buka Setting Kantor dan Master Event. Kalau dump tidak memuat akun (misalnya dibuat sebelum akun ada), buat akun owner atau superadmin lewat Runbook akun dengan `DATABASE_URL` ke `dproduction_pulih`.
5. Kalau gambar unggahan ikut hilang, salin kembali folder `uploads` dari NAS ke `/data/dproduction/uploads` lalu `chown -R 1000:1000 /data/dproduction/uploads`.
6. Database lama bisa dihapus setelah beberapa hari berjalan normal.

## Struktur folder

- `src/app/(site)`: layout dan halaman landing publik (Navbar, Footer, JSON-LD, tag Ads hanya dimuat di sini).
- `src/app/management`: halaman dashboard admin. `src/app/api`: route API (kontak, health, auth, users, unggah gambar, dan tiap modul). `src/app/media`: gambar unggahan untuk publik.
- `src/proxy.ts`: pengecekan sesi dan hak akses halaman `/management`, serta batas ukuran, tipe konten, dan origin untuk request API yang mengubah data.
- `src/components/sections`: section landing page. `src/components/management`: AdminShell, Sidebar, Header, Modal, AdminThumb, ImageField, Pagination.
- `src/lib`: `prisma.ts` (koneksi), `landing-content.ts` (konten landing dari database beserta cadangannya), `revalidate.ts`, `site.ts` (URL situs, WhatsApp, opsi form kontak), `rbac.ts` (role dan hak akses), `session.ts` (token dan cookie), `auth.ts` (sesi dari database, `requireAccess`), `password.ts` (hash scrypt dan bcrypt lama), `api.ts` (validasi dan penanganan error route), `audit.ts`, `upload.ts`, `workspace.ts`, `rate-limit.ts`, `notify.ts`.
- `src/hooks`: `useCrud` dan `usePagination` untuk halaman admin.
- `prisma`: skema, migrasi, dan seed akun lokal.
- `scripts`: pengaman host database, isi konten landing, akun dashboard, dan smoke test.
- `deploy`: skrip auto deploy VPS. `Dockerfile` dan `.dockerignore`: image produksi. `vercel.json`: pembekuan build Vercel. `.github/workflows/ci.yml`: CI.
