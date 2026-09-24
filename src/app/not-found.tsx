import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLandingKantor } from "@/lib/landing-content";

export const metadata: Metadata = {
  title: { absolute: "Halaman Tidak Ditemukan | D'Production" },
};

export default async function NotFound() {
  const kantor = await getLandingKantor();
  return (
    <>
      <Navbar whatsapp={kantor.whatsapp} />
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 pt-24">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-9xl font-extrabold text-slate-200">404</h1>
          <h2 className="text-3xl font-bold text-slate-900">Halaman Tidak Ditemukan</h2>
          <p className="text-slate-600">
            Maaf, halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak tersedia untuk sementara waktu.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/" 
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" /> Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
      <Footer kantor={kantor} />
    </>
  );
}
