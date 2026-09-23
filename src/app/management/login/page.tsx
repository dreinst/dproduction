"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import { safeNextPath } from "@/lib/rbac";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const COOKIE_BLOCKED =
  "Login berhasil, tetapi browser tidak menyimpan sesi. Buka dashboard lewat alamat https:// atau http://localhost, lalu coba lagi.";

export default function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = use(searchParams);
  const next = safeNextPath(typeof params.next === "string" ? params.next : null) ?? "/management";
  const expired = params.expired === "1";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        router.replace(next);
        return;
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
    }
    setLoading(false);
  };

  const inputClass =
    "w-full py-3.5 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-10">
        <div className="text-center mb-10">
          <Image
            src="/logo-dpro.png"
            alt="D'Production"
            width={72}
            height={72}
            className="mx-auto mb-5 h-18 w-18 rounded-2xl object-contain"
          />
          <h1 className="text-white text-3xl font-extrabold tracking-tight">Halaman Manajemen</h1>
          <p className="text-slate-300 mt-2 text-sm">Masuk ke sistem administrasi D&apos;Production</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {expired && !error && (
            <p role="status" className="mb-5 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm px-4 py-3 rounded-xl">
              Sesi Anda sudah berakhir. Silakan masuk lagi.
            </p>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-username" className="block text-slate-300 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden />
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${inputClass} pl-12 pr-4`}
                  placeholder="Masukkan username"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pl-12 pr-12`}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" aria-hidden /> : <Eye className="w-5 h-5" aria-hidden />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
                  <span className="sr-only">Memproses</span>
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          {`© ${new Date().getFullYear()} D'Production. Hak cipta dilindungi.`}
        </p>
      </div>
    </div>
  );
}
