import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-slate-50`}>
        <Navbar />
        <main className="flex-grow pt-24 pb-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
