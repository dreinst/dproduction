export const WHATSAPP_NUMBER = "6281938938800";
export const WHATSAPP_DEFAULT_TEXT =
  "Halo D'Production, saya dapat info dari website dan ingin konsultasi acara.";

export function whatsappUrl(text: string = WHATSAPP_DEFAULT_TEXT) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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
