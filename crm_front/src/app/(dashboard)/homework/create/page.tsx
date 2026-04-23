"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function CreateHomeworkPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return null;
  }

  const role = session?.user?.role;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-gray-800 bg-gray-900 p-6">
        <h1 className="text-3xl font-black">Create Homework</h1>
        {role === "STUDENT" && <p className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-300">Only teachers and admins should assign homework.</p>}
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Title</span>
            <input className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none focus:border-[#8B1E2D]" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Instructions</span>
            <textarea className="mt-2 min-h-40 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none focus:border-[#8B1E2D]" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Due date</span>
            <input type="datetime-local" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none focus:border-[#8B1E2D]" />
          </label>
          <button className="rounded-2xl bg-[#8B1E2D] px-6 py-3 font-bold text-white hover:bg-[#8B1E2D]">Submit</button>
        </form>
        {saved && <p className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">Homework created.</p>}
      </section>
    </main>
  );
}
