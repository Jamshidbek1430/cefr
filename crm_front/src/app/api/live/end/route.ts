import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken as string | undefined;
        const response = await fetch(`${getBackendUrl()}/api/live/end/`, {
            method: "POST",
            headers: accessToken ? { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            return NextResponse.json(payload, { status: response.status });
        }

        return NextResponse.json(payload);
    } catch (error: any) {
        console.error("Error ending live lesson proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
