import KartuPutih from "@/components/site/KartuPutih";
import KepalaSection from "@/components/site/KepalaSection";

const LANGKAH = [
  { nama: "Konsultasi", keterangan: "Ceritakan jenis acara, tanggal, dan kebutuhan Anda. Sesi awal tanpa biaya." },
  { nama: "Konsep dan anggaran", keterangan: "Kami susun konsep beserta rincian anggaran yang terbuka." },
  { nama: "Persiapan", keterangan: "Vendor, perizinan, jadwal, dan gladi kami kelola." },
  { nama: "Hari H", keterangan: "Tim lapangan menjalankan acara sampai selesai, lalu menyerahkan dokumentasi." },
];

export default function ProsesKerja() {
  return (
    <section aria-labelledby="judul-proses" className="bg-latar px-tepi py-section">
      <div className="mx-auto max-w-konten">
        <KepalaSection id="judul-proses" label="Cara kerja" judul="Empat langkah sampai acara selesai." />
        <ol className="mt-kepala grid gap-kisi sm:grid-cols-2 lg:grid-cols-4">
          {LANGKAH.map((langkah, index) => (
            <li key={langkah.nama}>
              <KartuPutih className="gap-3 p-6 lg:p-7">
                <p className="text-eyebrow text-merah">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="text-kartu-md">{langkah.nama}</h3>
                <p className="text-isi-sm text-mute">{langkah.keterangan}</p>
              </KartuPutih>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
