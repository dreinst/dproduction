type Props = { alt?: string; navy?: boolean; className?: string };

// Kotak pengganti foto yang mengisi wadah relative: untuk item yang belum punya foto, dan sebagai latar saat foto
// gagal dimuat (alt foto itu diteruskan supaya tetap terbaca pembaca layar). Dengan navy kotaknya navy polos tanpa
// tulisan, untuk pengganti foto yang ditimpa teks putih.
export default function FotoKosong({ alt, navy = false, className = "" }: Props) {
  const label = alt === undefined ? {} : alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true };
  return (
    // Teks #636366: token mute di atas latar kotak ini tidak lolos kontras AA.
    <div
      {...label}
      className={`absolute inset-0 flex items-center justify-center text-sm/[1.2] ${navy ? "bg-navy" : "bg-kosong text-[#636366]"} ${className}`}
    >
      {!navy && "Foto menyusul"}
    </div>
  );
}
