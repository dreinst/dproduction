"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Apa saja layanan yang disediakan D'Production?",
    answer:
      "D'Production melayani tiga hal utama: event organizer untuk acara korporat dan pemerintahan (gathering, seminar, product launching, gala dinner), wedding organizer untuk pernikahan, dan sewa peralatan event seperti tenda, sound system, lighting stage, serta kursi dan meja.",
  },
  {
    question: "D'Production berlokasi di mana?",
    answer:
      "Kantor kami di Jl. Raya Pandanlandung No. 16, Bandulan, Wagir, Kabupaten Malang, Jawa Timur. Sebagian besar acara yang kami tangani berada di Malang dan sekitarnya.",
  },
  {
    question: "Apakah D'Production melayani acara di luar kota Malang?",
    answer:
      "Ya. Selain di Malang, tim kami sudah berpengalaman menangani acara di Bandung, Yogyakarta, dan Magelang untuk program-program Bank Indonesia, jadi kami terbiasa bekerja di luar kota.",
  },
  {
    question: "Sudah berapa lama D'Production menjadi event organizer?",
    answer:
      "D'Production berdiri sejak 2016 di Malang dan sudah menangani acara mulai dari gathering korporat, seremoni pemerintahan, peresmian gedung perusahaan, hingga fun run berskala ribuan peserta.",
  },
  {
    question: "Bagaimana cara memesan jasa D'Production?",
    answer:
      'Cara paling cepat adalah lewat tombol "Konsultasi Gratis" atau WhatsApp di halaman ini. Ceritakan jenis acara, tanggal, dan kebutuhanmu, tim kami akan membalas untuk diskusi lebih lanjut, tanpa biaya untuk sesi konsultasi awal.',
  },
  {
    question: "Bisakah menyewa peralatan saja tanpa jasa event organizer?",
    answer:
      "Bisa. Tenda, sound system, lighting stage, serta kursi dan meja bisa disewa terpisah tanpa harus memakai jasa full event organizer kami. Hubungi kami lewat WhatsApp untuk cek ketersediaan dan harga.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-32 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6"
          >
            Pertanyaan Umum
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Yang Sering <span className="gradient-text">Ditanyakan</span>
          </motion.h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-blue-600 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
