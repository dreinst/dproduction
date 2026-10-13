import { NextResponse, after } from "next/server";
import prisma from "@/lib/prisma";
import { NO_NUL } from "@/lib/api";
import { notifyNewLead } from "@/lib/notify";
import { EVENT_VALUES, WHATSAPP_PATTERN, formatTanggal, normalizeWhatsapp, wibDate } from "@/lib/site";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().overwrite((value) => value.replace(/\s+/g, " ").trim()).min(1).max(100).regex(NO_NUL),
  whatsapp: z.string().overwrite(normalizeWhatsapp).regex(WHATSAPP_PATTERN),
  eventType: z.enum(EVENT_VALUES),
  // Pesan dan tanggal acara boleh kosong. Tanggal dari isian kalender berformat YYYY-MM-DD.
  message: z.string().trim().max(2000).regex(NO_NUL).nullish(),
  eventDate: z.union([z.literal(""), z.iso.date()]).nullish(),
});

// Tanggal acara disimpan sebagai baris pertama kolom message, jadi tabel Client tidak perlu kolom baru. Yang ditolak:
// tanggal yang sudah lewat (kemarin masih diterima supaya "hari ini" di zona waktu pengunjung mana pun lolos) dan
// tanggal lebih dari 3 tahun ke depan.
function eventDateError(eventDate: string) {
  const today = wibDate();
  if (eventDate < wibDate(-1)) return "Tanggal acara sudah lewat. Pilih tanggal yang akan datang, atau kosongkan.";
  if (eventDate > `${Number(today.slice(0, 4)) + 3}${today.slice(4)}`) {
    return "Tanggal acara paling jauh 3 tahun dari sekarang. Pilih tanggal yang lebih dekat, atau kosongkan.";
  }
  return null;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const since = Date.now() - WINDOW_MS;
  if (hits.size > 1000) {
    for (const [key, times] of hits) if (times[times.length - 1] <= since) hits.delete(key);
  }
  const recent = (hits.get(ip) ?? []).filter((time) => time > since);
  if (recent.length >= MAX_PER_WINDOW) return true;
  hits.set(ip, [...recent, Date.now()]);
  return false;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

const reply = (status: number, message: string) =>
  NextResponse.json({ success: status < 300, message }, { status });

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") return reply(415, "Format kiriman tidak didukung.");
  if (!isSameOrigin(request)) return reply(403, "Kiriman dari situs lain tidak diterima.");

  // Hanya percaya x-real-ip yang diisi proxy (Traefik di VPS, Vercel). x-forwarded-for tidak dipakai karena
  // bisa dipalsukan klien, sehingga pembatas laju tidak bisa dilewati lewat header palsu.
  const ip = request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return reply(429, "Terlalu banyak kiriman dari jaringan Anda. Silakan coba lagi dalam 10 menit atau hubungi kami lewat WhatsApp.");
  }

  const body = await request.json().catch(() => null);
  if (body === null) return reply(400, "Data kiriman tidak terbaca.");

  const thankYou = "Pesan berhasil dikirim!";
  if ((body as { website?: unknown }).website) return reply(201, thankYou);

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const onlyDate = parsed.error.issues.every((issue) => issue.path[0] === "eventDate");
    return reply(
      400,
      onlyDate
        ? "Tanggal acara tidak dikenali. Pilih tanggalnya lewat kalender, atau kosongkan."
        : "Data belum lengkap atau tidak valid. Periksa kembali isian Anda.",
    );
  }
  const { eventDate, message, ...contact } = parsed.data;
  const dateError = eventDate ? eventDateError(eventDate) : null;
  if (dateError) return reply(400, dateError);
  const fullMessage = [eventDate && `Tanggal acara: ${formatTanggal(eventDate)}`, message].filter(Boolean).join("\n\n");

  try {
    const lead = await prisma.client.create({ data: { ...contact, message: fullMessage } });
    after(() => notifyNewLead(lead));
    return reply(201, thankYou);
  } catch (error) {
    const { name, code } = (error ?? {}) as { name?: string; code?: string };
    // Error Prisma bisa memuat nilai isian (data pribadi), jadi hanya nama dan kodenya yang dicatat.
    const detail = code ? code : error instanceof Error && name === "Error" ? error.message : "";
    console.error(`Gagal menyimpan lead: ${name ?? "tidak diketahui"} ${detail}`.trim());
    return reply(500, "Server kami sedang bermasalah, jadi pesan belum tersimpan. Coba lagi sebentar lagi, atau kirim lewat WhatsApp.");
  }
}
