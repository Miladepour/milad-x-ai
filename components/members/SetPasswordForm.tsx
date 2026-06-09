"use client";

import { FormEvent, useState } from "react";
import { Lock } from "lucide-react";
import StudentAuthShell from "@/components/members/StudentAuthShell";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SetPasswordFormProps {
  redirectTo: string;
}

export default function SetPasswordForm({ redirectTo }: SetPasswordFormProps) {
  const t = useTranslation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus(error.message);
      setLoading(false);
      return;
    }

    window.location.href = redirectTo;
  }

  return (
    <StudentAuthShell>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-orange/40 bg-orange/10">
            <Lock className="h-5 w-5 text-orange" strokeWidth={1.75} aria-hidden />
          </div>
          <h1 className="font-dm text-3xl font-semibold tracking-tight text-cream">
            {t.memberPortal.setPasswordTitle}
          </h1>
          <p className="mt-2 font-dm text-sm leading-relaxed text-cream/55">
            {t.memberPortal.setPasswordSubtitle}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {t.memberPortal.newPassword}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-field"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {t.memberPortal.confirmPassword}
            </span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="form-field"
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:opacity-50"
        >
          {loading ? "…" : t.memberPortal.savePassword}
        </button>

        {status && (
          <p className="font-dm text-sm leading-relaxed text-orange" role="alert">
            {status}
          </p>
        )}
      </form>
    </StudentAuthShell>
  );
}
