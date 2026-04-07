import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherCard } from "@/components/dashboard/TeacherCard";
import { MapPin, Users, BookOpen, GraduationCap } from "lucide-react";

async function getBranchDetail(id: number) {
    const branch = await prisma.branch.findUnique({
        where: { id },
        include: {
            users: {
                where: { role: { name: "TEACHER" } },
                include: {
                    ratingsReceived: { select: { stars: true } },
                    salaries: { orderBy: { createdAt: 'desc' }, take: 1 }
                }
            },
            groups: {
                include: {
                    course: true,
                    students: { select: { id: true } }
                }
            }
        }
    });

    if (!branch) return null;

    const teachers = branch.users.map(u => {
        const ratings = (u as any).ratingsReceived;
        const avgRating = ratings.length > 0
            ? (ratings.reduce((acc: number, r: any) => acc + r.stars, 0) / ratings.length).toFixed(1)
            : "0.0";

        return {
            id: u.id,
            name: u.name || "Unknown",
            email: u.email,
            image: (u as any).image || "",
            specialty: (u as any).specialty || "General",
            experience: (u as any).experience || 0,
            salary: (u as any).salaries[0]?.amount || 0,
            avgRating
        };
    });

    return { ...branch, teachers };
}

export async function generateStaticParams() {
    const branches = await prisma.branch.findMany({
        select: { id: true }
    });
    return branches.map((branch) => ({
        id: branch.id.toString(),
    }));
}

export default async function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const branch = await getBranchDetail(parseInt(id, 10));
    if (!branch) notFound();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary text-primary-foreground">Active Branch</Badge>
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {branch.location}
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{branch.name}</h1>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl border flex items-center gap-8">
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Revenue</p>
                        <p className="text-xl font-black text-green-600">${branch.revenue.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Active Faculty</p>
                        <p className="text-xl font-black text-foreground">{branch.teachers.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Teachers List
                        </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {branch.teachers.map((teacher: any) => (
                            <TeacherCard key={teacher.id} teacher={teacher} />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-blue-500" />
                        Active Groups
                    </h2>
                    <div className="space-y-4">
                        {branch.groups.map((group: any) => (
                            <Card key={group.id} className="bg-muted/30 border-none shadow-sm hover:bg-muted/50 transition-colors">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">{group.name}</CardTitle>
                                        <Badge variant="outline" className="text-[10px]">{group.course?.name}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {group.students.length} Students
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <GraduationCap className="h-3 w-3" />
                                            Active
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {branch.groups.length === 0 && (
                            <p className="text-muted-foreground text-sm italic">No groups assigned to this branch.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
