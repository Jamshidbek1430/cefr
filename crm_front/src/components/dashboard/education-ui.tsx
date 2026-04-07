/* eslint-disable @next/next/no-img-element */
"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  buildWeeklyHistory,
  formatDate,
  formatDateTime,
  getDaysRemaining,
  getProgressBgClass,
  getProgressColor,
  getProgressTextClass,
  type LibraryItem,
  type StudentRecord,
} from "@/lib/education-mocks";
import { cn } from "@/lib/utils";

const cardClassName = "rounded-3xl border border-gray-800 bg-gray-900";

export function PageCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn(cardClassName, "transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5", className)}>{children}</section>;
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-gray-800 bg-gray-900">
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-800 bg-gray-900/70 p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-2xl border-gray-800 bg-gray-900 pl-10 text-white placeholder:text-gray-500"
      />
    </div>
  );
}

export function WeeklyPerformanceChart({
  attendance,
  homework,
  height = 260,
}: {
  attendance: number[];
  homework: number[];
  height?: number;
}) {
  const chartData = buildWeeklyHistory(attendance, homework);

  return (
    <div className="h-full w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#1f2937" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "16px",
              color: "#ffffff",
            }}
          />
          <Line type="monotone" dataKey="attendance" stroke="#14b8a6" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="homework" stroke="#a855f7" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProgressMetricCircle({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color = getProgressColor(value);
  const textClass = getProgressTextClass(value);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex h-[100px] w-[100px] items-center justify-center rounded-full text-2xl font-bold text-white shadow-[0_18px_45px_rgba(20,184,166,0.15)]"
        style={{ backgroundColor: color }}
      >
        {value}%
      </div>
      <p className="text-sm font-medium text-gray-300">{label}</p>
      <p className={cn("text-xl font-bold", textClass)}>{value}%</p>
    </div>
  );
}

export function MetricChip({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white",
          getProgressBgClass(value),
        )}
      >
        {value}%
      </div>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className={cn("text-xs", getProgressTextClass(value))}>{value}%</p>
      </div>
    </div>
  );
}

export function StudentsDirectory({
  students,
  includeSubmissions = false,
  action,
}: {
  students: StudentRecord[];
  includeSubmissions?: boolean;
  action?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(students[0]?.id ?? null);
  const filteredStudents = students.filter((student) => {
    const haystack = `${student.full_name} ${student.telegram_username}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by student name or Telegram username"
        />
        {action}
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try a different name or Telegram username."
        />
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => {
            const isExpanded = expandedId === student.id;

            return (
              <div
                key={student.id}
                className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : student.id)}
                  className="flex w-full flex-col gap-4 px-5 py-5 text-left transition-all duration-200 hover:bg-gray-900/80 md:flex-row md:items-center md:justify-between group"
                >
                  <div>
                    <p className="text-lg font-bold tracking-tight text-white group-hover:text-teal-400 transition-colors">{student.full_name}</p>
                    <p className="mt-1 text-sm text-gray-500 font-medium tracking-tight">@{student.telegram_username}</p>
                  </div>
                  <div className="flex gap-4">
                    <MetricChip label="Attendance" value={student.attendance_percentage} />
                    <MetricChip label="Homework" value={student.homework_percentage} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-800 px-5 py-5">
                    <div className="rounded-3xl border border-gray-800 bg-gray-950/70 p-4">
                      <WeeklyPerformanceChart
                        attendance={student.attendance_history}
                        homework={student.homework_history}
                        height={240}
                      />
                    </div>

                    {includeSubmissions && (
                      <div className="mt-5 space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                          Homework submissions
                        </h3>
                        {student.submissions?.length ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            {student.submissions.map((submission) => (
                              <div
                                key={submission.id}
                                className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="font-medium text-white">{submission.homework_title}</p>
                                  <span
                                    className={cn(
                                      "rounded-full px-3 py-1 text-xs font-semibold",
                                      submission.submitted
                                        ? "bg-green-500/15 text-green-400"
                                        : "bg-red-500/15 text-red-400",
                                    )}
                                  >
                                    {submission.submitted ? "Submitted" : "Not submitted"}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-400">
                                  {submission.answer || "No answer has been submitted yet."}
                                </p>
                                {submission.submitted_at && (
                                  <p className="mt-3 text-xs text-gray-500">
                                    {formatDateTime(submission.submitted_at)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <EmptyState
                            title="No submissions yet"
                            description="This student has not submitted any homework yet."
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LibraryTypeIcon({
  type,
  className,
}: {
  type: LibraryItem["file_type"];
  className?: string;
}) {
  if (type === "pdf") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 14h6M9 18h5" />
      </svg>
    );
  }

  if (type === "audio") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Zm16 0v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5.2-5.2a1 1 0 0 0-1.4 0L8 17" />
    </svg>
  );
}

export function DueDateText({ dateValue }: { dateValue: string }) {
  const daysRemaining = getDaysRemaining(dateValue);
  const colorClass =
    daysRemaining <= 1 ? "text-red-400" : daysRemaining <= 3 ? "text-orange-400" : "text-gray-300";

  return (
    <div className="text-sm">
      <p className="text-gray-400">{formatDate(dateValue)}</p>
      <p className={cn("mt-1 font-medium", colorClass)}>
        {daysRemaining <= 0 ? "Due today" : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`}
      </p>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  closeOnOverlay = true,
  closeOnEscape = true,
  panelClassName,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  panelClassName?: string;
}) {
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeOnEscape, onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
      onClick={() => {
        if (closeOnOverlay) onClose();
      }}
    >
      <div
        className={cn(
          "max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-gray-800 bg-gray-900 p-6",
          panelClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose?: () => void;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description ? <p className="mt-2 text-sm text-gray-400">{description}</p> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-gray-800 p-2 text-gray-400 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export { cardClassName };
