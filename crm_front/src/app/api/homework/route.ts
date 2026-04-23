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
        const homeworks = await apiFetch("/api/homework/", { accessToken });
        return NextResponse.json(homeworks);
    } catch (error: any) {
        console.error("Error fetching homework proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
            return new NextResponse("Only teachers can create homework", { status: 403 });
        }

        const accessToken = (session as any).accessToken;
        const body = await req.json();
        
        const homework = await apiFetch("/api/homework/", {
            method: "POST",
            accessToken,
            body: JSON.stringify(body),
        });
        
        return NextResponse.json(homework, { status: 201 });
    } catch (error: any) {
        console.error("Error creating homework:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
