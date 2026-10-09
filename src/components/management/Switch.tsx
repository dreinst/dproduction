"use client";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  // Nama untuk pembaca layar. Sebut datanya, misalnya "Tampilkan Dry Ice di situs", karena sakelar di tabel tidak berlabel.
  label: string;
  describedBy?: string;
  disabled?: boolean;
  // Selama perubahan disimpan: klik diabaikan tetapi sakelar tetap bisa difokus, jadi fokus papan ketik tidak hilang.
  busy?: boolean;
  title?: string;
};

export default function Switch({ checked, onChange, label, describedBy, disabled = false, busy = false, title }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      disabled={disabled}
      title={title}
      onClick={() => {
        if (!busy) onChange(!checked);
      }}
      className="adm-switch"
    />
  );
}
