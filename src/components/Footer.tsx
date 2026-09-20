import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const menu = [
  { href: "/#beranda", label: "Beranda" },
  { href: "/#tentang-kami", label: "Tentang Kami" },
  { href: "/#layanan", label: "Layanan" },
  { href: "/#masterpiece", label: "Masterpiece" },
  { href: "/#klien", label: "Klien" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#kontak", label: "Kontak" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 mb-12">

          {/* Brand & About */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- vector logo, no raster optimization needed */}
              <img
                src="/logo-dpro.svg"
                alt="D'Production Event Organizer"
                width={521}
                height={106}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed pr-4">
              Event organizer dan wedding planner di Malang sejak 2016. Kami merancang, mengelola, dan menyukseskan acara korporat maupun pernikahan Anda.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.instagram.com/dpro.duction" target="_blank" rel="noopener noreferrer" aria-label="Instagram D'Production" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://youtube.com/@dproductionzone" target="_blank" rel="noopener noreferrer" aria-label="YouTube D'Production" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Menu */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Menu</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {menu.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400 leading-relaxed">Jl. Raya Pandanlandung No. 16 Bandulan, Wagir, Kab. Malang</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="https://wa.me/6281938938800" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">081938938800</a>
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
            © 2026 <span className="text-slate-300 font-semibold">D&apos;Production</span>. All Rights Reserved.
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Made by dreinst, organized by D&apos;Production Event Organizer
          </p>
        </div>
      </div>
    </footer>
  );
}
