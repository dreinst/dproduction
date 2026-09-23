import { useState } from 'react';

export const PAGE_SIZES = [10, 25, 50, 100] as const;

const toCount = (n: number) => Math.max(1, Math.floor(n) || 1);

// resetKey berisi nilai filter dan pencarian; setiap kali berubah, tampilan kembali ke halaman 1.
export function usePagination<T>(items: readonly T[], resetKey: string | number = '', initialPageSize = 10) {
  const [pageSize, setPageSizeState] = useState(() => toCount(initialPageSize));
  const [state, setState] = useState({ page: 1, key: resetKey });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = state.key === resetKey ? Math.min(state.page, totalPages) : 1;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    page,
    pageSize,
    total,
    totalPages,
    pageItems,
    from: total ? start + 1 : 0,
    to: start + pageItems.length,
    setPage: (next: number) => setState({ page: Math.min(toCount(next), totalPages), key: resetKey }),
    setPageSize: (next: number) => {
      setPageSizeState(toCount(next));
      setState({ page: 1, key: resetKey });
    },
  };
}

export type PaginationState = ReturnType<typeof usePagination>;
