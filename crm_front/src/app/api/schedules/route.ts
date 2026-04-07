import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Mock schedules data as backend is missing this app
        return NextResponse.json([]);
    } catch (error: any) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
