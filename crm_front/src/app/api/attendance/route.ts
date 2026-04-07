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
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get("groupId");
        const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

        if (!groupId) {
            return new NextResponse("groupId is required", { status: 400 });
        }

        // Django endpoint: GET /api/attendance/group/{group_id}/{date}/
        const djangoData = await apiFetch(` /api/attendance/group/${groupId}/${date}/`, {
            accessToken
        });

        // Map Django attendance data to frontend format
        // Frontend expects list of attendance records with user info
        const mappedAttendance = (djangoData.students || []).map((s: any) => ({
            id: s.attendance_id || Math.random(),
            date: djangoData.date,
            status: s.status?.toUpperCase() || "ABSENT",
            userId: s.id,
            user: {
                id: s.id,
                name: s.name,
                role: "STUDENT"
            }
        }));

        return NextResponse.json(mappedAttendance);
    } catch (error: any) {
        console.error("Error fetching attendance proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = (session as any).accessToken;
        const body = await req.json();
        const { groupId, date, status, userId } = body;

        // Django expects bulk create or we can adapt single record to bulk
        const djangoResponse = await apiFetch("/api/attendance/", {
            method: "POST",
            accessToken,
            body: JSON.stringify({
                group_id: groupId,
                date: date,
                students: [
                    {
                        id: userId,
                        status: status.toLowerCase(),
                        coins: 0
                    }
                ]
            })
        });

        return NextResponse.json(djangoResponse);
    } catch (error: any) {
        console.error("Error creating attendance proxy:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
