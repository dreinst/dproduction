"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Package,
  Settings,
  LogOut,
  Building2,
  Image,
  Film,
  X,
  FileText,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

interface SidebarProps {
  onClose?: () => void;
  role?: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

const allNavItems: NavItem[] = [
  { name: "Dashboard", href: "/management", icon: LayoutDashboard },
  { name: "Database", href: "/management/database", icon: FileText },
  {
    name: "Galeri",
    icon: Image,
    children: [
      { name: "Foto", href: "/management/galeri/foto" },
      { name: "Video", href: "/management/galeri/video" },
    ],
  },
  {
    name: "Master",
    icon: Package,
    children: [
      { name: "Master Foto", href: "/management/master/foto" },
      { name: "Master Event", href: "/management/master/event" },
      { name: "Master Wedding", href: "/management/master/wedding" },
      { name: "Master Rental", href: "/management/master/rental" },
      { name: "Master Grade Event", href: "/management/master/grade-event" },
      { name: "Master JobDesc", href: "/management/master/jobdesc" },
    ],
  },
  {
    name: "Setting",
    icon: Settings,
    children: [
      { name: "Kantor", href: "/management/setting/kantor" },
      { name: "Login", href: "/management/setting/login" },
      { name: "Head Home", href: "/management/setting/head-home" },
    ],
  },
  {
    name: "Workspace",
    icon: Building2,
    children: [
      { name: "Event", href: "/management/workspace/event" },
      { name: "Report", href: "/management/workspace/report" },
      { name: "Salary", href: "/management/workspace/salary" },
    ],
  },
];

export default function Sidebar({ onClose, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  // Filter nav items based on role
  const navItems = useMemo(() => {
    if (!role) return []; // hide all if no role
    
    // Shallow copy array and objects to avoid mutating global but preserve component references
    const clonedItems = allNavItems.map(item => ({
      ...item,
      children: item.children ? [...item.children] : undefined
    }));
    
    return clonedItems.filter((item) => {
      if (role === "owner") return true;
      
      if (role === "superadmin") {
        // Superadmin can see everything except Setting Login
        if (item.name === "Setting") {
          item.children = item.children?.filter(child => child.name !== "Login");
        }
        return true;
      }
      
      if (role === "admin") {
        // Admin: Master + Galeri + Workspace Event/Report
        if (["Database", "Setting"].includes(item.name)) return false;
        if (item.name === "Workspace") {
          item.children = item.children?.filter(child => child.name !== "Salary");
        }
        return true;
      }
      
      if (role === "staff" || role === "tester") {
        // Hanya Workspace Event
        if (item.name === "Dashboard") return true;
        if (item.name === "Workspace") {
          item.children = item.children?.filter(child => child.name === "Event");
          return true;
        }
        return false;
      }
      
      return false;
    });
  }, [role]);

  useEffect(() => {
    // Only re-run when pathname changes to expand the active group
    const activeGroup = navItems.find(
      (item) => item.children?.some((child) => pathname === child.href)
    );
    if (activeGroup) {
      queueMicrotask(() => {
        setExpandedMenus(prev => {
          if (!prev.includes(activeGroup.name)) {
            return [...prev, activeGroup.name];
          }
          return prev;
        });
      });
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push("/management/login");
    router.refresh();
  };

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (item: NavItem) => {
    if (item.href) return pathname === item.href;
    return item.children?.some((child) => pathname === child.href) || false;
  };

  return (
    <aside className="w-64 bg-white h-full flex flex-col border-r border-slate-200 shadow-sm">
      {/* Logo area */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <NextImage
            src="/logo-dpro.png"
            alt="D'Production Logo"
            width={44}
            height={44}
            className="rounded-xl object-contain"
          />
          <div>
            <div className="text-slate-800 font-bold text-sm tracking-tight">
              D&apos;Production
            </div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Management
            </div>
          </div>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const groupActive = isGroupActive(item);
          const isExpanded = expandedMenus.includes(item.name);

          // Simple link (no children)
          if (item.href && !item.children) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.name}
              </Link>
            );
          }

          // Expandable menu
          return (
            <div key={item.name}>
              <button
                onClick={() => toggleMenu(item.name)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  groupActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px]" />
                  {item.name}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isExpanded && item.children && (
                <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      onClick={onClose}
                      className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive(child.href)
                          ? "text-blue-700 bg-blue-50/50 font-medium"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}
