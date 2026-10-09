"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import FotoKosong from "@/components/site/FotoKosong";

type Props = Omit<ImageProps, "src" | "alt" | "fill" | "unoptimized" | "onError"> & { src: string; alt: string };

// Gambar landing yang bisa berasal dari database, selalu mode fill di dalam wadah relative.
// Path di situs ini (/assets, /media) dioptimasi; URL https dimuat apa adanya supaya tidak perlu remotePatterns.
// Kalau gagal dimuat, diganti kotak "Foto menyusul" yang tetap membawa alt-nya untuk pembaca layar.
export default function LandingImage({ src, alt, className, ...props }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) return <FotoKosong alt={alt} />;

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
