import { z } from 'zod';
import { zSortIndex, zText } from '@/lib/api';
import { youtubeId } from '@/lib/site';

const YOUTUBE_MESSAGE = 'Link harus video YouTube, misalnya https://www.youtube.com/watch?v=xxxxxxxxxxx.';

const fields = {
  // Parser URL membuang tab dan baris baru di tengah link, jadi spasi dan karakter kontrol ditolak lebih dulu.
  url: z
    .string({ error: YOUTUBE_MESSAGE })
    .trim()
    .max(2000, 'Link video maksimal 2000 karakter.')
    .refine((value) => !/[\s\u0000-\u001f\u007f]/.test(value) && youtubeId(value) !== null, YOUTUBE_MESSAGE),
  title: zText(200, 'Judul video').nullable().optional(),
  active: z.boolean({ error: 'Status tampil harus ya atau tidak.' }),
  sortIndex: zSortIndex,
};

export const createSchema = z.object({
  ...fields,
  active: fields.active.default(true),
  sortIndex: fields.sortIndex.default(0),
});
export const updateSchema = z.object(fields).partial();
