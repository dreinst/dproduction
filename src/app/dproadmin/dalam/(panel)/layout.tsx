import AdminShell from "@/components/management/AdminShell";
import "@/components/management/admin-v2.css";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
