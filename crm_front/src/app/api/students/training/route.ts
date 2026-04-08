import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        const history = await prisma.trainingSession.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("Error fetching training history:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

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
        const { topic, score, totalQuestions } = await req.json();

        const trainingSession = await prisma.trainingSession.create({
            data: {
                studentId,
                topic,
                score,
                totalQuestions
            }
        });

        // Also log to AIUsageLog for auditing
        await prisma.aIUsageLog.create({
            data: {
                type: "TRAINING",
                prompt: `Training session on ${topic}`,
                response: `Score: ${score}/${totalQuestions}`,
                userId: studentId
            }
        });

        return NextResponse.json(trainingSession);
    } catch (error) {
        console.error("Error saving training session:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
