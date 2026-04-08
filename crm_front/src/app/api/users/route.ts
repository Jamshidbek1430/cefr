import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type BackendUser = {
    id: string;
    username?: string;
    full_name?: string;
    telegram_username?: string;
    email?: string;
    photo?: string | null;
    role?: string;
};
type BackendUsersResponse = BackendUser[] | { results?: BackendUser[] };
type SessionWithToken = {
    user?: { id?: string; role?: string };
    accessToken?: string;
};

function mapBackendRole(role?: string): "ADMIN" | "TEACHER" | "STUDENT" {
    if (role === "admin" || role === "branch_admin") return "ADMIN";
    if (role === "teacher") return "TEACHER";
    return "STUDENT";
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as SessionWithToken | null;
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const accessToken = session.accessToken;
        const { searchParams } = new URL(req.url);

        const role = searchParams.get("role");
        const search = searchParams.get("search");
        const groupId = searchParams.get("groupId");

        // Construct Django query params
        const params = new URLSearchParams();
        if (role) params.append("role", role.toLowerCase());
        if (search) params.append("search", search);
        if (groupId) params.append("group", groupId); // Django expects 'group'

        const djangoUsers = await apiFetch(`/api/users/?${params.toString()}`, {
            accessToken
        }) as BackendUsersResponse;

        const usersList = Array.isArray(djangoUsers) ? djangoUsers : djangoUsers.results || [];

        // Map Django fields to frontend expected fields
        const mappedUsers = usersList.map((u) => ({
            id: u.id,
            name: u.full_name || u.username,
            email: u.email || (u.telegram_username ? `@${u.telegram_username}` : undefined),
            image: u.photo,
            role: mapBackendRole(u.role),
            teacherId: u.id, // Fallback
        }));

        return NextResponse.json(mappedUsers);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Error";
        console.error("Error fetching users proxy:", message);
        return new NextResponse(message, { status: 500 });
    }
}
