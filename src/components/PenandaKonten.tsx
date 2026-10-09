import type { Sumber } from "@/lib/landing-content";

// Penanda bahwa halaman dirender tanpa data database (salinan terakhir atau konten kode). Cache halaman bersama
// (cache-handler.mjs) mengenali teks data-konten="cadangan" di HTML dan mencoba render ulang 30 detik kemudian, tanpa
// menunggu masa `revalidate` habis. Teks itu harus sama persis di kedua tempat.
// Atributnya juga bisa dipakai pemantauan dari luar (curl lalu cari data-konten).
export default function PenandaKonten({ sumber }: { sumber: Sumber[] }) {
  if (sumber.every((asal) => asal === "db")) return null;
  return <span hidden data-konten="cadangan" data-sumber={sumber.join(",")} />;
}
