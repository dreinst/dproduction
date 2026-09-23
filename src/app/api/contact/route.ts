import { NextResponse, after } from "next/server";
import prisma from "@/lib/prisma";
import { notifyNewLead } from "@/lib/notify";
import { EVENT_VALUES, WHATSAPP_PATTERN, normalizeWhatsapp } from "@/lib/site";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().overwrite((value) => value.replace(/\s+/g, " ").trim()).min(1).max(100),
  whatsapp: z.string().overwrite(normalizeWhatsapp).regex(WHATSAPP_PATTERN),
  eventType: z.enum(EVENT_VALUES),
  message: z.string().trim().min(1).max(2000),
});

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

  // x-real-ip diisi proxy (Traefik di VPS, Vercel), entri pertama x-forwarded-for bisa dipalsukan klien.
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return reply(429, "Terlalu banyak kiriman dari jaringan Anda. Silakan coba lagi dalam 10 menit atau hubungi kami lewat WhatsApp.");
  }

  const body = await request.json().catch(() => null);
  if (body === null) return reply(400, "Data kiriman tidak terbaca.");

  const thankYou = "Pesan berhasil dikirim!";
  if ((body as { website?: unknown }).website) return reply(201, thankYou);

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return reply(400, "Data belum lengkap atau tidak valid. Periksa kembali isian Anda.");

  try {
    const lead = await prisma.client.create({ data: parsed.data });
    console.log(`Lead baru tersimpan, id ${lead.id}`);
    after(() => notifyNewLead(lead));
    return reply(201, thankYou);
  } catch (error) {
    const { name, code } = (error ?? {}) as { name?: string; code?: string };
    // Error Prisma bisa memuat nilai isian (data pribadi), jadi hanya nama dan kodenya yang dicatat.
    const detail = code ? code : error instanceof Error && name === "Error" ? error.message : "";
    console.error(`Gagal menyimpan lead: ${name ?? "tidak diketahui"} ${detail}`.trim());
    return reply(500, "Terjadi kesalahan saat memproses pesan.");
  }
}
