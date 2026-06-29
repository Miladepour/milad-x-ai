"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, Lock } from "lucide-react";
import { accountLoginPath, learnPath } from "@/lib/members/paths";
import { useStudentNavAuth } from "@/lib/members/use-student-nav-auth";
import type { UrlLocale } from "@/lib/i18n/config";

const studentLoginButtonClass =
  "inline-flex items-center justify-center gap-2 border-2 border-orange bg-orange px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-background transition-colors hover:bg-orange-dim hover:border-orange-dim";

interface StudentNavButtonProps {
  urlLocale: UrlLocale;
  active: boolean;
  loginLabel: string;
  loginAria: string;
  dashboardLabel: string;
  dashboardAria: string;
  className?: string;
  onNavigate?: () => void;
}

export default function StudentNavButton({
  urlLocale,
  active,
  loginLabel,
  loginAria,
  dashboardLabel,
  dashboardAria,
  className = "",
  onNavigate,
}: StudentNavButtonProps) {
  const [mounted, setMounted] = useState(false);
  const isStudent = useStudentNavAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showDashboard = mounted && isStudent === true;
  const href = showDashboard ? learnPath(urlLocale) : accountLoginPath(urlLocale);
  const label = showDashboard ? dashboardLabel : loginLabel;
  const ariaLabel = showDashboard ? dashboardAria : loginAria;
  const Icon = showDashboard ? LayoutDashboard : Lock;

  return (
    <Link
      href={href}
      className={`${studentLoginButtonClass} ${active ? "ring-2 ring-cream ring-offset-2 ring-offset-background" : ""} ${className}`}
      aria-label={ariaLabel}
      onClick={onNavigate}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </Link>
  );
}
