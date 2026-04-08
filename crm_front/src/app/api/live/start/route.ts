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

        const role = session.user.role;
        if (role !== "ADMIN" && role !== "TEACHER") {
            return new NextResponse("Forbidden: only teachers/admins can start a live lesson", { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const accessToken = (session as any).accessToken as string | undefined;

        const response = await fetch(`${getBackendUrl()}/api/live/start_live/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify(body),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            return NextResponse.json(payload, { status: response.status });
        }

        return NextResponse.json(payload);
    } catch (error: any) {
        console.error("Error starting live lesson:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
