import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { getGoogleAnalyticsId } from "@/lib/analytics/config";

export default function GoogleAnalytics() {
  const gaId = getGoogleAnalyticsId();
  if (!gaId) return null;

  return <NextGoogleAnalytics gaId={gaId} />;
}
