"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BookOpen,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Menu,
  PenLine,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import StudentNavIcon from "@/components/members/StudentNavIcon";
import NotificationBell from "@/components/notifications/NotificationBell";
import { ADMIN_DASHBOARD_BANNER_URL } from "@/lib/admin/dashboard-constants";
import type { AppNotification } from "@/lib/notifications/types";

export type AdminTab =
  | "overview"
  | "blog"
  | "contact"
  | "audience"
  | "courses"
  | "programs"
  | "students";

interface NavItem {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface AdminShellProps {
  adminEmail: string;
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onRefresh: () => void;
  onSignOut: () => void;
  isRefreshing?: boolean;
  children: React.ReactNode;
  navBadges?: Partial<Record<AdminTab, number>>;
  onNotificationClick?: (notification: AppNotification) => void;
}

export default function AdminShell({
  adminEmail,
  tab,
  onTabChange,
  onRefresh,
  onSignOut,
  isRefreshing,
  children,
  navBadges = {},
  onNotificationClick,
}: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = adminEmail
    ? adminEmail.slice(0, 2).toUpperCase()
    : "MX";

  const navItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: GraduationCap, badge: navBadges.students },
    { id: "programs", label: "Member programs", icon: BookOpen },
    { id: "courses", label: "Public courses", icon: Globe },
    { id: "blog", label: "Blog", icon: PenLine, badge: navBadges.blog },
    { id: "contact", label: "Contact inbox", icon: Mail, badge: navBadges.contact },
    { id: "audience", label: "Audience", icon: Users, badge: navBadges.audience },
  ];

  function NavButton({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
    const active = tab === item.id;
    return (
      <button
        type="button"
        onClick={() => {
          onTabChange(item.id);
          onNavigate?.();
        }}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-dm text-sm transition-all ${
          active
            ? "bg-orange/15 text-orange shadow-[inset_0_0_0_1px_rgba(255,92,0,0.25)]"
            : "text-cream/65 hover:bg-white/[0.05] hover:text-cream"
        }`}
      >
        <StudentNavIcon icon={item.icon} active={active} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge != null && item.badge > 0 && (
          <span className="rounded-full bg-orange/20 px-2 py-0.5 font-mono text-[10px] text-orange">
            {item.badge}
          </span>
        )}
      </button>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.08] px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange">
              MX Console
            </p>
            <p className="mt-1 truncate font-dm text-sm text-cream/80">{adminEmail}</p>
          </div>
          <NotificationBell onNotificationClick={onNotificationClick} />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavButton key={item.id} item={item} onNavigate={() => setMenuOpen(false)} />
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/[0.08] px-3 py-4">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full rounded-xl border border-white/[0.1] px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-cream/70 transition-colors hover:border-orange hover:text-orange disabled:opacity-50"
        >
          {isRefreshing ? "Refreshing…" : "Refresh data"}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-xl border border-white/[0.1] px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-cream/70 transition-colors hover:border-red-400/50 hover:text-red-300"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-cream">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="student-glass-pill flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-widest"
        >
          <Menu className="h-4 w-4" strokeWidth={1.75} />
          Menu
        </button>
        <p className="font-dm text-sm font-medium">Admin console</p>
        <div className="flex items-center gap-2">
          <NotificationBell onNotificationClick={onNotificationClick} />
          <div className="h-9 w-9 rounded-full border border-orange/50 bg-surface/80 text-center font-dm text-xs leading-9">
            {initials}
          </div>
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/85 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="mx-auto flex w-full max-w-[1500px] gap-4 px-4 py-6 sm:gap-6 sm:px-6 lg:py-8">
        <aside
          className={`student-glass fixed bottom-0 left-0 top-0 z-50 w-[min(100vw-2rem,18rem)] !rounded-none !p-0 shadow-2xl transition-transform duration-300 sm:left-4 sm:top-4 sm:!rounded-2xl lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 lg:hidden">
            <span className="font-dm text-sm">Navigation</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-cream/60 transition-colors hover:bg-white/[0.06] hover:text-cream"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          {sidebar}
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <section className="relative min-h-[160px] overflow-hidden rounded-3xl sm:min-h-[200px]">
            <Image
              src={ADMIN_DASHBOARD_BANNER_URL}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1500px) 100vw, 1500px"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/60 to-background/30" />
            <div className="relative z-10 flex h-full min-h-[160px] flex-col justify-between p-5 sm:min-h-[200px] sm:flex-row sm:items-end sm:p-7">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                  Private console
                </p>
                <h1 className="mt-2 font-dm text-2xl font-semibold text-cream sm:text-3xl">
                  Admin panel
                </h1>
                <p className="mt-1 font-dm text-sm text-cream/60">{adminEmail}</p>
              </div>
              <div className="mt-4 flex items-center gap-3 self-end sm:mt-0">
                <div className="lg:hidden">
                  <NotificationBell onNotificationClick={onNotificationClick} />
                </div>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-orange/70 bg-surface/80 font-dm text-sm font-semibold shadow-[0_0_24px_rgba(255,92,0,0.2)] backdrop-blur-md sm:h-14 sm:w-14"
                  title={adminEmail}
                >
                  {initials}
                </div>
              </div>
            </div>
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}
