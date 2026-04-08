import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email || session.user.role !== "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const studentId = dbUser.id;
        const { stars, comment, period } = await req.json();

        // Check if already submitted for this period
        const existing = await prisma.centerRating.findFirst({
            where: { studentId, period }
        });

        if (existing) {
            return new NextResponse("Survey already submitted for this period.", { status: 400 });
        }

        const rating = await prisma.centerRating.create({
            data: {
                studentId,
                stars,
                comment,
                period
            }
        });

        return NextResponse.json(rating);
    } catch (error) {
        console.error("Error submitting survey:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email || session.user.role !== "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const studentId = dbUser.id;
        const period = new Date().toISOString().slice(0, 7); // YYYY-MM

        const existing = await prisma.centerRating.findFirst({
            where: { studentId, period }
        });

        return NextResponse.json({
            canSubmit: !existing,
            period
        });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
