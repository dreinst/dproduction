import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Memuat data...</h2>
      <p className="text-slate-500">Tunggu sebentar, sedang menyiapkan halaman untuk Anda.</p>
    </div>
  );
}
