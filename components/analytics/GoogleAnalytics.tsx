"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";
import { getGoogleAnalyticsId } from "@/lib/analytics/config";

export default function GoogleAnalytics() {
  const gaId = getGoogleAnalyticsId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!gaId || !mounted) return null;

  return <NextGoogleAnalytics gaId={gaId} />;
}
