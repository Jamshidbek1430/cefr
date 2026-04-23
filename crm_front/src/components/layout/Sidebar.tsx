"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from 'react-i18next';
import '@/i18n';
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  PlaySquare,
  Settings,
  Shield,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

export function Sidebar() {
  const { t } = useTranslation('common');
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  if (status === "loading" || !session || !session.user) {
    return null;
  }

  const role = session.user.role as string;

  const learnerLinks = [
    { name: t('nav.dashboard'), href: "/dashboard", icon: LayoutDashboard },
    { name: t('nav.videos'), href: "/videos", icon: PlaySquare },
    { name: t('nav.library'), href: "/library", icon: Library },
    { name: t('nav.homework'), href: "/homework", icon: ClipboardList },
    { name: t('nav.settings'), href: "/settings", icon: Settings },
  ];

  const roleBasedLinks: Record<string, any[]> = {
    STUDENT: learnerLinks,
    TEACHER: learnerLinks,
    ADMIN: [
      { name: t('nav.dashboard'), href: "/dashboard", icon: LayoutDashboard },
      { name: t('nav.schedule'), href: "/schedule", icon: CalendarDays },
      { name: t('nav.users'), href: "/users", icon: Shield },
      { name: t('nav.students'), href: "/students", icon: Users },
      { name: t('nav.teachers'), href: "/teachers", icon: UserCheck },
      { name: t('nav.homework'), href: "/homework", icon: ClipboardList },
      { name: t('nav.videos'), href: "/videos", icon: PlaySquare },
      { name: t('nav.library'), href: "/library", icon: Library },
      { name: t('nav.settings'), href: "/settings", icon: Settings },
    ],
  };

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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B1E2D]">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
                ARTUR
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">
                TURKCE
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-900 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#8B1E2D] text-white shadow-lg shadow-[#8B1E2D]/20"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-gray-900 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('buttons.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
