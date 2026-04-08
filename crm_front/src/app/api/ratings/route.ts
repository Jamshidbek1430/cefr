import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Mock ratings data as backend is missing this app
        return NextResponse.json([]);
    } catch (error: any) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { teacherId, stars, comment } = await req.json();
        const parsedStars = Number(stars);
        if (!parsedStars || parsedStars < 1 || parsedStars > 5) {
            return new NextResponse("Rating must be between 1 and 5", { status: 400 });
        }

        const studentId = Number(session.user.id);
        const fallbackTeacher = teacherId
            ? null
            : await prisma.user.findFirst({ where: { role: { name: "TEACHER" } }, select: { id: true } });
        const resolvedTeacherId = Number(teacherId || fallbackTeacher?.id);

        if (!studentId || !resolvedTeacherId) {
            return new NextResponse("Missing student or teacher", { status: 400 });
        }

        const rating = await prisma.rating.create({
            data: {
                stars: parsedStars,
                comment,
                studentId,
                teacherId: resolvedTeacherId,
            },
        });

        return NextResponse.json(rating);
    } catch (error: any) {
        console.error("[RATINGS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
