import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type SessionWithToken = {
    user?: { id?: string; role?: string };
    accessToken?: string;
};

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log("🔴 DELETE API route called");
    
    try {
        const { id } = await params;
        console.log("📋 User ID to delete:", id);
        
        const session = await getServerSession(authOptions) as SessionWithToken | null;
        console.log("👤 Session user:", session?.user?.id, "Role:", session?.user?.role);
        
        if (!session?.user || session.user.role !== "ADMIN") {
            console.log("❌ Unauthorized: Not an admin");
            return NextResponse.json(
                { detail: "Unauthorized. Only admins can delete users." },
                { status: 403 }
            );
        }

        // Prevent deleting yourself
        if (session.user.id === id) {
            console.log("❌ Cannot delete yourself");
            return NextResponse.json(
                { detail: "You cannot delete your own account." },
                { status: 400 }
            );
        }

        const accessToken = session.accessToken;
        console.log("🔑 Access token present:", !!accessToken);
        console.log("📡 Calling Django backend: DELETE /api/users/" + id + "/");
        
        const result = await apiFetch(`/api/users/${id}/`, {
            method: "DELETE",
            accessToken,
        });

        console.log("✅ Django backend responded successfully");
        return new NextResponse(null, { status: 204 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete user";
        console.error("❌ Error in DELETE route:", message, error);
        return NextResponse.json(
            { detail: message },
            { status: 500 }
        );
    }
}

