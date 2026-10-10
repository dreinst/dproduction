"use client";

import type { ComponentProps } from "react";
import { trackWhatsAppClick, whatsappUrl } from "@/lib/site";

type Props = Omit<ComponentProps<"a">, "href" | "target" | "rel" | "onClick"> & { nomor?: string; teks?: string };

// Tautan ke WhatsApp yang ikut mencatat konversi Google Ads saat diklik. nomor berformat 62xxx (bawaan WhatsApp 1),
// teks adalah pesan awal (bawaan salam umum di src/lib/site.ts).
export default function TautanWhatsApp({ nomor, teks, children, ...props }: Props) {
  return (
    <a {...props} href={whatsappUrl(teks, nomor)} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick}>
      {children}
    </a>
  );
}
