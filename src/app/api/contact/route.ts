import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Here you would typically process the data, e.g. save to database or send an email.
    // For now, we just log it and return a success response.
    console.log("Contact form submission received:", { name, email, subject, message });

    return NextResponse.json(
      { success: true, message: "Pesan berhasil dikirim!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses pesan." },
      { status: 500 }
    );
  }
}
