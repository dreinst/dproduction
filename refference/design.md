# D'Production — Design System & Frontend Reference

> Konsep: konten & struktur asli **dpro.events** (Event / Wedding / Rental, Klien, Masterpiece) digabung dengan bahasa visual yang lebih bersih ala **eventify.co.id**, minus noise dari keduanya (lihat checklist di bagian 8).

---

## 1. Brand Positioning

D'Production — event organizer & wedding planner, Malang, 10+ tahun, melayani klien korporat besar (Bank Indonesia, Astra, Kemendagri, Univ. Brawijaya) sekaligus pernikahan personal.

Dua nada hidup berdampingan dan desain harus menampung keduanya tanpa pecah jadi dua brand:
- **Profesional & terpercaya** → sisi korporat (gathering, seminar, government event)
- **Hangat & personal** → sisi wedding

**Signature element:** rel timeline vertikal di section Masterpiece. Bukan dekorasi angka 01/02/03 kosong — isinya memang kronologi nyata (tanggal + jam + kegiatan), jadi struktur timeline itu jujur terhadap kontennya.

---

## 2. Design Tokens

### Warna
| Token | Hex | Pakai untuk |
|---|---|---|
| `brand` | `#2563EB` | Primary — CTA, link aktif, accent (sudah dipakai di Navbar) |
| `brand-dark` | `#1D4ED8` | Hover/active state dari brand |
| `brand-soft` | `#EFF6FF` | Background lembut (badge, highlight section) |
| `ink` | `#0F172A` | Teks utama, heading gelap |
| `gold` | `#C8973A` | **Signature accent** — dipakai sangat sedikit: garis di timeline Masterpiece, badge "Wedding", micro-highlight. Ini elemen yang membedakan sisi hangat dari sisi korporat. |
| `surface` | `#FFFFFF` | Background utama |
| `surface-muted` | `#F8FAFC` | Background section selang-seling |
| `line` | `#E2E8F0` | Border, divider |

Aturan: `gold` maksimal satu titik fokus per section — jangan jadi warna kedua yang dipakai di semua tempat, atau dia kehilangan fungsi sebagai signature.

### Tipografi
- **Display** (headline, H1/H2, label section): **Plus Jakarta Sans**, weight 700–800. Dipilih bukan asal — font ini lahir dari Jakarta, cocok secara "vernacular" untuk brand EO Indonesia, dan punya karakter tanpa jatuh ke serif klise atau grotesk generik.
- **Body** (paragraf, nav, UI): **Inter** — netral, sangat legible untuk teks panjang Bahasa Indonesia.
- **Data/Caption** (tanggal, jumlah pax, stats counter): Inter dengan `tabular-nums`, ukuran kecil, tracking sedikit lebar.

### Spacing & Radius
- Card & container: `rounded-xl` (12px) — konsisten dengan logo box di Navbar
- Button/pill/avatar: `rounded-full`
- Section padding vertikal: `py-20 lg:py-28` (jangan kurang dari ini, whitespace generous = clean)

### Shadow
- Default: `shadow-sm` saja untuk card
- Hover state: naik ke `shadow-md` + `scale-[1.02]`, transition 200ms
- Hindari shadow tebal/berwarna — biarkan whitespace yang bicara

---

## 3. Setup Tailwind v4 (`globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-ink: #0F172A;
  --color-brand: #2563EB;
  --color-brand-dark: #1D4ED8;
  --color-brand-soft: #EFF6FF;
  --color-gold: #C8973A;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F8FAFC;
  --color-line: #E2E8F0;

  --font-display: "Plus Jakarta Sans", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

Lalu pakai sebagai `bg-brand`, `text-gold`, `font-display`, dst — tidak perlu `tailwind.config.js` terpisah di Tailwind v4.

---

## 4. Component Patterns

### Navbar — *sudah ada, jadi acuan pattern lain*
Sticky, `bg-white/80 backdrop-blur-md`, logo box `rounded-xl` gradient, CTA WA `rounded-full`. Pattern ini yang harus direplikasi nada-nya ke section lain (soft blur, rounded-xl/full, blue gradient).

### Hero
Hindari 8-foto slideshow kasar ala dpro. Layout asimetris: teks kiri (60%), foto kanan (40%), crossfade lambat maksimal 3–4 foto kalau tetap mau slideshow.

```
+--------------------------------------------------+
| Navbar                                            |
+--------------------------------------------------+
|  Your event partner                               |
|  Momen Spesial Anda,         |                    |
|  Diwujudkan Sempurna.         |   [Foto besar      |
|                                |    rounded-2xl]   |
|  Subhead 1 kalimat singkat.   |                    |
|                                |                    |
|  [Chat WhatsApp] [Lihat Masterpiece →]              |
|                                                    |
|  10+ Tahun  ·  179+ Crew  ·  XX+ Event             |
+--------------------------------------------------+
```
Satu CTA primer (WhatsApp, `bg-brand rounded-full`), satu CTA sekunder (text-link ke Masterpiece). Jangan dua CTA + video sekaligus.

### Layanan Cards (Event / Wedding / Rental)
Pertahankan 3 kategori asli dpro — ini lebih jujur ke bisnis nyata dibanding belasan kategori generik. Tiap card: hover-swap 2 foto (pattern dari eventify), label kategori, deskripsi singkat, link ke subpage. Card wedding boleh dapat aksen `gold` halus saat hover; card event/corporate tetap `brand` blue.

### Stats Counter
Count-up animation saat scroll masuk viewport (`whileInView` + animate number). Angka pakai `tabular-nums font-display`. Maksimal 3–4 angka, jangan lebih (eventify punya kebiasaan menumpuk banyak angka — buang yang tidak punya bukti nyata).

### Klien Logo Grid
Grayscale default, full color on hover (pattern eventify "They Trust Us"). Tiap logo tetap link ke Masterpiece terfilter by klien (pattern dpro, dipertahankan karena berguna).

### Masterpiece Timeline — *signature section*
Rel vertikal di kiri (mobile) / tengah (desktop), dot marker per entri, tanggal di samping dot. Tiap entri: thumbnail (kalau ada), judul, deskripsi singkat, tag kategori klien, tombol "Lihat Detail" → buka **modal/lightbox internal** (bukan redirect mentah ke Google Drive seperti versi lama). Filter by kategori klien di atas timeline.

### Kontak
Dua kolom: info kontak (alamat, telepon, email) + embed Google Maps. Simple, tidak perlu diubah banyak dari versi dpro.

### Footer
Ramping: logo, alamat singkat, 1 baris sosial media (pastikan semua link benar — lihat checklist), menu, copyright. Hapus link yang tidak valid.

---

## 5. Motion Guidelines (Framer Motion — sudah terinstall)

- Page-load hero: fade + translateY 16px, stagger antar elemen teks, easing halus (`ease-out`), bukan bouncy/playful
- Scroll reveal section: `whileInView` fade + translateY 24px, sekali saja (`viewport={{ once: true }}`)
- Hover card: `scale: 1.02–1.03`, durasi 200ms
- Mobile nav: sudah ada pattern `AnimatePresence` di Navbar — pertahankan sebagai standar untuk dropdown/modal lain
- **Hindari**: animasi looping terus-menerus, parallax berlebihan, lebih dari satu efek motion bersamaan dalam satu section — itu yang bikin desain terasa "dibuat AI"
- Hormati `prefers-reduced-motion`

---

## 6. Voice & Copy Rules

- Kalimat aktif, singkat, bahasa Indonesia natural — bukan terjemahan kaku
- **Jangan** ulang frasa promosi ("EO Terbaik di Indonesia") berkali-kali tiap paragraf seperti eventify — sekali cukup, lalu biarkan portfolio bicara
- CTA selalu konkret tentang aksi: "Chat via WhatsApp", bukan "Submit" atau "Klik Disini"
- Caption Masterpiece tetap faktual (venue, jumlah pax, tanggal) — bukan kalimat pemasaran berulang

---

## 7. Route Map (sesuai Navbar yang sudah dibangun)

| Route | Konten |
|---|---|
| `/` | Hero, ringkasan Layanan, stats, CTA |
| `/layanan` | 3 kategori: Event / Wedding / Rental |
| `/tentang-kami` | Narasi brand + stats + foto |
| `/klien` | Grid logo klien |
| `/masterpiece` | Timeline portfolio (gabungkan Galeri ke sini sebagai tab Foto/Video per entri, jangan section terpisah) |
| `/kontak` | Info kontak + map |

---

## 8. Do / Don't Checklist

**Hindari dari dpro.events:**
- Link rusak (Workspace malformed, TikTok kosong, Facebook salah akun)
- Teks placeholder/test yang lolos ke production
- Domain tidak konsisten (`dpro.events` vs `www.dpro.events`)
- Galeri & Masterpiece terpisah padahal isinya tumpang tindih

**Hindari dari eventify.co.id:**
- Pengulangan keyword SEO di tiap paragraf
- CTA "Contact Us" diulang di 12 card layanan berturut-turut
- Multi-branch kota yang tidak relevan (D'Production fokus Malang, jangan dipaksa terlihat nasional)

---

## 9. Urutan Build Hari Ini (fokus frontend)

1. Pasang token warna & font di `globals.css` (`@theme` block di atas)
2. **Hero** — section paling sering dilihat, sekaligus tempat token diuji
3. **Layanan cards** (Event/Wedding/Rental) dengan hover-swap image
4. **Stats counter** — reusable component, juga dipakai lagi di Tentang Kami

Navbar sudah selesai dan jadi acuan pattern (rounded-full, backdrop-blur, brand blue) — pastikan section baru konsisten dengan itu, bukan menciptakan gaya baru sendiri.
