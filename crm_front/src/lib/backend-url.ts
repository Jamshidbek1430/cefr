const DEFAULT_BACKEND_URL = "http://localhost:8000";

export function getBackendUrl() {
    const url = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
    return url.replace(/\/$/, "");
}
