import type { ReactNode } from "react";

type Props = {
  label?: string;
  judul: ReactNode;
  keterangan?: ReactNode;
  // Untuk section berlatar navy (teks putih).
  navy?: boolean;
  // id judul, untuk aria-labelledby di <section>.
  id?: string;
  className?: string;
};

// Kepala section: label kecil, judul h2, dan keterangan. Jarak ke isi section diberikan pemakainya (mt-kepala).
export default function KepalaSection({ label, judul, keterangan, navy = false, id, className = "" }: Props) {
  return (
    <div className={`flex max-w-[820px] flex-col gap-3.5 ${className}`}>
      {label && <p className={`text-eyebrow ${navy ? "text-white/72" : "text-merah"}`}>{label}</p>}
      <h2 id={id} className={`text-h2 ${navy ? "text-white" : "text-ink"}`}>
        {judul}
      </h2>
      {keterangan && <p className={`max-w-[640px] text-sub ${navy ? "text-white/72" : "text-mute"}`}>{keterangan}</p>}
    </div>
  );
}
