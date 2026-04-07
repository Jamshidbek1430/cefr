"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  PlaySquare,
  Radio,
  MessageCircle,
  Settings,
  Shield,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

const learnerLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Lesson", href: "/live", icon: Radio },
  { name: "Videos", href: "/videos", icon: PlaySquare },
  { name: "Library", href: "/library", icon: Library },
  { name: "Homework", href: "/homework", icon: ClipboardList },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

const roleBasedLinks: Record<string, any[]> = {
  STUDENT: learnerLinks,
  TEACHER: learnerLinks,
  ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/schedule", icon: CalendarDays },
    { name: "Users", href: "/users", icon: Shield },
    { name: "Students", href: "/students", icon: Users },
    { name: "Teachers", href: "/teachers", icon: UserCheck },
    { name: "Homework", href: "/homework", icon: ClipboardList },
    { name: "Videos", href: "/videos", icon: PlaySquare },
    { name: "Library", href: "/library", icon: Library },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  if (status === "loading" || !session || !session.user) {
    return null;
  }

  const role = session.user.role as string;
  const links = roleBasedLinks[role] || [];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-800 bg-gray-950 transition-transform duration-200 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="rounded-2xl bg-teal-500/15 p-2 text-teal-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500/80">Platform</p>
              <p className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                KOMIL_CEFR
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-full border border-gray-800 p-2 text-gray-400 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <nav className="space-y-2">
            {links.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === link.href
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.02]",
                    isActive
                      ? "bg-teal-500/15 text-teal-300 shadow-lg shadow-teal-500/10"
                      : "text-gray-400 hover:bg-gray-900 hover:text-white hover:shadow-xl",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-800 p-4">
          <div className="mb-4 rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3">
            <p className="truncate text-sm font-medium text-white">{session?.user?.name}</p>
            <p className="mt-1 truncate text-xs text-gray-400">{session?.user?.email}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-teal-400">{role}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOut({ callbackUrl: "/login" });
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
