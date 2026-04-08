"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

type Teacher = {
  id: string;
  full_name: string;
  telegram_username: string;
  created_at: string;
};

export default function TeachersPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) return;

    try {
      const data = await apiFetch("/api/users/?role=teacher", { accessToken });
      // Handle different API responses (Direct array OR Paginated)
      const results = Array.isArray(data) ? data : data.results || [];
      setTeachers(results);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || status === "loading") {
    return null;
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
          <h1 className="text-2xl font-bold">Admin only</h1>
          <p className="mt-2 text-gray-400">Only admins can manage teachers.</p>
        </section>
      </main>
    );
  }

  async function addTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = (session as any)?.accessToken;
    const form = new FormData(event.currentTarget);
    const data = {
      full_name: form.get("full_name"),
      telegram_username: String(form.get("telegram_username") || "").replace(/^@+/, ""),
      password: form.get("temporary_password"),
      role: "teacher"
    };

    try {
      await apiFetch("/api/users/", {
        method: "POST",
        accessToken,
        body: JSON.stringify(data),
      });
      fetchTeachers();
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to add teacher:", error);
      alert("Failed to add teacher. Check console for details.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Teachers</h1>
          <p className="mt-2 text-gray-400">Manage teacher accounts.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="rounded-2xl bg-[#14b8a6] px-5 py-3 font-bold text-white hover:bg-teal-400">Add Teacher</button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-gray-400">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="text-gray-400">No teachers found.</p>
        ) : (
          teachers.map((teacher) => (
            <article key={teacher.id} className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#14b8a6]/10 text-xl font-black text-[#14b8a6]">
                {teacher.full_name?.[0] || "?"}
              </div>
              <h2 className="mt-4 text-xl font-bold">{teacher.full_name}</h2>
              <p className="mt-2 text-gray-400">@{teacher.telegram_username}</p>
              <p className="mt-1 text-sm text-gray-500">
                Added {new Date(teacher.created_at).toLocaleDateString()}
              </p>
            </article>
          ))
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalOpen(false)}>
          <form onSubmit={addTeacher} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-2xl font-bold">Add Teacher</h2>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-gray-300">Full name</span>
              <input name="full_name" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#14b8a6]" />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-gray-300">Telegram username</span>
              <input name="telegram_username" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#14b8a6]" placeholder="@username" />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-gray-300">Temporary password</span>
              <input type="password" name="temporary_password" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#14b8a6]" />
            </label>
            <button className="mt-6 rounded-2xl bg-[#14b8a6] px-6 py-3 font-bold text-white hover:bg-teal-400">Submit</button>
          </form>
        </div>
      )}
    </main>
  );
}
