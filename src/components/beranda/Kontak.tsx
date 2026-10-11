import FormKontak from "@/components/beranda/FormKontak";
import LandingImage from "@/components/LandingImage";
import TautanWhatsApp from "@/components/site/TautanWhatsApp";
import type { LandingKantor } from "@/lib/landing-content";

type Props = { kantor: Pick<LandingKantor, "address" | "email" | "whatsapp" | "whatsappDisplay" | "whatsapp2" | "whatsapp2Display"> };

// Kartu kontak: alamat, jam buka, email, dua nomor WhatsApp berlabel (tanpa nama pemiliknya), dan form.
export default function Kontak({ kantor }: Props) {
  const nomor = [
    { nomor: kantor.whatsapp, tampil: kantor.whatsappDisplay },
    { nomor: kantor.whatsapp2, tampil: kantor.whatsapp2Display },
  ];

  return (
    <section id="kontak" aria-labelledby="judul-kontak" className="bg-white px-tepi pt-18 pb-6 lg:pt-24">
      <div className="relative isolate mx-auto grid max-w-konten gap-8 overflow-hidden rounded-raksasa bg-navy p-6 text-white md:p-10 lg:grid-cols-[minmax(0,560fr)_minmax(0,514fr)] lg:items-center lg:gap-10 lg:p-12 xl:gap-16 xl:p-18">
        <LandingImage
          src="/assets/portfolio/pekan-qris-nasional-panggung.jpg"
          alt=""
          navy
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="-z-10 object-cover"
        />
        {/* Lapisan navy: dari kiri ke kanan saat dua kolom, dari atas ke bawah saat satu kolom. Ujung kanannya 0,6
            (Figma 0,55) supaya teks ketikan di kotak isian tetap kontras di atas bagian foto yang terang. */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(11_33_68/.94),rgb(11_33_68/.7))] lg:bg-[linear-gradient(90deg,rgb(11_33_68/.94),rgb(11_33_68/.6))]" />

        <div className="flex flex-col items-start gap-5">
          <p className="text-eyebrow text-white/80">Konsultasi gratis</p>
          <h2 id="judul-kontak" className="text-h2">
            Ceritakan acara Anda.
          </h2>
          <address className="max-w-[520px] text-isi/[1.8] text-pretty text-white/88 not-italic">
            {kantor.address}
            <br />
            Senin sampai Sabtu, 09.00 sampai 17.00 WIB
            <br />
            {/* Padding dengan margin negatif: daerah sentuh 44 px tanpa mengubah jarak baris. */}
            <a href={`mailto:${kantor.email}`} className="-my-2 inline-block py-2 break-all underline-offset-4 hover:underline">
              {kantor.email}
            </a>
          </address>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            {nomor.map(
              (wa, i) =>
                wa.nomor && (
                  <TautanWhatsApp
                    key={i}
                    nomor={wa.nomor}
                    className="flex flex-col gap-0.5 rounded-wa bg-white px-[22px] py-3 transition-colors duration-200 hover:bg-latar"
                  >
                    <span className="text-[13px]/4 font-medium text-mute">WhatsApp {i + 1}</span>
                    <span className="text-[17px]/[21px] font-semibold text-navy">{wa.tampil}</span>
                  </TautanWhatsApp>
                ),
            )}
          </div>
        </div>

        <FormKontak whatsapp1={kantor.whatsapp} whatsapp2={kantor.whatsapp2} />
      </div>
    </section>
  );
}
