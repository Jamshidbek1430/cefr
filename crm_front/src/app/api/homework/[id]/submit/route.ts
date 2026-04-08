import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const accessToken = (session as any).accessToken;
        const body = await req.json();

        const submission = await apiFetch(`/api/homework/${id}/submit/`, {
            method: "POST",
            accessToken,
            body: JSON.stringify({ answer: body.answer }),
        });

        return NextResponse.json(submission);
    } catch (error: any) {
        console.error("Error submitting homework proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
