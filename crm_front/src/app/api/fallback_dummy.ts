import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// schedules, ratings, student-notes, branches, homework, reports
// are currently missing in the Django backend.
// This route provides a graceful fallback (empty list) to prevent UI crashes
// while maintaining the structure expected by the frontend components.

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Return empty array as fallback for missing backend entity
        return NextResponse.json([]);
    } catch (error: any) {
        console.error("Error in fallback API route:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
