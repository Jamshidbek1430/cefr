import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, BookOpen } from "lucide-react";

import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";

export default async function GroupsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role === "STUDENT") {
        redirect("/dashboard");
    }

    const role = session.user.role as any;
    // For branch admins, filter by branchId. Superadmins see everything.
    const whereClause = role === "ADMIN" && (session.user as any).branchId
        ? { branchId: (session.user as any).branchId }
        : {};

    const groups = await prisma.group.findMany({
        where: whereClause,
        include: {
            teachers: true,
            _count: {
                select: { students: true, lessons: true }
            }
        } as any
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Active Groups</h1>
                    <p className="text-muted-foreground">
                        Manage your educational groups and assignments.
                    </p>
                </div>
                {role === "ADMIN" && (
                    <CreateGroupDialog />
                )}
            </div>

            {groups.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                    <CardHeader>
                        <div className="mx-auto rounded-full bg-primary/10 p-3 mb-4 w-fit">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>No Groups Found</CardTitle>
                        <CardDescription>
                            {role === "ADMIN"
                                ? "No groups have been created across the system yet."
                                : "You haven't created any groups yet."}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create your first group
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups?.map((group) => (
                        <Card key={group.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">{group.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            Teachers: {(group as any).teachers.map((t: any) => t.name).join(", ")}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{(group as any)._count.students} Students</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{(group as any)._count.lessons} Lessons</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                <Button variant="secondary" className="w-full">
                                    Manage Group
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
