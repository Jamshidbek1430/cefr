"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

import {
  EmptyState,
  LoadingState,
  PageCard,
  ProgressMetricCircle,
  StudentsDirectory,
  WeeklyPerformanceChart,
} from "@/components/dashboard/education-ui";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/useMockLoading";
import {
  formatCountdownUnit,
  getCountdownParts,
  getDaysRemaining,
  mockDashboard,
  mockStudents,
} from "@/lib/education-mocks";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function NextLessonCountdown({ session }: { session: any }) {
  const [now, setNow] = useState(Date.now());
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
    const interval = setInterval(fetchLesson, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function fetchLesson() {
    try {
      const data = await apiFetch("/api/lessons/active/", { accessToken: session?.accessToken });
      if (data && data.id) {
        setLesson(data);
      } else {
        setLesson(null);
      }
    } catch (err) {
      console.error("Dashboard lesson fetch failed:", err);
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-3xl bg-gray-900/50" />;
  if (!lesson) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center py-10">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-700">No lessons scheduled</p>
        <p className="mt-2 text-xs text-gray-600">Check back later for updates.</p>
      </div>
    );
  }

  const lessonTime = new Date(lesson.datetime).getTime();
  const diff = lessonTime - now;
  const isSoon = lesson.status === "scheduled" && diff > 0 && diff <= 3600000;
  const isLive = lesson.status === "live";

  // Countdown parts
  const d_diff = Math.max(0, diff);
  const h = Math.floor((d_diff % 86400000) / 3600000);
  const m = Math.floor((d_diff % 3600000) / 60000);
  const s = Math.floor((d_diff % 60000) / 1000);

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B1E2D]/70">Next lesson</p>
        <h3 className="mt-3 text-2xl font-black italic tracking-tighter text-white uppercase">{lesson.title}</h3>
      </div>

      <div className={cn(
        "rounded-[2rem] border p-6 text-center shadow-2xl transition-all duration-500",
        isLive ? "bg-teal-950/30 border-[#8B1E2D]/30 shadow-[#8B1E2D]/10" : "bg-gray-950/70 border-gray-800/50"
      )}>
        {isLive ? (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white animate-pulse">
              SESSION ACTIVE
            </div>
            <Button asChild className="w-full h-14 rounded-2xl bg-[#8B1E2D] text-lg font-black text-white hover:bg-[#8B1E2D] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-500/20">
              <Link href="/live">JOIN SESSION</Link>
            </Button>
          </div>
        ) : isSoon ? (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B1E2D] animate-pulse">Starting soon</p>
            <p className="text-5xl font-black tracking-tighter text-white tabular-nums">
              {pad(m)}:{pad(s)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-4xl font-black tracking-tighter text-white tabular-nums">
              {pad(h)}:{pad(m)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Hours : Minutes</p>
          </div>
        )}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
        Tashkent Time (UTC+5)
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const isLoading = useMockLoading();

  if (status === "loading" || isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (status !== "authenticated") {
    return (
      <EmptyState
        title="Session required"
        description="Please sign in to view your dashboard."
      />
    );
  }

  const role = session?.user.role ?? "STUDENT";

  if (role === "STUDENT") {
    return (
      <div className="space-y-6">
        <div className="px-2 md:px-0">
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#8B1E2D]/70">ARTUR.TURKCE system</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-white">Welcome back.</h1>
          <p className="mt-2 text-sm md:text-base text-gray-400 font-medium">
            Your progress at a glance • Attendance, homework, and live lessons.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <PageCard className="p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">Activity Graph</h2>
              <p className="mt-2 text-sm text-gray-400">
                Attendance is teal and homework submission is purple across eight study weeks.
              </p>
            </div>
            <WeeklyPerformanceChart
              attendance={mockDashboard.attendance_history}
              homework={mockDashboard.homework_history}
              height={320}
            />
          </PageCard>

          <PageCard className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Status circles</h2>
              <p className="mt-2 text-sm text-gray-400">
                Color changes automatically based on the performance thresholds you requested.
              </p>
            </div>
            <div className="flex flex-col gap-8 sm:flex-row sm:justify-center">
              <ProgressMetricCircle label="Attendance" value={mockDashboard.attendance_percentage} />
              <ProgressMetricCircle label="Homework" value={mockDashboard.homework_percentage} />
            </div>
          </PageCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <PageCard className="p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">Upcoming homework</h2>
              <p className="mt-2 text-sm text-gray-400">
                Due dates highlight urgency so students know what needs attention first.
              </p>
            </div>

            {mockDashboard.upcoming_homework.length === 0 ? (
              <EmptyState
                title="No upcoming homework"
                description="You're all caught up for now."
              />
            ) : (
              <div className="space-y-3">
                {mockDashboard.upcoming_homework.map((item) => {
                  const daysRemaining = getDaysRemaining(item.due_date);
                  const urgencyClass =
                    daysRemaining <= 1
                      ? "text-red-400"
                      : daysRemaining <= 3
                        ? "text-orange-400"
                        : "text-white";

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 p-4 sm:flex-row sm:items-center transition-all duration-300 hover:scale-[1.01] hover:bg-gray-900 shadow-lg hover:shadow-teal-500/5"
                    >
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-gray-400">{item.due_date}</p>
                      </div>
                      <p className={cn("text-sm font-semibold", urgencyClass)}>
                        {daysRemaining <= 0
                          ? "Due today"
                          : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </PageCard>

          <PageCard className="p-6">
            <NextLessonCountdown session={session} />
          </PageCard>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          {role === "ADMIN" ? "Admin dashboard" : "Teacher dashboard"}
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          {role === "ADMIN" ? "Student performance overview" : "Student performance"}
        </h1>
        <p className="mt-2 text-gray-400">
          Search learners, compare attendance with homework completion, and expand any row to inspect weekly trends.
        </p>
      </div>

      <StudentsDirectory
        students={mockStudents}
        action={
          role === "ADMIN" ? (
            <Button asChild className="h-11 rounded-2xl bg-[#8B1E2D] text-white hover:bg-[#8B1E2D]">
              <Link href="/teachers">
                <Plus className="h-4 w-4" />
                Add Teacher
              </Link>
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
