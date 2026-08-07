"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Lightbulb, Train, Utensils, Info, ChevronRight, ChevronLeft } from "lucide-react";

type Menu = {
  id: string;
  title: string;
  url: string;
};

export default function CategoryScrollMenu({ menus }: { menus: Menu[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [menus]);

  const getIcon = (title: string) => {
    if (title.includes("팁") || title.includes("추천")) return <Lightbulb size={18} className="text-yellow-400 group-hover:text-yellow-300 transition-colors drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />;
    if (title.includes("교통") || title.includes("지하철") || title.includes("패스")) return <Train size={18} className="text-cyan-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />;
    if (title.includes("맛집") || title.includes("식당")) return <Utensils size={18} className="text-pink-500 group-hover:text-pink-400 transition-colors drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" />;
    return <Info size={18} className="text-purple-400 group-hover:text-purple-300 transition-colors drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]" />;
  };

  return (
    <div className="relative max-w-7xl mx-auto px-5">
      {/* 왼쪽 스크롤 가능 표시 */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0A0E17] via-[#0A0E17]/80 to-transparent z-10 pointer-events-none flex items-center justify-start pl-3">
          <div className="bg-[#1A2235]/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm border border-white/10">
            <ChevronLeft size={14} className="text-white/50" />
          </div>
        </div>
      )}

      <nav
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-3 -mx-1 px-1 relative"
      >
        {menus.map((menu) => (
          <Link
            key={menu.id}
            href={menu.url}
            className="group flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-xl text-[15px] font-extrabold text-white/70 hover:text-white transition-all whitespace-nowrap relative"
          >
            <div className="bg-[#1A2235] p-1.5 rounded-lg group-hover:bg-[#2A3655] transition-colors border border-white/5 group-hover:border-white/20">
              {getIcon(menu.title)}
            </div>
            <span>{menu.title}</span>
            <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
          </Link>
        ))}
      </nav>

      {/* 오른쪽 스크롤 가능 표시 (화살표) */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0A0E17] via-[#0A0E17]/90 to-transparent z-10 pointer-events-none flex items-center justify-end pr-3">
          <div className="bg-[#1A2235]/90 backdrop-blur-sm rounded-full p-0.5 shadow-sm border border-white/10 animate-pulse">
            <ChevronRight size={16} className="text-white/70" />
          </div>
        </div>
      )}
    </div>
  );
}
