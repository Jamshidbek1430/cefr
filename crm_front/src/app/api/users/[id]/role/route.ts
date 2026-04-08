import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type SessionWithToken = {
    user?: { role?: string };
    accessToken?: string;
};

function mapFrontendRoleToBackend(role: string) {
    if (role === "ADMIN") return "admin";
    if (role === "TEACHER") return "teacher";
    return "student";
}

function mapBackendRoleToFrontend(role?: string): "ADMIN" | "TEACHER" | "STUDENT" {
    if (role === "admin" || role === "branch_admin") return "ADMIN";
    if (role === "teacher") return "TEACHER";
    return "STUDENT";
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions) as SessionWithToken | null;
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized. Only admins can change roles.", { status: 403 });
        }

        const { roleName } = await req.json();

        if (!roleName || !["ADMIN", "TEACHER", "STUDENT"].includes(roleName)) {
            return new NextResponse("Invalid role name", { status: 400 });
        }

        const accessToken = session.accessToken;
        const updatedUser = await apiFetch(`/api/users/${id}/`, {
            method: "PATCH",
            accessToken,
            body: JSON.stringify({ role: mapFrontendRoleToBackend(roleName) }),
        });

        return NextResponse.json({
            id: updatedUser.id,
            role: mapBackendRoleToFrontend(updatedUser.role),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Error";
        console.error("Error updating user role:", message);
        return new NextResponse(message, { status: 500 });
    }
}
