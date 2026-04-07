"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SalaryBreakdownProps {
    salary: any;
    avgRating: number;
}

export function SalaryBreakdown({ salary, avgRating }: SalaryBreakdownProps) {
    const baseAmount = salary?.amount || 0;
    const performanceBonus = avgRating >= 4.5 ? 200 : 0;
    const additionalBonus = salary?.bonus || 0;
    const deductions = salary?.deductions || 0;
    const total = baseAmount + performanceBonus + additionalBonus - deductions;

    return (
        <Card className="shadow-md border-primary/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Salary Breakdown
                </CardTitle>
                <CardDescription>Estimated payout for {salary?.payoutDate ? new Date(salary.payoutDate).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'current month'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Base Salary</span>
                        <span className="font-medium">${baseAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Performance Bonus</span>
                            {performanceBonus > 0 ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            )}
                        </div>
                        <span className={performanceBonus > 0 ? "font-medium text-green-600" : "text-muted-foreground"}>
                            +${performanceBonus.toFixed(2)}
                        </span>
                    </div>

                    {additionalBonus > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Additional Bonuses</span>
                            <span className="font-medium text-green-600">+${additionalBonus.toFixed(2)}</span>
                        </div>
                    )}

                    {deductions > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Deductions/Penalties</span>
                            <span className="font-medium text-destructive">-${deductions.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="pt-2 border-t flex justify-between items-center">
                        <span className="font-semibold text-base">Total Estimated</span>
                        <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
                    </div>

                    {avgRating < 4.5 && (
                        <p className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded italic text-center">
                            Pro tip: Reach a 4.5 average rating to unlock the $200 performance bonus!
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
