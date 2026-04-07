"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, TrendingUp, AlertTriangle, Calendar, CheckCircle2, History, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

export default function TeacherSalaryPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalary = async () => {
            const accessToken = (session as any)?.accessToken;
            if (!accessToken) return;
            try {
                const res = await apiFetch("/api/teacher/salary", { accessToken });
                setData(res);
            } catch (error) {
                console.error("Failed to fetch salary info:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSalary();
    }, [session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    const current = data?.current || { amount: data?.baseSalary || 0, bonus: 0, deductions: 0, status: "N/A" };
    const totalExpected = current.amount + current.bonus - current.deductions;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Payout Hub</h1>
                <p className="text-muted-foreground font-medium mt-1">Detailed breakdown of your earnings and financial history.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Base Salary", value: `$${current.amount.toLocaleString()}`, sub: "Monthly fixed", icon: Wallet, bg: "bg-blue-500/10", text: "text-blue-500" },
                    { label: "Est. Bonuses", value: `+$${current.bonus.toLocaleString()}`, sub: "Performance based", icon: TrendingUp, bg: "bg-green-500/10", text: "text-green-500" },
                    { label: "Deductions", value: `-$${current.deductions.toLocaleString()}`, sub: "Penalties if any", icon: AlertTriangle, bg: "bg-orange-500/10", text: "text-orange-500" },
                    { label: "Total Payout", value: `$${totalExpected.toLocaleString()}`, sub: "Estimated net", icon: DollarSign, bg: "bg-primary/10", text: "text-primary" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden relative group">
                        <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40", stat.bg)} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                            <stat.icon className={cn("h-4 w-4", stat.text)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <CardHeader className="border-b border-white/5 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <History className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black tracking-tight">Payment History</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-tighter opacity-70">Review your past earnings</CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Date</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Method</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Net Amount</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.history?.map((h: any) => (
                                    <TableRow key={h.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="py-4 font-bold text-sm tracking-tight capitalize">
                                            {new Date(h.payoutDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] font-black opacity-60 uppercase tracking-tighter">Direct Deposit</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-black text-sm tracking-tighter">${(h.amount + h.bonus - h.deductions).toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                className={cn(
                                                    "rounded-lg border-2 font-black text-[9px] uppercase tracking-[0.1em] px-2.5 py-1",
                                                    h.status === "PAID" ? "border-green-500/20 bg-green-500/10 text-green-600" : "border-orange-500/20 bg-orange-500/10 text-orange-600 shadow-inner"
                                                )}
                                                variant="outline"
                                            >
                                                {h.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none bg-primary/90 text-primary-foreground shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <CardHeader>
                            <CardTitle className="text-xl font-black tracking-tight">Next Payout</CardTitle>
                            <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest">Scheduled Transaction</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white/10">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black tracking-tighter">March 28, 2026</p>
                                    <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Processing in 24 days</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Progress</span>
                                    <span>15%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full w-[15%]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-card/40 backdrop-blur-xl shadow-xl ring-1 ring-white/10 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-black tracking-tight">About Deductions</p>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Penalties may be applied for unexcused absences, late entry to classes, or low student feedback scores. Ensure all attendance is marked on time to avoid processing delays.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
