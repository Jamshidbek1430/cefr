import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken as string | undefined;
        const formData = await req.formData();

        const response = await fetch(`${getBackendUrl()}/api/live/chat/upload/`, {
            method: "POST",
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            body: formData,
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            return NextResponse.json(body, { status: response.status });
        }

        return NextResponse.json(body);
    } catch (error: any) {
        console.error("Error uploading live chat image proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
