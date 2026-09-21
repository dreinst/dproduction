// Deklarasi tipe untuk window.gtag (dimuat lewat src/components/GoogleAdsTag.tsx,
// hanya ada di browser kalau NEXT_PUBLIC_GOOGLE_ADS_ID diisi).
export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
