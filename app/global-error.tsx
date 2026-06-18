"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-cream font-dm antialiased min-h-screen flex flex-col items-center justify-center px-6">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-orange">
          Error
        </p>
        <h1 className="mt-5 text-center font-dm text-3xl font-semibold text-cream md:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-md text-center text-cream/65">
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 border-2 border-orange bg-orange px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-orange-dim hover:border-orange-dim"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
