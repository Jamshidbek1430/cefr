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

        const salaries = await prisma.salary.findMany({
            where: { teacherId },
            orderBy: { payoutDate: 'desc' },
        });

        // Get basic teacher info (monthlySalary)
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { monthlySalary: true }
        });

        return NextResponse.json({
            current: salaries[0] || null,
            history: salaries,
            baseSalary: teacher?.monthlySalary || 0
        });
    } catch (error) {
        console.error("Error fetching teacher salary:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
