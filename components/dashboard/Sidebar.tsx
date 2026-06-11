"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { href: "/dashboard", label: "Workspaces", icon: LayoutDashboard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col bg-ink-soft">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-paper/[0.07] px-4">
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gradient-to-br from-gold/20 to-transparent">
          <span className="absolute inset-0 rounded-lg bg-gold/10 blur-md" />
          <svg viewBox="0 0 24 24" className="relative h-3.5 w-3.5 text-gold" fill="none">
            <path
              d="M12 2.5v19M5 6.5l14 11M5 17.5l14-11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="font-display text-base tracking-tight text-paper">LumiDoc</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                active
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-paper-faint hover:bg-paper/[0.05] hover:text-paper-dim border border-transparent"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-paper/[0.07] p-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-paper/[0.06] bg-ink-raised/60 px-3 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-xs font-semibold text-gold">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-paper">
              {user.displayName ?? user.email}
            </p>
            {user.displayName && <p className="truncate text-xs text-paper-faint">{user.email}</p>}
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="shrink-0 rounded-lg p-1 text-paper-faint transition hover:bg-paper/[0.06] hover:text-paper-dim"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-paper/[0.07] lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-paper/10 bg-ink-soft p-2 text-paper-dim lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-56 border-r border-paper/[0.07]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1 text-paper-faint hover:text-paper-dim"
            >
              <X className="size-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
