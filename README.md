# 🚀 D'Production Web System & Management Dashboard

## 🏗️ Arsitektur Sistem

Sistem yang saya bangun terbagi menjadi dua bagian utama yang berjalan dalam satu kesatuan (*monolith*):

1. **Company Profile (Halaman Depan / Publik)**
   Halaman yang dirancang interaktif untuk memamerkan portofolio, layanan (Wedding, Corporate, dll), galeri foto/video, dan form kontak yang langsung terhubung ke database.
   
2. **Management Dashboard (Halaman Admin `/management`)**
   Sistem operasi dapur perusahaan yang tersembunyi. Di sinilah tim Anda mengelola jadwal kru (*Workspace Event*), menggaji (*Salary*), hingga mengubah isi halaman depan (*Master Data* & *Galeri*). URL dibuat khusus (`/management`) agar tidak mudah ditebak oleh peretas (menghindari tebakan standar `/admin`).

---

## 🛡️ Keamanan & Hierarki Akses (RBAC)

Keamanan adalah prioritas utama. Saya telah mengimplementasikan **Role-Based Access Control (RBAC)** menggunakan verifikasi **JWT Kriptografi Edge (Jose)**. Artinya, sistem akan secara cerdas memblokir akses jika ada kru yang mencoba masuk ke ranah yang bukan haknya.

Berikut adalah 5 tingkatan *Role* yang telah saya tanamkan beserta hak aksesnya:

- 👑 **Owner** : Akses mutlak. Dapat melihat seluruh modul termasuk Laporan Keuangan, Gaji, Database, dan manajemen Akun Admin lainnya.
- ⚡ **Superadmin** : Akses operasional tak terbatas, dapat mengelola hampir seluruh sistem kecuali pengaturan akun login (Setting Login).
- 💼 **Admin** : Staf manajerial yang hanya difokuskan untuk mengelola Master Data (Klien, Event, Jobdesc), Galeri, dan Workspace Event. Tidak bisa melihat Gaji atau Database.
- 👁️ **Staff** : Memiliki batasan *View-Only*. Mereka hanya bisa masuk dan melihat jadwal acara (*Workspace Event*) tanpa memiliki wewenang untuk mengubah, menambah, atau menghapus data.
- 🧪 **Tester** : Akun replika setara *Staff* (*View-Only*). Dibuat khusus jika ada pihak ketiga yang ingin menguji sistem tanpa risiko merusak data produksi.

---

## 💾 Manajemen Database & "Soft Delete"

Sistem ini didukung oleh **PostgreSQL** dan **Prisma ORM**.
Untuk mencegah bencana kehilangan data secara tidak sengaja, saya menggunakan teknik **Soft Delete** pada data krusial:
*(Event, Wedding, WorkspaceSalary, WorkspaceEvent, Client)*

Jika admin menekan tombol "Hapus", sistem **tidak akan menghapus data tersebut secara permanen dari server**. Alih-alih, sistem hanya akan menyembunyikannya dari UI (memberi stempel `deletedAt`). Ini sangat berguna jika ke depan Anda membutuhkan audit data masa lalu.

---

## 💻 Tech Stack (Teknologi yang Digunakan)

Untuk memastikan sistem Anda berjalan sangat cepat, modern, dan tidak cepat usang, saya meraciknya menggunakan:
- **Framework Utama**: [Next.js 15 (App Router)](https://nextjs.org) - Standar industri saat ini.
- **Bahasa**: TypeScript - Meminimalisir *bug* saat pengembangan.
- **Styling**: Tailwind CSS & Framer Motion - Untuk antarmuka modern, *glassmorphism*, dan animasi halus.
- **Database**: PostgreSQL diakses melalui Prisma ORM.
- **Validasi Data**: Zod - Memastikan setiap input form (seperti kontak klien) sesuai kriteria sebelum masuk database.

---

## ⚙️ Panduan Menjalankan Sistem (Bagi Tim IT)

Jika suatu saat tim IT internal Anda ingin menjalankan atau mengembangkan sistem ini secara lokal, ikuti langkah berikut:

1. **Instalasi Dependensi**
   ```bash
   npm install
   ```

2. **Pengaturan Environment (.env.local)**
   Pastikan Anda meminta *file* `.env.local` dari saya (karena file ini bersifat rahasia dan tidak ada di GitHub). File ini berisi `DATABASE_URL` dan `JWT_SECRET`.

3. **Sinkronisasi Database & Akun Bawaan**
   ```bash
   npx prisma db push
   npx tsx --env-file=.env.local prisma/seed.ts
   ```

4. **Jalankan Server Lokal**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di *browser*.

---
Semoga karya digital ini dapat meroketkan skala bisnis **D'Production**. Jika ada kendala, penambahan fitur, atau butuh konsultasi teknis, *I'm just one message away!* 🚀
