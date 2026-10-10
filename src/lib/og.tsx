// Khusus server: pembuat gambar Open Graph untuk berkas opengraph-image.tsx tiap folder halaman publik.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/jpeg";

// Gambar OG 1200 x 630: foto acara dari public/, lapisan navy, label kecil, dan judul.
// ImageResponse menghasilkan PNG; untuk gambar berfoto ukurannya di atas 1 MB, jadi diubah ke JPEG lewat sharp.
// photo: path JPEG relatif terhadap public/, tanpa garis miring di depan. Berkas yang tidak ada menggagalkan build.
export async function renderOg({ eyebrow, title, photo }: { eyebrow: string; title: string; photo: string }) {
  const file = await readFile(join(process.cwd(), "public", photo));
  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/jpeg;base64,${file.toString("base64")}`}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: "linear-gradient(180deg, rgba(11,33,68,0.55) 0%, rgba(11,33,68,0.94) 100%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 72, width: "100%", height: "100%" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>{eyebrow}</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 18 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.88)", marginTop: 28 }}>www.dpro.events</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": OG_CONTENT_TYPE } });
}
