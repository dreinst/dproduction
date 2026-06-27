import { useState, useEffect, useCallback } from 'react';

interface UseCrudOptions<T> {
  endpoint: string;
}

export function useCrud<T extends { id: number }>({ endpoint }: UseCrudOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createItem = async (payload: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create item');
      await fetchAll();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const updateItem = async (id: number, payload: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update item');
      await fetchAll();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      await fetchAll();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return { data, loading, error, createItem, updateItem, deleteItem, fetchAll };
}
