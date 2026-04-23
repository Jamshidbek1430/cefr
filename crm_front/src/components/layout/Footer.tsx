"use client";

export function Footer() {
    return (
        <footer className="border-t border-gray-800 bg-gray-950 py-6 px-4 md:px-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm font-medium text-gray-500">
                    &copy; 2026 <span className="font-black tracking-tight text-[#8B1E2D]">ARTUR.TURKCE</span>. All rights reserved.
                </p>
                <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>
            </div>
        </footer>
    );
}
