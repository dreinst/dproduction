import Link from "next/link";
import LandingImage from "@/components/LandingImage";
import KepalaSection from "@/components/site/KepalaSection";
import { tombol } from "@/components/site/tombol";
import type { LandingWedding } from "@/lib/landing-content";

// Dua pintu masuk menurut jenis acara. fotoPernikahan berasal dari Master Wedding.
export default function PilihAcara({ fotoPernikahan }: { fotoPernikahan: LandingWedding["photo"] }) {
  const pintu = [
    {
      nama: "Acara Perusahaan",
      keterangan: "Gathering, peresmian, fun run, seminar, gala dinner.",
      href: "/layanan#event-organizer",
      foto: { src: "/assets/portfolio/ustegra-panggung-peresmian.jpg", alt: "Panggung peresmian gedung ekstensi PT. Ustegra di Malang" },
    },
    {
      nama: "Pernikahan",
      keterangan: "Konsep dan tema, dekorasi, vendor, koordinasi hari H.",
      href: "/layanan#wedding-organizer",
      foto: fotoPernikahan,
    },
  ];

  return (
    <section aria-labelledby="judul-pilih-acara" className="bg-white px-tepi py-section">
      <div className="mx-auto max-w-konten">
        <KepalaSection id="judul-pilih-acara" label="Mulai dari sini" judul="Acara apa yang sedang Anda siapkan?" />
        {/* grid-cols-1: tanpa lebar kolom, min-h butir diterjemahkan lewat rasio 4/5 menjadi lebar kolom paling sedikit
            336 px dan kartu melewati wadahnya di layar yang lebih sempit dari 376 px. */}
        <ul className="mt-kepala grid grid-cols-1 gap-kisi lg:grid-cols-2">
          {pintu.map((p) => (
            <li key={p.href} className="relative aspect-[4/5] min-h-[420px] w-full md:aspect-auto md:h-[440px] lg:h-[520px]">
              <div className="absolute inset-0 overflow-hidden rounded-pintu bg-latar">
                <LandingImage src={p.foto.src} alt={p.foto.alt} navy sizes="(min-width: 1024px) 628px, 100vw" className="object-cover" />
                {/* Dasar foto digelapkan di belakang label kaca. Di atas foto pernikahan yang terang, keterangan label
                    hanya berkontras 3,1 sampai 3,4 tanpa lapisan ini. */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(0deg, rgb(11 33 68 / .35) 0, rgb(11 33 68 / .35) 30%, rgb(11 33 68 / 0) 60%)" }}
                />
              </div>
              {/* Seluruh pintu menjadi tautan. Fotonya di luar tautan supaya nama tautan hanya teks labelnya. */}
              <Link href={p.href} className="absolute inset-0 flex items-end overflow-hidden rounded-pintu p-3 md:p-6">
                <div className="kaca kaca--navy kaca-biru flex w-full flex-col gap-4 rounded-kartu p-5 text-white md:min-h-[104px] md:flex-row md:items-center md:justify-between md:py-4 md:pr-5 md:pl-7">
                  <div>
                    <h3 className="text-kartu-lg">{p.nama}</h3>
                    <p className="mt-1 text-isi-sm/[1.4] text-white/85">{p.keterangan}</p>
                  </div>
                  <span className={tombol("putih", "kecil")}>Lihat layanan</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
