import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Healthcheck database gagal:", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
