import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email || session?.user?.role !== "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const body = await req.json();
        const { homeworkId } = body;

        if (!homeworkId) {
            return new NextResponse("Homework ID is required", { status: 400 });
        }

        const homework = await prisma.homework.update({
            where: {
                id: parseInt(homeworkId, 10),
                studentId: dbUser.id
            },
            data: {
                submitted: true,
            },
        });

        return NextResponse.json(homework);
    } catch (error: any) {
        console.error("Error submitting homework:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
