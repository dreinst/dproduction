import Link from "next/link";
import HalamanLegal, { type Bagian, EMAIL_LEGAL, Kontak, WHATSAPP_LEGAL, tautan } from "@/components/legal/HalamanLegal";
import { tombol } from "@/components/site/tombol";
import { pageMetadata } from "@/lib/seo";
import { formatWhatsapp, whatsappUrl } from "@/lib/site";

// Navigasi dan footer dari database dirender ulang paling lama tiap 5 menit, sama seperti halaman publik lain.
export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Penghapusan Data Pengguna",
  description:
    "Cara meminta D'Production menghapus data Anda dari layanan chat Instagram dan WhatsApp: kirim permintaan lewat WhatsApp atau email, tanpa perlu login.",
  path: "/hapus-data",
});

// Pesan awal tombol WhatsApp dan tautan email, supaya pengguna tinggal melengkapi baris terakhir.
const PESAN = "Halo D'Production, saya ingin data saya dihapus.\n\nNama pengguna Instagram atau nomor WhatsApp saya: ";
const SUREL = `mailto:${EMAIL_LEGAL}?subject=${encodeURIComponent("Permintaan hapus data")}&body=${encodeURIComponent(PESAN)}`;

const BAGIAN: Bagian[] = [
  {
    id: "langkah",
    judul: "Langkah meminta penghapusan",
    isi: [
      {
        langkah: [
          `Buka WhatsApp ke ${formatWhatsapp(WHATSAPP_LEGAL)} atau tulis email ke ${EMAIL_LEGAL}. Tombol dan tautan di bawah langsung membukanya.`,
          "Tulis bahwa Anda ingin data Anda dihapus.",
          "Sebutkan nama pengguna Instagram atau nomor WhatsApp yang Anda pakai saat menghubungi kami, supaya kami tahu data mana yang dihapus.",
          "Kirim pesannya. Tim kami menghapus data itu, lalu mengabari Anda lewat kanal yang sama.",
        ],
      },
      // Tautan biasa, tanpa TautanWhatsApp: permintaan hapus data tidak dicatat sebagai konversi iklan.
      <p key="aksi" className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
        <a href={whatsappUrl(PESAN, WHATSAPP_LEGAL)} target="_blank" rel="noopener noreferrer" className={tombol("navy")}>
          Minta hapus lewat WhatsApp
        </a>
        <a href={SUREL} className={tautan}>
          Minta hapus lewat email
        </a>
      </p>,
      "Keduanya sudah berisi contoh pesan. Anda tinggal melengkapi nama pengguna Instagram atau nomor WhatsApp Anda.",
    ],
  },
  {
    id: "yang-dihapus",
    judul: "Apa yang kami hapus",
    isi: [
      "Setelah menerima permintaan Anda, tim kami menghapus:",
      [
        "riwayat chat Anda dengan layanan chat kami",
        "catatan yang terkait dengan chat itu",
        "isian form kontak di situs ini yang memakai nomor WhatsApp Anda, kalau ada",
      ],
      "Percakapan yang tersimpan di aplikasi Instagram dan WhatsApp Anda sendiri tidak bisa kami hapus. Anda bisa menghapusnya langsung di aplikasi itu.",
      "Tanpa permintaan pun, riwayat chat hanya kami simpan sekitar 3 hari. Rinciannya ada di Kebijakan Privasi.",
      <p key="privasi">
        <Link href="/privasi#penyimpanan" className={tautan}>
          Buka Kebijakan Privasi
        </Link>
      </p>,
    ],
  },
  {
    id: "konfirmasi",
    judul: "Konfirmasi",
    isi: [
      "Setelah data dihapus, tim kami mengabari Anda lewat kanal yang Anda pakai untuk meminta. Permintaan lewat WhatsApp dibalas di WhatsApp, permintaan lewat email dibalas lewat email.",
    ],
  },
  {
    id: "instagram",
    judul: "Mencabut akses di Instagram",
    isi: [
      "Anda juga bisa mencabut akses aplikasi yang terhubung ke akun Instagram Anda:",
      {
        langkah: [
          "Buka aplikasi Instagram, lalu masuk ke Pengaturan.",
          "Pilih Aplikasi dan situs web.",
          "Cabut akses aplikasi yang Anda pilih dari daftar di sana.",
        ],
      },
      "Kalau Anda juga ingin riwayat chat dihapus, kirim permintaan lewat langkah di atas.",
    ],
  },
  {
    id: "kontak",
    judul: "Hubungi kami",
    isi: [
      "Pertanyaan soal penghapusan data bisa Anda kirim lewat:",
      <Kontak key="kontak" email teks="Halo D'Production, saya ingin bertanya soal penghapusan data." />,
    ],
  },
];

export default function HapusDataPage() {
  return (
    <HalamanLegal
      path="/hapus-data"
      judul="Penghapusan data pengguna."
      keterangan="Anda bisa meminta D'Production menghapus data Anda dari layanan chat di Instagram dan WhatsApp. Permintaan dikirim lewat WhatsApp atau email, tanpa perlu login atau membuat akun."
      bagian={BAGIAN}
    />
  );
}
