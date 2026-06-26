"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";

function getAuthCookie(): { username: string; alias: string; level: string } | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/dpro_auth=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; alias: string; level: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const authUser = getAuthCookie();
    if (!isLoginPage && !authUser) {
      router.replace("/admin/login");
    } else {
      setUser(authUser);
    }
    setChecking(false);
  }, [isLoginPage, router]);

  // Login page renders without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        <AdminHeader
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-6 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="px-6 lg:px-8 py-4 text-center text-slate-400 text-xs border-t border-slate-200">
          Copyright &copy; {new Date().getFullYear()} D&apos;Production. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
