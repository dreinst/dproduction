"use client";

import { Menu, Calendar, User } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/rbac";

interface AdminHeaderProps {
  user: { username: string; alias: string | null; role: Role };
  menuOpen: boolean;
  onMenuToggle: () => void;
}

export default function AdminHeader({ user, menuOpen, onMenuToggle }: AdminHeaderProps) {
  const formattedDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" aria-hidden />
        </button>
        <h2 className="text-slate-700 font-semibold text-lg hidden sm:block">Halaman Manajemen</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-slate-600 text-sm">
          <Calendar className="w-4 h-4" aria-hidden />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="text-green-800 text-sm font-medium leading-none">{user.alias || user.username}</span>
            <span className="text-green-700 text-[10px] font-bold uppercase tracking-wider mt-0.5">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
