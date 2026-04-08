import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken;
        const body = await req.json();
        const { name, teacherIds } = body;

        if (!name || !teacherIds || !Array.isArray(teacherIds)) {
            return new NextResponse("Name and Teacher IDs (array) are required", { status: 400 });
        }

        // Django Group model expects a single 'teacher' ID (as integer or UUID string)
        // Mapping first teacher from frontend request
        const djangoGroup = await apiFetch("/api/groups/", {
            method: "POST",
            accessToken,
            body: JSON.stringify({
                name,
                teacher: teacherIds[0],
                // Room and Course can be added here if needed, setting defaults
                start_time: "09:00",
                end_time: "10:30",
                class_days: ["monday", "wednesday", "friday"]
            })
        });

        return NextResponse.json(djangoGroup);
    } catch (error: any) {
        console.error("Error creating group proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken;
        const djangoGroups = await apiFetch("/api/groups/", {
            accessToken
        });

        const groupsList = Array.isArray(djangoGroups) ? djangoGroups : djangoGroups.results || [];

        // Map Django fields to frontend expected fields
        const mappedGroups = groupsList.map((g: any) => ({
            id: g.id,
            name: g.name,
            course: g.course || { name: "General" },
            branch: { id: 1, name: "Main" },
            schedules: [],
            teachers: g.teacher ? [{ id: g.teacher.id, name: `${g.teacher.first_name || ""} ${g.teacher.last_name || ""}`.trim() || g.teacher.username }] : [],
            _count: {
                students: g.student_count || 0
            }
        }));

        return NextResponse.json(mappedGroups);
    } catch (error: any) {
        console.error("Error fetching groups proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
