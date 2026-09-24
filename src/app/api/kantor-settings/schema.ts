import { z } from 'zod';
import { zName, zText, zWhatsapp } from '@/lib/api';

// Setting kantor hanya satu baris, selalu di id 1 (baris produksi yang sudah ada juga id 1).
export const KANTOR_ID = 1;

const HTTPS_URL = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(:\d{1,5})?([/?#][^\s\\]*)?$/i;
// Dipakai sebagai src iframe peta di landing, jadi host-nya dikunci ke Google Maps.
const GOOGLE_MAPS_URL = /^https:\/\/www\.google\.com\/maps[^\s\\]*$/;
const FOUNDED_YEAR = 'Tahun berdiri harus tahun 4 digit.';

const text = (max: number, label: string) => zText(max, label).nullable().optional();
const httpsUrl = (label: string) =>
  zText(2000, label).regex(HTTPS_URL, `${label} harus berupa alamat lengkap yang diawali https://.`).nullable().optional();
const stat = (label: string) => {
  const message = `${label} harus angka bulat dari 0 sampai 1.000.000.`;
  return z.number({ error: message }).int(message).min(0, message).max(1_000_000, message).nullable().optional();
};

export const kantorSchema = z.object({
  companyName: zName('Nama perusahaan'),
  status: text(200, 'Status'),
  motto1: text(200, 'Motto baris 1'),
  motto2: text(200, 'Motto baris 2'),
  description: text(1000, 'Teks pembuka Hero'),
  foundedYear: z
    .number({ error: FOUNDED_YEAR })
    .int(FOUNDED_YEAR)
    .min(1900, FOUNDED_YEAR)
    .max(2100, FOUNDED_YEAR)
    .nullable()
    .optional(),
  address: text(500, 'Alamat'),
  phone: text(50, 'Nomor telepon'),
  whatsapp: zWhatsapp('Nomor WhatsApp').nullable().optional(),
  email: zText(200, 'Email').pipe(z.email({ error: 'Format email tidak valid.' })).nullable().optional(),
  website: httpsUrl('Website'),
  googleMapsUrl: zText(2000, 'URL Google Maps')
    .regex(GOOGLE_MAPS_URL, 'URL Google Maps harus link embed yang diawali https://www.google.com/maps.')
    .nullable()
    .optional(),
  facebookUrl: httpsUrl('URL Facebook'),
  instagramUrl: httpsUrl('URL Instagram'),
  youtubeUrl: httpsUrl('URL YouTube'),
  tiktokUrl: httpsUrl('URL TikTok'),
  aboutUs: text(5000, 'Tentang Kami'),
  statClients: stat('Statistik Klien'),
  statEvents: stat('Statistik Event'),
  statRentalCategories: stat('Statistik Kategori Rental'),
  statMembers: stat('Statistik Member'),
  statYears: stat('Statistik Tahun Pengalaman'),
});
