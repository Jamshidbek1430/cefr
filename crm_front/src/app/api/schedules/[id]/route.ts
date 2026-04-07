import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session?.user?.role as any) !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await (prisma as any).schedule.delete({
            where: { id: parseInt(id, 10) }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[SCHEDULE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
