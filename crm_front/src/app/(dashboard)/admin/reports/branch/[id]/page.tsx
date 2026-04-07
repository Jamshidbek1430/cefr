import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Clock, Download, ChevronLeft, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BranchReportsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const { id } = await params;
    const branchId = parseInt(id);
    const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: {
            users: {
                where: { role: { name: "ADMIN" } },
                include: {
                    reports: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!branch) {
        notFound();
    }

    const allReports = branch.users.flatMap(user =>
        user.reports.map(report => ({
            ...report,
            authorName: user.name
        }))
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Link href="/admin/reports">
                        <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all rounded-full px-4">
                            <ChevronLeft className="h-4 w-4" /> Back to Network
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            {branch.name} Archives
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1">Reviewing administrative submissions from this node.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        Branch ID: {branchId}
                    </Badge>
                </div>
            </div>

            <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <CardHeader className="pb-6 border-b border-white/5 bg-muted/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black tracking-tight">Administrative Reports</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Verified Submissions</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[700px]">
                        <div className="divide-y divide-white/5">
                            {allReports.length === 0 ? (
                                <div className="p-24 text-center">
                                    <div className="p-6 rounded-full bg-primary/5 w-fit mx-auto mb-6">
                                        <Clock className="h-12 w-12 text-primary/20" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight mb-2">No Reports Found</h3>
                                    <p className="text-muted-foreground font-medium">This branch admin has not archived any reports yet.</p>
                                </div>
                            ) : (
                                allReports.map((report) => (
                                    <div key={report.id} className="p-6 hover:bg-white/5 transition-all group/item relative">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover/item:scale-110 transition-transform">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black tracking-tight group-hover/item:text-primary transition-colors">
                                                        {report.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80">
                                                            <User className="h-3 w-3" />
                                                            {report.authorName}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(report.createdAt).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs uppercase tracking-widest gap-2 border-white/10 hover:bg-primary/10 hover:text-primary transition-all">
                                                    <Download className="h-3 w-3" /> Download PDF
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
