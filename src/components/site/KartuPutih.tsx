import type { ComponentProps } from "react";

type Props = ComponentProps<"div"> & { besar?: boolean };

// Kartu putih tanpa bayangan (kartu langkah, kartu layanan). Radius 28, atau 32 dengan besar. Setinggi wadahnya
// supaya kartu yang sejajar sama tinggi. Padding dan celah diberikan pemakainya.
export default function KartuPutih({ besar = false, className = "", ...props }: Props) {
  return (
    <div {...props} className={`flex h-full flex-col overflow-hidden bg-white ${besar ? "rounded-besar" : "rounded-kartu"} ${className}`} />
  );
}
