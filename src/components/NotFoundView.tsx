import Link from "next/link";
import { Home } from "lucide-react";

// Isi halaman 404 tanpa navigasi dan footer. Dipakai app/not-found.tsx (yang memasang kerangka situs sendiri) dan
// app/(site)/not-found.tsx (kerangkanya sudah dipasang layout grup).
export default function NotFoundView() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24">
      <div className="w-full max-w-md space-y-6 text-center">
        <p className="text-9xl font-extrabold text-slate-500" aria-hidden>404</p>
        <h1 className="text-3xl font-bold text-slate-900">Halaman Tidak Ditemukan</h1>
        <p className="text-slate-600">
          Alamatnya mungkin salah ketik, atau halamannya sudah dipindah. Silakan kembali ke beranda.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
          >
            <Home className="h-5 w-5" aria-hidden /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
