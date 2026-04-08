import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const role = session.user.role;

    if (!studentId) {
        return new NextResponse("Student ID is required", { status: 400 });
    }

    try {
        let where: any = { studentId: parseInt(studentId, 10) };

        // Private to Teacher, Admin, and Super Admin
        if (role === "STUDENT") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const notes = await (prisma as any).studentNote.findMany({
            where,
            include: {
                teacher: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error("[STUDENT_NOTES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;

    if (!session?.user?.email || role === "STUDENT") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email } });
    if (!dbUser) {
        return new NextResponse("User not found", { status: 404 });
    }

    try {
        const { studentId, content } = await req.json();
        const teacherId = dbUser.id;

        const note = await (prisma as any).studentNote.create({
            data: {
                studentId,
                teacherId,
                content
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error("[STUDENT_NOTES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
