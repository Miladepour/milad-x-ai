"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { SITE_URL } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { resolveProgramTitle } from "@/lib/members/program-localized";
import type { MemberProgram } from "@/lib/members/types";
import type { VipGuestInvite } from "@/lib/vip-guests/types";

interface VipGuestManagerProps {
  vipGuestsRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string, tone?: "success" | "error" | "info") => void;
}

const BTN_PRIMARY =
  "bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50";

const BTN_OUTLINE =
  "rounded-full border border-orange/50 px-5 py-3 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50";

function formatDate(dateIso: string): string {
  return new Date(`${dateIso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function VipGuestManager({
  vipGuestsRequest,
  membersRequest,
  onStatus,
}: VipGuestManagerProps) {
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [invites, setInvites] = useState<VipGuestInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [guestTitle, setGuestTitle] = useState("VIP Guest");
  const [eventDate, setEventDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [programId, setProgramId] = useState("");
  const [locale, setLocale] = useState<"EN" | "FA">("EN");
  const [inviteMode, setInviteMode] = useState<"email" | "link">("email");
  const [sendEmail, setSendEmail] = useState(true);
  const [lastCreatedLink, setLastCreatedLink] = useState<string | null>(null);

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === programId) ?? null,
    [programs, programId]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [programsData, invitesData] = await Promise.all([
        membersRequest("list-programs") as Promise<{ programs: MemberProgram[] }>,
        vipGuestsRequest("list-invites") as Promise<{ invites: VipGuestInvite[] }>,
      ]);
      setPrograms(programsData.programs ?? []);
      setInvites(invitesData.invites ?? []);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not load data", "error");
    } finally {
      setLoading(false);
    }
  }, [membersRequest, onStatus, vipGuestsRequest]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedProgram || eventTitle.trim()) return;
    setEventTitle(resolveProgramTitle(selectedProgram, locale));
  }, [selectedProgram, locale, eventTitle]);

  function passUrl(invite: VipGuestInvite): string {
    const urlLocale = invite.locale === "FA" ? "fa" : "en";
    return `${SITE_URL}${localizedPath(`/vip/${invite.token}`, urlLocale)}`;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const isLinkOnly = inviteMode === "link";

    if (!fullName.trim() || !eventDate || !eventTitle.trim()) {
      onStatus("Please fill in name, event date, and event title.", "error");
      return;
    }

    if (!isLinkOnly && !trimmedEmail) {
      onStatus("Please enter an email or switch to link-only mode.", "error");
      return;
    }

    setSubmitting(true);
    setLastCreatedLink(null);
    try {
      const data = (await vipGuestsRequest("create-invite", {
        fullName: fullName.trim(),
        email: isLinkOnly ? null : trimmedEmail,
        guestTitle: guestTitle.trim() || "VIP Guest",
        eventDate,
        eventTitle: eventTitle.trim(),
        programId: programId || null,
        locale,
        sendEmail: !isLinkOnly && sendEmail,
      })) as {
        invite: VipGuestInvite;
        passUrl?: string;
        emailSent?: boolean;
        emailError?: string;
      };

      const url = data.passUrl ?? passUrl(data.invite);

      if (data.emailSent === false) {
        onStatus(
          `Invite created but email failed: ${data.emailError ?? "unknown error"}`,
          "error"
        );
        setLastCreatedLink(url);
      } else if (!isLinkOnly && sendEmail) {
        onStatus(`VIP invite sent to ${trimmedEmail}.`, "success");
      } else {
        setLastCreatedLink(url);
        try {
          await navigator.clipboard.writeText(url);
          onStatus("VIP pass created — link copied to clipboard.", "success");
        } catch {
          onStatus("VIP pass created — copy the link below.", "success");
        }
      }

      setFullName("");
      setEmail("");
      setGuestTitle("VIP Guest");
      setEventDate("");
      setEventTitle("");
      setProgramId("");
      await loadData();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not create invite", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend(id: string) {
    setResendingId(id);
    try {
      await vipGuestsRequest("resend-invite", { id });
      onStatus("Invite email resent.", "success");
      await loadData();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not resend", "error");
    } finally {
      setResendingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await vipGuestsRequest("delete-invite", { id: deleteId });
      onStatus("Invite deleted.", "success");
      setDeleteId(null);
      await loadData();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not delete", "error");
    }
  }

  async function copyLink(invite: VipGuestInvite) {
    try {
      await navigator.clipboard.writeText(passUrl(invite));
      onStatus("Pass link copied.", "success");
    } catch {
      onStatus("Could not copy link.", "error");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
          VIP guests
        </p>
        <h2 className="mt-1 font-dm text-xl font-semibold text-cream">
          Event VIP invitations
        </h2>
        <p className="mt-2 max-w-2xl font-dm text-sm text-cream/65">
          Invite VIP guests by email, or create a personal pass link to share manually
          (WhatsApp, DM, etc.) when you do not have their email yet.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setInviteMode("email");
            setSendEmail(true);
          }}
          className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            inviteMode === "email"
              ? "bg-orange text-background"
              : "border border-white/15 text-cream/65 hover:border-orange/50 hover:text-orange"
          }`}
        >
          Send by email
        </button>
        <button
          type="button"
          onClick={() => {
            setInviteMode("link");
            setSendEmail(false);
          }}
          className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            inviteMode === "link"
              ? "bg-orange text-background"
              : "border border-white/15 text-cream/65 hover:border-orange/50 hover:text-orange"
          }`}
        >
          Link only — no email
        </button>
      </div>

      {lastCreatedLink && (
        <div className="rounded-xl border border-orange/30 bg-orange/10 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-orange">
            Share this link
          </p>
          <p className="mt-2 break-all font-dm text-sm text-cream">{lastCreatedLink}</p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(lastCreatedLink);
                onStatus("Link copied.", "success");
              } catch {
                onStatus("Could not copy link.", "error");
              }
            }}
            className={`${BTN_OUTLINE} mt-3`}
          >
            Copy link
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-cream/55">
            Full name
          </span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="form-field w-full"
            placeholder="Kartik Shani"
            required
          />
        </label>

        <label className={`block ${inviteMode === "link" ? "opacity-50 md:col-span-2" : ""}`}>
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-cream/55">
            Email {inviteMode === "link" ? "(optional — link-only mode)" : ""}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-field w-full"
            placeholder={inviteMode === "link" ? "Not needed for link-only" : "guest@company.com"}
            disabled={inviteMode === "link"}
            required={inviteMode === "email"}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-cream/55">
            Title / role
          </span>
          <input
            value={guestTitle}
            onChange={(e) => setGuestTitle(e.target.value)}
            className="form-field w-full"
            placeholder="VIP Guest"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-cream/55">
            Event date
          </span>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="form-field w-full"
            required
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-cream/55">
            Event title
          </span>
          <input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="form-field w-full"
            placeholder="AI Workshop — London"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-cream/55">
            Link to program (optional)
          </span>
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            className="form-field w-full"
          >
            <option value="">— None —</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {resolveProgramTitle(program, "EN")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-cream/55">
            Email language
          </span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "EN" | "FA")}
            className="form-field w-full"
          >
            <option value="EN">English</option>
            <option value="FA">Farsi</option>
          </select>
        </label>

        {inviteMode === "email" && (
          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 accent-orange"
            />
            <span className="font-dm text-sm text-cream/75">
              Send invitation email immediately
            </span>
          </label>
        )}

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button type="submit" disabled={submitting} className={BTN_PRIMARY}>
            {submitting
              ? "Creating…"
              : inviteMode === "link"
                ? "Create & copy link"
                : sendEmail
                  ? "Send VIP invite"
                  : "Create invite"}
          </button>
        </div>
      </form>

      <div>
        <h3 className="font-dm text-lg font-semibold text-cream">Sent invites</h3>
        {loading ? (
          <p className="mt-4 font-dm text-sm text-cream/60">Loading…</p>
        ) : invites.length === 0 ? (
          <p className="mt-4 font-dm text-sm text-cream/60">No VIP invites yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-dm font-semibold text-cream">{invite.fullName}</p>
                  <p className="font-dm text-sm text-cream/65">
                    {invite.email ?? "Link only"} · {invite.guestTitle}
                  </p>
                  <p className="mt-1 font-dm text-sm text-cream/55">
                    {invite.eventTitle} — {formatDate(invite.eventDate)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-cream/40">
                    {invite.email
                      ? invite.emailSentAt
                        ? `Email sent ${new Date(invite.emailSentAt).toLocaleString()}`
                        : "Email not sent"
                      : "Shared via link"}
                    {invite.openedAt
                      ? ` · Opened ${new Date(invite.openedAt).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyLink(invite)}
                    className={BTN_OUTLINE}
                  >
                    Copy link
                  </button>
                  {invite.email && (
                    <button
                      type="button"
                      onClick={() => void handleResend(invite.id)}
                      disabled={resendingId === invite.id}
                      className={BTN_OUTLINE}
                    >
                      {resendingId === invite.id ? "Sending…" : "Resend"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteId(invite.id)}
                    className="rounded-full border border-red-400/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-red-300 transition-colors hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete VIP invite?"
        description="This removes the invite and invalidates the pass link."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
