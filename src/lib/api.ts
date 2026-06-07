/**
 * Helper to get the API URL.
 * Allows using an external PHP server (e.g. localhost:8000) during development.
 */
export function getApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  return `${base}${path}`;
}
