import { getBackendUrl } from "@/lib/backend-url";

const API_URL = getBackendUrl();

export async function apiFetch(endpoint: string, options: RequestInit & { accessToken?: string } = {}) {
    let accessToken = options.accessToken;

    if (!accessToken && typeof window !== "undefined") {
        const sessionResponse = await fetch("/api/auth/session");
        const session = sessionResponse.ok ? await sessionResponse.json().catch(() => null) : null;
        accessToken = session?.accessToken;
    }

    const headers = new Headers(options.headers);
    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

    const res = await fetch(url, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", text);
        let errorMessage = `API request failed with status ${res.status}`;
        try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
            if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
                errorMessage += ": backend returned HTML; check API endpoint/proxy URL";
            } else if (text.length > 0) {
                errorMessage += `: ${text.slice(0, 100)}`;
            }
        }
        throw new Error(errorMessage);
    }

    if (res.status === 204) {
        return null;
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }
    return res.text();
}
