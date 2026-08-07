"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";

interface HeaderMenuClientProps {
  menus: { id: string; title: string; url: string }[];
}

export default function HeaderMenuClient({ menus }: HeaderMenuClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        {/* 모바일 메뉴 토글 */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white/70 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileMenuOpen && menus.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-[#0A0E17]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:hidden z-50">
          <nav className="max-w-7xl mx-auto px-5 py-3 space-y-1">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                href={menu.url}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-white/80 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-500/30"
              >
                {menu.title}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
