import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseCrudOptions {
  endpoint: string;
}

type Payload<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

const SESSION_ENDED = 'Sesi Anda sudah berakhir. Silakan masuk lagi.';
const OFFLINE = 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.';

// Semua error dari request() berupa RequestError dengan pesan yang aman ditampilkan ke pengguna.
export class RequestError extends Error {}

function messageFrom(body: unknown, fallback: string) {
  const b = body as { message?: unknown; issues?: { message?: unknown }[] } | null;
  if (typeof b?.message === 'string' && b.message) return b.message;
  const issue = b?.issues?.[0]?.message;
  return typeof issue === 'string' && issue ? issue : fallback;
}

// request(url, fallback, init?) membalas body JSON. Status 401 mengarahkan ke login; status gagal lain melempar
// RequestError berisi pesan dari API atau fallback.
export function useApiRequest() {
  const router = useRouter();
  return useCallback(
    async (url: string, fallback: string, init?: RequestInit) => {
      let res: Response;
      try {
        res = await fetch(url, init);
      } catch {
        throw new RequestError(OFFLINE);
      }
      if (res.status === 401) {
        const here = window.location.pathname + window.location.search;
        router.replace(`/management/login?next=${encodeURIComponent(here)}&expired=1`);
        throw new RequestError(SESSION_ENDED);
      }
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new RequestError(messageFrom(body, fallback));
      return body;
    },
    [router],
  );
}

export const jsonInit = (method: string, payload: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

export function useCrud<T extends { id: number }>({ endpoint }: UseCrudOptions) {
  const request = useApiRequest();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await request(endpoint, 'Gagal memuat data. Coba muat ulang halaman.'));
    } catch (err) {
      setError(err instanceof RequestError ? err.message : 'Gagal memuat data. Coba muat ulang halaman.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, request]);

  useEffect(() => {
    queueMicrotask(fetchAll);
  }, [fetchAll]);

  const save = async (url: string, init: RequestInit, fallback: string) => {
    setSaveError(null);
    try {
      await request(url, fallback, init);
    } catch (err) {
      setSaveError(err instanceof RequestError ? err.message : fallback);
      return false;
    }
    await fetchAll();
    return true;
  };

  const createItem = (payload: Payload<T>) =>
    save(endpoint, jsonInit('POST', payload), 'Gagal menyimpan data. Coba lagi.');

  const updateItem = (id: number, payload: Partial<Payload<T>>) =>
    save(`${endpoint}/${id}`, jsonInit('PUT', payload), 'Gagal menyimpan perubahan. Coba lagi.');

  const deleteItem = (id: number) =>
    save(`${endpoint}/${id}`, { method: 'DELETE' }, 'Gagal menghapus data. Coba lagi.');

  const clearSaveError = useCallback(() => setSaveError(null), []);

  return { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem, fetchAll };
}
