import type { Client } from "@prisma/client";
import { eventLabel } from "@/lib/site";

export async function notifyNewLead(lead: Client) {
  const token = process.env.LEAD_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.LEAD_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    `Lead baru dari website (#${lead.id})`,
    `Nama: ${lead.name}`,
    `WhatsApp: https://wa.me/62${lead.whatsapp.slice(1)}`,
    `Jenis acara: ${eventLabel(lead.eventType)}`,
    `Pesan: ${lead.message}`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`Notifikasi Telegram lead ${lead.id} gagal: HTTP ${res.status}`);
  } catch (error) {
    console.error(`Notifikasi Telegram lead ${lead.id} gagal: ${error instanceof Error ? error.message : "tidak diketahui"}`);
  }
}
