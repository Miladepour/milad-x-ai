export function formatLinkedInError(detail: string): string {
  const normalized = detail.trim();
  if (!normalized) {
    return "Could not publish to LinkedIn. Try again.";
  }

  if (normalized.includes("NONEXISTENT_VERSION")) {
    return 'LinkedIn API version is outdated. Set LINKEDIN_API_VERSION=202601 (or newer) in your environment and restart the server.';
  }

  try {
    const json = JSON.parse(normalized) as {
      message?: string;
      error_description?: string;
      code?: string;
      status?: number;
    };
    const message = json.message || json.error_description;
    if (message) {
      if (/permission|access denied|not authorized/i.test(message)) {
        return 'LinkedIn blocked the post. Make sure "Share on LinkedIn" is approved for your app and you completed the login step.';
      }
      return `LinkedIn: ${message}`;
    }
  } catch {
    // not JSON — fall through
  }

  if (/permission|access denied|not authorized/i.test(normalized)) {
    return 'LinkedIn blocked the post. Make sure "Share on LinkedIn" is approved for your app and you completed the login step.';
  }

  return "Could not publish to LinkedIn. Try again.";
}
