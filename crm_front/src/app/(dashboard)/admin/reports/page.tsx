import { prisma } from "@/lib/prisma";
import { ReportEditor } from "@/components/admin/ReportEditor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ClipboardList, Clock, User, Download, ExternalLink, MapPin, Building2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminReportsPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    if (isAdmin) {
        const branches = await prisma.branch.findMany({
            include: {
                _count: {
                    select: { users: true, groups: true }
                }
            }
        });

        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Branch Network Reports</h1>
                        <p className="text-muted-foreground font-medium mt-1">Select a branch to review administrative submissions.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {branches?.map((branch) => (
                        <Link key={branch.id} href={`/admin/reports/branch/${branch.id}`}>
                            <Card className="relative overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 cursor-pointer border border-white/5 bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-xl group hover:-translate-y-2 h-full">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

                                <CardHeader className="relative z-10 pb-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/10">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider">
                                            Live Node
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors duration-300">
                                        {branch.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 mt-1.5 font-bold text-muted-foreground/60">
                                        <MapPin className="h-3 w-3" />
                                        {branch.location || "Remote Location"}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="relative z-10 pt-4 border-t border-white/5 mt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Team Size</span>
                                            <span className="font-black text-lg">{branch._count.users}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Active Units</span>
                                            <span className="font-black text-lg">{branch._count.groups}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.2em] group-hover:gap-4 transition-all">
                                        Access Reports <ExternalLink className="h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    // Admin View (Existing)
    const reports = await prisma.report.findMany({
        where: { authorId: parseInt(session?.user?.id || "0") },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Documentation Engine</h1>
                    <p className="text-muted-foreground font-medium mt-1">Generate and archive professional executive reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        Executive Suite
                    </Badge>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black tracking-tight px-2 flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        New Report
                    </h2>
                    <ReportEditor />
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black tracking-tight px-2 flex items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Recent Archives
                    </h2>
                    <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Saved Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[600px]">
                                <div className="divide-y divide-white/5">
                                    {reports.length === 0 ? (
                                        <div className="p-12 text-center opacity-40">
                                            <Clock className="h-10 w-10 mx-auto mb-4" />
                                            <p className="text-sm font-bold">No archives found.</p>
                                        </div>
                                    ) : (
                                        reports.map((report) => (
                                            <div key={report.id} className="p-4 hover:bg-white/5 transition-colors group/item">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black tracking-tight leading-tight group-hover/item:text-primary transition-colors">{report.title}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">
                                                                {new Date(report.createdAt).toLocaleDateString()} • {report.author.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                                                        <Download className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
