"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { BlogPost } from "@/lib/blog/types";
import type { ContactSubmission } from "@/lib/contact/types";
import type { WaitlistSubmission } from "@/lib/courses/types";
import AdminLoginScreen from "@/components/admin/AdminLoginScreen";
import type { AdminInsights } from "@/lib/admin/insights";
import { createClient } from "@/lib/supabase/client";

const AdminDashboard = dynamic(() => import("@/components/admin/AdminDashboard"), {
  loading: () => (
    <div className="min-h-screen bg-background px-6 py-28">
      <p className="mx-auto max-w-7xl font-dm text-sm text-cream/70">Opening console…</p>
    </div>
  ),
});

interface AdminSummary {
  email?: string;
  contactSubmissions: ContactSubmission[];
  waitlistSubmissions: WaitlistSubmission[];
}

interface BootstrapResponse extends AdminSummary {
  posts: BlogPost[];
  insights: AdminInsights;
}

export default function AdminPanel() {
  const [adminEmail, setAdminEmail] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [summary, setSummary] = useState<AdminSummary>({
    contactSubmissions: [],
    waitlistSubmissions: [],
  });
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [insights, setInsights] = useState<AdminInsights | null>(null);

  const adminRequest = useCallback(async (action: string, payload = {}) => {
    const res = await fetch("/api/admin-console", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Admin request failed");
    return data;
  }, []);

  const membersRequest = useCallback(async (action: string, payload = {}) => {
    const res = await fetch("/api/admin-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Members request failed");
    return data;
  }, []);

  const loadSummary = useCallback(async () => {
    const data = (await adminRequest("summary")) as AdminSummary;
    setSummary(data);
  }, [adminRequest]);

  const loadBlogPosts = useCallback(async () => {
    const data = (await adminRequest("list-posts")) as { posts: BlogPost[] };
    setBlogPosts(data.posts ?? []);
  }, [adminRequest]);

  const refreshDashboard = useCallback(async () => {
    setIsBootstrapping(true);
    try {
      const [summaryData, insightsData] = await Promise.all([
        adminRequest("summary") as Promise<AdminSummary>,
        adminRequest("insights") as Promise<{ insights: AdminInsights }>,
        loadBlogPosts(),
      ]);
      setSummary({
        contactSubmissions: summaryData.contactSubmissions,
        waitlistSubmissions: summaryData.waitlistSubmissions,
      });
      setInsights(insightsData.insights);
    } finally {
      setIsBootstrapping(false);
    }
  }, [adminRequest, loadBlogPosts]);

  const unlockWithSession = useCallback(async () => {
    setIsUnlocked(true);
    setIsBootstrapping(true);

    try {
      const data = (await adminRequest("bootstrap")) as BootstrapResponse;
      setSummary({
        contactSubmissions: data.contactSubmissions,
        waitlistSubmissions: data.waitlistSubmissions,
      });
      setBlogPosts(data.posts ?? []);
      setInsights(data.insights ?? null);
      setAdminEmail(data.email ?? "");
    } catch (error) {
      setIsUnlocked(false);
      throw error;
    } finally {
      setIsBootstrapping(false);
    }
  }, [adminRequest]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsUnlocked(false);
    setAdminEmail("");
    setSummary({ contactSubmissions: [], waitlistSubmissions: [] });
    setBlogPosts([]);
    setInsights(null);
  }

  if (!isUnlocked) {
    return (
      <AdminLoginScreen
        onAuthenticated={async () => {
          await unlockWithSession();
        }}
      />
    );
  }

  return (
    <AdminDashboard
      adminEmail={adminEmail}
      summary={summary}
      insights={insights}
      blogPosts={blogPosts}
      isBootstrapping={isBootstrapping}
      onSignOut={handleSignOut}
      onRefresh={refreshDashboard}
      adminRequest={adminRequest}
      membersRequest={membersRequest}
      loadSummary={loadSummary}
      loadBlogPosts={loadBlogPosts}
    />
  );
}
