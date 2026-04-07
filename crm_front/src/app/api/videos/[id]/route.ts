import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const accessToken = (session as any).accessToken;
        const video = await apiFetch(`/api/videos/${id}/`, { accessToken });
        return NextResponse.json(video);
    } catch (error: any) {
        console.error("Error fetching video detail proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
