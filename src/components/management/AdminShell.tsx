"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/management/Sidebar";
import AdminHeader from "@/components/management/Header";
import { can, type Action, type Resource, type Role } from "@/lib/rbac";

export type AdminUser = { id: number; username: string; alias: string | null; role: Role };

type AdminContext = { user: AdminUser; can: (resource: Resource, action: Action) => boolean };

const AdminUserContext = createContext<AdminContext | null>(null);

export function useAdminUser(): AdminContext {
  const ctx = useContext(AdminUserContext);
  if (!ctx) throw new Error("useAdminUser hanya bisa dipakai di dalam halaman /management.");
  return ctx;
}

export default function AdminShell({ children }: { children: ReactNode }) {
  return usePathname() === "/management/login" ? <>{children}</> : <AuthedShell>{children}</AuthedShell>;
}

function AuthedShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ctx, setCtx] = useState<AdminContext | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (cancelled) return;
        if (res.status === 401) {
          const here = window.location.pathname + window.location.search;
          router.replace(`/management/login?next=${encodeURIComponent(here)}&expired=1`);
          return;
        }
        if (!res.ok) throw new Error(`GET /api/auth/me ${res.status}`);
        const { user } = (await res.json()) as { user: AdminUser };
        if (!cancelled) setCtx({ user, can: (resource, action) => can(user.role, resource, action) });
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div role="alert" className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-slate-800">Data sesi gagal dimuat.</p>
          <p className="mt-1 text-sm text-slate-600">Periksa koneksi, lalu muat ulang halaman.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Muat ulang
          </button>
        </div>
      </div>
    );
  }

  if (!ctx) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center" role="status" aria-label="Memuat">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminUserContext.Provider value={ctx}>
      <div className="min-h-screen bg-slate-100">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" aria-hidden onClick={() => setSidebarOpen(false)} />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} role={ctx.user.role} />
        </div>

        <div className="lg:pl-64">
          <AdminHeader user={ctx.user} menuOpen={sidebarOpen} onMenuToggle={() => setSidebarOpen((open) => !open)} />
          <main className="p-6 lg:p-8">{children}</main>
          <footer className="px-6 lg:px-8 py-4 text-center text-slate-500 text-xs border-t border-slate-200">
            {`© ${new Date().getFullYear()} D'Production. Hak cipta dilindungi.`}
          </footer>
        </div>
      </div>
    </AdminUserContext.Provider>
  );
}
