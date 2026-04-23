"use client";

import { useSession } from "next-auth/react";
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { Bell, Menu } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-800 bg-gray-950/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="border border-gray-800 text-gray-300 hover:bg-gray-900 hover:text-white md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500/70">ARTUR.TURKCE {t('dashboard.platform')}</p>
          <p className="text-lg font-black tracking-tight text-white">{t('dashboard.learning_workspace')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        
        <Button
          variant="ghost"
          size="icon"
          className="relative border border-gray-800 text-gray-300 hover:bg-gray-900 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#8B1E2D]" />
          <span className="sr-only">Notifications</span>
        </Button>

        {session?.user && (
          <div className="hidden items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900 px-4 py-2 md:flex">
            <div className="h-10 w-10 rounded-full bg-[#8B1E2D]/15" />
            <div className="text-right">
              <p className="text-sm font-medium text-white">{session?.user?.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                {session?.user?.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
