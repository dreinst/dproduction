export const WHATSAPP_NUMBER = "6281938938800";
export const WHATSAPP_DEFAULT_TEXT =
  "Halo D'Production, saya dapat info dari website dan ingin konsultasi acara.";

export function whatsappUrl(text: string = WHATSAPP_DEFAULT_TEXT) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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
