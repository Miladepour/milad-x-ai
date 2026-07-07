"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import StudentAuthShell from "@/components/members/StudentAuthShell";
import {
  accountForgotPasswordPath,
  studentDeviceBootstrapUrl,
} from "@/lib/members/paths";
import { createClient } from "@/lib/supabase/client";
import { translations } from "@/lib/i18n/translations";

const t = translations.EN.memberPortal;

interface SetPasswordFormProps {
  redirectTo: string;
}

export default function SetPasswordForm({ redirectTo }: SetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifyStudentSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setStatus(t.setPasswordExpired);
          setCheckingSession(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut({ scope: "local" });
        if (!cancelled) {
          setStatus(
            "This account is not enrolled as a student. Use the link from your invite email."
          );
          setCheckingSession(false);
        }
        return;
      }

      if (!cancelled) {
        setCanSubmit(true);
        setCheckingSession(false);
      }
    }

    void verifyStudentSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
      data: { password_set_at: new Date().toISOString() },
    });

    if (error) {
      setStatus(error.message);
      setLoading(false);
      return;
    }

    window.location.href = studentDeviceBootstrapUrl(redirectTo);
  }

  return (
    <StudentAuthShell englishOnly>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-orange/40 bg-orange/10">
            <Lock className="h-5 w-5 text-orange" strokeWidth={1.75} aria-hidden />
          </div>
          <h1 className="font-dm text-3xl font-semibold tracking-tight text-cream">
            {t.setPasswordTitle}
          </h1>
          <p className="mt-2 font-dm text-sm leading-relaxed text-cream/55">
            {t.setPasswordSubtitle}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {t.newPassword}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-field"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={!canSubmit || checkingSession}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {t.confirmPassword}
            </span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="form-field"
              autoComplete="new-password"
              required
              disabled={!canSubmit || checkingSession}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit || checkingSession}
          className="w-full bg-orange px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:opacity-50"
        >
          {loading ? "…" : t.savePassword}
        </button>

        {status && (
          <p className="font-dm text-sm leading-relaxed text-orange" role="alert">
            {status}
          </p>
        )}

        {!canSubmit && !checkingSession && (
          <p className="border-t border-surface pt-5 font-dm text-xs leading-relaxed text-cream/45">
            <Link href={accountForgotPasswordPath()} className="text-orange hover:underline">
              {t.forgotPasswordLink}
            </Link>
          </p>
        )}
      </form>
    </StudentAuthShell>
  );
}
