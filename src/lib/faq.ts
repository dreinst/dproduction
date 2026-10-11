import type { LandingKantor } from "@/lib/landing-content";

export type Faq = { question: string; answer: string };

// Pertanyaan umum di halaman Tentang. Tampilan dan JSON-LD FAQPage memakai daftar yang sama, jadi teks keduanya selalu
// cocok. Alamat dan tahun berdiri mengikuti Setting Kantor.
export function daftarFaq({ address, foundedYear }: Pick<LandingKantor, "address" | "foundedYear">): Faq[] {
  return [
    {
      question: "Apa saja layanan D'Production?",
      answer:
        "D'Production melayani tiga hal: event organizer untuk acara perusahaan dan instansi (gathering, peresmian, seminar, peluncuran produk, gala dinner), wedding organizer untuk pernikahan, dan persewaan alat event seperti sound system, lighting, tenda, efek panggung, dan fireworks.",
    },
    {
      question: "Kantor D'Production di mana?",
      answer: `Kantor kami di ${address}. Sebagian besar acara yang kami tangani berada di Malang dan sekitarnya.`,
    },
    {
      question: "Apakah D'Production melayani acara di luar Malang?",
      answer:
        "Ya. Selain di Malang, tim kami pernah menangani acara di Bandung, Yogyakarta, dan Magelang untuk program Bank Indonesia.",
    },
    {
      question: "Sejak kapan D'Production berdiri?",
      answer: `D'Production berdiri di Malang pada ${foundedYear}. Acara yang pernah kami tangani antara lain gathering perusahaan, acara instansi pemerintah, peresmian gedung, dan fun run dengan ribuan pelari.`,
    },
    {
      question: "Bagaimana cara memesan jasa D'Production?",
      answer:
        'Cara paling cepat lewat tombol "Konsultasi Gratis", yang membuka WhatsApp. Ceritakan jenis acara, tanggal, dan kebutuhan Anda, lalu tim kami membalas untuk diskusi lebih lanjut. Sesi konsultasi awal tanpa biaya.',
    },
    {
      question: "Bisakah menyewa peralatan saja tanpa jasa event organizer?",
      answer:
        "Bisa. Sound system, lighting, tenda, efek panggung, dan fireworks bisa disewa terpisah. Harganya ada di halaman Katalog Harga, dan item yang harganya belum tercantum bisa ditanyakan lewat WhatsApp.",
    },
  ];
}
