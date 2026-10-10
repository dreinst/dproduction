"use client";

import { useEffect } from "react";

// Bilah navigasi hanya dilayani selama berwujud kaca (Navigasi menulis data-terang="false"). Di varian terang cahayanya
// tidak tampak, jadi tidak perlu ditulisi.
const PERMUKAAN = '.kaca-biru:not(.nav-situs:not([data-terang="false"]) > .nav-bilah)';

// Interaksi kaca biru untuk semua elemen .kaca-biru: cahaya mengikuti kursor (--mx, --my), data-sorot saat kursor di
// atasnya, data-tekan dan riak saat ditekan. Gayanya di src/app/globals.css. Dirender satu kali di layout situs.
// Listener dipasang sekali di dokumen, jadi permukaan kaca yang muncul belakangan ikut terlayani.
// Di layar sentuh hanya keadaan ditekan yang muncul.
export default function KacaBiru() {
  useEffect(() => {
    const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)");
    const lepasListener = new AbortController();
    const opsi = { passive: true, signal: lepasListener.signal };
    const cari = (target: EventTarget | null, pilih = PERMUKAAN) => (target instanceof Element ? target.closest<HTMLElement>(pilih) : null);
    let antre = 0;
    let terakhir: HTMLElement | null = null;
    let x = 0;
    let y = 0;

    const tulis = () => {
      antre = 0;
      if (!terakhir) return;
      const kotak = terakhir.getBoundingClientRect();
      terakhir.style.setProperty("--mx", `${Math.round(x - kotak.left)}px`);
      terakhir.style.setProperty("--my", `${Math.round(y - kotak.top)}px`);
    };
    // Paling banyak satu tulisan per frame selama kursor bergerak.
    const posisi = (el: HTMLElement, e: PointerEvent, segera: boolean) => {
      // Dengan gerak dikurangi cahaya tetap di tengah (nilai awal 50% 50%).
      if (kurangiGerak.matches) return;
      terakhir = el;
      x = e.clientX;
      y = e.clientY;
      if (segera) {
        cancelAnimationFrame(antre);
        tulis();
      } else if (!antre) antre = requestAnimationFrame(tulis);
    };
    const lepas = () => {
      for (const el of document.querySelectorAll(".kaca-biru[data-tekan]")) el.removeAttribute("data-tekan");
    };

    document.addEventListener(
      "pointermove",
      (e) => {
        const el = cari(e.target);
        if (!el || e.pointerType === "touch") return;
        // Bilah navigasi bisa berganti ke wujud kaca saat kursor sudah di atasnya, tanpa pointerover baru.
        el.toggleAttribute("data-sorot", true);
        posisi(el, e, false);
      },
      opsi,
    );
    document.addEventListener(
      "pointerover",
      (e) => {
        const el = cari(e.target);
        if (!el || e.pointerType === "touch") return;
        el.setAttribute("data-sorot", "");
        posisi(el, e, true);
      },
      opsi,
    );
    document.addEventListener(
      "pointerout",
      (e) => {
        // Semua permukaan, termasuk bilah yang sudah berganti ke varian terang selagi disorot.
        const el = cari(e.target, ".kaca-biru");
        if (el && !(e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) el.removeAttribute("data-sorot");
      },
      opsi,
    );
    document.addEventListener(
      "pointerdown",
      (e) => {
        const el = cari(e.target);
        if (!el) return;
        posisi(el, e, true);
        el.setAttribute("data-tekan", "");
        if (kurangiGerak.matches || el.classList.contains("kaca-biru--diam")) return;
        const riak = document.createElement("span");
        riak.className = "kaca-riak";
        riak.setAttribute("aria-hidden", "true");
        riak.addEventListener("animationend", () => riak.remove(), { once: true });
        el.append(riak);
      },
      opsi,
    );
    for (const nama of ["pointerup", "pointercancel", "dragend"]) document.addEventListener(nama, lepas, opsi);
    window.addEventListener("blur", lepas, opsi);

    return () => {
      lepasListener.abort();
      cancelAnimationFrame(antre);
    };
  }, []);

  return null;
}
