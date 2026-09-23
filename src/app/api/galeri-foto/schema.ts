import { z } from 'zod';
import { zUrl } from '@/lib/api';

const fields = {
  image: zUrl('URL gambar'),
  link: zUrl('Link').nullable().optional(),
};

export const createSchema = z.object(fields);
export const updateSchema = z.object(fields).partial();
