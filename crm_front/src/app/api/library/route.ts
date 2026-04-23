import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { getBackendUrl } from "@/lib/backend-url";

const BACKEND_URL = getBackendUrl();

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken;
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const suffix = search ? `?search=${encodeURIComponent(search)}` : "";

        const library = await apiFetch(`/api/library/${suffix}`, { accessToken });
        return NextResponse.json(library);
    } catch (error: any) {
        console.error("Error fetching library proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken;
        const formData = await req.formData();

        const res = await fetch(`${BACKEND_URL}/api/library/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Backend upload error:", errorText);
            return new NextResponse(errorText, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("Error uploading to library:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
