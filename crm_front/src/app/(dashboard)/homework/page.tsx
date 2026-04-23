"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Plus } from "lucide-react";

type LibraryItem = {
  id: string;
  title: string;
  file_type: "pdf" | "image";
  file_url: string;
};

type Homework = {
  id: string;
  title: string;
  instructions: string;
  due_date: string;
};

type Submission = {
  id: string;
  user_full_name?: string;
  submitted: boolean;
};

function daysRemaining(dateValue: string) {
  const diff = new Date(dateValue).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function dueColor(days: number) {
  if (days <= 1) return "text-red-400";
  if (days <= 3) return "text-orange-400";
  return "text-green-400";
}

function MaterialIcon({ type }: { type: LibraryItem["file_type"] }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#8B1E2D]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {type === "pdf" ? (
        <>
          <path d="M7 3h7l5 5v13H7z" />
          <path d="M14 3v5h5" />
        </>
      ) : (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m21 16-5.5-5.5a1 1 0 0 0-1.4 0L8 17" />
        </>
      )}
    </svg>
  );
}

export default function HomeworkPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [session]);

  async function fetchData() {
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) return;

    try {
      const [hData, lData, sData] = await Promise.all([
        apiFetch("/api/homework/", { accessToken }),
        apiFetch("/api/library/", { accessToken }),
        apiFetch("/api/homework/submissions/", { accessToken })
      ]);

      const hResults = Array.isArray(hData) ? hData : hData.results || [];
      const lResults = Array.isArray(lData) ? lData : lData.results || [];
      const sResults = Array.isArray(sData) ? sData : sData.results || [];

      setHomeworks(hResults);
      setLibraryItems(lResults);
      setSubmissions(sResults);
      if (lResults.length > 0) setSelectedItem(lResults[0]);
    } catch (err) {
      console.error("Failed to fetch homework data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function submitHomework() {
    if (!homeworks[0] || !answer.trim()) return;
    const accessToken = (session as any)?.accessToken;
    try {
      await apiFetch(`/api/homework/${homeworks[0].id}/submit/`, {
        method: "POST",
        accessToken,
        body: JSON.stringify({ answer: answer.trim() }),
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Failed to submit homework:", err);
      alert("Failed to submit: " + err.message);
    }
  }

  if (!mounted || status === "loading") {
    return null;
  }

  const role = session?.user?.role;
  const homework = homeworks[0];
  const days = homework ? daysRemaining(homework.due_date) : 0;

  if (loading) return <p className="p-10 text-gray-400">Loading homework...</p>;

  if (role === "TEACHER" || role === "ADMIN") {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">Homework Submissions</h1>
          <button
            onClick={() => router.push("/teacher/homework")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E2D] text-white rounded-2xl hover:bg-[#6d1723] transition-colors font-bold"
          >
            <Plus className="h-5 w-5" />
            Add Homework
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {submissions.length === 0 ? (
            <p className="text-gray-400">No submissions found.</p>
          ) : (
            submissions?.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between rounded-3xl border border-gray-800 bg-gray-900 p-5">
                <p className="font-bold text-white">{sub.user_full_name || "Student"}</p>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${sub.submitted ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {sub.submitted ? "Submitted" : "Not submitted"}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    );
  }

  if (!homework) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <p className="text-gray-400">No active homework assigned.</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen gap-6 bg-gray-950 text-white p-6 xl:grid-cols-[40%_minmax(0,60%)]">
      <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
        <h1 className="text-2xl font-bold">Reference Materials</h1>
        <div className="mt-5 space-y-3">
          {libraryItems.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No materials found.</p>
          ) : (
            libraryItems.map((item) => (
              <button key={item.id} onClick={() => setSelectedItem(item)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selectedItem?.id === item.id ? "border-[#8B1E2D] bg-[#8B1E2D]/10" : "border-gray-800 bg-gray-950"}`}>
                <MaterialIcon type={item.file_type} />
                <span className="font-semibold">{item.title}</span>
              </button>
            ))
          )}
        </div>
        {selectedItem && (
          <div className="mt-5 min-h-[380px] rounded-2xl border border-gray-800 bg-gray-950 p-4">
            {selectedItem.file_type === "pdf" ? (
              <iframe src={selectedItem.file_url} title={selectedItem.title} className="h-[360px] w-full rounded-xl bg-white" />
            ) : (
              <div className="flex h-[360px] items-center justify-center rounded-xl bg-gray-900 text-gray-400">Image preview: {selectedItem.title}</div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-black">{homework.title}</h2>
            <p className="mt-3 text-gray-400">{homework.instructions}</p>
          </div>
          <p className={`shrink-0 rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 font-bold ${dueColor(days)}`}>
            {days <= 0 ? "Due today" : `${days} days left`}
          </p>
        </div>

        <textarea
          className="mt-6 min-h-[300px] w-full rounded-2xl bg-gray-950 border border-gray-800 p-8 text-white placeholder-gray-500 shadow-2xl outline-none focus:border-[#8B1E2D] focus:ring-2 focus:ring-[#8B1E2D]/50"
          style={{ backgroundColor: '#030712 !important', color: '#ffffff !important' }}
          placeholder="Write your homework answer here..."
          disabled={submitted}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="mt-5 flex justify-end">
          {submitted ? (
            <span className="rounded-full bg-green-500/10 px-4 py-2 font-bold text-green-400">Submitted</span>
          ) : (
            <button onClick={submitHomework} className="rounded-2xl bg-[#8B1E2D] px-6 py-3 font-bold text-white hover:bg-[#6d1723] transition-colors">Submit</button>
          )}
        </div>
      </section>
    </main>
  );
}
