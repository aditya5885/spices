/**
 * Helper to get the API URL.
 * Allows using an external PHP server (e.g. localhost:8000) during development.
 */
export function getApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE || "").trim();

  if (!base) {
    return path;
  }

  if (typeof window === "undefined") {
    return `${base.replace(/\/$/, "")}${path}`;
  }

  try {
    const configured = new URL(base, window.location.origin);
    const currentOrigin = window.location.origin;

    // If the configured host matches the current site, use a relative path so
    // HTTPS pages never try to call an HTTP API endpoint.
    if (configured.hostname === window.location.hostname) {
      return path;
    }

    // If a production page is using an insecure API base, fall back to the
    // current site origin instead of triggering a mixed-content block.
    if (window.location.protocol === "https:" && configured.protocol === "http:") {
      return `${currentOrigin}${path}`;
    }

    return `${configured.origin}${path}`;
  } catch {
    return `${base.replace(/\/$/, "")}${path}`;
  }
}
