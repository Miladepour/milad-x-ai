"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MemberSignOutButton from "@/components/members/MemberSignOutButton";
import { learnPath } from "@/lib/members/paths";
import { localizedPath } from "@/lib/i18n/paths";
import type { UrlLocale } from "@/lib/i18n/config";

export interface StudentNavLabels {
  overview: string;
  myPrograms: string;
  announcements: string;
  upcomingCourses: string;
  resources: string;
  backToSite: string;
  signOut: string;
  menu: string;
  closeMenu: string;
  portalTitle: string;
}

interface StudentDashboardShellProps {
  locale: UrlLocale;
  studentName: string;
  labels: StudentNavLabels;
  children: React.ReactNode;
}

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

export default function StudentDashboardShell({
  locale,
  studentName,
  labels,
  children,
}: StudentDashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardHref = learnPath(locale);
  const isOnDashboard = pathname === dashboardHref || pathname === `${dashboardHref}/`;
  const inProgram = pathname.includes("/learn/") && !isOnDashboard;

  const navItems: NavItem[] = [
    { id: "overview", label: labels.overview, href: dashboardHref, icon: "⌂" },
    { id: "programs", label: labels.myPrograms, href: `${dashboardHref}#my-programs`, icon: "▦" },
    {
      id: "announcements",
      label: labels.announcements,
      href: `${dashboardHref}#announcements`,
      icon: "◉",
    },
    {
      id: "courses",
      label: labels.upcomingCourses,
      href: `${dashboardHref}#upcoming-courses`,
      icon: "◷",
    },
    { id: "resources", label: labels.resources, href: `${dashboardHref}#resources`, icon: "↗" },
  ];

  function isActive(item: NavItem) {
    if (item.id === "overview") return isOnDashboard;
    if (item.id === "programs" && inProgram) return true;
    return false;
  }

  function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
    const active = isActive(item);
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-dm text-sm transition-all ${
          active
            ? "bg-orange/15 text-orange shadow-[inset_0_0_0_1px_rgba(255,92,0,0.25)]"
            : "text-cream/65 hover:bg-white/[0.05] hover:text-cream"
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm ${
            active ? "bg-orange/20 text-orange" : "bg-white/[0.06] text-cream/50"
          }`}
          aria-hidden
        >
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.08] px-4 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange">
          {labels.portalTitle}
        </p>
        <p className="mt-1 truncate font-dm text-sm font-medium text-cream">{studentName}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.id} item={item} onNavigate={() => setMenuOpen(false)} />
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/[0.08] px-3 py-4">
        <Link
          href={localizedPath("/", locale)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-dm text-sm text-cream/65 transition-colors hover:bg-white/[0.05] hover:text-cream"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] font-mono text-sm text-cream/50">
            ←
          </span>
          {labels.backToSite}
        </Link>
        <MemberSignOutButton label={labels.signOut} variant="sidebar" />
      </div>
    </div>
  );

  return (
    <div className="bg-background text-cream">
      <div className="sticky top-20 z-40 flex items-center justify-between border-b border-white/[0.06] bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="student-glass-pill px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-cream"
          aria-label={labels.menu}
        >
          ☰ {labels.menu}
        </button>
        <p className="truncate font-dm text-sm font-medium text-cream">{labels.portalTitle}</p>
        <div className="w-[72px]" />
      </div>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 top-20 z-40 bg-background/85 backdrop-blur-sm lg:hidden"
          aria-label={labels.closeMenu}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="mx-auto flex w-full max-w-[1440px] gap-4 px-4 py-6 sm:gap-6 sm:px-6 lg:py-8">
        <aside
          className={`student-glass fixed bottom-0 left-0 top-20 z-50 w-[min(100vw-2rem,18rem)] !rounded-none !p-0 shadow-2xl transition-transform duration-300 sm:left-4 sm:top-24 sm:!rounded-2xl lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:!p-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 lg:hidden">
            <span className="font-dm text-sm font-medium text-cream">{labels.menu}</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-1 text-cream/60 hover:bg-white/[0.06]"
            >
              ✕
            </button>
          </div>
          {sidebar}
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
