import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "D'Production",
    template: "%s | D'Production",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans min-h-screen flex flex-col bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
