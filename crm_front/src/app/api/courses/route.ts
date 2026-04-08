import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken;
        const djangoCourses = await apiFetch("/api/courses/", {
            accessToken
        });

        const coursesList = Array.isArray(djangoCourses) ? djangoCourses : djangoCourses.results || [];

        // Map Django fields to frontend expected fields
        const mappedCourses = coursesList.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            groups: [], // Dashboard will handle group nested counts if needed
            price: c.price,
            duration: c.duration_months
        }));

        return NextResponse.json(mappedCourses);
    } catch (error: any) {
        console.error("Error fetching courses proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
