"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function SortOptions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "popularity";
  const order = searchParams.get("order") || (sort === 'distance' ? 'asc' : 'desc');

  const handleSortClick = (targetSort: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (sort === targetSort) {
      params.set("order", order === "desc" ? "asc" : "desc");
    } else {
      params.set("sort", targetSort);
      if (targetSort === 'distance') {
        params.set("order", "asc");
      } else {
        params.set("order", "desc");
      }
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const getSortIcon = (currentSort: string) => {
    if (sort !== currentSort) return null;
    return order === "desc" ? <ArrowDown size={14} className="stroke-[3px]" /> : <ArrowUp size={14} className="stroke-[3px]" />;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button 
        onClick={() => handleSortClick('popularity')}
        className={`flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-full transition-all duration-300 shadow-sm ${sort === 'popularity' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-[#1A2235]/40 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
      >
        인기순 {getSortIcon('popularity')}
      </button>
      <button 
        onClick={() => handleSortClick('distance')}
        className={`flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-full transition-all duration-300 shadow-sm ${sort === 'distance' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-[#1A2235]/40 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
      >
        거리순 {getSortIcon('distance')}
      </button>
      <button 
        onClick={() => handleSortClick('discount')}
        className={`flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-full transition-all duration-300 shadow-sm ${sort === 'discount' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-[#1A2235]/40 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
      >
        할인순 {getSortIcon('discount')}
      </button>
    </div>
  );
}
