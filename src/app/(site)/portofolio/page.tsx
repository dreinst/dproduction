import type { Metadata } from "next";
import LandingImage from "@/components/LandingImage";
import PenandaKonten from "@/components/PenandaKonten";
import Ajakan from "@/components/halaman/Ajakan";
import KepalaHalaman from "@/components/halaman/KepalaHalaman";
import KepalaSection from "@/components/site/KepalaSection";
import { getLandingAngka, getLandingEvents, getLandingKantor } from "@/lib/landing-content";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { portofolioLd } from "./ld";

// Isi dari database dirender ulang paling lama tiap 5 menit, atau segera setelah admin menyimpan (revalidateLanding).
export const revalidate = 300;

const JENIS_ACARA = "fun run, gathering perusahaan, peresmian gedung, acara instansi, dan pernikahan";

// Jumlah event di deskripsi sama dengan angka di pita hero Beranda.
export async function generateMetadata(): Promise<Metadata> {
  const { events } = await getLandingAngka();
  return pageMetadata({
    title: "Portofolio Event Organizer Malang",
    description:
      events.value > 0
        ? `Lihat ${events.text} event yang tercatat pernah ditangani D'Production: ${JENIS_ACARA}.`
        : `Portofolio D'Production, event organizer di Malang: ${JENIS_ACARA}.`,
    path: "/portofolio",
  });
}

export default async function PortofolioPage() {
  const [kantor, angka, events] = await Promise.all([getLandingKantor(), getLandingAngka(), getLandingEvents()]);
  // Daftar bisa kosong kalau semua event disembunyikan admin.
  const adaEvent = events.byYear.length > 0;

  return (
    <>
      <KepalaHalaman
        label="Portofolio"
        judul="Event yang pernah kami tangani."
        keterangan={
          adaEvent
            ? `${angka.events.text} event tercatat: ${JENIS_ACARA}.`
            : "Daftar event belum tersedia di halaman ini. Tanyakan pengalaman kami lewat WhatsApp."
        }
      />

      {events.masterpieces.length > 0 && (
        <section
          aria-labelledby="judul-masterpiece"
          className="px-tepi py-section"
          style={{ background: "linear-gradient(180deg, #0b2144, #0a2c63)" }}
        >
          <div className="mx-auto max-w-konten">
            <KepalaSection
              navy
              id="judul-masterpiece"
              label="Masterpiece"
              judul="Event terbesar yang pernah kami tangani."
              keterangan="Dari fun run ribuan pelari sampai program multi hari Bank Indonesia."
            />
            <ul className="mt-kepala grid gap-x-kisi gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {events.masterpieces.map((event, index) => {
                const meta = [event.year, event.client].filter(Boolean).join(" · ");
                return (
                  <li key={index}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-besar bg-kosong lg:aspect-[411/460]">
                      <LandingImage
                        src={event.photo}
                        alt={`Dokumentasi ${event.name}`}
                        sizes="(min-width: 1280px) 411px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    {meta && <p className="mt-[22px] text-sm/[1.2] font-medium text-white/72">{meta}</p>}
                    <h3 className="mt-2 text-kartu-md text-white">{event.name}</h3>
                    {event.description && <p className="mt-2 text-isi text-white/72">{event.description}</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Tanpa event, bagian daftar tidak dirender: teks pembuka di atas sudah menjelaskannya. */}
      {adaEvent && (
        <section aria-labelledby="judul-daftar" className="px-tepi py-section">
          <div className="mx-auto max-w-konten">
            <KepalaSection id="judul-daftar" label="Semua event" judul="Daftar event per tahun." keterangan="Urut dari tahun terbaru." />
            <div className="mt-kepala flex flex-col gap-12 lg:gap-16">
              {events.byYear.map((group) => (
                <div key={group.label} className="grid gap-x-11 gap-y-4 lg:grid-cols-[272px_1fr]">
                  <div className="flex items-baseline gap-3 lg:flex-col lg:gap-1.5">
                    <h3 className="text-kategori">{group.label}</h3>
                    <p className="text-label text-mute">{group.events.length} event</p>
                  </div>
                  <ul className="grid gap-x-kisi sm:grid-cols-2">
                    {group.events.map((event, index) => (
                      <li key={index} className="border-t border-garis py-3.5">
                        <p className="text-isi font-medium">{event.name}</p>
                        {event.client && <p className="text-sm/[1.6] text-mute">{event.client}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Ajakan
        judul={adaEvent ? "Sedang menyiapkan acara serupa?" : "Sedang menyiapkan acara?"}
        keterangan="Ceritakan jenis acara, tanggal, dan kebutuhan Anda. Sesi awal tanpa biaya."
        nomor={kantor.whatsapp}
      />

      <JsonLd data={portofolioLd(events)} />
      <PenandaKonten sumber={[kantor.sumber, angka.sumber, events.sumber]} />
    </>
  );
}
