"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "src" | "alt" | "fill" | "unoptimized" | "onError"> & { src: string; alt: string };

// Gambar landing yang bisa berasal dari database, selalu mode fill di dalam wadah relative.
// Path di situs ini (/assets, /media) dioptimasi; URL https dimuat apa adanya supaya tidak perlu remotePatterns.
// Kalau gagal dimuat, diganti kotak bergradasi netral yang tetap terbaca pembaca layar.
export default function LandingImage({ src, alt, className, ...props }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return <div role="img" aria-label={alt} className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-400" />;
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      fill
      // Next 16 menolak mengoptimasi path lokal ber-query tanpa localPatterns, jadi yang begitu juga dimuat apa adanya.
      unoptimized={!src.startsWith("/") || src.includes("?")}
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}
