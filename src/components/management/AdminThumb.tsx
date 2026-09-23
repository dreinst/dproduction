"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

type Props = { src?: string | null; alt?: string };

export default function AdminThumb({ src, alt = "" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const url = src?.trim() ?? "";
  const external = /^https?:\/\//i.test(url);
  const local = url.startsWith("/") && !url.startsWith("//");

  if ((!external && !local) || failedSrc === url) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} (gambar tidak tersedia)` : "Gambar tidak tersedia"}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
      >
        <ImageOff className="h-5 w-5" aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={48}
      height={48}
      unoptimized={external || url.includes("?")}
      onError={() => setFailedSrc(url)}
      className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
    />
  );
}
