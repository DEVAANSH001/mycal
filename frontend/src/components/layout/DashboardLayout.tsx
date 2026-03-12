// src/components/layout/DashboardLayout.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  BookOpen,
  Clock,
  ExternalLink,
  Copy,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Event types",  href: "/dashboard",              icon: Calendar  },
  { label: "Bookings",     href: "/dashboard/bookings",     icon: BookOpen  },
  { label: "Availability", href: "/dashboard/availability", icon: Clock     },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "DU";

  return (
    <div className="flex h-screen bg-[#101010] text-white overflow-hidden">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-lg border border-[#2a2a2a] bg-[#171717] flex items-center justify-center text-white shadow-lg"
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      <div
        className={`lg:hidden fixed inset-0 z-30 bg-black/60 transition-opacity duration-200 ${
          mobileNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[220px] shrink-0 flex flex-col border-r border-[#2a2a2a] bg-[#1a1a1a] transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="lg:hidden flex items-center justify-between px-3 pt-4 pb-2 border-b border-[#1f1f1f]">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* User chip */}
        <div className="px-3 pt-4 pb-2">
          <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#1f1f1f] transition-colors group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-white truncate flex-1 text-left">
              {user?.name || "Demo User"}
            </span>
            <ChevronDown size={14} className="text-[#666] group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileNav}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[#1f1f1f] text-white font-medium"
                    : "text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-2 pb-4 space-y-0.5 border-t border-[#1f1f1f] pt-3">
          <a
            href={`/${user?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobileNav}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            <ExternalLink size={15} />
            View public page
          </a>
          <button
            onClick={() => {
              closeMobileNav();
              navigator.clipboard.writeText(
                `${window.location.origin}/${user?.username}`
              );
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            <Copy size={15} />
            Copy public page link
          </button>
         
          <button
            onClick={() => {
              closeMobileNav();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888] hover:bg-[#1a1a1a] hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}