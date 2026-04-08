import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BranchCards } from "@/components/dashboard/BranchCards";

async function getBranches() {
    const branches = await prisma.branch.findMany({
        include: {
            users: {
                where: { role: { name: "TEACHER" } },
                include: {
                    ratingsReceived: { select: { stars: true } }
                }
            },
            _count: {
                select: { groups: true, users: true }
            }
        }
    });

    return branches.map((branch: any) => {
        const allRatings = branch.users.flatMap((u: any) => u.ratingsReceived);
        const avgRating = allRatings.length > 0
            ? (allRatings.reduce((acc: number, r: any) => acc + r.stars, 0) / allRatings.length).toFixed(1)
            : "0.0";

        return {
            id: branch.id,
            name: branch.name,
            location: branch.location,
            revenue: branch.revenue,
            avgRating,
            teacherCount: branch.users.length,
            groupCount: branch._count.groups,
            studentCount: branch._count.users - branch.users.length
        };
    });
}

export default async function BranchesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const branches = await getBranches();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
                    <p className="text-muted-foreground">
                        Manage and monitor all school locations and their performance.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <BranchCards branches={branches} />
            </div>
        </div>
    );
}
