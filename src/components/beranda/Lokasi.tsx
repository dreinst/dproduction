import PetaLokasi from "@/components/beranda/PetaLokasi";
import { tombol } from "@/components/site/tombol";
import type { LandingKantor } from "@/lib/landing-content";
import { mapsLink } from "@/lib/seo";

// Kartu peta dengan panel alamat. Latar section sama dengan Kontak di atasnya supaya tidak ada garis ganti warna di tepi
// atas kartu. Di bawah lg panel berada di atas peta. Mulai lg panel menumpang di kiri atas peta, dan lebarnya dijaga
// supaya penanda lokasi Google (selalu di tengah peta) tetap terlihat di sebelah kanannya.
export default function Lokasi({ kantor }: { kantor: Pick<LandingKantor, "address" | "googleMapsUrl"> }) {
  const buka = mapsLink(kantor);
  // Tujuan yang sama dengan tombol pertama, dalam bentuk tautan petunjuk arah Google Maps.
  const arah = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(new URL(buka).searchParams.get("query") ?? kantor.address)}`;

  return (
    <section aria-labelledby="judul-lokasi" className="bg-white px-tepi pb-18 lg:pb-24">
      <div className="relative mx-auto flex max-w-konten flex-col overflow-hidden rounded-raksasa bg-peta lg:block lg:h-[560px]">
        <div className="kaca kaca--navy-tebal kaca-biru kaca-biru--diam z-10 flex flex-col items-start gap-3.5 p-6 text-white max-lg:[--kaca-isi:linear-gradient(#0b2144,#0b2144)] max-lg:after:hidden md:p-[33px] lg:absolute lg:top-8 lg:left-8 lg:w-[360px] lg:rounded-besar xl:w-[426px]">
          {/* Putih 0,8 (Figma 0,72): saat panel disorot kursor, cahaya biru di belakang label ini menurunkan kontrasnya
              sampai 4,49 dengan nilai Figma. */}
          <p className="text-eyebrow text-white/80">Lokasi</p>
          <h2 id="judul-lokasi" className="text-h3">
            Kunjungi kantor kami.
          </h2>
          <p className="text-isi text-white/80">{kantor.address}</p>
          <p className="text-isi-sm text-white/80">Senin sampai Sabtu, 09.00 sampai 17.00 WIB</p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <a href={buka} target="_blank" rel="noopener noreferrer" className={`${tombol("putih", "kecil")} text-navy`}>
              Buka di Google Maps
            </a>
            <a href={arah} target="_blank" rel="noopener noreferrer" className={tombol("garis", "kecil")}>
              Petunjuk arah
            </a>
          </div>
        </div>
        {/* Mulai lg peta digeser 200 px ke atas dan dipotong kartu: kartu tempat bawaan Google di kiri atas embed jatuh
            tepat di balik panel dan menyembul di tepinya. Atribusi Google di dasar peta tetap terlihat. */}
        <div className="relative h-80 lg:absolute lg:inset-x-0 lg:-top-[200px] lg:bottom-0 lg:h-auto">
          <PetaLokasi src={kantor.googleMapsUrl} title="Peta lokasi kantor D'Production di Wagir, Malang" />
        </div>
      </div>
    </section>
  );
}
