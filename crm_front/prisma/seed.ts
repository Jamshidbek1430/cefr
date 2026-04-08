const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Clean existing data
    await prisma.report.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.studentNote.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.salary.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.aIUsageLog.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.homework.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.course.deleteMany();

    // Roles
    const superAdminRole = await prisma.role.create({ data: { name: "SUPER_ADMIN" } });
    const adminRole = await prisma.role.create({ data: { name: "ADMIN" } });
    const teacherRole = await prisma.role.create({ data: { name: "TEACHER" } });
    const studentRole = await prisma.role.create({ data: { name: "STUDENT" } });

    // Branches
    const branch1 = await prisma.branch.create({
        data: {
            name: "Downtown Campus",
            location: "123 Main St, City Center",
            revenue: 150000,
        }
    });
    const branch2 = await prisma.branch.create({
        data: {
            name: "Uptown Branch",
            location: "456 North Ave, Skyline",
            revenue: 120000,
        }
    });

    // Courses
    const course1 = await prisma.course.create({
        data: {
            name: "Full Stack Web Development",
            description: "Master modern web technologies from React to Node.js",
        }
    });
    const course2 = await prisma.course.create({
        data: {
            name: "Data Science & AI",
            description: "Learn Python, machine learning, and data visualization",
        }
    });
    const course3 = await prisma.course.create({
        data: {
            name: "English Proficiency",
            description: "Improve your IELTS score and professional communication",
        }
    });

    // Super Admin
    const superAdmin = await prisma.user.create({
        data: {
            email: "superadmin@educrm.com",
            password: "password",
            name: "Alex Johnson",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
            roleId: superAdminRole.id,
        },
    });

    // Admin
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@educrm.com",
            password: "password",
            name: "Sarah Miller",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
            roleId: adminRole.id,
            branchId: branch1.id,
        },
    });

    // Teachers
    const teacherData = [
        { name: "John Smith", email: "john@educrm.com", specialty: "Web Development", exp: 8, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
        { name: "Emily Davis", email: "emily@educrm.com", specialty: "Data Science", exp: 5, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
        { name: "Michael Owen", email: "michael@educrm.com", specialty: "IELTS Prep", exp: 12, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
        { name: "Sophia Cheng", email: "sophia@educrm.com", specialty: "Node.js", exp: 4, img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop" },
    ];

    const teachers = [];
    for (const t of teacherData) {
        const teacher = await prisma.user.create({
            data: {
                email: t.email,
                password: "password",
                name: t.name,
                image: t.img,
                specialty: t.specialty,
                experience: t.exp,
                monthlySalary: 3500 + (t.exp * 200),
                roleId: teacherRole.id,
                branchId: branch1.id,
            },
        });
        teachers.push(teacher);
    }

    // Students
    const students = [];
    for (let i = 1; i <= 20; i++) {
        const s = await prisma.user.create({
            data: {
                email: `student${i}@educrm.com`,
                password: "password",
                name: `Student ${i}`,
                image: `https://i.pravatar.cc/150?u=${i}`,
                activenessScore: Math.floor(60 + Math.random() * 40),
                roleId: studentRole.id,
                branchId: i % 2 === 0 ? branch1.id : branch2.id,
            },
        });
        students.push(s);

        // Add some payments
        await prisma.payment.create({
            data: {
                amount: 500,
                status: i % 7 === 0 ? "UNPAID" : (i % 4 === 0 ? "PARTIAL" : "PAID"),
                studentId: s.id,
            }
        });
    }

    // Groups
    const groups = [];
    const groupNames = ["Alpha (Web)", "Beta (Data)", "Gamma (English)"];
    const branches = [branch1, branch1, branch2];
    const courses = [course1, course2, course3];

    for (let i = 0; i < 3; i++) {
        const g = await prisma.group.create({
            data: {
                name: groupNames[i],
                branchId: branches[i].id,
                courseId: courses[i].id,
                teachers: {
                    connect: [{ id: teachers[i % teachers.length].id }, { id: teachers[(i + 1) % teachers.length].id }]
                }
            },
            include: { teachers: true }
        });
        groups.push(g);
    }

    // Assign students to groups and teachers
    for (let i = 0; i < students.length; i++) {
        const targetGroup = groups[i % 3];
        const primaryTeacher = targetGroup.teachers[i % 2];

        await prisma.user.update({
            where: { id: students[i].id },
            data: {
                teacherId: primaryTeacher.id,
                groups: { connect: { id: targetGroup.id } },
            },
        });

        // Add 1-2 ratings per student for their teacher
        if (i < 15) {
            await prisma.rating.create({
                data: {
                    stars: 4 + (i % 2),
                    comment: i % 3 === 0 ? "Exceptional teaching style!" : "Very informative and practical.",
                    studentId: students[i].id,
                    teacherId: primaryTeacher.id,
                }
            });
        }
    }

    // Salary and Schedules
    const now = new Date();
    for (const teacher of teachers) {
        await prisma.salary.create({
            data: {
                amount: 4000 + (teacher.experience || 0) * 100,
                bonus: teacher.id % 2 === 0 ? 500 : 0,
                deductions: teacher.id % 4 === 0 ? 150 : 0, // Sample penalties
                payoutDate: new Date(now.getFullYear(), now.getMonth(), 28),
                status: teacher.id === teachers[0].id ? "PAID" : "PENDING",
                teacherId: teacher.id,
            }
        });

        // Add history
        await prisma.salary.create({
            data: {
                amount: 4000 + (teacher.experience || 0) * 100,
                bonus: 200,
                deductions: 0,
                payoutDate: new Date(now.getFullYear(), now.getMonth() - 1, 28),
                status: "PAID",
                teacherId: teacher.id,
            }
        });

        for (let day = 1; day <= 5; day++) {
            await prisma.schedule.create({
                data: {
                    startTime: new Date(2026, 2, day + 1, 10 + (teacher.id % 4), 0),
                    endTime: new Date(2026, 2, day + 1, 12 + (teacher.id % 4), 0),
                    dayOfWeek: day,
                    teacherId: teacher.id,
                    groupId: groups[teacher.id % 3].id,
                }
            });
        }
    }

    // Attendance
    for (const group of groups) {
        const groupStudents = await prisma.user.findMany({ where: { groups: { some: { id: group.id } } } });
        for (const student of groupStudents.slice(0, 10)) {
            await prisma.attendance.create({
                data: {
                    date: now,
                    status: (student.id + group.id) % 8 === 0 ? "ABSENT" : "PRESENT",
                    studentId: student.id,
                    groupId: group.id,
                    teacherId: group.teachers[0].id,
                }
            });
        }
    }

    // Chat Message (Admin/Teacher -> Super Admin messenger style)
    await prisma.chatMessage.create({
        data: {
            content: "Welcome to the new branch management system!",
            senderId: superAdmin.id,
            receiverId: adminUser.id,
        }
    });

    await prisma.chatMessage.create({
        data: {
            content: "Thank you! I've already updated the teacher profiles for our branch.",
            senderId: adminUser.id,
            receiverId: superAdmin.id,
        }
    });

    for (const teacher of teachers.slice(0, 2)) {
        await prisma.chatMessage.create({
            data: {
                content: `Requesting a review of the curriculum for ${teacher.specialty}.`,
                senderId: teacher.id,
                receiverId: superAdmin.id,
            }
        });
    }

    // Lessons and Homework
    for (const group of groups) {
        // Group Invitation Message
        await prisma.chatMessage.create({
            data: {
                content: `Welcome to the ${group.name} group chat! All students and admins in this group can participate here.`,
                senderId: adminUser.id,
                groupId: group.id,
            }
        });

        const lesson = await prisma.lesson.create({
            data: {
                title: `Advanced Module: ${group.name}`,
                content: "Exploring deep dive topics and architectural patterns.",
                groupId: group.id,
                teacherId: group.teachers[0].id,
            },
        });

        const studentsInGroup = await prisma.user.findMany({ where: { groups: { some: { id: group.id } } } });
        for (const student of studentsInGroup.slice(0, 8)) {
            await prisma.homework.create({
                data: {
                    title: "Project Milestone 1",
                    description: "Implement the core logic discussed in today's lesson.",
                    dueDate: new Date(Date.now() + 86400000 * 5),
                    submitted: student.id % 3 !== 0,
                    studentId: student.id,
                    groupId: group.id,
                    lessonId: lesson.id,
                },
            });
        }
    }

    // Reports
    await prisma.report.create({
        data: {
            title: "March 2026 Academic Performance",
            content: "<h2>Academic Overview</h2><p>Student engagement is at an all-time high with the new AI integration features.</p><h3>Key Metrics:</h3><ul><li>Average Activeness: 84%</li><li>Homework Submission: 78%</li></ul>",
            authorId: superAdmin.id,
        }
    });

    // AI Training Sessions and Center Ratings for Students
    for (let i = 0; i < 5; i++) {
        const student = students[i];
        await prisma.trainingSession.create({
            data: {
                topic: i % 2 === 0 ? "React Fundamentals" : "Next.js Architecture",
                score: 8 + (i % 3),
                totalQuestions: 10,
                studentId: student.id,
            }
        });

        await prisma.centerRating.create({
            data: {
                stars: 4 + (i % 2),
                comment: i % 2 === 0 ? "Great facilities and responsive support!" : "Excellent curriculum structure.",
                period: "2026-03",
                studentId: student.id,
            }
        });
    }

    console.log("Database seeded successfully with rich modern data!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
