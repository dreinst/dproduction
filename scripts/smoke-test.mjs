// Uji asap untuk server yang sudah jalan: node scripts/smoke-test.mjs (BASE_URL default http://localhost:3000).
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// POST kontak menulis lead ke database, jadi jangan sampai mengenai produksi.
if (!["localhost", "127.0.0.1"].includes(new URL(BASE_URL).hostname)) {
  console.error(`BASE_URL ${BASE_URL} bukan localhost. Smoke test hanya untuk server lokal atau CI.`);
  process.exit(1);
}

function postContact(body) {
  return fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const checks = [
  ["GET / 200 dan memuat h1", async () => {
    const res = await fetch(`${BASE_URL}/`);
    return res.status === 200 && /<h1[\s>]/.test(await res.text());
  }],
  ["GET /robots.txt 200", async () => {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    return res.status === 200 && (await res.text()).includes("Sitemap:");
  }],
  ["GET /sitemap.xml 200", async () => {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    return res.status === 200 && (await res.text()).includes("<urlset");
  }],
  ["GET /opengraph-image 200 image/png", async () => {
    const res = await fetch(`${BASE_URL}/opengraph-image`);
    await res.arrayBuffer();
    return res.status === 200 && res.headers.get("content-type")?.startsWith("image/png");
  }],
  ["GET /api/health 200 ok:true", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.status === 200 && (await res.json()).ok === true;
  }],
  ["POST /api/contact valid 201", async () => {
    const res = await postContact({
      name: "Smoke Test CI",
      whatsapp: "081234567890",
      eventType: "corporate",
      message: "Pesan uji otomatis dari smoke test.",
    });
    await res.arrayBuffer();
    return res.status === 201;
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
