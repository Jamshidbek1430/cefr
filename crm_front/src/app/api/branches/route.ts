import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Mock branches data as backend is missing this app
        return NextResponse.json([
            { id: 1, name: "Main Branch", location: "Central", revenue: 0 }
        ]);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
