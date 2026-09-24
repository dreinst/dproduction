import { z } from 'zod';
import { zName } from '@/lib/api';

// JobDesc hanya berisi nama. Tarif honor per level ada di /api/tarif (khusus Pemilik dan Super Admin).
export const jobDescSchema = z.object({ name: zName('Nama JobDesc') });
export const jobDescSelect = { id: true, name: true } as const;
export const MESSAGES = {
  P2002: 'JobDesc dengan nama ini sudah ada.',
  P2003: 'JobDesc masih dipakai di penugasan crew.',
  P2025: 'JobDesc tidak ditemukan.',
};
