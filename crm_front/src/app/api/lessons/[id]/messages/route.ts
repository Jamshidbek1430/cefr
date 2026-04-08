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
        const messages = await apiFetch(`/api/lessons/${id}/messages/`, { accessToken });
        return NextResponse.json(messages);
    } catch (error: any) {
        console.error("Error fetching lesson messages proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const accessToken = (session as any).accessToken;
        const body = await req.json();
        const message = await apiFetch(`/api/lessons/${id}/messages/`, {
            method: "POST",
            accessToken,
            body: JSON.stringify({
                content: body.content ?? body.message,
                type: body.type ?? body.message_type ?? "text",
            }),
        });
        return NextResponse.json(message);
    } catch (error: any) {
        console.error("Error posting lesson message proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
