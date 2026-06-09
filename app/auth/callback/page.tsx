import type { Metadata } from "next";
import AuthCallbackClient from "@/components/auth/AuthCallbackClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return <AuthCallbackClient />;
}
