import { NextResponse } from "next/server";
import { parseEmailBannerId } from "@/lib/email/banners";
import { sendRawEmail } from "@/lib/email/resend";
import { renderVipGuestInviteEmail } from "@/lib/vip-guests/invite-email";
import { vipPassAbsoluteUrl } from "@/lib/vip-guests/paths";
import {
  createVipGuestInviteAdmin,
  deleteVipGuestInviteAdmin,
  listVipGuestInvitesAdmin,
  markVipGuestInviteEmailSent,
  resendVipGuestInviteAdmin,
} from "@/lib/vip-guests/store";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getAdminUser } from "@/lib/supabase/require-admin";

function parseLocale(value: unknown): "EN" | "FA" {
  return value === "FA" ? "FA" : "EN";
}

async function sendInviteEmailForGuest(
  invite: Awaited<ReturnType<typeof createVipGuestInviteAdmin>>,
  bannerId: ReturnType<typeof parseEmailBannerId>
): Promise<{ ok: boolean; error?: string }> {
  if (!invite.email) {
    return { ok: false, error: "No email on invite" };
  }

  const { subject, html } = renderVipGuestInviteEmail({
    locale: invite.locale,
    fullName: invite.fullName,
    eventTitle: invite.eventTitle,
    eventDate: invite.eventDate,
    token: invite.token,
    bannerId,
  });

  const result = await sendRawEmail({
    to: invite.email,
    subject,
    html,
  });

  if (result.ok) {
    await markVipGuestInviteEmailSent(invite.id);
  }

  return result;
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (action === "list-invites") {
      const invites = await listVipGuestInvitesAdmin();
      return NextResponse.json({ ok: true, invites });
    }

    if (action === "preview-invite-email") {
      const fullName = String(body.fullName ?? "").trim() || "Guest";
      const eventTitle = String(body.eventTitle ?? "").trim() || "VIP Event";
      const eventDate = String(body.eventDate ?? "").trim() || new Date().toISOString().slice(0, 10);
      const locale = parseLocale(body.locale);
      const bannerId = parseEmailBannerId(body.bannerId);
      const token = "preview-token";

      const { subject, html } = renderVipGuestInviteEmail({
        locale,
        fullName,
        eventTitle,
        eventDate,
        token,
        bannerId,
      });

      return NextResponse.json({
        ok: true,
        subject,
        html,
        passUrl: vipPassAbsoluteUrl({ locale, token }),
      });
    }

    if (action === "create-invite") {
      const fullName = String(body.fullName ?? "").trim();
      const emailRaw = String(body.email ?? "").trim();
      const email = emailRaw ? emailRaw.toLowerCase() : null;
      const guestTitle = String(body.guestTitle ?? "VIP Guest").trim() || "VIP Guest";
      const eventDate = String(body.eventDate ?? "").trim();
      const eventTitle = String(body.eventTitle ?? "").trim();
      const programId = String(body.programId ?? "").trim() || null;
      const locale = parseLocale(body.locale);
      const sendEmail = body.sendEmail === true && Boolean(email);
      const bannerId = parseEmailBannerId(body.bannerId);

      if (!fullName || !eventDate || !eventTitle) {
        return NextResponse.json(
          { error: "fullName, eventDate, and eventTitle are required" },
          { status: 400 }
        );
      }

      if (body.sendEmail === true && !email) {
        return NextResponse.json(
          { error: "email is required to send an invitation email" },
          { status: 400 }
        );
      }

      const invite = await createVipGuestInviteAdmin(
        {
          fullName,
          email,
          guestTitle,
          eventDate,
          eventTitle,
          programId,
          locale,
        },
        admin.id
      );

      const passUrl = vipPassAbsoluteUrl({ locale: invite.locale, token: invite.token });

      if (sendEmail && invite.email) {
        const emailResult = await sendInviteEmailForGuest(invite, bannerId);
        if (!emailResult.ok) {
          return NextResponse.json({
            ok: true,
            invite,
            passUrl,
            emailSent: false,
            emailError: emailResult.error ?? "Email failed",
          });
        }
      }

      return NextResponse.json({ ok: true, invite, passUrl, emailSent: sendEmail });
    }

    if (action === "resend-invite") {
      const id = String(body.id ?? "").trim();
      if (!id) {
        return NextResponse.json({ error: "id required" }, { status: 400 });
      }

      const invite = await resendVipGuestInviteAdmin(id);
      if (!invite) {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 });
      }

      if (!invite.email) {
        return NextResponse.json(
          { error: "This invite has no email — share the pass link instead" },
          { status: 400 }
        );
      }

      const bannerId = parseEmailBannerId(body.bannerId);
      const emailResult = await sendInviteEmailForGuest(invite, bannerId);
      if (!emailResult.ok) {
        return NextResponse.json(
          { error: emailResult.error ?? "Email failed" },
          { status: 502 }
        );
      }

      return NextResponse.json({ ok: true, invite });
    }

    if (action === "delete-invite") {
      const id = String(body.id ?? "").trim();
      if (!id) {
        return NextResponse.json({ error: "id required" }, { status: 400 });
      }
      await deleteVipGuestInviteAdmin(id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[admin-vip-guests]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
