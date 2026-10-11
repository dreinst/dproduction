"use client";

import Image from "next/image";
import { useState } from "react";

// id: ID video YouTube 11 karakter dari getLandingGaleri.
type Props = { id: string; title: string };

// Fasad video: saat halaman dimuat yang ada hanya gambar pratinjau dan judulnya, tanpa iframe dan tanpa permintaan dari
// peramban ke YouTube. Pemutar baru dimuat setelah kartu diklik. Tanpa JavaScript kartunya tetap tautan biasa ke video
// itu di YouTube.
export default function VideoFasad({ id, title }: Props) {
  const [playing, setPlaying] = useState(false);
  const [gagalId, setGagalId] = useState<string | null>(null);

  // Judul ditaruh di bawah gambar. Isi gambar pratinjau tidak bisa diatur dari sini, jadi teks di atasnya tidak
  // terjamin kontras.
  const keterangan = (
    <>
      <span className="mt-3 block text-label text-mute">
        Video YouTube<span className="sr-only">: </span>
      </span>
      <span className="mt-0.5 block text-kartu-sm">{title}</span>
    </>
  );

  if (playing) {
    return (
      <div>
        <iframe
          // Tautan yang tadi difokus sudah diganti, jadi fokus dipindahkan ke pemutar.
          ref={(el) => el?.focus()}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="block aspect-video w-full rounded-besar border-0 bg-navy"
        />
        {keterangan}
      </div>
    );
  }

  return (
    <a
      href={`https://www.youtube.com/watch?v=${id}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        // Klik dengan tombol pengubah (misalnya untuk membuka di tab baru) dibiarkan menjadi tautan biasa.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        setPlaying(true);
      }}
      // scroll-mt menjaga kartu yang mendapat fokus papan ketik tidak berhenti di belakang bilah navigasi.
      className="group block scroll-mt-(--nav-ruang)"
    >
      <span
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-besar"
        style={{ background: "linear-gradient(180deg, #0b2144, #0a2c63)" }}
      >
        {/* Pratinjau diambil server lewat pengoptimasi gambar (butuh izin i.ytimg.com di images.remotePatterns), jadi
            peramban tidak menghubungi YouTube. Alt kosong karena judulnya sudah tertulis di bawah. Kalau gagal dimuat
            gambarnya dibuang dan kotaknya tetap navy. */}
        {gagalId !== id && (
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1280px) 628px, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
            onError={() => setGagalId(id)}
          />
        )}
        <span className="relative flex size-14 items-center justify-center rounded-full bg-white text-navy shadow-kaca transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6 3.5v13a.5.5 0 0 0 .77.42l10-6.5a.5.5 0 0 0 0-.84l-10-6.5A.5.5 0 0 0 6 3.5Z" />
          </svg>
        </span>
      </span>
      {/* Teks tersembunyi melengkapi nama tautan untuk pembaca layar: "Putar Video YouTube: judul". */}
      <span className="sr-only">Putar </span>
      {keterangan}
    </a>
  );
}
