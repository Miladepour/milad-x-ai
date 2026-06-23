"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  LogOut,
  Megaphone,
  Menu,
  PlayCircle,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StudentNavIcon from "@/components/members/StudentNavIcon";
import StudentPremiumNavCard from "@/components/members/StudentPremiumNavCard";
import NotificationBell from "@/components/notifications/NotificationBell";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import NotificationToasts from "@/components/notifications/NotificationToasts";
import {
  learnAnnouncementsPath,
  learnCertificatesPath,
  learnClubCardPath,
  learnPath,
  learnProfilePath,
  learnProgramsPath,
  learnResourcesPath,
  learnSupportPath,
  learnUpcomingCoursesPath,
} from "@/lib/members/paths";
import { localizedPath } from "@/lib/i18n/paths";
import type { UrlLocale } from "@/lib/i18n/config";
import type { MembershipTier, MembershipTierInfo } from "@/lib/members/membership-tier";

export interface StudentNavLabels {
  overview: string;
  myPrograms: string;
  certificates: string;
  announcements: string;
  upcomingCourses: string;
  resources: string;
  profile: string;
  clubCard: string;
  support: string;
  viewProfile: string;
  studentId: string;
  backToSite: string;
  signOut: string;
  menu: string;
  closeMenu: string;
  portalTitle: string;
}

export interface StudentContinueWatching {
  href: string;
  lessonTitle: string;
  programTitle: string;
  label: string;
  cta: string;
}

interface StudentDashboardShellProps {
  locale: UrlLocale;
  studentName: string;
  studentEmail: string;
  studentNumber: string;
  labels: StudentNavLabels;
  announcementUnreadCount?: number;
  continueWatching?: StudentContinueWatching | null;
  membership?: MembershipTierInfo | null;
  membershipLabels?: {
    member: string;
    courses: string;
    next: string;
    maxTier: string;
    discountGold: string;
    discountPlatinum: string;
    discountActive: string;
    discountPerksShort: string;
    tierLabels: Record<MembershipTier, string>;
  };
  children: React.ReactNode;
}

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export default function StudentDashboardShell(props: StudentDashboardShellProps) {
  return (
    <NotificationProvider>
      <StudentDashboardShellInner {...props} />
      <NotificationToasts />
    </NotificationProvider>
  );
}

function profileInitials(fullName: string, email: string): string {
  const source = fullName.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function StudentDashboardShellInner({
  locale,
  studentName,
  studentEmail,
  studentNumber,
  labels,
  announcementUnreadCount = 0,
  continueWatching,
  membership,
  membershipLabels,
  children,
}: StudentDashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardHref = learnPath(locale);
  const announcementsHref = learnAnnouncementsPath(locale);
  const programsHref = learnProgramsPath(locale);
  const certificatesHref = learnCertificatesPath(locale);
  const coursesHref = learnUpcomingCoursesPath(locale);
  const resourcesHref = learnResourcesPath(locale);
  const profileHref = learnProfilePath(locale);
  const clubCardHref = learnClubCardPath(locale);
  const supportHref = learnSupportPath(locale);
  const profileInitialsLabel = profileInitials(studentName, studentEmail);

  function pathMatches(href: string) {
    return pathname === href || pathname === `${href}/`;
  }

  const isOnDashboard = pathMatches(dashboardHref);
  const isOnAnnouncements = pathMatches(announcementsHref);
  const isOnPrograms = pathMatches(programsHref);
  const isOnCertificates = pathMatches(certificatesHref);
  const isOnCourses = pathMatches(coursesHref);
  const isOnResources = pathMatches(resourcesHref);
  const isOnProfile = pathMatches(profileHref);
  const isOnClubCard = pathMatches(clubCardHref);
  const isOnSupport = pathMatches(supportHref);
  const isOnPortalSection =
    isOnAnnouncements ||
    isOnPrograms ||
    isOnCertificates ||
    isOnCourses ||
    isOnResources ||
    isOnProfile ||
    isOnClubCard ||
    isOnSupport;
  const inProgram =
    pathname.includes("/learn/") && !isOnDashboard && !isOnPortalSection;

  const navItems: NavItem[] = [
    { id: "overview", label: labels.overview, href: dashboardHref, icon: LayoutDashboard },
    { id: "programs", label: labels.myPrograms, href: programsHref, icon: BookOpen },
    {
      id: "certificates",
      label: labels.certificates,
      href: certificatesHref,
      icon: Award,
    },
    {
      id: "announcements",
      label: labels.announcements,
      href: announcementsHref,
      icon: Megaphone,
    },
    {
      id: "courses",
      label: labels.upcomingCourses,
      href: coursesHref,
      icon: CalendarDays,
    },
    { id: "resources", label: labels.resources, href: resourcesHref, icon: Link2 },
    { id: "support", label: labels.support, href: supportHref, icon: LifeBuoy },
    { id: "profile", label: labels.profile, href: profileHref, icon: User },
    { id: "clubCard", label: labels.clubCard, href: clubCardHref, icon: CreditCard },
  ];

  function isActive(item: NavItem) {
    if (item.id === "overview") return isOnDashboard;
    if (item.id === "announcements") return isOnAnnouncements;
    if (item.id === "programs") return isOnPrograms || inProgram;
    if (item.id === "certificates") return isOnCertificates;
    if (item.id === "courses") return isOnCourses;
    if (item.id === "resources") return isOnResources;
    if (item.id === "support") return isOnSupport;
    if (item.id === "profile") return isOnProfile;
    if (item.id === "clubCard") return isOnClubCard;
    return false;
  }

  function navRowClass(active: boolean) {
    return `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-dm text-sm transition-all ${
      active
        ? "bg-orange/15 text-orange shadow-[inset_0_0_0_1px_rgba(255,92,0,0.25)]"
        : "text-cream/65 hover:bg-white/[0.05] hover:text-cream"
    }`;
  }

  function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
    const active = isActive(item);
    const Icon = item.icon;
    const badge = item.id === "announcements" ? announcementUnreadCount : 0;
    return (
      <Link href={item.href} onClick={onNavigate} className={navRowClass(active)}>
        <StudentNavIcon icon={Icon} active={active} />
        <span className="flex-1 truncate">{item.label}</span>
        {badge > 0 && (
          <span className="rounded-full bg-orange/20 px-2 py-0.5 font-mono text-[10px] text-orange">
            {badge}
          </span>
        )}
      </Link>
    );
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = localizedPath("/", locale);
  }

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-white/[0.08] px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={profileHref}
            onClick={() => setMenuOpen(false)}
            className="group min-w-0 flex flex-1 items-center gap-3 rounded-xl transition-colors hover:bg-white/[0.04]"
            aria-label={labels.viewProfile}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange/35 bg-orange/15 font-dm text-sm font-semibold text-orange transition-colors group-hover:border-orange/55"
              aria-hidden
            >
              {profileInitialsLabel}
            </span>
            <span className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange">
                {labels.portalTitle}
              </p>
              <p className="mt-1 truncate font-dm text-sm font-medium text-cream group-hover:text-orange">
                {studentName}
              </p>
              {studentNumber ? (
                <p className="mt-2.5 border-t border-white/[0.08] pt-2 font-mono text-xs text-orange">
                  {labels.studentId}:{" "}
                  <span className="font-semibold tracking-wider">{studentNumber}</span>
                </p>
              ) : null}
            </span>
          </Link>
          <NotificationBell />
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {continueWatching && (
          <Link
            href={continueWatching.href}
            onClick={() => setMenuOpen(false)}
            className="group mb-3 block rounded-xl border border-orange/35 bg-gradient-to-br from-orange/15 to-orange/5 p-3 transition-colors hover:border-orange/55 hover:from-orange/20 hover:to-orange/10"
          >
            <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-orange">
              <PlayCircle className="h-3.5 w-3.5" strokeWidth={2} />
              {continueWatching.label}
            </p>
            <p className="mt-1.5 line-clamp-2 font-dm text-sm font-semibold leading-snug text-cream">
              {continueWatching.lessonTitle}
            </p>
            <p className="mt-1 line-clamp-1 font-dm text-xs text-cream/55">
              {continueWatching.programTitle}
            </p>
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-orange px-3.5 py-2 font-mono text-xs uppercase tracking-widest text-background">
              <PlayCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
              {continueWatching.cta}
            </span>
          </Link>
        )}
        {navItems.map((item) => (
          <NavLink key={item.id} item={item} onNavigate={() => setMenuOpen(false)} />
        ))}

        {membership && membershipLabels && (
          <StudentPremiumNavCard
            href={clubCardHref}
            onNavigate={() => setMenuOpen(false)}
            info={membership}
            labels={{
              member: membershipLabels.member,
              courses: membershipLabels.courses,
              next: membershipLabels.next,
              maxTier: membershipLabels.maxTier,
              discountGold: membershipLabels.discountGold,
              discountPlatinum: membershipLabels.discountPlatinum,
              discountActive: membershipLabels.discountActive,
              discountPerksShort: membershipLabels.discountPerksShort,
            }}
            tierLabels={membershipLabels.tierLabels}
          />
        )}

        <div className="my-2 border-t border-white/[0.08]" aria-hidden />

        <Link
          href={localizedPath("/", locale)}
          onClick={() => setMenuOpen(false)}
          className={navRowClass(false)}
        >
          <StudentNavIcon icon={ArrowLeft} />
          <span className="truncate">{labels.backToSite}</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            void handleSignOut();
          }}
          className={navRowClass(false)}
        >
          <StudentNavIcon icon={LogOut} />
          <span className="truncate">{labels.signOut}</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="bg-background text-cream">
      <div className="sticky top-20 z-40 flex items-center justify-between border-b border-white/[0.06] bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="student-glass-pill flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-cream"
          aria-label={labels.menu}
        >
          <Menu className="h-4 w-4" strokeWidth={1.75} />
          {labels.menu}
        </button>
        <Link
          href={profileHref}
          onClick={() => setMenuOpen(false)}
          className="flex min-w-0 flex-col items-end gap-0.5"
        >
          <span className="flex min-w-0 items-center gap-2">
            {membership && membershipLabels && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                  membership.tier === "platinum"
                    ? "bg-gradient-to-r from-violet-400/30 to-cyan-300/30 text-violet-200"
                    : membership.tier === "gold"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-slate-400/20 text-slate-300"
                }`}
              >
                {membershipLabels.tierLabels[membership.tier]}
              </span>
            )}
            <span className="truncate font-dm text-sm font-medium text-cream transition-colors hover:text-orange">
              {studentName}
            </span>
          </span>
          {studentNumber ? (
            <span className="truncate font-mono text-xs text-orange">
              {labels.studentId}:{" "}
              <span className="font-semibold tracking-wider">{studentNumber}</span>
            </span>
          ) : null}
        </Link>
        <NotificationBell />
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
          className={`student-glass fixed left-0 top-20 z-50 flex h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] w-[min(100vw-2rem,18rem)] flex-col overflow-hidden !rounded-none !p-0 shadow-2xl transition-transform duration-300 sm:left-4 sm:top-24 sm:h-[calc(100dvh-6rem)] sm:max-h-[calc(100dvh-6rem)] sm:!rounded-2xl lg:static lg:z-auto lg:h-auto lg:max-h-none lg:w-60 lg:shrink-0 lg:translate-x-0 lg:!p-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3 lg:hidden">
            <span className="font-dm text-sm font-medium text-cream">{labels.menu}</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-cream/60 transition-colors hover:bg-white/[0.06] hover:text-cream"
              aria-label={labels.closeMenu}
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{sidebar}</div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
