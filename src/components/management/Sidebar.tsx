"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { navFor, ROLE_LABELS, type NavLink, type Role } from "@/lib/rbac";
import { ADMIN_BASE, ADMIN_LOGIN } from "@/lib/admin-path";

interface SidebarProps {
  onClose: () => void;
  user: { username: string; alias: string | null; role: Role };
}

export default function Sidebar({ onClose, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const groupId = useId();
  const navRef = useRef<HTMLElement>(null);

  // Grup selalu terbuka, jadi daftar menu bisa lebih tinggi dari layar. Butir aktif digulir sampai terlihat, dengan
  // sela setengah butir dari tepi supaya latarnya tidak menutup bayangan penanda gulir di tepi daftar.
  // scrollTop dihitung sendiri: scrollIntoView ikut memindahkan titik awal Tab ke butir itu, sehingga tautan lompat terlewati.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector('[aria-current="page"]')?.getBoundingClientRect();
    if (!nav || !active) return;
    const box = nav.getBoundingClientRect();
    const gap = active.height / 2;
    if (active.top - gap < box.top) nav.scrollTop -= box.top - active.top + gap;
    else if (active.bottom + gap > box.bottom) nav.scrollTop += active.bottom - box.bottom + gap;
  }, [pathname]);

  // Sama dengan canAccessPath: halaman anak ikut menandai menu induknya, kecuali Dashboard yang hanya cocok persis.
  const isActive = (href: string) => pathname === href || (href !== ADMIN_BASE && pathname.startsWith(`${href}/`));

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.replace(ADMIN_LOGIN);
    router.refresh();
  };

  const link = (item: NavLink) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={onClose}
      aria-current={isActive(item.href) ? "page" : undefined}
      className="adm-nav__item"
    >
      {item.name}
    </Link>
  );

  return (
    <aside className="adm-side">
      <div className="adm-side__brand">
        <div>
          <p className="adm-brand">D&apos;Production</p>
          <p className="adm-brand__note">Panel pengelola</p>
        </div>
        <button type="button" onClick={onClose} className="adm-btn adm-btn--sm adm-btn--outline lg:hidden">
          Tutup
        </button>
      </div>

      {/* Menu dirender apa adanya dari NAV di rbac.ts: tautan lepas jadi butir, grup jadi label dan butir di bawahnya. */}
      <nav ref={navRef} aria-label="Menu admin" className="adm-nav">
        {navFor(user.role).map((item, i) =>
          item.children ? (
            <div key={item.name} role="group" aria-labelledby={`${groupId}-${i}`}>
              <p id={`${groupId}-${i}`} className="adm-nav__group">
                {item.name}
              </p>
              {item.children.map(link)}
            </div>
          ) : (
            link(item)
          ),
        )}
      </nav>

      <div className="adm-side__user">
        <div className="adm-side__who">
          <p className="adm-side__alias">{user.alias || user.username}</p>
          <p className="adm-side__role">{ROLE_LABELS[user.role]}</p>
        </div>
        <button type="button" onClick={handleLogout} className="adm-nav__item">
          Keluar
        </button>
      </div>
    </aside>
  );
}
