"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  busy?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
};

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal(props: ModalProps) {
  return props.open ? <ModalDialog {...props} /> : null;
}

function ModalDialog({ title, onClose, children, footer, onSubmit, busy = false, size = "md" }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    // Fokus awal hanya ke isian di body; modal tanpa isian (detail, konfirmasi) memfokuskan dialog, bukan tombol Hapus.
    const first = dialog?.querySelector<HTMLElement>(`[data-modal-body] :is(${FOCUSABLE})`) ?? dialog;
    first?.focus();
    return () => {
      if (trigger?.isConnected) trigger.focus();
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
      <div data-modal-body className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {children}
      </div>
      {footer && (
        <div data-modal-footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
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
        className={`flex max-h-[90dvh] w-full ${SIZES[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl focus:outline-none`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h2 id={titleId} className="text-lg font-bold text-slate-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="Tutup"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {onSubmit ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
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
