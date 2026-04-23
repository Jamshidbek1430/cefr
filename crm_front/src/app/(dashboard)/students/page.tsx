"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const mockStudents = [
  { id: 1, full_name: "Ali Karimov", telegram_username: "alikarimov", attendance_percentage: 90, homework_percentage: 75, attendance_history: [80, 85, 90, 90, 90, 95, 90, 90], homework_history: [70, 75, 75, 80, 75, 75, 75, 75] },
  { id: 2, full_name: "Zara Yusupova", telegram_username: "zarayusup", attendance_percentage: 55, homework_percentage: 40, attendance_history: [60, 55, 50, 55, 55, 60, 55, 55], homework_history: [40, 45, 40, 40, 45, 40, 40, 40] },
  { id: 3, full_name: "Bobur Toshmatov", telegram_username: "bobbur", attendance_percentage: 78, homework_percentage: 82, attendance_history: [75, 78, 80, 78, 78, 80, 78, 78], homework_history: [80, 82, 80, 85, 82, 82, 82, 82] },
];

function colorClass(value: number) {
  if (value > 80) return "bg-green-500";
  if (value >= 60) return "bg-orange-500";
  return "bg-red-500";
}

export default function StudentsPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(mockStudents[0].id);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return null;
  }

  if (session?.user?.role !== "TEACHER" && session?.user?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
          <h1 className="text-2xl font-bold">Teacher/Admin only</h1>
        </section>
      </main>
    );
  }

  const students = mockStudents.filter((student) => `${student.full_name} ${student.telegram_username}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-black">Students</h1>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or username..." className="mt-5 w-full max-w-xl rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3 outline-none focus:border-[#8B1E2D]" />

      <div className="mt-6 space-y-4">
        {students.map((student) => {
          const chartData = student.attendance_history.map((attendance, index) => ({
            week: `Week ${index + 1}`,
            attendance,
            homework: student.homework_history[index] || 0,
          }));
          const expanded = expandedId === student.id;
          return (
            <section key={student.id} className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
              <button onClick={() => setExpandedId(expanded ? null : student.id)} className="flex w-full flex-col gap-4 p-5 text-left hover:bg-gray-900/80 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{student.full_name}</h2>
                  <p className="mt-1 text-gray-400">@{student.telegram_username}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${colorClass(student.attendance_percentage)}`}>{student.attendance_percentage}%</span>
                    <span className="text-sm text-gray-400">Attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${colorClass(student.homework_percentage)}`}>{student.homework_percentage}%</span>
                    <span className="text-sm text-gray-400">Homework</span>
                  </div>
                </div>
              </button>

              {expanded && (
                <div className="border-t border-gray-800 p-5">
                  <div className="h-72 rounded-2xl border border-gray-800 bg-gray-950 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12 }} />
                        <Line type="monotone" dataKey="attendance" stroke="#8B1E2D" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="homework" stroke="#a855f7" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
