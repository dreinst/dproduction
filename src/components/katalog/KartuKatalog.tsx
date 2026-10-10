import LandingImage from "@/components/LandingImage";
import FotoKosong from "@/components/site/FotoKosong";
import TautanWhatsApp from "@/components/site/TautanWhatsApp";
import { tombol } from "@/components/site/tombol";
import type { KatalogItem } from "@/lib/landing-content";
import { hargaKatalog } from "@/lib/site";

// Lebar kartu di kisi katalog per rentang layar, dihitung dari jumlah kolom, tepi halaman (px-tepi), celah kisi, dan
// sidebar 272 + 44 px: tiga kolom di samping sidebar mulai 1280 px (paling lebar 306 px), dua kolom di samping sidebar
// mulai 1024 px, dua kolom mulai 640 px, lalu satu kolom.
const UKURAN_FOTO =
  "(min-width: 1440px) 306px, (min-width: 1280px) calc(33.34vw - 174px), (min-width: 1024px) calc(50vw - 218px), (min-width: 768px) calc(50vw - 42px), (min-width: 640px) calc(50vw - 28px), calc(100vw - 40px)";

type Props = {
  item: KatalogItem;
  // id kartu, tujuan url item di JSON-LD.
  id: string;
  // WhatsApp 1 berformat 62xxx dari Setting Kantor.
  whatsapp: string;
  // Untuk satu foto di baris pertama katalog: dimuat tanpa menunggu tata letak.
  segera?: boolean;
};

// Kartu satu item katalog. Tinggi mengikuti kartu tertinggi di barisnya dan aksinya menempel di dasar kartu.
// Item tanpa harga tampil (prices kosong) menjadi varian "Harga lewat WhatsApp" dengan tombol.
export default function KartuKatalog({ item, id, whatsapp, segera = false }: Props) {
  return (
    <li id={id} className="flex flex-col overflow-hidden rounded-produk bg-latar">
      {/* Mulai 1440 px lebar kartu tetap, jadi tinggi bingkai dipatok 220 seperti di Figma. Kalau hanya memakai rasio,
          kolom ketiga yang lebih lebar sepersekian piksel terlukis satu piksel lebih tinggi dari dua kolom lainnya. */}
      <div className="relative aspect-[229/165] min-[1440px]:aspect-auto min-[1440px]:h-[220px]">
        {item.photo ? (
          <LandingImage src={item.photo} alt={item.name} sizes={UKURAN_FOTO} loading={segera ? "eager" : undefined} className="object-cover" />
        ) : (
          <FotoKosong />
        )}
      </div>
      <div className="flex grow flex-col items-start gap-3 p-[22px]">
        <h3 className="text-kartu-sm">{item.name}</h3>
        {item.prices.length > 0 ? (
          <>
            <div className="flex flex-col gap-0.5">
              {item.prices.map((price, index) => {
                const harga = hargaKatalog(price, item.priceFrom);
                return (
                  // Keterangan berawalan "per" sejajar dengan nominal dan turun sendiri kalau kartunya sempit.
                  <p key={index} className={harga.sebaris ? "flex flex-wrap items-end gap-x-1.5" : undefined}>
                    <span className="block text-[1.0625rem]/[1.5] font-semibold">{harga.nominal}</span>
                    {harga.keterangan && <span className="block text-sm/[1.6] text-mute">{harga.keterangan}</span>}
                  </p>
                );
              })}
            </div>
            <p className="mt-auto text-tombol-sm">
              {/* Di layar sentuh tinggi tautan dinaikkan sampai 44 px tanpa menggeser isi kartu. */}
              <TautanWhatsApp
                nomor={whatsapp}
                teks={`Halo D'Production, saya ingin tanya ketersediaan sewa ${item.name} untuk acara saya.`}
                className="inline-block text-navy hover:underline hover:underline-offset-4 pointer-coarse:-my-3.5 pointer-coarse:py-3.5"
              >
                Tanya ketersediaan
              </TautanWhatsApp>
            </p>
          </>
        ) : (
          <>
            <p className="text-isi-sm text-mute">Harga lewat WhatsApp</p>
            <TautanWhatsApp
              nomor={whatsapp}
              teks={`Halo D'Production, saya ingin tanya harga sewa ${item.name} untuk acara saya.`}
              className={`${tombol("navy", "kecil")} mt-auto`}
            >
              Tanya harga
            </TautanWhatsApp>
          </>
        )}
      </div>
    </li>
  );
}
