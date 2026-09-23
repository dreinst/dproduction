"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Package,
  Settings,
  LogOut,
  Building2,
  Image,
  X,
  FileText,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { navFor, type NavIcon, type NavItem, type Role } from "@/lib/rbac";

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  leads: Inbox,
  database: FileText,
  galeri: Image,
  master: Package,
  setting: Settings,
  workspace: Building2,
};

interface SidebarProps {
  onClose?: () => void;
  role: Role;
}

export default function Sidebar({ onClose, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const navItems = navFor(role);

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (item: NavItem) => item.children?.some((child) => isActive(child.href)) ?? false;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.replace("/management/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white h-full flex flex-col border-r border-slate-200 shadow-sm">
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <NextImage src="/logo-dpro.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-contain" />
          <div>
            <div className="text-slate-800 font-bold text-sm tracking-tight">D&apos;Production</div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Manajemen</div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="lg:hidden p-1 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        )}
      </div>

      <nav aria-label="Menu admin" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon];

          if (!item.children) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" aria-hidden />
                {item.name}
              </Link>
            );
          }

          const groupActive = isGroupActive(item);
          const expanded = toggled[item.name] ?? groupActive;
          const listId = `nav-${item.icon}`;
          return (
            <div key={item.name}>
              <button
                type="button"
                onClick={() => setToggled((prev) => ({ ...prev, [item.name]: !expanded }))}
                aria-expanded={expanded}
                aria-controls={listId}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  groupActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px]" aria-hidden />
                  {item.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {expanded && (
                <div id={listId} className="ml-8 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      aria-current={isActive(child.href) ? "page" : undefined}
                      className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive(child.href)
                          ? "text-blue-700 bg-blue-50/50 font-medium"
                          : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
        >
          <LogOut className="w-[18px] h-[18px]" aria-hidden />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}
