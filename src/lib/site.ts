export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dpro.events";

// WhatsApp 1 dipakai semua ajakan umum; WhatsApp 2 hanya tampil berdampingan di bagian kontak, nomornya dari Setting Kantor.
export const WHATSAPP_NUMBER = "6281938938800";
export const WHATSAPP_DEFAULT_TEXT =
  "Halo D'Production, saya dapat info dari website dan ingin konsultasi acara.";

// number dalam format 62xxx (hasil waNumber), misalnya dari Setting Kantor.
export function whatsappUrl(text: string = WHATSAPP_DEFAULT_TEXT, number: string = WHATSAPP_NUMBER) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export const EVENT_OPTIONS = [
  { value: "corporate", label: "Corporate Gathering" },
  { value: "wedding", label: "Wedding / Pernikahan" },
  { value: "exhibition", label: "Pameran / Exhibition" },
  { value: "rental", label: "Sewa Peralatan" },
  { value: "other", label: "Lainnya" },
] as const;

export const EVENT_VALUES = EVENT_OPTIONS.map((option) => option.value) as [
  (typeof EVENT_OPTIONS)[number]["value"],
  ...(typeof EVENT_OPTIONS)[number]["value"][],
];

export function eventLabel(value: string) {
  return EVENT_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export const WHATSAPP_PATTERN = /^08\d{7,12}$/;

export function normalizeWhatsapp(value: string) {
  return value.replace(/[\s.()-]/g, "").replace(/^\+?62/, "0");
}

// 08xxx, +62xxx, atau 62xxx menjadi 62xxx (hanya angka) untuk link wa.me; null kalau bukan nomor Indonesia yang valid.
export function waNumber(value: string | null | undefined) {
  if (!value) return null;
  const local = normalizeWhatsapp(value);
  return WHATSAPP_PATTERN.test(local) ? `62${local.slice(1)}` : null;
}

// 62xxx (hasil waNumber) menjadi teks tampil, misalnya "+62 819-3893-8800".
export function formatWhatsapp(number: string) {
  const rest = number.slice(2);
  return `+62 ${[rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter(Boolean).join("-")}`;
}

// Pemisah ribuan titik tanpa Intl, supaya hasil di server dan di peramban selalu sama.
export const formatRibuan = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// 1500000 menjadi "Rp 1.500.000".
export const formatRupiah = (amount: number) => `Rp ${formatRibuan(amount)}`;

// Teks satu baris harga katalog. unit adalah keterangan yang tampil apa adanya di samping nominal, misalnya "per mesin".
// Keterangan yang tidak diawali "per " (misalnya "300 sampai 400 shot") tampil di baris kedua, jadi sebaris bernilai false.
// priceFrom milik itemnya dan berlaku untuk semua baris harga item itu.
export function hargaKatalog(price: { amount: number; unit: string | null }, priceFrom = false) {
  const keterangan = price.unit?.trim() || null;
  return {
    nominal: `${priceFrom ? "Mulai " : ""}${formatRupiah(price.amount)}`,
    keterangan,
    sebaris: !keterangan || /^per\s/i.test(keterangan),
  };
}

// Tanggal kalender di WIB (UTC+7, tanpa jam musim panas) sebagai YYYY-MM-DD. offsetDays menggeser harinya.
export function wibDate(offsetDays = 0) {
  return new Date(Date.now() + (7 + 24 * offsetDays) * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// "2026-12-12" menjadi "12 Desember 2026". Hanya untuk tanggal yang sudah dipastikan berformat YYYY-MM-DD.
export function formatTanggal(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${BULAN[month - 1]} ${year}`;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// ID video 11 karakter dari link YouTube (watch?v=, youtu.be/, /embed/, /shorts/), atau null.
export function youtubeId(url: string | null | undefined) {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const host = parsed.hostname;
  let id: string | null | undefined = null;
  if (host === "youtu.be") {
    id = parsed.pathname.slice(1);
  } else if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
    id =
      parsed.pathname === "/watch"
        ? parsed.searchParams.get("v")
        : parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1];
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

// Google Ads butuh send_to berformat "AW-XXXX/label"; env label boleh diisi label saja.
function adsSendTo(label: string | undefined) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId || !label) return null;
  return label.includes("/") ? label : `${adsId}/${label}`;
}

function sendConversion(label: string | undefined) {
  const sendTo = adsSendTo(label);
  if (!sendTo || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: sendTo, transport_type: "beacon" });
}

export function trackFormConversion() {
  sendConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL);
}

export function trackWhatsAppClick() {
  sendConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_WA_CONVERSION_LABEL);
}
