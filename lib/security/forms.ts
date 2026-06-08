import { verifyTurnstileToken } from "./turnstile";

export const FORM_ERROR_MESSAGE = "Could not submit. Please try again later.";

export function isHoneypotTriggered(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function clampField(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export async function assertPublicFormAllowed(
  body: Record<string, unknown>,
  request: Request
): Promise<{ ok: true } | { ok: false; status: number }> {
  if (isHoneypotTriggered(body.website)) {
    return { ok: false, status: 400 };
  }

  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : null;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");

  const valid = await verifyTurnstileToken(token, ip);
  if (!valid) {
    return { ok: false, status: 403 };
  }

  return { ok: true };
}
