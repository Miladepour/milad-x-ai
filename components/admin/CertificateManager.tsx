"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { formatDateOnly } from "@/lib/members/dates";
import { certificateVerifyPath } from "@/lib/members/paths";
import type {
  CertificateAdminListItem,
  CertificateListResult,
  CertificateListStatusFilter,
} from "@/lib/members/types";

interface CertificateManagerProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string) => void;
}

export default function CertificateManager({
  membersRequest,
  onStatus,
}: CertificateManagerProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<CertificateListStatusFilter>("active");
  const [list, setList] = useState<CertificateListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await membersRequest("list-certificates", {
        page,
        search: debouncedSearch,
        status,
      })) as CertificateListResult;
      setList(data);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not load certificates");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, membersRequest, onStatus, page, status]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  function startEdit(item: CertificateAdminListItem) {
    setEditingId(item.certificate.id);
    setNameDraft(item.certificate.studentName);
  }

  function cancelEdit() {
    setEditingId(null);
    setNameDraft("");
  }

  async function saveName(certificateId: string) {
    const studentName = nameDraft.trim();
    if (studentName.length < 2) {
      onStatus("Certificate name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    onStatus("Updating certificate name…");
    try {
      await membersRequest("update-certificate", { certificateId, studentName });
      cancelEdit();
      await loadList();
      onStatus("Certificate name updated.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not update certificate name");
    } finally {
      setSaving(false);
    }
  }

  async function revokeCertificate(certificateId: string) {
    if (!confirm("Revoke this certificate? The student will no longer see it.")) return;
    setSaving(true);
    onStatus("Revoking certificate…");
    try {
      await membersRequest("revoke-certificate", { certificateId });
      if (editingId === certificateId) cancelEdit();
      await loadList();
      onStatus("Certificate revoked.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not revoke certificate");
    } finally {
      setSaving(false);
    }
  }

  const total = list?.total ?? 0;
  const totalPages = list?.totalPages ?? 1;
  const items = list?.items ?? [];
  const pageSize = list?.pageSize ?? 20;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-dm text-xl font-semibold text-cream">Certificates</h2>
          <p className="mt-1 font-dm text-sm text-cream/55">
            Issued certificates across all students. Edit the printed name or revoke without
            reloading everything.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
          {loading && !list
            ? "Loading…"
            : `${total} total · showing ${from}–${to}`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            Search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, cert #, student ID, program, or email…"
            className="form-field"
          />
        </label>
        <label className="flex w-full flex-col gap-1.5 sm:w-44">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CertificateListStatusFilter)}
            className="form-field"
          >
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>

      {loading && !list ? (
        <p className="font-dm text-sm text-cream/70">Loading certificates…</p>
      ) : items.length === 0 ? (
        <p className="font-dm text-sm text-cream/55">No certificates match these filters.</p>
      ) : (
        <div className={`overflow-x-auto ${loading ? "opacity-60" : ""}`}>
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b border-white/[0.08] font-mono text-[10px] uppercase tracking-widest text-cream/45">
                <th className="px-3 py-3">Name on certificate</th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Program</th>
                <th className="px-3 py-3">Certificate #</th>
                <th className="px-3 py-3">Issued</th>
                <th className="px-3 py-3">Hours</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const cert = item.certificate;
                const isEditing = editingId === cert.id;
                const isRevoked = Boolean(cert.revokedAt);
                const verifyHref = certificateVerifyPath(cert.certificateNumber, "en");

                return (
                  <tr
                    key={cert.id}
                    className="border-b border-white/[0.05] align-top font-dm text-sm text-cream/80"
                  >
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          className="form-field min-w-[12rem]"
                          maxLength={120}
                          disabled={saving}
                        />
                      ) : (
                        <span className="font-medium text-cream">{cert.studentName}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-cream/80">{item.studentEmail || "—"}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-cream/45">
                        {cert.studentNumber}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-cream">{item.programTitle}</p>
                      {cert.programTitleEn !== item.programTitle && (
                        <p className="mt-0.5 text-xs text-cream/45">{cert.programTitleEn}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs tracking-wider text-emerald-300/90">
                      {cert.certificateNumber}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {formatDateOnly(cert.issuedAt)}
                    </td>
                    <td className="px-3 py-3">{cert.totalHours}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                          isRevoked
                            ? "bg-red-500/15 text-red-300"
                            : "bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        {isRevoked ? "Revoked" : "Active"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void saveName(cert.id)}
                              className="border border-orange px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:opacity-40"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={cancelEdit}
                              className="border border-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-cream/50 disabled:opacity-40"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          !isRevoked && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => startEdit(item)}
                              className="border border-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-orange hover:text-orange disabled:opacity-40"
                            >
                              Edit name
                            </button>
                          )
                        )}
                        {!isRevoked && !isEditing && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void revokeCertificate(cert.id)}
                            className="border border-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-red-400 hover:text-red-300 disabled:opacity-40"
                          >
                            Revoke
                          </button>
                        )}
                        <a
                          href={verifyHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 border border-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-orange hover:text-orange"
                        >
                          Verify
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface px-1 py-3">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="student-btn-secondary inline-flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft size={16} aria-hidden />
            Previous
          </button>
          <p className="font-dm text-sm text-cream/65">
            Page {page} of {totalPages}
          </p>
          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="student-btn-secondary inline-flex items-center gap-1 disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
