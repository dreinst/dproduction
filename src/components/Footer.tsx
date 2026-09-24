"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { whatsappUrl, trackWhatsAppClick } from "@/lib/site";
import type { LandingKantor } from "@/lib/landing-content";

const menu = [
  { href: "/#beranda", label: "Beranda" },
  { href: "/#tentang-kami", label: "Tentang Kami" },
  { href: "/#layanan", label: "Layanan" },
  { href: "/#masterpiece", label: "Masterpiece" },
  { href: "/#klien", label: "Klien" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#kontak", label: "Kontak" },
];

const ICONS = {
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  facebook: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
};

type Props = {
  kantor: Pick<LandingKantor, "companyName" | "address" | "whatsapp" | "whatsappDisplay" | "email" | "socials" | "foundedYear">;
};

export default function Footer({ kantor }: Props) {
  // Link sosial yang kosong di Setting Kantor tidak ditampilkan.
  const socials = [
    { label: "Instagram", href: kantor.socials.instagram, path: ICONS.instagram, hover: "hover:bg-pink-600" },
    { label: "YouTube", href: kantor.socials.youtube, path: ICONS.youtube, hover: "hover:bg-red-600" },
    { label: "Facebook", href: kantor.socials.facebook, path: ICONS.facebook, hover: "hover:bg-blue-600" },
    { label: "TikTok", href: kantor.socials.tiktok, path: ICONS.tiktok, hover: "hover:bg-slate-700" },
  ];

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
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed pr-4">
              Event organizer dan wedding planner di Malang sejak {kantor.foundedYear}. Kami merancang, mengelola, dan menyukseskan acara korporat maupun pernikahan Anda.
            </p>
            <div className="flex gap-4 pt-2">
              {socials.map(
                (item) =>
                  item.href && (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.label} D'Production`} className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:text-white transition-colors duration-300 ${item.hover}`}>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d={item.path} /></svg>
                    </a>
                  ),
              )}
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
                <span className="text-sm text-slate-400 leading-relaxed">{kantor.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <a href={whatsappUrl(undefined, kantor.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick} className="text-sm text-slate-400 hover:text-white transition-colors">{kantor.whatsappDisplay}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href={`mailto:${kantor.email}`} className="min-w-0 break-all text-sm text-slate-400 hover:text-white transition-colors">{kantor.email}</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col items-center justify-center">
          <p className="text-sm text-slate-400">
            © 2026 <span className="text-slate-300 font-semibold">{kantor.companyName}</span>. All Rights Reserved.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Made by dreinst, organized by D&apos;Production Event Organizer
          </p>
        </div>
      </div>
    </footer>
  );
}
