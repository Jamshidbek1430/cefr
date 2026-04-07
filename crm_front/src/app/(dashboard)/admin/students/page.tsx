import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, TrendingUp, Wallet, Clock, User, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default async function AdminStudentsPage() {
    const students = await (prisma as any).user.findMany({
        where: { role: { name: "STUDENT" } },
        include: {
            attendance: true,
            payments: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    const studentData = students.map((s: any) => {
        const total = s.attendance.length;
        const present = s.attendance.filter((a: any) => a.status === "PRESENT").length;
        const attendanceRate = total > 0 ? (present / total) * 100 : 0;
        const lastPayment = s.payments[0];

        return {
            ...s,
            attendanceRate,
            paymentStatus: lastPayment?.status || "NO_DATA",
            paymentAmount: lastPayment?.amount || 0
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Students Directory</h1>
                    <p className="text-muted-foreground font-medium mt-1">Cross-branch student metrics and financial tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-2 shadow-sm">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">{students.length} Total Students</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Avg Attendance", value: `${(studentData.reduce((acc: number, s: any) => acc + s.attendanceRate, 0) / (studentData.length || 1)).toFixed(1)}%`, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "High Activeness", value: studentData.filter((s: any) => s.activenessScore >= 80).length, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
                    { label: "Pending Payments", value: studentData.filter((s: any) => s.paymentStatus !== "PAID").length, icon: Wallet, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "New Enrollments", value: "8", icon: ArrowUpRight, color: "text-purple-500", bg: "bg-purple-500/10" },
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
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary py-6">Student</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Attendance</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Activeness</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Payment Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {studentData.map((student: any) => (
                            <TableRow key={student.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                <TableCell className="py-5">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border-2 border-background shadow-lg transition-transform group-hover:scale-110">
                                            <AvatarImage src={student.image} />
                                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                                                {student.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{student.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{student.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1.5 w-32">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                            <span>Rate</span>
                                            <span className={student.attendanceRate < 75 ? "text-destructive" : "text-green-500"}>
                                                {student.attendanceRate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    student.attendanceRate < 75 ? "bg-destructive" : "bg-green-500"
                                                )}
                                                style={{ width: `${student.attendanceRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            student.activenessScore >= 80 ? "bg-green-500/10 text-green-500" : (student.activenessScore >= 50 ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500")
                                        )}>
                                            <TrendingUp className="h-3 w-3" />
                                            {student.activenessScore}/100
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "rounded-lg border-2 font-black text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 shadow-sm",
                                            student.paymentStatus === "PAID" ? "border-green-500/20 bg-green-500/10 text-green-600" :
                                                (student.paymentStatus === "PARTIAL" ? "border-blue-500/20 bg-blue-500/10 text-blue-600" : "border-destructive/20 bg-destructive/10 text-destructive")
                                        )}
                                    >
                                        {student.paymentStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4 transition-all">
                                        Profile Details
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
