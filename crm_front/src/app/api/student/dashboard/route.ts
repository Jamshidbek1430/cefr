import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken;
        const dashboard = await apiFetch("/api/student/dashboard/", { accessToken });
        return NextResponse.json(dashboard);
    } catch (error: any) {
        console.error("Error fetching student dashboard proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
