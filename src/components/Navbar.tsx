"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/#beranda", label: "Beranda", id: "beranda" },
  { href: "/#tentang-kami", label: "Tentang Kami", id: "tentang-kami" },
  { href: "/#layanan", label: "Layanan", id: "layanan" },
  { href: "/#masterpiece", label: "Masterpiece", id: "masterpiece" },
  { href: "/#klien", label: "Klien", id: "klien" },
  { href: "/#galeri", label: "Galeri", id: "galeri" },
  { href: "/#kontak", label: "Kontak", id: "kontak" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Handle transparent to solid navbar
      setScrolled(window.scrollY > 20);

      // Scrollspy logic
      const sections = links.map(link => document.getElementById(link.id));
      let currentSection = "beranda";

      for (const section of sections) {
        if (section) {
          const sectionTop = section.offsetTop;
          // Offset for fixed navbar height (approx 100px)
          if (window.scrollY >= sectionTop - 120) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname !== "/") {
      setIsOpen(false);
      return; // allow Next.js Link to handle routing to /#id
    }
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Calculate position minus navbar height
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "py-3 bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100" : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#beranda" onClick={(e) => handleLinkClick(e, "beranda")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all duration-300">
              D
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800">
              D'Production
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {links.map((link) => {
              const isActive = activeSection === link.id && pathname === "/";
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.id)}
                  className={`relative px-4 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
                    isActive
                      ? "text-blue-700 bg-blue-50"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navTab"
                      className="absolute inset-0 border border-blue-200 rounded-full z-[-1]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center">
            <a
              href="https://wa.me/6281938938800"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 gradient-bg text-white hover:shadow-lg hover:shadow-blue-500/30 rounded-full font-bold text-sm flex items-center gap-2 hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.003-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
              </svg>
              Konsultasi Gratis
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2.5 text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl"
          >
            <nav className="flex flex-col px-4 pt-4 pb-8 space-y-2">
              {links.map((link) => {
                const isActive = activeSection === link.id && pathname === "/";
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.id)}
                    className={`px-5 py-3.5 rounded-xl text-base font-bold transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 pl-6 border-l-4 border-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-6 px-2">
                <a
                  href="https://wa.me/6281938938800"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.003-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                  Konsultasi Gratis
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
