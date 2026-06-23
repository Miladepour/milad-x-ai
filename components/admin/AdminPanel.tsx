"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { BlogPostListItem } from "@/lib/blog/types";
import type { ContactSubmission } from "@/lib/contact/types";
import type { WaitlistSubmission } from "@/lib/courses/types";
import AdminLoginScreen from "@/components/admin/AdminLoginScreen";
import {
  NotificationProvider,
} from "@/components/notifications/NotificationProvider";
import NotificationToasts from "@/components/notifications/NotificationToasts";
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
  contactSubmissions: ContactSubmission[];
  waitlistSubmissions: WaitlistSubmission[];
}

interface BootstrapResponse {
  email?: string;
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
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPostListItem[]>([]);
  const [blogLoaded, setBlogLoaded] = useState(false);
  const [blogLoading, setBlogLoading] = useState(false);
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

  const audienceRequest = useCallback(async (action: string, payload = {}) => {
    const res = await fetch("/api/admin-audience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Audience request failed");
    return data;
  }, []);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = (await adminRequest("summary")) as AdminSummary;
      setSummary({
        contactSubmissions: data.contactSubmissions,
        waitlistSubmissions: data.waitlistSubmissions,
      });
      setSummaryLoaded(true);
    } finally {
      setSummaryLoading(false);
    }
  }, [adminRequest]);

  const loadBlogPosts = useCallback(async () => {
    setBlogLoading(true);
    try {
      const data = (await adminRequest("list-posts")) as { posts: BlogPostListItem[] };
      setBlogPosts(data.posts ?? []);
      setBlogLoaded(true);
    } finally {
      setBlogLoading(false);
    }
  }, [adminRequest]);

  const reloadBlogPosts = useCallback(async () => {
    await loadBlogPosts();
  }, [loadBlogPosts]);

  const ensureSummaryLoaded = useCallback(async () => {
    if (summaryLoaded || summaryLoading) return;
    await loadSummary();
  }, [loadSummary, summaryLoaded, summaryLoading]);

  const ensureBlogLoaded = useCallback(async () => {
    if (blogLoaded || blogLoading) return;
    await loadBlogPosts();
  }, [blogLoaded, blogLoading, loadBlogPosts]);

  const refreshDashboard = useCallback(async () => {
    setIsBootstrapping(true);
    try {
      const insightsData = (await adminRequest("insights")) as { insights: AdminInsights };
      setInsights(insightsData.insights);
      if (summaryLoaded) {
        await loadSummary();
      }
      if (blogLoaded) {
        await loadBlogPosts();
      }
    } finally {
      setIsBootstrapping(false);
    }
  }, [adminRequest, blogLoaded, loadBlogPosts, loadSummary, summaryLoaded]);

  const unlockWithSession = useCallback(async () => {
    setIsUnlocked(true);
    setIsBootstrapping(true);

    try {
      const data = (await adminRequest("bootstrap")) as BootstrapResponse;
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
    setSummaryLoaded(false);
    setBlogPosts([]);
    setBlogLoaded(false);
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
    <NotificationProvider>
      <AdminDashboard
        adminEmail={adminEmail}
        summary={summary}
        summaryLoaded={summaryLoaded}
        summaryLoading={summaryLoading}
        blogPosts={blogPosts}
        blogLoaded={blogLoaded}
        blogLoading={blogLoading}
        insights={insights}
        isBootstrapping={isBootstrapping}
        onSignOut={handleSignOut}
        onRefresh={refreshDashboard}
        adminRequest={adminRequest}
        membersRequest={membersRequest}
        audienceRequest={audienceRequest}
        onEnsureSummaryLoaded={ensureSummaryLoaded}
        onEnsureBlogLoaded={ensureBlogLoaded}
        onReloadBlogPosts={reloadBlogPosts}
      />
      <NotificationToasts />
    </NotificationProvider>
  );
}
