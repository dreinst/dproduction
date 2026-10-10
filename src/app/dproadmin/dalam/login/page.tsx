"use client";

import { use, useState } from "react";
import { safeNextPath } from "@/lib/rbac";
import { ADMIN_BASE } from "@/lib/admin-path";
import "@/components/management/admin-v2.css";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const COOKIE_BLOCKED =
  "Login berhasil, tetapi browser tidak menyimpan sesi. Buka dashboard lewat alamat https:// atau http://localhost, lalu coba lagi.";

export default function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = use(searchParams);
  const next = safeNextPath(typeof params.next === "string" ? params.next : null) ?? ADMIN_BASE;
  const expired = params.expired === "1";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Username atau password salah.");
      } else if (!(await fetch("/api/auth/me")).ok) {
        setError(COOKIE_BLOCKED);
      } else {
        // Muat dokumen penuh, bukan router.replace: cache router klien bisa masih menyimpan pengalihan ke login untuk
        // alamat tujuan (sisa permintaan saat sesi habis), sehingga navigasi klien kembali ke halaman login.
        window.location.assign(next);
        return;
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
    }
    setLoading(false);
  };

  return (
    <div className="admin-v2 flex min-h-screen items-center justify-center px-5 py-10">
      <main className="w-full max-w-[400px] rounded-3xl bg-white p-7">
        <p className="adm-brand">D&apos;Production</p>
        <h1 className="mt-1">Panel pengelola</h1>

        {expired && !error && (
          <p role="status" className="mt-5 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm">
            Sesi Anda sudah berakhir. Silakan masuk lagi.
          </p>
        )}
        <form method="post" onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="adm-field">
            <label htmlFor="login-username" className="adm-label">
              Username
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="adm-input"
              required
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="adm-field">
            <label htmlFor="login-password" className="adm-label">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="adm-input pr-28"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="adm-link absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                {showPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="adm-alert">
              {error}
            </div>
          )}

          <button id="login-submit" type="submit" disabled={loading} className="adm-btn adm-btn--primary w-full">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </main>
    </div>
  );
}
