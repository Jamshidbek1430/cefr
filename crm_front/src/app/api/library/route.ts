import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

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
