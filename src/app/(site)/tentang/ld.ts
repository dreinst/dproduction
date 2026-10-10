import type { Faq } from "@/lib/faq";
import { absoluteUrl, breadcrumbLd, orgRef, siteRef } from "@/lib/seo";

// JSON-LD /tentang: jejak halaman, halaman tentang organisasi, dan daftar pertanyaan umum yang tampil di halaman.
// Hasil kaya FAQ sudah tidak tampil di Google, jadi FAQPage di sini hanya membantu mesin memahami isi halaman.
export function tentangLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbLd("Tentang", "/tentang"),
      {
        "@type": "AboutPage",
        "@id": absoluteUrl("/tentang#halaman"),
        name: "Tentang D'Production",
        url: absoluteUrl("/tentang"),
        inLanguage: "id-ID",
        isPartOf: siteRef,
        mainEntity: orgRef,
      },
      ...(faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": absoluteUrl("/tentang#faq"),
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
          ]
        : []),
    ],
  };
}
