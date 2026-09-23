import { z } from 'zod';
import { zIsoDate, zName, zText } from '@/lib/api';

// Setting kantor hanya satu baris, selalu di id 1 (baris produksi yang sudah ada juga id 1).
export const KANTOR_ID = 1;

const HTTPS_URL = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(:\d{1,5})?([/?#][^\s\\]*)?$/i;

const text = (max: number, label: string) => zText(max, label).nullable().optional();
const httpsUrl = (label: string) =>
  zText(2000, label).regex(HTTPS_URL, `${label} harus berupa alamat lengkap yang diawali https://.`).nullable().optional();

export const kantorSchema = z.object({
  companyName: zName('Nama perusahaan'),
  status: text(200, 'Status'),
  motto1: text(200, 'Motto baris 1'),
  motto2: text(200, 'Motto baris 2'),
  description: text(1000, 'Deskripsi motto'),
  foundedDate: zIsoDate('Tanggal berdiri').nullable().optional(),
  address: text(500, 'Alamat'),
  phone: text(50, 'Nomor telepon'),
  email: zText(200, 'Email').pipe(z.email({ error: 'Format email tidak valid.' })).nullable().optional(),
  website: httpsUrl('Website'),
  googleMapsUrl: httpsUrl('URL Google Maps'),
  facebookUrl: httpsUrl('URL Facebook'),
  instagramUrl: httpsUrl('URL Instagram'),
  youtubeUrl: httpsUrl('URL YouTube'),
  tiktokUrl: httpsUrl('URL TikTok'),
  aboutUs: text(5000, 'Tentang kami'),
});
