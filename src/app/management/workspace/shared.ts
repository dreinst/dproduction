import { useState } from "react";
import { RequestError, useApiRequest } from "@/hooks/useCrud";

// Dipakai bersama halaman Workspace dan Master Tarif. WIB selalu UTC+7 tanpa jam musim panas.
export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const RUPIAH = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
export const rupiah = (amount: number) => RUPIAH.format(amount);

export const formatWib = (iso: string) =>
  `${new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })} WIB`;

export const formatWibDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

// Isi input datetime-local dihitung dari WIB, apa pun zona waktu browser.
export const toWibInput = (iso: string) => new Date(new Date(iso).getTime() + WIB_OFFSET_MS).toISOString().slice(0, 16);
export const fromWibInput = (value: string) => `${value.slice(0, 16)}:00+07:00`;

export const currentWibMonth = () => new Date(Date.now() + WIB_OFFSET_MS).toISOString().slice(0, 7);

export const orNull = (value: string) => value.trim() || null;

export const errorMessage = (err: unknown, fallback: string) => (err instanceof RequestError ? err.message : fallback);

// Menjalankan satu request tulis (PATCH, POST, DELETE) lalu memuat ulang data halaman.
export function useAction(reload: () => unknown) {
  const request = useApiRequest();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (url: string, init: RequestInit, fallback: string) => {
    setBusy(true);
    setError(null);
    try {
      await request(url, fallback, init);
      await reload();
      return true;
    } catch (err) {
      setError(errorMessage(err, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { run, busy, error, clearError: () => setError(null) };
}

export const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
export const labelClass = "block text-sm font-medium text-slate-700 mb-1";
export const hintClass = "mt-1 text-xs text-slate-600";
export const primaryButton =
  "px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors";
export const secondaryButton =
  "px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-sm font-medium rounded-lg transition-colors";
export const dangerButton =
  "px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors";
export const addButton =
  "inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors";

export function tabClass(active: boolean) {
  return `flex-1 min-w-[7.5rem] px-3 py-3 text-sm font-semibold transition-colors ${
    active ? "bg-blue-600 text-white" : "bg-white text-blue-700 hover:bg-blue-50"
  }`;
}
