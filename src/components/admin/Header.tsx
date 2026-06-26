"use client";

import { Menu, Search, Bell, Calendar, User } from "lucide-react";
import { useState } from "react";

interface AdminHeaderProps {
  user: { username: string; alias: string; level: string };
  onMenuToggle: () => void;
}

export default function AdminHeader({ user, onMenuToggle }: AdminHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-slate-700 font-semibold text-lg hidden sm:block">
          Management Page
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Date */}
        <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
          <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-green-700 text-sm font-medium">
            {user.username}
          </span>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-lg">
          <input
            type="text"
            placeholder="Cari di Management Page..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
