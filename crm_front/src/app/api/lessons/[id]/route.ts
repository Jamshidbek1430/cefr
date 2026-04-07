import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const accessToken = (session as any).accessToken;
        const body = await req.json();
        const lesson = await apiFetch(`/api/lessons/${id}/`, {
            method: "PATCH",
            accessToken,
            body: JSON.stringify(body),
        });

        return NextResponse.json(lesson);
    } catch (error: any) {
        console.error("Error updating lesson proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const accessToken = (session as any).accessToken;
        await apiFetch(`/api/lessons/${id}/`, {
            method: "DELETE",
            accessToken,
        });

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("Error deleting lesson proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
