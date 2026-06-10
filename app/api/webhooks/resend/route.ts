import { NextResponse } from "next/server";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { verifyResendWebhook } from "@/lib/email/verify-resend-webhook";
import {
  mapResendEventType,
  updateStudentEmailDeliveryFromWebhook,
} from "@/lib/members/student-email-store";

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[resend webhook] RESEND_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();

  const verified = verifyResendWebhook(
    rawBody,
    {
      svixId: request.headers.get("svix-id"),
      svixTimestamp: request.headers.get("svix-timestamp"),
      svixSignature: request.headers.get("svix-signature"),
    },
    secret
  );

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as {
      type?: string;
      created_at?: string;
      data?: {
        email_id?: string;
        id?: string;
        created_at?: string;
        bounce?: { message?: string };
        failed?: { reason?: string };
        complaint?: { feedback_type?: string };
      };
    };

    const eventType = String(payload?.type ?? "");
    const messageId = String(payload?.data?.email_id ?? payload?.data?.id ?? "").trim();
    const status = mapResendEventType(eventType);
    const eventAt = payload.created_at ?? payload.data?.created_at ?? null;

    if (!messageId || !status) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const detail =
      payload?.data?.bounce?.message ??
      payload?.data?.failed?.reason ??
      payload?.data?.complaint?.feedback_type ??
      null;

    const updated = await updateStudentEmailDeliveryFromWebhook({
      resendMessageId: messageId,
      status,
      statusDetail: detail ? String(detail) : null,
      eventAt: eventAt ? String(eventAt) : null,
    });

    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error("[resend webhook]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
