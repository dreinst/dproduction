"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  onInput?: () => void;
  busy?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  // "drawer" menempel di kanan layar (lembar bawah di layar sempit) dan mengabaikan size.
  variant?: "dialog" | "drawer";
};

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal(props: ModalProps) {
  return props.open ? <ModalDialog {...props} /> : null;
}

function ModalDialog({
  title,
  onClose,
  children,
  footer,
  onSubmit,
  onInput,
  busy = false,
  size = "md",
  variant = "dialog",
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    // Fokus awal hanya ke isian di body; modal tanpa isian (detail, konfirmasi) memfokuskan dialog, bukan tombol Hapus.
    const first = dialog?.querySelector<HTMLElement>(`[data-modal-body] :is(${FOCUSABLE})`) ?? dialog;
    first?.focus();
    return () => {
      // Pemicu bisa sudah hilang (baris dihapus atau pindah tab); jatuhkan fokus ke konten utama, bukan ke body.
      if (trigger?.isConnected) trigger.focus();
      else document.getElementById("konten")?.focus();
    };
  }, []);

  // Pesan error dari halaman dirender di atas body yang bisa digulir; tarik ke layar saat muncul.
  useEffect(() => {
    const body = dialogRef.current?.querySelector("[data-modal-body]");
    if (!body) return;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const alert = node.matches('[role="alert"]') ? node : node.querySelector('[role="alert"]');
          if (alert) return alert.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    });
    observer.observe(body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Dipasang di document karena fokus bisa lepas ke body saat tombol yang sedang difokus menjadi disabled.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (e.key === "Escape") {
        if (!busy) onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!dialog.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  const close = () => {
    if (!busy) onClose();
  };

  const content = (
    <>
      <div data-modal-body className="adm-panel__body">
        {children}
      </div>
      {footer && (
        <div data-modal-footer className="adm-panel__foot">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div
      className={variant === "drawer" ? "adm-scrim" : "adm-scrim adm-scrim--center"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`adm-glass adm-panel focus:outline-hidden ${variant === "drawer" ? "adm-drawer" : `adm-dialog ${SIZES[size]}`}`}
      >
        <div className="adm-panel__head">
          <h2 id={titleId} className="adm-panel__title">
            {title}
          </h2>
          <button type="button" onClick={close} disabled={busy} className="adm-btn adm-btn--sm adm-btn--outline">
            Tutup
          </button>
        </div>
        {onSubmit ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onInput={onInput}
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) onSubmit(e);
            }}
          >
            {content}
          </form>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
