"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import ErrorContent from "@/components/errors/ErrorContent";

export default function LearnError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <ErrorContent onRetry={reset} variant="learn" />;
}
