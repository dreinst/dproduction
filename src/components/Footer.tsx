import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & About */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                D
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                D'Production
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed pr-4">
              Eventify style with D'Production colors. Kami adalah Event Organizer terbaik yang siap membantu merancang, mengelola, dan menyukseskan acara Anda dengan konsep kreatif dan profesional.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://id-id.facebook.com/kanwilbcjatim2/" target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/dpro.duction" target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://youtube.com/@dproductionzone" target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2 lg:col-start-6 space-y-6">
            <h4 className="text-white font-bold text-lg">Navigasi</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">Beranda</Link></li>
              <li><Link href="/layanan" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">Layanan</Link></li>
              <li><Link href="/tentang-kami" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">Tentang Kami</Link></li>
              <li><Link href="/galeri" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">Galeri</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-white font-bold text-lg">Layanan</h4>
            <ul className="space-y-3">
              <li><Link href="/layanan" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">Event Organizer</Link></li>
              <li><Link href="/layanan" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">Wedding Planner</Link></li>
              <li><Link href="/layanan" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">Rental Equipment</Link></li>
              <li><Link href="/masterpiece" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">Masterpiece</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-white font-bold text-lg">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400 leading-relaxed">Jl. Raya Pandanlandung No. 16 Bandulan, Wagir, Kab. Malang</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="https://wa.me/6281938938800" className="text-sm text-slate-400 hover:text-white transition-colors">081938938800</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="mailto:dproductionorganizer@gmail.com" className="text-sm text-slate-400 hover:text-white transition-colors">dproductionorganizer@gmail.com</a>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col items-center justify-center">
          <p className="text-sm text-slate-500">
            © 2026 <span className="text-slate-300 font-semibold">D'Production</span>. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
