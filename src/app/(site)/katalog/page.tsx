import PenandaKonten from "@/components/PenandaKonten";
import Ajakan from "@/components/halaman/Ajakan";
import KepalaHalaman from "@/components/halaman/KepalaHalaman";
import KartuKatalog from "@/components/katalog/KartuKatalog";
import PenyaringKatalog from "@/components/katalog/PenyaringKatalog";
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
      {/* Kepala halaman ber-scroll-mt: saat tautan Katalog Harga diklik selagi sebuah kategori dipilih, hanya hash alamat
          yang berganti dan Next menggulir section pertama ini ke tepi atas layar. */}
      <KepalaHalaman
        label="Katalog harga"
        judul="Sewa peralatan event."
        keterangan="Harga per mesin, per titik, atau per paket. Item yang harganya belum tercantum bisa ditanyakan lewat WhatsApp."
      />

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

      <Ajakan
        judul="Tidak menemukan yang Anda cari?"
        keterangan="Kirim kebutuhan, tanggal, dan lokasi acara. Kami balas dengan ketersediaan dan penawarannya."
        nomor={kantor.whatsapp}
        teks={PESAN_AJAKAN}
        className="pt-6"
      />

      <JsonLd data={katalogLd(categories)} />
      {/* Menandai halaman yang dirender tanpa data database, supaya tidak tersimpan di cache selama masa revalidate penuh. */}
      <PenandaKonten sumber={[kantor.sumber, katalog.sumber]} />
    </>
  );
}
