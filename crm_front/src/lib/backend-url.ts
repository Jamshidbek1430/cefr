const DEFAULT_BACKEND_URL = "http://localhost:8000";

export function getBackendUrl() {
  // Server-side: use API_URL (not NEXT_PUBLIC_)
  // Client-side: use NEXT_PUBLIC_API_URL
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
  return url.replace(/\/$/, "");
}
