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

        const reports = await prisma.report.findMany({
            include: {
                author: {
                    select: {
                        name: true,
                        branch: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reports);
    } catch (error: any) {
        console.error("[REPORTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, content } = body;

        if (!title || !content) {
            return new NextResponse("Missing title or content", { status: 400 });
        }

        const report = await prisma.report.create({
            data: {
                title,
                content,
                authorId: parseInt(session?.user?.id),
            }
        });

        return NextResponse.json(report);
    } catch (error: any) {
        console.error("[REPORTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
