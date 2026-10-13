// Hanya untuk kode klien. Dipakai form kontak (publik), spanduk koneksi, dan useApiRequest (admin).

export const EV_GAGAL = "dpro:jaringan-gagal"; // sebuah fetch gagal di tingkat jaringan
export const EV_LAMBAT = "dpro:lambat"; // detail +1 saat sebuah permintaan melewati ambang lambat, -1 saat selesai
export const EV_PINDAH = "dpro:pindah"; // detail = href tujuan, dikirim src/instrumentation-client.ts

export type JenisGalat = "offline" | "waktu-habis" | "putus";

export class GalatJaringan extends Error {
  constructor(public jenis: JenisGalat) {
    super(jenis);
  }
}

type Batas = { batas?: number; lambat?: number };

// fetch dengan batas waktu dan penanda lambat. Melempar GalatJaringan, tidak pernah galat mentah dari fetch,
// kecuali permintaan dibatalkan lewat init.signal milik pemanggil.
// Batas waktu berlaku sampai header jawaban tiba. Semua jawaban API situs ini JSON kecil, jadi badan tidak diberi batas sendiri.
export async function ambil(url: string, init: RequestInit = {}, { batas = 15_000, lambat = 6_000 }: Batas = {}) {
  if (navigator.onLine === false) {
    window.dispatchEvent(new Event(EV_GAGAL));
    throw new GalatJaringan("offline");
  }
  // AbortSignal.timeout dan AbortSignal.any belum ada di Safari iOS 15, jadi dirangkai manual.
  const pengendali = new AbortController();
  const batalDariLuar = () => pengendali.abort();
  init.signal?.addEventListener("abort", batalDariLuar, { once: true });
  let habis = false;
  let ditandai = false;
  const tBatas = setTimeout(() => {
    habis = true;
    pengendali.abort();
  }, batas);
  const tLambat = setTimeout(() => {
    ditandai = true;
    window.dispatchEvent(new CustomEvent(EV_LAMBAT, { detail: 1 }));
  }, lambat);
  try {
    return await fetch(url, { ...init, signal: pengendali.signal });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    window.dispatchEvent(new Event(EV_GAGAL));
    throw new GalatJaringan(habis ? "waktu-habis" : "putus");
  } finally {
    clearTimeout(tBatas);
    clearTimeout(tLambat);
    init.signal?.removeEventListener("abort", batalDariLuar);
    if (ditandai) window.dispatchEvent(new CustomEvent(EV_LAMBAT, { detail: -1 }));
  }
}

// Benar kalau server menjawab apa pun (termasuk 404 atau 503): artinya jalur ke server ada.
// navigator.onLine bernilai true hanya berarti perangkat punya jaringan, belum tentu internetnya jalan.
// /api/health/live tidak menyentuh database, jadi cek ini tidak membebani server.
export async function serverTerjangkau(batas = 5_000) {
  const pengendali = new AbortController();
  const timer = setTimeout(() => pengendali.abort(), batas);
  try {
    await fetch("/api/health/live", { method: "HEAD", cache: "no-store", signal: pengendali.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
