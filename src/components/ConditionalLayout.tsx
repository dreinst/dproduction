"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    // Jika user mengakses halaman public (selain admin), hapus sesi login (harus login ulang)
    if (!isAdmin) {
      document.cookie = "dpro_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 pb-12">{children}</main>
      <Footer />
    </>
  );
}
