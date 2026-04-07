import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck, Star, DollarSign, Calendar, Users, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default async function AdminTeachersPage() {
    const teachers = await (prisma as any).user.findMany({
        where: { role: { name: "TEACHER" } },
        include: {
            ratingsReceived: true,
            salaries: {
                orderBy: { payoutDate: 'desc' },
                take: 1
            },
            taughtGroups: {
                include: { _count: { select: { students: true } } }
            }
        }
    });

    const teacherData = teachers.map((t: any) => {
        const ratings = t.ratingsReceived;
        const avgRating = ratings.length > 0
            ? (ratings.reduce((acc: number, r: any) => acc + r.stars, 0) / ratings.length).toFixed(1)
            : "0.0";

        const lastSalary = t.salaries[0];
        const studentCount = t.taughtGroups.reduce((acc: number, g: any) => acc + (g._count?.students || 0), 0);

        return {
            ...t,
            avgRating,
            totalStudents: studentCount,
            salaryAmount: t.monthlySalary || lastSalary?.amount || 0,
            payoutDate: lastSalary?.payoutDate,
            payoutStatus: lastSalary?.status || "PENDING"
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Professional Faculty</h1>
                    <p className="text-muted-foreground font-medium mt-1">Teaching performance metrics and payroll management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-2 shadow-sm">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">{teachers.length} Active Teachers</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Global Avg Rating", value: (teacherData.reduce((acc: number, t: any) => acc + parseFloat(t.avgRating), 0) / (teacherData.length || 1)).toFixed(1), icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                    { label: "Total Payroll", value: `$${teacherData.reduce((acc: number, t: any) => acc + t.salaryAmount, 0).toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
                    { label: "Faculty Capacity", value: `${teacherData.reduce((acc: number, t: any) => acc + t.totalStudents, 0)} Students`, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Next Payout", value: "Mar 28", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden relative group">
                        <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40", stat.bg)} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary py-6">Instructor</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Specialization</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Performance</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Monthly Salary</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teacherData.map((teacher: any) => (
                            <TableRow key={teacher.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                <TableCell className="py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-background shadow-lg transition-transform group-hover:scale-110">
                                                <AvatarImage src={teacher.image} />
                                                <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                                                    {teacher.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full shadow-sm" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{teacher.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{teacher.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm font-medium">{teacher.specialty || "General Educator"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={cn(
                                                        "h-3 w-3",
                                                        s <= Math.round(parseFloat(teacher.avgRating)) ? "text-yellow-500 fill-yellow-500" : "text-muted opacity-30"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-black tracking-tighter text-foreground ml-1">{teacher.avgRating}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black tracking-tight">${teacher.salaryAmount.toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Next: {teacher.payoutDate ? new Date(teacher.payoutDate).toLocaleDateString() : "N/A"}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "rounded-lg border-2 font-black text-[9px] uppercase tracking-[0.1em] px-2.5 py-1",
                                            teacher.payoutStatus === "PAID" ? "border-green-500/20 bg-green-500/10 text-green-600" : "border-orange-500/20 bg-orange-500/10 text-orange-600 shadow-orange-500/5 shadow-inner"
                                        )}
                                    >
                                        {teacher.payoutStatus}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
