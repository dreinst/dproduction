"use client";

import { useEffect, useState } from "react";
import { tombol } from "@/components/site/tombol";
import { GalatJaringan, ambil } from "@/lib/jaringan";
import {
  EVENT_OPTIONS,
  WHATSAPP_DEFAULT_TEXT,
  WHATSAPP_PATTERN,
  eventLabel,
  formatTanggal,
  normalizeWhatsapp,
  trackFormConversion,
  trackWhatsAppClick,
  whatsappUrl,
  wibDate,
} from "@/lib/site";

// Draf isian hidup selama tab terbuka (sessionStorage), supaya isian tidak hilang kalau halaman termuat ulang.
const KUNCI_DRAF = "dpro:kontak:draf";
const BATAS_KIRIM = 20_000;
// Lewat ambang ini src/lib/jaringan.ts memberi tahu spanduk koneksi bahwa permintaan masih berjalan.
const AMBANG_LAMBAT = 6_000;

const KOSONG = { name: "", whatsapp: "", eventType: "", eventDate: "", website: "" };
type Isian = typeof KOSONG;
type Kolom = keyof Isian;
type Status = "idle" | "loading" | "success" | "error" | "failed";

// fetch yang gagal tidak memberi tahu sebabnya, jadi tiap pesan hanya menyebut yang pasti.
const PESAN_GAGAL: Record<GalatJaringan["jenis"] | "server", string> = {
  offline: "Anda sedang offline, jadi pesan belum terkirim. Isian Anda tersimpan di perangkat ini. Kirim lagi saat koneksi kembali.",
  "waktu-habis":
    "Server belum menjawab setelah 20 detik, jadi kami tidak bisa memastikan pesan Anda sampai. Supaya pasti, kirim ringkasannya lewat WhatsApp.",
  putus: "Koneksi terputus saat mengirim. Isian Anda masih ada di sini. Coba kirim lagi, atau kirim lewat WhatsApp.",
  server: "Server kami sedang bermasalah, jadi pesan belum tersimpan. Coba lagi sebentar lagi, atau kirim lewat WhatsApp.",
};

// sessionStorage bisa melempar galat (penyimpanan diblokir atau penuh), jadi selalu dibungkus. Isi draf diperiksa lagi
// saat dibaca karena bisa diubah dari luar halaman ini.
function bacaDraf(): Isian | null {
  try {
    const d = JSON.parse(sessionStorage.getItem(KUNCI_DRAF) ?? "null") as Partial<Isian> | null;
    if (!d) return null;
    const teks = (nilai: unknown, maks: number) => (typeof nilai === "string" ? nilai.slice(0, maks) : "");
    const isian = {
      ...KOSONG,
      name: teks(d.name, 100),
      whatsapp: teks(d.whatsapp, 20),
      eventType: EVENT_OPTIONS.some((o) => o.value === d.eventType) ? (d.eventType as string) : "",
      eventDate: /^\d{4}-\d{2}-\d{2}$/.test(teks(d.eventDate, 10)) ? teks(d.eventDate, 10) : "",
    };
    return isian.name || isian.whatsapp || isian.eventType || isian.eventDate ? isian : null;
  } catch {
    return null;
  }
}

// Kolom jebakan (website) tidak ikut disimpan.
function simpanDraf({ name, whatsapp, eventType, eventDate }: Isian) {
  try {
    if (!name && !whatsapp && !eventType && !eventDate) sessionStorage.removeItem(KUNCI_DRAF);
    else sessionStorage.setItem(KUNCI_DRAF, JSON.stringify({ name, whatsapp, eventType, eventDate }));
  } catch {}
}

// focus-within: garis fokus juga tampil saat fokus berada di bagian dalam isian tanggal (tombol kalender bawaan peramban).
const kolom =
  "h-12 w-full rounded-kotak border border-white/40 bg-white/16 px-4 text-base font-normal text-white outline-offset-2 outline-white focus-within:outline-2 aria-invalid:border-2 aria-invalid:border-white";
const kotakPesan = "rounded-kotak bg-white/16 px-4 py-3 text-sm/[1.5] font-normal text-white";

// whatsapp1 dan whatsapp2: nomor berformat 62xxx dari Setting Kantor. WhatsApp 2 null kalau dikosongkan di sana.
export default function FormKontak({ whatsapp1, whatsapp2 }: { whatsapp1: string; whatsapp2: string | null }) {
  const [isian, setIsian] = useState(KOSONG);
  const [status, setStatus] = useState<Status>("idle");
  const [pesan, setPesan] = useState("");
  const [salah, setSalah] = useState<Kolom[]>([]);
  const [dipulihkan, setDipulihkan] = useState(false);
  // Tanggal paling awal di kalender. Diisi setelah skrip siap, sekaligus penanda bahwa tombol kirim boleh aktif.
  // Sebelum itu tombolnya mati: di koneksi lambat pengunjung bisa menekan Kirim sebelum skrip tiba, lalu peramban
  // mengirim form dengan cara bawaannya, halaman berganti, dan isiannya hilang.
  const [hariIni, setHariIni] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      const draf = bacaDraf();
      if (draf) {
        setIsian(draf);
        setDipulihkan(true);
      }
      setHariIni(wibDate());
    });
  }, []);

  const ubah = (nama: Kolom, nilai: string) => {
    // Selama kiriman berjalan isian dikunci. Yang terkirim nilai saat tombol ditekan dan form dikosongkan begitu jawaban
    // berhasil tiba, jadi perubahan di tengah jalan akan hilang tanpa tanda.
    if (status === "loading") return;
    const baru = { ...isian, [nama]: nilai };
    setIsian(baru);
    simpanDraf(baru);
    setSalah((daftar) => daftar.filter((k) => k !== nama));
    if (status !== "idle") setStatus("idle");
  };

  const kosongkan = () => {
    setIsian(KOSONG);
    setDipulihkan(false);
    setSalah([]);
    setStatus("idle");
    simpanDraf(KOSONG);
  };

  const gagal = (jenis: "error" | "failed", teks: string) => {
    setStatus(jenis);
    setPesan(teks);
  };

  const kirim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;
    const whatsapp = normalizeWhatsapp(isian.whatsapp);
    const kosong: Kolom[] = (["name", "whatsapp", "eventType"] as const).filter((k) => !isian[k].trim());
    const perlu: Kolom[] = kosong.length || WHATSAPP_PATTERN.test(whatsapp) ? kosong : ["whatsapp"];
    setSalah(perlu);
    if (perlu.length) {
      // Fokus pindah ke isian pertama yang perlu dibetulkan.
      (e.currentTarget.elements.namedItem(perlu[0]) as HTMLElement | null)?.focus();
      return gagal(
        "error",
        kosong.length ? "Nama, nomor WhatsApp, dan jenis acara perlu diisi." : "Nomor WhatsApp belum sesuai. Contoh: 08123456789.",
      );
    }

    setStatus("loading");
    try {
      const res = await ambil(
        "/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...isian, whatsapp }),
        },
        { batas: BATAS_KIRIM, lambat: AMBANG_LAMBAT },
      );
      const data: { success?: unknown; message?: unknown } | null = await res.json().catch(() => null);
      if (!res.ok || data?.success !== true) {
        // Jawaban 5xx bisa berupa halaman HTML dari proxy, jadi teksnya dari sini. Untuk 4xx dipakai pesan dari API.
        return gagal("failed", res.status < 500 && typeof data?.message === "string" ? data.message : PESAN_GAGAL.server);
      }
      setStatus("success");
      setIsian(KOSONG);
      setDipulihkan(false);
      simpanDraf(KOSONG);
      trackFormConversion();
    } catch (error) {
      gagal("failed", error instanceof GalatJaringan ? PESAN_GAGAL[error.jenis] : PESAN_GAGAL.putus);
    }
  };

  // Isi pesan untuk tombol cadangan, supaya pengunjung tidak mengetik ulang di WhatsApp.
  const ringkasan = [
    WHATSAPP_DEFAULT_TEXT,
    "",
    `Nama: ${isian.name}`,
    `No. WhatsApp: ${isian.whatsapp}`,
    `Jenis acara: ${isian.eventType ? eventLabel(isian.eventType) : ""}`,
    ...(isian.eventDate ? [`Tanggal acara: ${formatTanggal(isian.eventDate)}`] : []),
  ].join("\n");

  const sibuk = status === "loading";
  const keliru = (nama: Kolom) => salah.includes(nama) || undefined;

  return (
    <form
      method="post"
      noValidate
      onSubmit={kirim}
      aria-labelledby="judul-kontak"
      aria-busy={sibuk}
      className="kaca kaca-biru kaca-biru--diam rounded-besar p-6 text-label text-white/90 md:p-[33px]"
    >
      {dipulihkan && status !== "success" && (
        <p className={`${kotakPesan} mb-3.5`}>
          Isian terakhir Anda kami pulihkan dari perangkat ini.{" "}
          <button type="button" disabled={sibuk} onClick={kosongkan} className="-my-3 py-3 font-medium underline underline-offset-4">
            Kosongkan
          </button>
        </p>
      )}

      <div className="flex flex-col items-start gap-3.5">
        <label className="flex w-full flex-col gap-1.5">
          Nama
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            readOnly={sibuk}
            aria-invalid={keliru("name")}
            value={isian.name}
            onChange={(e) => ubah("name", e.target.value)}
            className={kolom}
          />
        </label>
        <label className="flex w-full flex-col gap-1.5">
          No. WhatsApp
          <input
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={20}
            readOnly={sibuk}
            aria-invalid={keliru("whatsapp")}
            value={isian.whatsapp}
            onChange={(e) => ubah("whatsapp", e.target.value)}
            className={kolom}
          />
        </label>
        <label className="flex w-full flex-col gap-1.5">
          Jenis acara
          {/* select tidak mengenal readOnly, jadi keadaan terkuncinya diberitahukan lewat aria-disabled. */}
          <select
            name="eventType"
            required
            aria-disabled={sibuk || undefined}
            aria-invalid={keliru("eventType")}
            value={isian.eventType}
            onChange={(e) => ubah("eventType", e.target.value)}
            className={kolom}
          >
            {/* Daftar pilihan digambar peramban dengan latar terang, jadi teksnya gelap. */}
            <option value="" className="text-ink">
              Pilih jenis acara
            </option>
            {EVENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="text-ink">
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex w-full flex-col gap-1.5">
          <span>
            Tanggal acara <span className="font-normal">(opsional)</span>
          </span>
          {/* scheme-dark: ikon kalender bawaan peramban ikut berwarna terang. */}
          <input
            name="eventDate"
            type="date"
            min={hariIni || undefined}
            readOnly={sibuk}
            value={isian.eventDate}
            onChange={(e) => ubah("eventDate", e.target.value)}
            className={`${kolom} scheme-dark`}
          />
        </label>
        {/* Kolom jebakan untuk bot. Kiriman yang mengisinya dijawab berhasil tanpa disimpan. */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" value={isian.website} onChange={(e) => ubah("website", e.target.value)} />
          </label>
        </div>

        <button type="submit" disabled={!hariIni || sibuk} className={tombol("putih")}>
          {!hariIni ? "Menyiapkan form" : sibuk ? "Mengirim pesan" : "Kirim Pesan"}
        </button>
      </div>
      <noscript>
        <p className={`${kotakPesan} mt-3.5`}>
          Form ini memerlukan JavaScript. Silakan hubungi kami lewat WhatsApp 1{whatsapp2 ? " atau WhatsApp 2" : ""} di halaman ini.
        </p>
      </noscript>

      {/* Kedua wadah pesan selalu ada di DOM supaya pembaca layar mengumumkan isi yang baru masuk. */}
      <div role="status">
        {status === "success" && (
          <p className={`${kotakPesan} mt-3.5`}>
            Pesan Anda sudah kami terima. Kami hubungi Anda lewat WhatsApp pada jam kerja, Senin sampai Sabtu, 09.00 sampai 17.00 WIB.
          </p>
        )}
      </div>
      <div role="alert">
        {(status === "error" || status === "failed") && (
          <div className={`${kotakPesan} mt-3.5`}>
            <p>{pesan}</p>
            {status === "failed" && (
              <p className="mt-3 flex flex-wrap gap-2">
                {[whatsapp1, whatsapp2].map(
                  (nomor, i) =>
                    nomor && (
                      <a
                        key={i}
                        href={whatsappUrl(ringkasan, nomor)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={trackWhatsAppClick}
                        className={tombol("putih", "kecil")}
                      >
                        Kirim lewat WhatsApp {i + 1}
                      </a>
                    ),
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
