import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const teacherId = dbUser.id;

        const schedules = await prisma.schedule.findMany({
            where: { teacherId },
            include: {
                group: {
                    include: { course: { select: { name: true } } }
                }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        return NextResponse.json(schedules);
    } catch (error) {
        console.error("Error fetching teacher schedule:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
