import PenandaKonten from "@/components/PenandaKonten";
import KartuKatalog from "@/components/katalog/KartuKatalog";
import PenyaringKatalog from "@/components/katalog/PenyaringKatalog";
import TautanWhatsApp from "@/components/site/TautanWhatsApp";
import { tombol } from "@/components/site/tombol";
import { getLandingKantor, getLandingKatalog } from "@/lib/landing-content";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { idItem, katalogLd } from "./ld";

// Konten dari database di-render ulang paling lama tiap 5 menit, atau segera setelah admin menyimpan (revalidateLanding).
export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Harga Sewa Alat Event dan Sound System Malang",
  description:
    "Katalog harga sewa alat event D'Production di Malang: efek panggung, fireworks, sound system, lighting, dan tenda. Sebagian harga lewat WhatsApp.",
  path: "/katalog",
});

const PESAN_AJAKAN =
  "Halo D'Production, saya mencari peralatan event yang belum ada di katalog.\n\nKebutuhan: \nTanggal acara: \nLokasi: ";

export default async function Katalog() {
  const [kantor, katalog] = await Promise.all([getLandingKantor(), getLandingKatalog()]);
  const { categories } = katalog;
  // Nomor foto pertama di baris teratas kisi (tiga item pertama), atau 0 kalau ketiganya belum berfoto. Di tablet foto
  // itu elemen terbesar di layar pertama, jadi tidak dimuat malas.
  const fotoSegera =
    categories
      .flatMap((kategori) => kategori.items)
      .slice(0, 3)
      .findIndex((item) => item.photo) + 1;

  return (
    <>
      {/* scroll-mt: saat tautan Katalog Harga diklik selagi sebuah kategori dipilih, hanya hash alamat yang berganti
          dan Next menggulir section ini ke tepi atas layar. Tanpa jarak ini labelnya berhenti di balik navigasi. */}
      <section aria-labelledby="judul-halaman" className="scroll-mt-(--nav-ruang) px-tepi py-12 lg:py-18">
        <div className="mx-auto flex max-w-konten flex-col gap-4">
          <p className="text-eyebrow text-merah">Katalog harga</p>
          <h1 id="judul-halaman" className="max-w-[1000px] text-display-2">
            Sewa peralatan event.
          </h1>
          <p className="max-w-[680px] text-lead text-mute">
            Harga per mesin, per titik, atau per paket. Item yang harganya belum tercantum bisa ditanyakan lewat WhatsApp.
          </p>
        </div>
      </section>

      <section aria-label="Daftar harga" className="px-tepi pt-6 pb-16 lg:pb-24">
        {categories.length > 0 ? (
          <PenyaringKatalog
            kategori={categories.map((kategori, urutan) => {
              // Jumlah item di kategori sebelumnya. Nomor tiap item berlanjut di seluruh katalog, sama dengan position
              // di JSON-LD.
              const sebelum = categories.slice(0, urutan).reduce((jumlah, lain) => jumlah + lain.items.length, 0);
              return {
                slug: kategori.slug,
                name: kategori.name,
                jumlah: kategori.items.length,
                isi: (
                  <>
                    <div className="flex max-w-[640px] flex-col gap-1.5">
                      <h2 className="text-kategori">{kategori.name}</h2>
                      {kategori.description && <p className="text-isi text-mute">{kategori.description}</p>}
                    </div>
                    {/* role ditulis karena Safari tidak membacakan daftar yang gaya butirnya dihapus. */}
                    <ul role="list" className="mt-6 grid gap-kisi sm:grid-cols-2 xl:grid-cols-3">
                      {kategori.items.map((item, index) => {
                        const nomor = sebelum + index + 1;
                        return <KartuKatalog key={nomor} item={item} id={idItem(nomor)} whatsapp={kantor.whatsapp} segera={nomor === fotoSegera} />;
                      })}
                    </ul>
                  </>
                ),
              };
            })}
          />
        ) : (
          <p className="mx-auto max-w-konten text-lead text-mute">Belum ada item yang tampil di katalog saat ini.</p>
        )}
      </section>

      <section aria-labelledby="judul-ajakan" className="px-tepi pt-6 pb-18">
        <div className="mx-auto flex max-w-konten flex-col items-start gap-6 rounded-pintu bg-latar px-6 py-8 md:flex-row md:items-center md:justify-between md:px-14 md:py-12">
          <div className="flex max-w-[640px] flex-col gap-2">
            <h2 id="judul-ajakan" className="text-h3 leading-[1.15]">
              Tidak menemukan yang Anda cari?
            </h2>
            <p className="text-[1.0625rem]/[1.5] text-mute">
              Kirim kebutuhan, tanggal, dan lokasi acara. Kami balas dengan ketersediaan dan penawarannya.
            </p>
          </div>
          <TautanWhatsApp nomor={kantor.whatsapp} teks={PESAN_AJAKAN} className={tombol("navy")}>
            Chat lewat WhatsApp
          </TautanWhatsApp>
        </div>
      </section>

      <JsonLd data={katalogLd(categories)} />
      {/* Menandai halaman yang dirender tanpa data database, supaya tidak tersimpan di cache selama masa revalidate penuh. */}
      <PenandaKonten sumber={[kantor.sumber, katalog.sumber]} />
    </>
  );
}
