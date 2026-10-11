// Uji asap untuk server yang sudah jalan: node scripts/smoke-test.mjs (BASE_URL default http://localhost:3000).
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// POST kontak menulis lead ke database, jadi jangan sampai mengenai produksi.
if (!["localhost", "127.0.0.1"].includes(new URL(BASE_URL).hostname)) {
  console.error(`BASE_URL ${BASE_URL} bukan localhost. Smoke test hanya untuk server lokal atau CI.`);
  process.exit(1);
}

// Alamat IP berbeda tiap kali skrip dijalankan, supaya batas 5 kiriman per 10 menit per IP tidak menggagalkan uji ulang.
const runIp = `smoke-${Date.now().toString(36)}`;

function postContact(body) {
  return fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-real-ip": runIp },
    body: JSON.stringify(body),
  });
}

const lead = { name: "Smoke Test CI", whatsapp: "081234567890", eventType: "corporate" };

const PAGES_PUBLIK = ["/", "/layanan", "/portofolio", "/katalog", "/tentang"];
const PAGES_LEGAL = ["/privasi", "/syarat", "/hapus-data"];
const PAGES = [...PAGES_PUBLIK, ...PAGES_LEGAL];

const checks = [
  ...PAGES.map((path) => [`GET ${path} 200 dan memuat h1`, async () => {
    const res = await fetch(`${BASE_URL}${path}`);
    return res.status === 200 && /<h1[\s>]/.test(await res.text());
  }]),
  // Host selain www.dpro.events (localhost, sslip.io, vercel.app) tidak boleh diindeks.
  ["GET / di localhost membawa X-Robots-Tag noindex", async () => {
    const res = await fetch(`${BASE_URL}/`);
    await res.arrayBuffer();
    return res.headers.get("x-robots-tag") === "noindex";
  }],
  ["GET /robots.txt 200", async () => {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    return res.status === 200 && (await res.text()).includes("Sitemap:");
  }],
  ["GET /sitemap.xml 200 dan memuat delapan halaman publik", async () => {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    const paths = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
    return res.status === 200 && paths.length === PAGES.length && PAGES.every((path) => paths.includes(path));
  }],
  // Path gambar OG diambil dari meta og:image, karena Next memberi sufiks hash kalau file ada di route group.
  ...PAGES.map((path) => [`og:image di ${path} 200 image/jpeg`, async () => {
    const html = await (await fetch(`${BASE_URL}${path}`)).text();
    const content = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    if (!content) return false;
    const { pathname, search } = new URL(content.replaceAll("&amp;", "&"), BASE_URL);
    const res = await fetch(`${BASE_URL}${pathname}${search}`);
    await res.arrayBuffer();
    return res.status === 200 && res.headers.get("content-type")?.startsWith("image/jpeg");
  }]),
  ["GET /api/health 200 ok:true", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.status === 200 && (await res.json()).ok === true;
  }],
  // Dipakai form kontak untuk memastikan server terjangkau, jadi HEAD juga harus dijawab.
  ["HEAD /api/health/live 200", async () => {
    const res = await fetch(`${BASE_URL}/api/health/live`, { method: "HEAD" });
    return res.status === 200;
  }],
  // Bentuk kiriman form v2: tanpa pesan, dengan tanggal acara (di sini 30 hari dari sekarang).
  ["POST /api/contact valid tanpa pesan, dengan tanggal acara 201", async () => {
    const eventDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const res = await postContact({ ...lead, eventDate });
    await res.arrayBuffer();
    return res.status === 201;
  }],
  ["POST /api/contact tanggal acara tidak valid 400", async () => {
    const res = await postContact({ ...lead, eventDate: "2026-02-30" });
    await res.arrayBuffer();
    return res.status === 400;
  }],
  ["POST /api/contact tidak valid 400", async () => {
    const res = await postContact({ name: "", whatsapp: "", eventType: "", message: "" });
    await res.arrayBuffer();
    return res.status === 400;
  }],
];

let failed = 0;
for (const [name, run] of checks) {
  const ok = await run().catch((error) => {
    console.error(error);
    return false;
  });
  if (!ok) failed++;
  console.log(`${ok ? "LULUS" : "GAGAL"}  ${name}`);
}

if (failed) {
  console.error(`${failed} dari ${checks.length} cek gagal.`);
  process.exit(1);
}
console.log(`Semua ${checks.length} cek lulus.`);
