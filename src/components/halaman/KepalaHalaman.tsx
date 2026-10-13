type Props = { label: string; judul: string; keterangan: string };

// Kepala halaman publik selain Beranda (Layanan, Portofolio, Katalog Harga, Tentang): label kecil, judul h1, dan teks
// pembuka. Ukuran dan jaraknya mengikuti kepala halaman Katalog Harga di Figma.
export default function KepalaHalaman({ label, judul, keterangan }: Props) {
  return (
    // scroll-mt: saat tautan menu ke halaman ini diklik dari alamat berjangkar (misalnya /tentang#faq), Next menggulir
    // section pertama ini ke tepi atas layar. Tanpa jarak ini labelnya berhenti di balik bilah navigasi.
    <section aria-labelledby="judul-halaman" className="scroll-mt-(--nav-ruang) px-tepi py-10 md:py-14 lg:py-18">
      <div className="mx-auto flex max-w-konten flex-col gap-4">
        <p className="text-eyebrow text-merah">{label}</p>
        <h1 id="judul-halaman" className="max-w-[1000px] text-display-2">
          {judul}
        </h1>
        <p className="max-w-[680px] text-lead text-mute">{keterangan}</p>
      </div>
    </section>
  );
}
