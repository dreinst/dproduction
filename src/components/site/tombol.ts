type Varian = "putih" | "navy" | "garis" | "kaca";
type Ukuran = "besar" | "kecil";

// Kelas tombol pil v2 (gayanya di .tombol, src/app/globals.css). Dipasang di elemen apa pun: <Link>, <a>, <button>,
// atau TautanWhatsApp. putih dan kaca untuk di atas foto atau navy, navy untuk latar terang, garis untuk latar navy.
// Tinggi 48 (besar) atau 37 (kecil, 44 di layar sentuh).
export function tombol(varian: Varian = "navy", ukuran: Ukuran = "besar") {
  return `tombol tombol--${varian}${ukuran === "kecil" ? " tombol--kecil" : ""}${varian === "kaca" ? " kaca kaca-biru" : ""}`;
}
