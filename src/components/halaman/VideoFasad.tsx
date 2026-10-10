"use client";

import { useState } from "react";

// id: ID video YouTube 11 karakter dari getLandingGaleri.
type Props = { id: string; title: string };

// Fasad video: saat halaman dimuat yang ada hanya kartu berjudul ini, tanpa iframe dan tanpa permintaan ke YouTube.
// Pemutar baru dimuat setelah kartu diklik. Tanpa JavaScript kartunya tetap tautan biasa ke video itu di YouTube.
export default function VideoFasad({ id, title }: Props) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
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
      // Garis fokus bawaan memakai warna teks (putih), yang tidak terlihat di luar kartu navy ini. scroll-mt menjaga
      // kartu yang mendapat fokus papan ketik tidak berhenti di belakang bilah navigasi.
      className="group flex aspect-video scroll-mt-(--nav-ruang) flex-col justify-between gap-3 rounded-besar p-5 text-white outline-biru md:p-6 xl:p-8"
      style={{ background: "linear-gradient(180deg, #0b2144, #0a2c63)" }}
    >
      {/* Teks tersembunyi melengkapi nama tautan untuk pembaca layar: "Putar Video YouTube: judul". */}
      <span className="text-label text-white/72">
        <span className="sr-only">Putar </span>Video YouTube<span className="sr-only">: </span>
      </span>
      <span className="flex items-end justify-between gap-4">
        <span className="text-kartu-md">{title}</span>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-navy transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none xl:size-14">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6 3.5v13a.5.5 0 0 0 .77.42l10-6.5a.5.5 0 0 0 0-.84l-10-6.5A.5.5 0 0 0 6 3.5Z" />
          </svg>
        </span>
      </span>
    </a>
  );
}
