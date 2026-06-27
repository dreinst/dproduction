Saya jawab dalam Bahasa Indonesia, dan saya akan susun ini sebagai dokumen lengkap per halaman/section seperti yang kamu minta — bukan ringkasan, tapi breakdown actionable per file. Karena scope-nya besar (roadmap + kritik + rekomendasi DB + security + per-page checklist), saya buat dalam satu teks panjang biar mudah kamu jadikan acuan kerja, bukan terpotong di chat.

Sebelum saya tulis, satu pertimbangan teknis yang akan menentukan isi dokumen: kamu sebut "rencana deploy otomatis" tapi juga "database lokal, tidak terikat vendor, dipelajari pakai MySQL/Laragon". Ini saya akan jawab dengan rekomendasi konkret (bukan nanya balik) karena sudah cukup jelas arahnya — saya akan jelaskan trade-off PostgreSQL vs MySQL untuk kasusmu di dalam dokumen.

---

# REVIEW LANJUTAN & ROADMAP PERBAIKAN — D'PRODUCTION

Disusun berdasarkan audit penuh terhadap codebase (dpro-main.zip). Format: per-bagian → masalah → tindakan konkret. Saya tulis sebagai dokumen kerja yang bisa langsung kamu jadikan checklist.

---

## BAGIAN 1 — KRITIK FRONTEND (Customer-Facing)

### 1.1 `src/app/layout.tsx`

**Masalah:** `<html lang="en">` padahal 100% konten Bahasa Indonesia.
**Perbaiki:** ganti ke `lang="id"`. Berdampak ke SEO (Google index sebagai bahasa salah) dan screen reader.

**Masalah:** Font Awesome dimuat via CDN (`<link rel="stylesheet" href=".../font-awesome/...">`) padahal seluruh project sudah konsisten pakai `lucide-react`.
**Perbaiki:** cek dulu pakai `grep -rn "fa-" src/` — kalau tidak ada pemakaian class `fa-*` di JSX manapun, hapus link ini. Mengurangi 1 request blocking + ~100KB.

**Masalah:** font cuma Inter. Dokumen rencanamu sendiri (`refference/design.md`) menentukan Plus Jakarta Sans untuk heading.
**Perbaiki:** tambahkan `import { Plus_Jakarta_Sans } from "next/font/google"`, daftarkan sebagai `--font-display`, pakai di h1–h3 lewat `font-display` Tailwind class. Konsistenkan dengan dokumen desain biar brand voice-nya jadi seperti yang sudah kamu rancang.

---

### 1.2 `src/components/sections/HeroSection.tsx`

**Masalah:** background pakai YouTube iframe full-screen (`autoplay=1&mute=1...`). Ini berat untuk mobile/koneksi lambat, dan `design.md` sendiri bilang "hindari slideshow kasar." Video YouTube background juga rawan delay load dan tidak konsisten di semua device (iOS Safari kadang block autoplay walau muted).
**Perbaiki:** ganti ke video native `<video autoPlay muted loop playsInline>` dengan file `.mp4` ter-compress yang di-host sendiri (lebih cepat, lebih konsisten), ATAU ikuti rekomendasi `design.md`: layout asimetris teks-kiri/foto-kanan tanpa video sama sekali.

**Masalah:** stats angka ("17+", "47+", "179+") di-hardcode langsung di JSX.
**Perbaiki:** setelah backend ada, fetch dari endpoint `/api/stats` (hitung COUNT dari tabel klien/event/team) supaya angka ini otomatis update, bukan manual edit kode setiap kali ada event baru.

---

### 1.3 `src/components/sections/KontakSection.tsx` — PALING URGENT DI FRONTEND

**Masalah:** `<form onSubmit={(e) => e.preventDefault()}>` — submit tidak melakukan apapun selain mencegah reload. Input tidak punya `value`/`onChange`, jadi tidak ada state yang ditangkap sama sekali.

**Perbaiki (langkah konkret):**

1. Tambahkan `useState` untuk `{ name, whatsapp, eventType, message }`.
2. Bind tiap input dengan `value` + `onChange`.
3. Di `handleSubmit`: validasi client-side dulu (semua field wajib terisi, format nomor WA valid pakai regex sederhana `/^08\d{8,11}$/` atau library `zod` untuk validasi terstruktur).
4. `fetch("/api/contact", { method: "POST", body: JSON.stringify(formData) })`.
5. Tampilkan state loading / success / error — kasih toast/notifikasi visual, jangan biarkan user menebak-nebak apakah pesan terkirim.

*(lihat Bagian 3 — Security — untuk apa yang harus terjadi di sisi API).*

---

### 1.4 Pola umum di seluruh komponen customer-facing

**Masalah:** tidak ada `loading.tsx` atau `error.tsx` di App Router manapun (Next.js App Router mendukung file convention ini per-folder).
**Perbaiki:** tambahkan `loading.tsx` minimal (skeleton/spinner) terutama nanti di halaman yang fetch data dari DB (katalog, detail-event, klien, team) supaya tidak ada flash konten kosong.

**Masalah:** tidak ada `not-found.tsx` custom — kalau halaman detail-event diakses dengan ID yang tidak ada, Next.js fallback ke 404 generic.
**Perbaiki:** buat 404 custom bermerk D'Production.

---

## BAGIAN 2 — KRITIK ADMIN PANEL (Frontend)

### 2.1 Pola berulang di SEMUA 11 modul (`master/*`, `workspace/*`, `setting/*`, `galeri/*`, `database`)

**Masalah sistemik:** setiap halaman re-implementasi logic CRUD yang identik (modal, search, filter, pagination) dengan copy-paste, bukan komponen reusable.

**Perbaiki:** buat komponen generik di `src/components/admin/`:

- `DataTable.tsx` — terima `columns`, `data`, `onEdit`, `onDelete` sebagai props.
- `CrudModal.tsx` — terima `fields config` (array of `{name, label, type}`) dan render form otomatis.
- `Pagination.tsx`, `SearchBar.tsx`, `EntriesSelector.tsx` — komponen kecil terpisah.

Ini bukan sekadar estetika kode — begitu kamu sambungkan ke backend nyata (Bagian 4), kamu hanya perlu ubah 1 file (`DataTable`) untuk benerin bug di 11 halaman sekaligus, bukan edit 11 file satu-satu.

---

### 2.2 `src/app/admin/setting/login/page.tsx`

**Masalah:** tombol Tambah/Edit/Hapus tidak punya `onClick` — dekoratif total.
**Perbaiki:** ini modul untuk manage user admin sendiri — paling sensitif, harus jadi yang terakhir dikerjakan setelah backend auth (Bagian 3) jadi, karena halaman ini nantinya akan langsung CRUD ke tabel `users` dengan password ter-hash.
**Catatan kecil:** ada typo "administratror" di data alias — perbaiki saat migrasi ke DB.

---

### 2.3 `src/components/VendorInit.tsx`

**Masalah:** dead code total — tidak diimpor di manapun, menunggu library (AOS, Swiper, GLightbox, PureCounter) yang tidak ada di `package.json`.
**Perbaiki:** hapus file ini. Sisa migrasi dari `arsip_penting/old_index_backup.html` yang tidak relevan untuk arsitektur React/Next.js sekarang.

---

### 2.4 Pemakaian `<img>` mentah (6 file: `master/rental`, `master/event`, `master/foto`, `master/wedding`, `setting/head-home`, `galeri/foto`)

**Perbaiki:** ganti semua jadi `next/image`. Karena ini preview thumbnail kecil di tabel admin (bukan hero besar), cukup pakai `<Image src={...} width={48} height={48} className="object-cover" />`.

---

### 2.5 Tidak ada loading/empty/error state yang konsisten

**Masalah:** begitu data datang dari API beneran (bukan `useState` lokal), setiap tabel butuh state loading & error — saat ini tidak ada satupun yang siap untuk itu.
**Perbaiki:** standardisasi pola fetch dengan custom hook, misal `useCrud<T>(endpoint: string)` yang mengembalikan `{ data, loading, error, refetch, create, update, remove }`. Semua 11 halaman tinggal panggil hook ini dengan endpoint masing-masing.

---

## BAGIAN 3 — SECURITY: Yang Wajib Dibenahi (termasuk CRUD sungguhan)

Ini bagian paling kritis. Saya breakdown per layer.

### 3.1 Autentikasi — total rebuild, bukan tambal

**Kondisi sekarang:** password plaintext hardcoded di client bundle, "session" cuma cookie yang bisa dipalsukan manual di DevTools.

**Yang harus dibangun:**

1. **Hash password** — jangan simpan plaintext di DB sekalipun. Pakai `bcrypt` (`npm install bcrypt`) — hash saat user dibuat/password diganti, compare hash saat login, jangan pernah compare plaintext.

2. **Auth di server, bukan client** — buat `src/app/api/auth/login/route.ts`:
   - Terima `username` + `password` lewat POST.
   - Query user dari DB by username.
   - `bcrypt.compare(password, user.passwordHash)`.
   - Kalau cocok → generate session token, set sebagai `httpOnly` cookie (Set-Cookie dari server, bukan `document.cookie` dari client — ini krusial karena `httpOnly` cookie tidak bisa dibaca/dipalsukan lewat JavaScript di browser sama sekali).

3. **Session management** — dua opsi realistis untuk skala project ini:
   - **Opsi A (lebih sederhana):** JWT signed dengan secret key di `.env`, simpan di `httpOnly` cookie, verifikasi tiap request lewat middleware.
   - **Opsi B (lebih aman untuk revoke):** session token random disimpan di tabel `sessions` di DB, cookie cuma berisi token itu, tiap request cek validitas ke DB. Lebih mudah untuk "logout semua device" atau revoke akses kalau ada kebocoran.
   - Untuk skala project ini (single business, bukan SaaS multi-tenant), Opsi A (JWT) sudah cukup dan lebih ringan dipelihara.

4. **Middleware proteksi route** — buat `src/middleware.ts` di root project:
   - Cek cookie session di SETIAP request ke `/admin/*`
   - Kalau invalid/tidak ada → redirect ke `/admin/login` SEBELUM page component dirender
   - Ini menggantikan `AdminLayout.tsx` yang sekarang cuma cek di `useEffect` (client-side, telat, bisa di-bypass)
   - Middleware Next.js jalan di server/edge sebelum halaman dikirim ke browser — ini baru benar-benar "menutup pintu", bukan sekadar nge-cek setelah pintu kebuka.

5. **Rate limiting login** — tambahkan pembatasan percobaan login (misal max 5x percobaan gagal per IP per 15 menit) supaya tidak bisa brute-force password. Bisa pakai middleware sederhana dengan in-memory store untuk skala kecil, atau Redis kalau mau lebih robust.

---

### 3.2 Role-Based Access Control (RBAC)

**Kondisi sekarang:** semua akun = "Superuser", semua bisa akses semua menu termasuk Salary.

**Yang harus dibangun:**

- Definisikan minimal 2-3 role realistis: `owner` (akses penuh termasuk Salary & Setting Login), `admin` (akses operasional: Master, Workspace Event, Galeri — tanpa Salary/Setting), `staff` (kalau perlu, hanya lihat Workspace Event).
- Simpan `role` di tabel `users`, masukkan ke JWT payload saat login.
- Di setiap API route sensitif (`/api/salary`, `/api/users`), cek role dari token sebelum proses request — jangan cuma sembunyikan menu di sidebar (itu cuma UX, bukan security; orang masih bisa langsung akses URL `/admin/workspace/salary` atau panggil API-nya langsung).

---

### 3.3 CRUD API — yang sebenarnya harus dibangun

Ini bagian yang kamu sebut "CRUD yang sebenarnya" — berikut standar minimalnya untuk setiap modul (event, wedding, rental, klien, dst):

```
GET    /api/{resource}        → list (dengan pagination, search query param)
GET    /api/{resource}/[id]   → detail satu item
POST   /api/{resource}        → create (validasi input WAJIB sebelum insert)
PUT    /api/{resource}/[id]   → update
DELETE /api/{resource}/[id]   → delete (soft delete direkomendasikan — tambah kolom deletedAt, jangan hard delete data klien/event yang sudah terjadi)
```

**Hal-hal yang sekarang TIDAK ADA sama sekali dan wajib ditambahkan:**

- **Validasi input di server** — jangan percaya apapun yang dikirim dari client. Pakai `zod`:
  - Definisikan schema per resource (misal `EventSchema`: name min 3 char, description max 1000 char, dst)
  - Validasi di awal setiap POST/PUT handler SEBELUM query ke database
  - Kalau gagal validasi → return 400 dengan pesan error jelas, jangan lanjut ke DB

- **Sanitasi & escaping** — kalau pakai ORM yang benar (lihat Bagian 4), SQL injection otomatis tercegah karena parameterized query. Tapi tetap sanitasi input untuk XSS kalau ada field yang nantinya ditampilkan sebagai HTML (misal description event) — jangan render `dangerouslySetInnerHTML` dari data user tanpa sanitasi (pakai `DOMPurify` kalau memang perlu render HTML).

- **Authorization check per-endpoint** — setiap API route harus cek: (a) apakah user login (dari middleware/token), (b) apakah role-nya cukup untuk operasi ini. Jangan asumsikan "kalau bisa akses `/admin` berarti boleh akses semua API".

- **Audit log minimal** — untuk data sensitif (Salary, Database), simpan log sederhana: siapa yang create/update/delete, kapan. Tabel `audit_logs` (userId, action, resource, resourceId, timestamp). Ini bukan opsional kalau melibatkan data finansial/klien korporat besar (Bank Indonesia, dst) — kalau ada dispute data, kamu punya jejak.

- **Environment variables** — JANGAN PERNAH hardcode connection string DB, JWT secret, atau API key di kode. Semua masuk `.env.local` (sudah di `.gitignore` secara default Next.js), akses lewat `process.env.NAMA_VARIABEL`.

- **CORS & CSRF** — karena ini Next.js API routes yang dipanggil dari frontend yang sama (same-origin), risiko CSRF lebih kecil, tapi tetap pastikan API tidak menerima request dari origin sembarangan kalau nanti ada integrasi eksternal. Untuk form-form penting (login, create data sensitif), pertimbangkan CSRF token kalau scope project membesar.

---

### 3.4 Checklist security ringkas (urutan prioritas)

```
[ ] 1. Pindahkan kredensial dari hardcoded plaintext ke DB dengan bcrypt hash
[ ] 2. Bangun API /api/auth/login dengan JWT + httpOnly cookie
[ ] 3. Bangun middleware.ts untuk proteksi /admin/* di level server
[ ] 4. Hapus document.cookie manual di AdminLayout.tsx, Sidebar.tsx, ConditionalLayout.tsx
[ ] 5. Tambahkan role ke tabel users + cek role di setiap API sensitif
[ ] 6. Validasi input (zod) di SETIAP endpoint POST/PUT
[ ] 7. Rate limiting di endpoint login
[ ] 8. .env.local untuk semua secret (DB url, JWT secret)
[ ] 9. Audit log untuk modul Salary & Database
[ ] 10. Soft delete untuk data historis (jangan hard delete)
```

---

## BAGIAN 4 — REKOMENDASI DATABASE

Kamu sebut tiga requirement: lokal, tidak terikat vendor, rencana deploy otomatis harus mudah dicek. Kamu juga sudah belajar MySQL + Laragon + phpMyAdmin. Saya jawab langsung dengan rekomendasi konkret:

### Rekomendasi: PostgreSQL (bukan MySQL) — dengan alasan teknis berikut

| Aspek | MySQL (yang kamu pelajari) | PostgreSQL (rekomendasi) |
|---|---|---|
| Lokal/self-hosted | ✅ Bisa, lewat Laragon | ✅ Bisa, lewat installer native / Docker |
| Vendor lock-in | Tidak ada (open source) | Tidak ada (open source) |
| Tooling GUI lokal | phpMyAdmin (web-based) | pgAdmin atau TablePlus / Beekeeper Studio (lebih modern, lintas-DB) |
| Validasi tipe data ketat | Lemah (implicit cast sering "diam-diam" salah) | Kuat — JSON native, array native, constraint lebih strict |
| Cocok dengan ORM modern (Prisma) | ✅ didukung | ✅ didukung, dan ekosistem Prisma paling matang di Postgres |
| Portabilitas ke hosting nanti | Banyak provider (PlanetScale, Railway, dst) | Lebih banyak lagi — Supabase, Neon, Railway, Render, semua punya tier gratis PostgreSQL |
| Dicek dengan mudah saat deploy | phpMyAdmin perlu setup terpisah | Cukup 1 connection string + GUI client manapun, termasuk Supabase Studio kalau pakai mereka untuk hosting (tetap Postgres asli, tidak terkunci API proprietary mereka) |

**Kenapa bukan MySQL walau sudah kamu pelajari:** MySQL tetap pilihan valid dan tidak salah — tapi untuk project Next.js + TypeScript modern, ekosistem tooling (Prisma, validasi tipe, hosting gratis tier) lebih matang di Postgres. Transisi dari MySQL ke Postgres knowledge-nya 90% sama (SQL dasar, JOIN, index — konsepnya identik), bedanya cuma sedikit di sintaks (`AUTO_INCREMENT` vs `SERIAL`, dst), jadi belajar yang sudah kamu kuasai di MySQL tidak hilang sama sekali.

---

### Setup lokal yang saya rekomendasikan

**Development di laptop:** install PostgreSQL native (postgresql.org) ATAU jalankan lewat Docker:
```
docker run -e POSTGRES_PASSWORD=xxx -p 5432:5432 postgres:16
```
Docker lebih gampang di-reset/dihapus kalau eksperimen.

**GUI untuk cek data (pengganti phpMyAdmin):**
- **TablePlus** (gratis untuk pemakaian ringan, UI sangat mirip phpMyAdmin tapi lebih cepat) — rekomendasi utama saya.
- **Beekeeper Studio** (open source, gratis penuh).
- **pgAdmin** (official tapi UI lebih berat) kalau mau yang paling "resmi".

**ORM: Prisma** (`npm install prisma @prisma/client`)

Kenapa Prisma: schema didefinisikan di 1 file (`schema.prisma`), auto-generate TypeScript types (cocok sekali dengan project Next.js + TS-mu), ada `prisma studio` — GUI berbasis browser built-in untuk lihat/edit data tanpa tool eksternal sama sekali (ini yang paling relevan untuk "mudah dicek").

Alternatif kalau mau lebih ringan tanpa ORM besar: **Drizzle ORM** — lebih dekat ke SQL asli, type-safe, lebih ringan dari Prisma. Pilih Drizzle kalau kamu mau kontrol query lebih manual; pilih Prisma kalau mau development cepat dengan tooling siap pakai.

---

### Untuk rencana deploy nanti ("mudah dicek")

Tetap Postgres di production — jangan ganti mesin DB antara development dan production (banyak bug tersembunyi muncul justru karena beda mesin DB).

Provider hosting Postgres yang punya dashboard web bawaan untuk cek data (sesuai requirement "mudah dicek"):

- **Supabase** — dashboard table editor mirip spreadsheet, built-in. (Kamu sudah punya koneksi Supabase di tools-mu, jadi ini langsung bisa dipakai tanpa setup baru.)
- **Neon** — serverless Postgres, ada SQL editor di dashboard, auto-scaling, tier gratis cukup besar.
- **Railway** — punya GUI database browser juga, plus auto-deploy dari GitHub.

Karena ini tetap Postgres standar (bukan API proprietary tertutup), kamu tidak terikat vendor — kalau suatu saat mau pindah dari Supabase ke Neon atau ke VPS sendiri, cukup `pg_dump` lalu `pg_restore`, tidak ada migrasi besar.

---

### Ringkasan stack yang saya sarankan

```
Database:      PostgreSQL (lokal: Docker atau native installer)
ORM:           Prisma (schema-first, auto TypeScript types, built-in Studio GUI)
GUI lokal:     TablePlus / Beekeeper Studio (pengganti phpMyAdmin)
Hosting nanti: Supabase atau Neon (Postgres asli, dashboard bawaan, tidak vendor-locked)
```

---

## BAGIAN 5 — TAHAPAN BUILD (Roadmap Eksekusi)

Disusun berurutan — tiap tahap bergantung pada tahap sebelumnya. Jangan lompat ke Tahap 3 sebelum Tahap 1-2 solid, karena security yang dibangun di atas fondasi rapuh akan rapuh juga.

### TAHAP 0 — Persiapan (sebelum nulis kode)

```
[ ] Install PostgreSQL lokal (native atau Docker)
[ ] Install TablePlus/Beekeeper Studio
[ ] npm install prisma @prisma/client bcrypt jsonwebtoken zod
[ ] Buat file .env.local — isi DATABASE_URL, JWT_SECRET (random string panjang)
[ ] npx prisma init
[ ] Rancang schema.prisma: tabel User, Client, Event, Wedding, Rental, GradeEvent,
    JobDesc, GaleriFoto, GaleriVideo, KantorSetting, AuditLog
    (turunkan struktur kolom dari field yang sudah ada di tiap formData di kode sekarang —
    ini sudah jadi spesifikasi gratis, tinggal disalin ke schema)
[ ] npx prisma migrate dev — generate tabel asli di DB lokal
```

---

### TAHAP 1 — Autentikasi & Proteksi (fondasi security)

```
[ ] Buat tabel User dengan kolom passwordHash, role
[ ] Seed 3 user awal (owner/admin/tester) dengan password di-hash bcrypt
[ ] Bangun /api/auth/login — validasi, bcrypt compare, generate JWT, set httpOnly cookie
[ ] Bangun /api/auth/logout — clear cookie
[ ] Bangun middleware.ts — proteksi semua /admin/* di server level
[ ] Hapus seluruh logic document.cookie manual di AdminLayout, Sidebar, ConditionalLayout
[ ] Test: buka /admin tanpa login → harus redirect sebelum halaman render sama sekali
[ ] Test: coba bypass lewat DevTools seperti sebelumnya → harus gagal total
```

---

### TAHAP 2 — CRUD API Generik (backend untuk satu modul dulu sebagai pattern)

```
[ ] Pilih SATU modul paling sederhana sebagai pilot — sarankan "Master Event"
    (datanya paling sedikit field)
[ ] Bangun /api/events (GET list, POST create) dan /api/events/[id] (GET, PUT, DELETE)
[ ] Tambahkan validasi zod di POST/PUT
[ ] Tambahkan cek role/auth di setiap handler
[ ] Sambungkan src/app/admin/master/event/page.tsx ke API ini (ganti useState lokal
    dengan fetch + custom hook useCrud)
[ ] Test penuh: create → cek di TablePlus data benar masuk → refresh browser →
    data tetap ada (ini validasi paling penting: data SURVIVE refresh)
```

---

### TAHAP 3 — Replikasi pattern ke semua modul tersisa

```
[ ] Setelah pattern Tahap 2 terbukti jalan, replikasi ke:
    Master Wedding, Master Rental, Master Grade Event, Master JobDesc,
    Master Foto, Galeri Foto, Galeri Video, Database, Workspace Event,
    Workspace Report, Workspace Salary, Setting Kantor, Setting Login,
    Setting Head Home
[ ] Setiap modul: buat tabel Prisma → buat API route → sambungkan page.tsx
[ ] Workspace Salary & Setting Login dikerjakan PALING TERAKHIR (paling sensitif,
    butuh RBAC sudah matang dari Tahap 1)
```

---

### TAHAP 4 — RBAC (Role-Based Access Control)

```
[ ] Definisikan role final: owner, admin, (staff jika perlu)
[ ] Tambahkan middleware check role per-route sensitif (Salary, Setting Login)
[ ] Update Sidebar.tsx — sembunyikan menu sesuai role (UX, bukan satu-satunya proteksi)
[ ] Test: login sebagai role rendah, coba akses langsung URL /admin/workspace/salary
    dan langsung panggil API /api/salary lewat Postman/curl → harus ditolak di server,
    bukan cuma disembunyikan di UI
```

---

### TAHAP 5 — Frontend Customer: sambungkan ke data nyata

```
[ ] Perbaiki KontakSection.tsx (lihat Bagian 1.3) — sambungkan ke /api/contact
    yang sudah diupgrade untuk simpan ke tabel Inquiry + (opsional) kirim notifikasi
    email/WhatsApp via API pihak ketiga
[ ] Halaman /klien, /team, /katalog, /detail-event — ganti data hardcoded jadi fetch
    dari API yang sudah dibangun di Tahap 2-3
[ ] Tambahkan loading.tsx skeleton untuk tiap halaman yang fetch data
```

---

### TAHAP 6 — Polish & Hardening sebelum go-live

```
[ ] Audit log untuk modul sensitif
[ ] Rate limiting di /api/auth/login
[ ] Ganti semua <img> jadi next/image
[ ] Ganti lang="en" jadi lang="id"
[ ] Hapus VendorInit.tsx dan Font Awesome CDN kalau tidak terpakai
[ ] Tambahkan font Plus Jakarta Sans sesuai design.md
[ ] Review ulang HeroSection — video background vs rekomendasi design.md
[ ] Setup .env untuk production (jangan commit .env ke git — cek .gitignore)
[ ] Pilih hosting DB (Supabase/Neon) — migrasi schema dari lokal ke production
[ ] Deploy ke Vercel (paling natural untuk Next.js) dengan DATABASE_URL production
```

---

## BAGIAN 6 — MINDMAP RINGKAS (Struktur Visual dalam Teks)

```
D'PRODUCTION — ROADMAP PERBAIKAN
│
├── 1. SECURITY (Prioritas #1 — fondasi semua yang lain)
│   ├── Auth server-side (JWT + httpOnly cookie)
│   ├── Password hashing (bcrypt)
│   ├── Middleware proteksi /admin/*
│   ├── RBAC (owner/admin/staff)
│   ├── Validasi input (zod) di semua API
│   ├── Rate limiting login
│   └── Audit log (Salary, Database)
│
├── 2. DATABASE (Fondasi data)
│   ├── PostgreSQL lokal (Docker/native)
│   ├── Prisma ORM (schema.prisma)
│   ├── 14 tabel: User, Client, Event, Wedding, Rental, GradeEvent,
│   │   JobDesc, GaleriFoto, GaleriVideo, KantorSetting, AuditLog,
│   │   Session(opsional), Salary, Inquiry(contact form)
│   └── Hosting nanti: Supabase/Neon (Postgres asli, dashboard bawaan)
│
├── 3. BACKEND API (CRUD sungguhan)
│   ├── Pattern generik: GET list/detail, POST, PUT, DELETE
│   ├── Pilot di Master Event dulu
│   ├── Replikasi ke 13 modul lain
│   └── Auth + role check di setiap endpoint sensitif
│
├── 4. ADMIN FRONTEND (Refactor setelah backend siap)
│   ├── Komponen reusable: DataTable, CrudModal, Pagination
│   ├── Custom hook useCrud per resource
│   ├── Ganti <img> → next/image
│   ├── Perbaiki tombol dekoratif (Setting Login)
│   └── Hapus VendorInit.tsx (dead code)
│
└── 5. CUSTOMER FRONTEND (Polish & sambung data)
    ├── Perbaiki form Kontak (paling urgent — saat ini buta total)
    ├── Sambungkan Klien/Team/Katalog/Detail-Event ke data API
    ├── lang="id", hapus Font Awesome CDN
    ├── Tambah font Plus Jakarta Sans (sesuai design.md)
    └── Evaluasi ulang Hero video background
```

---

Itu seluruh breakdown-nya. Kalau kamu mau mulai eksekusi, saya sarankan kita mulai dari Tahap 0 + Tahap 1 dulu (setup Postgres + Prisma + auth server-side) — itu fondasi yang akan menentukan apakah Tahap 2-6 berjalan mulus atau malah harus dirombak ulang nanti. Mau saya bantu mulai dari situ, misalnya buatkan `schema.prisma` awal berdasarkan field-field yang sudah ada di tiap `formData` di kodemu sekarang?
