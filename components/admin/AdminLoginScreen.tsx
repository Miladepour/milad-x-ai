"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  enrollTotpFactor,
  getMfaAssurance,
  getVerifiedTotpFactor,
  type AdminAuthStep,
  verifyTotpCode,
  verifyTotpEnrollment,
} from "@/lib/supabase/admin-mfa";

interface AdminLoginScreenProps {
  onAuthenticated: () => Promise<void>;
}

export default function AdminLoginScreen({ onAuthenticated }: AdminLoginScreenProps) {
  const [step, setStep] = useState<AdminAuthStep>("login");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [status, setStatus] = useState("");
  const [enrollQr, setEnrollQr] = useState<string | null>(null);
  const [enrollSecret, setEnrollSecret] = useState<string | null>(null);
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSessionChecked(true);
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setSessionChecked(true);
        return;
      }

      try {
        const assurance = await getMfaAssurance(supabase);
        if (assurance.needsVerification) {
          setStep("mfa_verify");
          setStatus("Enter the 6-digit code from your authenticator app.");
        } else if (!assurance.hasVerifiedTotp) {
          setStep("mfa_enroll");
          await startEnrollment();
        } else {
          await onAuthenticated();
        }
      } catch {
        await supabase.auth.signOut();
      } finally {
        setSessionChecked(true);
      }
    });
  }, [onAuthenticated]);

  async function startEnrollment() {
    setStatus("Preparing authenticator setup…");
    setLoading(true);
    try {
      const supabase = createClient();
      const data = await enrollTotpFactor(supabase);
      setEnrollFactorId(data.id);
      setEnrollQr(data.totp.qr_code);
      setEnrollSecret(data.totp.secret);
      setStatus("Scan the QR code with Google Authenticator, 1Password, or Authy.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not start MFA setup");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured()) {
      setStatus(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
      );
      return;
    }

    setLoading(true);
    setStatus("Signing in…");
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setStatus(signInError.message);
      setLoading(false);
      return;
    }

    const assurance = await getMfaAssurance(supabase);

    if (assurance.needsVerification) {
      setStep("mfa_verify");
      setStatus("Enter the 6-digit code from your authenticator app.");
      setLoading(false);
      return;
    }

    if (!assurance.hasVerifiedTotp) {
      setStep("mfa_enroll");
      setLoading(false);
      await startEnrollment();
      return;
    }

    try {
      await onAuthenticated();
      setStatus("Signed in.");
    } catch (error) {
      await supabase.auth.signOut();
      setStatus(
        error instanceof Error
          ? error.message
          : "Signed in but not authorized. Add your user to admin_profiles in Supabase."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyMfa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mfaCode.trim().length < 6) return;

    setLoading(true);
    setStatus("Verifying code…");
    const supabase = createClient();

    try {
      const factor = await getVerifiedTotpFactor(supabase);
      await verifyTotpCode(supabase, factor.id, mfaCode);
      await onAuthenticated();
      setStatus("Signed in.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid MFA code");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollFactorId || mfaCode.trim().length < 6) return;

    setLoading(true);
    setStatus("Activating authenticator…");
    const supabase = createClient();

    try {
      await verifyTotpEnrollment(supabase, enrollFactorId, mfaCode);
      await onAuthenticated();
      setStatus("MFA enabled. Signed in.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid verification code");
    } finally {
      setLoading(false);
    }
  }

  async function handleSkipEnrollment() {
    setLoading(true);
    setStatus("Continuing without MFA…");
    const supabase = createClient();
    try {
      await onAuthenticated();
    } catch (error) {
      await supabase.auth.signOut();
      setStatus(error instanceof Error ? error.message : "Not authorized");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setStep("login");
    setPassword("");
    setMfaCode("");
    setEnrollQr(null);
    setEnrollSecret(null);
    setEnrollFactorId(null);
    setStatus("Signed out.");
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-background px-6 py-28">
        <p className="mx-auto max-w-md font-dm text-sm text-cream/70">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-cream px-6 py-28">
      {step === "login" && (
        <form
          onSubmit={handleLogin}
          className="mx-auto flex w-full max-w-md flex-col gap-5 border border-surface bg-surface/40 p-6"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange">
              Private console
            </p>
            <h1 className="mt-2 font-dm text-3xl font-semibold text-cream">Admin access</h1>
          </div>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="form-field"
            placeholder="Email"
            autoComplete="email"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="form-field"
            placeholder="Password"
            autoComplete="current-password"
            required
          />
          <button
            disabled={loading}
            className="bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:opacity-60"
          >
            Sign in
          </button>
          {!isSupabaseConfigured() && (
            <p className="font-dm text-sm text-orange leading-relaxed">
              Supabase is not configured. Add your project URL and anon key to `.env.local`.
            </p>
          )}
          {status && <p className="font-dm text-sm text-cream/70">{status}</p>}
        </form>
      )}

      {step === "mfa_verify" && (
        <form
          onSubmit={handleVerifyMfa}
          className="mx-auto flex w-full max-w-md flex-col gap-5 border border-surface bg-surface/40 p-6"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange">
              Two-factor authentication
            </p>
            <h1 className="mt-2 font-dm text-3xl font-semibold text-cream">
              Enter authenticator code
            </h1>
            <p className="mt-2 font-dm text-sm text-cream/70">
              Open your authenticator app and enter the 6-digit code.
            </p>
          </div>
          <input
            value={mfaCode}
            onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            className="form-field text-center font-mono text-lg tracking-[0.3em]"
            placeholder="000000"
            autoComplete="one-time-code"
            required
          />
          <button
            disabled={loading || mfaCode.length < 6}
            className="bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:opacity-60"
          >
            Verify
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="font-mono text-xs uppercase tracking-widest text-cream/60 hover:text-orange"
          >
            Use a different account
          </button>
          {status && <p className="font-dm text-sm text-cream/70">{status}</p>}
        </form>
      )}

      {step === "mfa_enroll" && (
        <form
          onSubmit={handleCompleteEnrollment}
          className="mx-auto flex w-full max-w-md flex-col gap-5 border border-surface bg-surface/40 p-6"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange">
              Set up MFA
            </p>
            <h1 className="mt-2 font-dm text-3xl font-semibold text-cream">
              Protect admin access
            </h1>
            <p className="mt-2 font-dm text-sm text-cream/70">
              Scan the QR code, then enter the 6-digit code to finish setup.
            </p>
          </div>

          {enrollQr && (
            <div
              className="mx-auto rounded-sm bg-white p-3"
              dangerouslySetInnerHTML={{ __html: enrollQr }}
            />
          )}

          {enrollSecret && (
            <p className="break-all font-mono text-xs text-cream/60">
              Manual key: {enrollSecret}
            </p>
          )}

          <input
            value={mfaCode}
            onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            className="form-field text-center font-mono text-lg tracking-[0.3em]"
            placeholder="000000"
            autoComplete="one-time-code"
            required
          />

          <button
            disabled={loading || mfaCode.length < 6 || !enrollFactorId}
            className="bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:opacity-60"
          >
            Enable MFA and continue
          </button>

          <button
            type="button"
            onClick={handleSkipEnrollment}
            disabled={loading}
            className="font-mono text-xs uppercase tracking-widest text-cream/60 hover:text-orange disabled:opacity-60"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="font-mono text-xs uppercase tracking-widest text-cream/60 hover:text-orange"
          >
            Sign out
          </button>

          {status && <p className="font-dm text-sm text-cream/70">{status}</p>}
        </form>
      )}
    </div>
  );
}
