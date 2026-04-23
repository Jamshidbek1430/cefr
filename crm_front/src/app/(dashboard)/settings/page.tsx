"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return null;
  }
  const telegramUsername = session?.user?.email?.split("@")[0] || "telegram_username";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-black">Settings</h1>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-gray-300">Full name</span>
            <input readOnly value={session?.user?.name || ""} className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-gray-300 outline-none" />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-gray-300">Telegram username</span>
            <input readOnly value={telegramUsername} className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-gray-300 outline-none" />
          </label>
        </section>

        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-2xl font-bold">Password</h2>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-300">Current password</span>
              <input type="password" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#8B1E2D]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-300">New password</span>
              <input type="password" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#8B1E2D]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-300">Confirm password</span>
              <input type="password" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#8B1E2D]" />
            </label>
            <button className="rounded-2xl bg-[#8B1E2D] px-6 py-3 font-bold text-white hover:bg-[#8B1E2D]">Save</button>
          </form>
          {saved && <p className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">Password settings saved.</p>}
        </section>
        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-2xl font-bold text-red-400">Account</h2>
          <p className="mt-2 text-sm text-gray-400">Sign out of your account.</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-6 flex w-fit items-center gap-3 rounded-2xl border border-red-500/20 px-6 py-3 font-bold text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </section>
      </div>
    </main>
  );
}
