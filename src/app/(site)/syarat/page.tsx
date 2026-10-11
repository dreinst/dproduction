import Link from "next/link";
import HalamanLegal, { type Bagian, DIPERBARUI, Kontak, tautan } from "@/components/legal/HalamanLegal";
import { pageMetadata } from "@/lib/seo";
import { formatTanggal } from "@/lib/site";

// Navigasi dan footer dari database dirender ulang paling lama tiap 5 menit, sama seperti halaman publik lain.
export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Ketentuan Layanan Situs dan Chat",
  description:
    "Ketentuan memakai situs dpro.events dan layanan chat D'Production: jawaban asisten virtual, harga katalog, konfirmasi pesanan, dan pemilik konten situs.",
  path: "/syarat",
});

// Hanya ketentuan memakai situs dan layanan chat. Aturan uang (refund, denda, uang muka) sengaja tidak ditulis di sini.
const BAGIAN: Bagian[] = [
  {
    id: "cakupan",
    judul: "Cakupan",
    isi: [
      "Dengan memakai situs dpro.events atau layanan chat D'Production di Instagram dan WhatsApp, Anda menyetujui ketentuan di halaman ini.",
      "Ketentuan ini hanya mengatur pemakaian situs dan layanan chat.",
    ],
  },
  {
    id: "informasi",
    judul: "Informasi di situs",
    isi: ["Situs ini memuat informasi layanan, portofolio, dan katalog harga D'Production. Isinya bisa kami ubah sewaktu-waktu."],
  },
  {
    id: "harga",
    judul: "Harga di katalog",
    isi: [
      "Harga di halaman Katalog Harga bisa berubah. Item yang harganya belum tercantum bisa Anda tanyakan lewat WhatsApp.",
      "Harga dan ketersediaan untuk acara Anda kami pastikan lewat WhatsApp.",
      <p key="katalog">
        <Link href="/katalog" className={tautan}>
          Buka Katalog Harga
        </Link>
      </p>,
    ],
  },
  {
    id: "chat",
    judul: "Layanan chat",
    isi: [
      "Pesan Anda di Instagram dan WhatsApp bisa dijawab asisten virtual berbasis AI. Asisten itu memberi informasi umum soal acara D'Production.",
      "Pertanyaan yang jawabannya tidak ada di daftar tanya jawab kami dijawab langsung oleh admin.",
    ],
  },
  {
    id: "pesanan",
    judul: "Pesanan dan pembayaran",
    isi: [
      "Keputusan soal pesanan dan pembayaran mengikuti konfirmasi dari tim kami. Kalau jawaban asisten virtual berbeda dengan konfirmasi itu, yang berlaku konfirmasi tim.",
    ],
  },
  {
    id: "konten-situs",
    judul: "Konten situs",
    isi: [
      "Teks, desain, dan logo D'Production di situs ini milik D'Production, begitu juga foto dokumentasi acara kami. Logo klien dan sebagian foto produk di katalog milik pemiliknya masing-masing.",
      "Kalau Anda ingin memakai ulang konten itu, mohon minta izin kami dulu lewat WhatsApp.",
    ],
  },
  {
    id: "tautan-luar",
    judul: "Tautan ke layanan lain",
    isi: [
      "Situs ini menautkan ke layanan lain, misalnya WhatsApp, Google Maps, YouTube, dan situs acara kami. Ketentuan di halaman ini tidak berlaku di sana.",
    ],
  },
  {
    id: "privasi",
    judul: "Privasi",
    isi: [
      "Cara kami memakai data Anda dijelaskan di Kebijakan Privasi. Cara meminta penghapusan data ada di halaman Penghapusan Data Pengguna.",
      <ul key="tautan">
        <li>
          <Link href="/privasi" className={tautan}>
            Buka Kebijakan Privasi
          </Link>
        </li>
        <li>
          <Link href="/hapus-data" className={tautan}>
            Buka halaman Penghapusan Data Pengguna
          </Link>
        </li>
      </ul>,
    ],
  },
  {
    id: "kontak",
    judul: "Hubungi kami",
    isi: [
      "Pertanyaan soal ketentuan ini bisa Anda kirim lewat:",
      <Kontak key="kontak" teks="Halo D'Production, saya ingin bertanya soal ketentuan layanan." />,
    ],
  },
  {
    id: "perubahan",
    judul: "Perubahan",
    isi: [
      `Ketentuan ini terakhir diperbarui pada ${formatTanggal(DIPERBARUI)}. Kalau isinya berubah, versi terbaru tampil di halaman ini dengan tanggal yang baru.`,
    ],
  },
];

export default function SyaratPage() {
  return (
    <HalamanLegal
      path="/syarat"
      judul="Ketentuan layanan."
      keterangan="Ketentuan ini berlaku saat Anda memakai situs dpro.events dan layanan chat D'Production di Instagram dan WhatsApp."
      bagian={BAGIAN}
    />
  );
}
