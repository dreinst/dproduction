import { z } from 'zod';
import { zName } from '@/lib/api';

export const createSchema = z.object({ grade: zName('Grade') });
export const updateSchema = createSchema.partial();
export const MESSAGES = { P2002: 'Grade dengan nama ini sudah ada.', P2025: 'Grade tidak ditemukan.' };
