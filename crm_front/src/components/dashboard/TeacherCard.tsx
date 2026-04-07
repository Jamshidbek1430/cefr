"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Briefcase, GraduationCap, Calendar, Star, Users } from "lucide-react";

interface Teacher {
    id: number;
    name: string;
    email: string;
    image: string;
    specialty: string;
    experience: number;
    salary: number;
    avgRating: string;
}

export function TeacherCard({ teacher }: { teacher: Teacher }) {
    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-background to-muted/30">
            <div className="h-2 bg-primary" />
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-16 w-16 border-2 border-primary/20 p-0.5">
                    <AvatarImage src={teacher.image} alt={teacher.name} className="object-cover rounded-full" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {teacher.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">{teacher.name}</CardTitle>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                            {teacher.specialty}
                        </Badge>
                    </div>
                    <CardDescription>{teacher.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/40">
                        <div className="p-1.5 rounded-md bg-green-500/10">
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Monthly Salary</p>
                            <p className="text-sm font-bold text-foreground">${teacher.salary.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/40">
                        <div className="p-1.5 rounded-md bg-blue-500/10">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Experience</p>
                            <p className="text-sm font-bold text-foreground">{teacher.experience} Years</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold">{teacher.avgRating}</span>
                        <span className="text-xs text-muted-foreground">(Overall Rating)</span>
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
                        View Schedule
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
