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
        const lessons = await apiFetch("/api/lessons/", { accessToken });
        return NextResponse.json(lessons);
    } catch (error: any) {
        console.error("Error fetching lessons proxy:", error);
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
        const body = await req.json();
        const lesson = await apiFetch("/api/lessons/", {
            method: "POST",
            accessToken,
            body: JSON.stringify(body),
        });

        return NextResponse.json(lesson);
    } catch (error: any) {
        console.error("Error creating lesson proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
