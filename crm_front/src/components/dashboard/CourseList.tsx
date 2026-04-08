"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, LayoutGrid, GraduationCap } from "lucide-react";

interface Course {
    id: number;
    name: string;
    description: string;
    assignedTeachers: { id: number; name: string; image?: string; specialty?: string }[];
    groupCount: number;
    studentCount: number;
}

export function CourseList({ courses }: { courses: Course[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-muted/20">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{course.name}</CardTitle>
                                <CardDescription className="line-clamp-1">{course.description}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {course.studentCount} Students
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{course.groupCount} Groups</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{course.assignedTeachers.length} Specialists</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-2">Assigned Faculty</p>
                            <div className="flex -space-x-2 overflow-hidden">
                                {course.assignedTeachers.map((teacher) => (
                                    <Avatar key={teacher.id} className="h-8 w-8 border-2 border-background ring-1 ring-border">
                                        <AvatarImage src={teacher.image} alt={teacher.name} />
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                            {teacher.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                                {course.assignedTeachers.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">No teachers assigned</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
