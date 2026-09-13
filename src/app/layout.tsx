import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import ConditionalLayout from "@/components/ConditionalLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });

export const metadata: Metadata = {
  title: "D'Production - Event Organizer Profesional",
  description: "D'Production adalah Event Organizer terbaik yang siap membantu merancang, mengelola, dan menyukseskan acara Anda dengan konsep kreatif, layanan profesional, serta transparan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans min-h-screen flex flex-col bg-slate-50`}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
