import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  whatsapp: z.string().min(1, "WhatsApp number is required"),
  eventType: z.string().min(1, "Event type is required"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, whatsapp, eventType, message } = parsed.data;

    // Save to Prisma Client table
    const newClient = await prisma.client.create({
      data: {
        name,
        whatsapp,
        eventType,
        message,
      }
    });

    console.log("Contact form submission saved:", newClient);

    return NextResponse.json(
      { success: true, message: "Pesan berhasil dikirim!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses pesan." },
      { status: 500 }
    );
  }
}
