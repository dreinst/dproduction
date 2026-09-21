import Script from "next/script";

// Google tag (gtag.js) untuk Google Ads -- HANYA aktif kalau env
// NEXT_PUBLIC_GOOGLE_ADS_ID diisi (format: AW-XXXXXXXXX, didapat dari akun
// Google Ads > Alat > Konversi > Tag Google). Kosong = komponen ini tidak
// merender apa pun, aman dibiarkan terpasang sebelum akun Ads ada.
export default function GoogleAdsTag() {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${adsId}');
        `}
      </Script>
    </>
  );
}
