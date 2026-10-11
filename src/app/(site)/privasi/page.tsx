import Link from "next/link";
import HalamanLegal, { type Bagian, DIPERBARUI, Kontak, tautan } from "@/components/legal/HalamanLegal";
import { getLandingKantor } from "@/lib/landing-content";
import { pageMetadata } from "@/lib/seo";
import { formatTanggal } from "@/lib/site";

// Navigasi dan footer dari database dirender ulang paling lama tiap 5 menit, sama seperti halaman publik lain.
export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Kebijakan Privasi Situs dan Layanan Chat",
  description:
    "Data yang diterima D'Production dari situs dpro.events dan layanan chat Instagram dan WhatsApp, untuk apa dipakai, dan cara meminta kami menghapusnya.",
  path: "/privasi",
});

// Isi bagian situs ditulis dari kode: form kontak (src/components/beranda/FormKontak.tsx, src/app/api/contact),
// tag iklan (src/components/GoogleAdsTag.tsx), peta (PetaLokasi), video (VideoFasad), dan log audit (src/lib/audit.ts).
// Kalau salah satunya berubah, perbarui teks di sini dan DIPERBARUI. Isi bagian chat berasal dari pemilik.
export default async function PrivasiPage() {
  const kantor = await getLandingKantor();

  const bagian: Bagian[] = [
    {
      id: "cakupan",
      judul: "Cakupan",
      isi: [
        "Kebijakan ini berlaku untuk situs dpro.events dan untuk layanan chat D'Production di Instagram dan WhatsApp. Layanan chat itu menjawab pertanyaan soal acara D'Production, misalnya KUWERA Fun Run 5K, Pet Blessing, dan Drive Tech.",
        `D'Production adalah event organizer dan wedding organizer yang berkantor di ${kantor.address}.`,
      ],
    },
    {
      id: "data-situs",
      judul: "Data dari situs",
      isi: [
        "Semua halaman situs ini bisa Anda buka tanpa membuat akun dan tanpa mengisi data.",
        "Kalau Anda mengisi form kontak di Beranda, kami menerima dan menyimpan:",
        [
          "nama Anda",
          "nomor WhatsApp Anda",
          "jenis acara yang Anda pilih",
          "tanggal acara, kalau Anda mengisinya",
          "waktu form itu terkirim",
        ],
        "Sebelum terkirim, isian form disimpan sementara di peramban Anda supaya tidak hilang saat halaman termuat ulang. Simpanan itu hanya ada selama tab terbuka, terhapus begitu form terkirim, dan tidak sampai ke server kami sebelum Anda menekan Kirim Pesan.",
        "Saat form dikirim, server memakai alamat IP Anda untuk membatasi kiriman berulang dari jaringan yang sama. Alamat IP itu hanya ada di memori server dan tidak disimpan bersama isian form.",
        "Seperti situs web lain, server kami menerima alamat IP dan jenis peramban Anda saat mengirim halaman yang Anda buka.",
      ],
    },
    {
      id: "data-chat",
      judul: "Data dari layanan chat",
      isi: [
        "Saat Anda menghubungi D'Production lewat Instagram atau WhatsApp, kami menerima:",
        [
          "nama pengguna dan ID akun Instagram Anda",
          "isi pesan Anda, dan komentar Instagram Anda yang kami balas lewat pesan langsung (DM)",
          "gambar yang Anda kirim, misalnya tangkapan layar kendala",
          "nomor dan nama WhatsApp Anda, kalau Anda menghubungi lewat WhatsApp",
        ],
      ],
    },
    {
      id: "tujuan",
      judul: "Tujuan pemakaian",
      isi: [
        "Isian form kontak kami pakai untuk menghubungi Anda lewat WhatsApp soal acara Anda dan mencatat tindak lanjutnya.",
        "Data dari layanan chat kami pakai untuk:",
        [
          "menjawab pertanyaan Anda soal acara D'Production",
          "meneruskan pesan Anda ke admin",
          "menindaklanjuti percakapan",
          "mengirim pengingat pembayaran",
        ],
        "Data chat tidak kami jual dan tidak kami bagikan ke pihak ketiga untuk iklan.",
      ],
    },
    {
      id: "pemroses",
      judul: "Siapa yang memproses",
      isi: [
        "Pesan chat Anda dibaca asisten virtual berbasis AI, lalu diteruskan ke tim D'Production. Pertanyaan yang jawabannya tidak ada di daftar tanya jawab kami dijawab langsung oleh admin.",
        "Percakapan berlangsung di Instagram dan WhatsApp, jadi Meta sebagai penyedia kedua layanan itu ikut memprosesnya menurut kebijakan Meta.",
        "Isian form kontak tersimpan di database situs. Yang bisa membukanya hanya anggota tim yang masuk ke panel admin dengan akun berwenang.",
        "Saat form terkirim, isiannya bisa diteruskan ke tim kami sebagai pemberitahuan lewat Telegram.",
        "Perubahan data oleh tim di panel admin ikut dicatat: siapa yang mengubah, data yang mana, dan kapan. Catatan itu tidak memuat nama, nomor WhatsApp, atau isian form Anda.",
      ],
    },
    {
      id: "penyimpanan",
      judul: "Lama penyimpanan",
      isi: [
        [
          "Riwayat chat kami simpan sekitar 3 hari, supaya balasan berikutnya sesuai dengan percakapan sebelumnya.",
          "Catatan kerja sama dengan sponsor, vendor, dan tenant kami simpan selama tim masih membutuhkannya.",
          "Isian form kontak tersimpan sampai tim kami menghapusnya, termasuk atas permintaan Anda.",
        ],
      ],
    },
    {
      id: "pihak-lain",
      judul: "Cookie dan pihak lain",
      isi: [
        "Halaman publik situs ini tidak memasang cookie dari kami. Cookie hanya dipasang untuk anggota tim saat masuk ke panel admin.",
        "Beberapa bagian situs memuat layanan dari pihak lain. Saat bagian itu dimuat, penyedianya menerima alamat IP dan data peramban Anda, dan bisa memasang cookie mereka sendiri:",
        [
          "Peta di Beranda dimuat dari Google Maps saat Anda menggulir mendekati bagian Lokasi. Kalau perangkat sedang offline atau berhemat data, peta baru dimuat setelah Anda menekan tombol Tampilkan peta.",
          "Video di halaman Tentang baru dimuat dari YouTube setelah Anda menekan tombol putarnya.",
          "Tag Google Ads hanya dimuat kalau pengukuran iklan kami sedang aktif. Saat aktif, tag itu dimuat di halaman publik situs ini, dan kami mengirim tanda konversi ke Google ketika form kontak terkirim atau tombol konsultasi WhatsApp ditekan. Tanda itu tidak memuat nama, nomor WhatsApp, atau isian form Anda.",
        ],
        "Tautan ke situs lain, misalnya situs acara kami dan media sosial, membawa Anda keluar dari situs ini. Kebijakan ini tidak berlaku di sana.",
      ],
    },
    {
      id: "pilihan",
      judul: "Pilihan Anda",
      isi: [
        "Anda bisa meminta kami menghapus data Anda lewat WhatsApp atau email. Langkahnya ada di halaman Penghapusan Data Pengguna.",
        <p key="hapus-data">
          <Link href="/hapus-data" className={tautan}>
            Buka halaman Penghapusan Data Pengguna
          </Link>
        </p>,
        "Di Instagram, Anda bisa mencabut akses aplikasi lewat Pengaturan, lalu Aplikasi dan situs web.",
      ],
    },
    {
      id: "kontak",
      judul: "Hubungi kami",
      isi: [
        "Pertanyaan soal privasi dan permintaan hapus data bisa Anda kirim lewat:",
        <Kontak key="kontak" email teks="Halo D'Production, saya ingin bertanya soal kebijakan privasi." />,
      ],
    },
    {
      id: "perubahan",
      judul: "Perubahan",
      isi: [
        `Kebijakan ini terakhir diperbarui pada ${formatTanggal(DIPERBARUI)}. Kalau isinya berubah, versi terbaru tampil di halaman ini dengan tanggal yang baru.`,
      ],
    },
  ];

  return (
    <HalamanLegal
      path="/privasi"
      judul="Kebijakan privasi."
      keterangan="Halaman ini menjelaskan data apa yang D'Production terima dari situs dpro.events dan dari layanan chat di Instagram dan WhatsApp, untuk apa data itu dipakai, dan cara meminta kami menghapusnya."
      bagian={bagian}
    />
  );
}
