type Props = { alt?: string; className?: string };

// Kotak pengganti foto yang mengisi wadah relative: untuk item yang belum punya foto, dan sebagai latar saat foto
// gagal dimuat (alt foto itu diteruskan supaya tetap terbaca pembaca layar).
export default function FotoKosong({ alt, className = "" }: Props) {
  const label = alt === undefined ? {} : alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true };
  return (
    // Teks #636366: token mute di atas latar kotak ini tidak lolos kontras AA.
    <div {...label} className={`absolute inset-0 flex items-center justify-center bg-kosong text-sm/[1.2] text-[#636366] ${className}`}>
      Foto menyusul
    </div>
  );
}
