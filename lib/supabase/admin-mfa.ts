import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminAuthStep = "login" | "mfa_verify" | "mfa_enroll";

export interface MfaAssurance {
  needsVerification: boolean;
  hasVerifiedTotp: boolean;
}

export async function getMfaAssurance(
  supabase: SupabaseClient
): Promise<MfaAssurance> {
  const { data: aal, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError || !aal) {
    return { needsVerification: false, hasVerifiedTotp: false };
  }

  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();

  if (factorsError || !factors) {
    return { needsVerification: false, hasVerifiedTotp: false };
  }

  const verifiedTotp = factors.totp.filter((factor) => factor.status === "verified");
  const needsVerification =
    aal.nextLevel === "aal2" &&
    aal.currentLevel !== "aal2" &&
    verifiedTotp.length > 0;

  return {
    needsVerification,
    hasVerifiedTotp: verifiedTotp.length > 0,
  };
}

export function getVerifiedTotpFactor(supabase: SupabaseClient) {
  return supabase.auth.mfa.listFactors().then(({ data, error }) => {
    if (error || !data) throw error ?? new Error("Could not load MFA factors");
    const factor = data.totp.find((item) => item.status === "verified");
    if (!factor) throw new Error("No verified authenticator found");
    return factor;
  });
}

export async function verifyTotpCode(
  supabase: SupabaseClient,
  factorId: string,
  code: string
) {
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });

  if (challengeError || !challenge) {
    throw challengeError ?? new Error("Could not start MFA challenge");
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  });

  if (verifyError) throw verifyError;
}

export async function enrollTotpFactor(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "MX AI Academy Admin",
  });

  if (error || !data) {
    throw error ?? new Error("Could not start MFA enrollment");
  }

  return data;
}

export async function verifyTotpEnrollment(
  supabase: SupabaseClient,
  factorId: string,
  code: string
) {
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });

  if (challengeError || !challenge) {
    throw challengeError ?? new Error("Could not verify enrollment");
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  });

  if (verifyError) throw verifyError;
}
