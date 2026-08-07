"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Navigation } from "lucide-react";

type Station = {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
};

const mapData = [
  // Yamanote Line
  { slug: "ikebukuro", x: 300, y: 150, name: "이케부쿠로", name_jp: "池袋", color: "#80c241", textOffsetX: -20, textOffsetY: -20 },
  { slug: "ueno", x: 500, y: 150, name: "우에노", name_jp: "上野", color: "#80c241", textOffsetX: 20, textOffsetY: -20 },
  { slug: "akihabara", x: 600, y: 230, name: "아키하바라", name_jp: "秋葉原", color: "#80c241", textOffsetX: 30, textOffsetY: 5 },
  { slug: "tokyo", x: 600, y: 325, name: "도쿄역", name_jp: "東京", color: "#80c241", textOffsetX: 30, textOffsetY: 5 },
  { slug: "shinagawa", x: 500, y: 500, name: "시나가와", name_jp: "品川", color: "#80c241", textOffsetX: 20, textOffsetY: 25 },
  { slug: "shibuya", x: 300, y: 500, name: "시부야", name_jp: "渋谷", color: "#80c241", textOffsetX: -20, textOffsetY: 25 },
  { slug: "shinjuku", x: 200, y: 325, name: "신주쿠", name_jp: "新宿", color: "#80c241", textOffsetX: -30, textOffsetY: 5 },
  
  // Subway Lines
  { slug: "roppongi", x: 420, y: 440, name: "롯폰기", name_jp: "六本木", color: "#b5b5ac", textOffsetX: 0, textOffsetY: 25 },
  { slug: "ginza", x: 550, y: 410, name: "긴자", name_jp: "銀座", color: "#f39700", textOffsetX: 20, textOffsetY: 25 },
  { slug: "asakusa", x: 580, y: 60, name: "아사쿠사", name_jp: "浅草", color: "#ff4b00", textOffsetX: 30, textOffsetY: 5 },
  { slug: "omote-sando", x: 340, y: 440, name: "오모테산도", name_jp: "表参道", color: "#f46c9e", textOffsetX: -30, textOffsetY: -20 },
];

export default function InteractiveMap() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDeparture = searchParams.get('from') || '';
  const currentDestination = searchParams.get('to') || '';

  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  const handleNodeClick = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (!currentDeparture) {
      params.set('from', slug);
    } else if (!currentDestination && slug !== currentDeparture) {
      params.set('to', slug);
      // Scroll to top where JourneyVisualizer is
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      params.set('from', slug);
      params.delete('to');
    }
    
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A2235]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] shadow-lg">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MapPin className="text-cyan-400" /> 도쿄 인터랙티브 맵
          </h2>
          <p className="text-white/50 text-sm mt-1">지도에서 역을 클릭하여 출발지와 도착지를 빠르게 설정하세요.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-[#0A0E17]/60 px-4 py-2 rounded-xl border border-white/10">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-sm font-bold text-white/80">출발: {mapData.find(m => m.slug === currentDeparture)?.name || '미설정'}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0A0E17]/60 px-4 py-2 rounded-xl border border-white/10">
            <span className="w-3 h-3 rounded-full bg-pink-500 animate-pulse"></span>
            <span className="text-sm font-bold text-white/80">도착: {mapData.find(m => m.slug === currentDestination)?.name || '미설정'}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto aspect-[4/3] md:aspect-[21/9] bg-[#0A0E17]/80 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden select-none border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
        
        <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 800 650" preserveAspectRatio="xMidYMid meet">
          {/* JR Yamanote Line (Green Loop) */}
          <path 
            d="M 300 150 L 500 150 Q 600 150 600 250 L 600 400 Q 600 500 500 500 L 300 500 Q 200 500 200 400 L 200 250 Q 200 150 300 150 Z" 
            fill="none" 
            stroke="#80c241" 
            strokeWidth="12" 
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60 drop-shadow-[0_0_10px_rgba(128,194,65,0.6)]"
          />

          {/* Ginza Line (Orange) Shibuya -> Omote-sando -> Ginza -> Ueno -> Asakusa */}
          <path 
            d="M 300 500 L 340 440 L 550 410 L 500 150 L 580 60" 
            fill="none" 
            stroke="#f39700" 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60 drop-shadow-[0_0_10px_rgba(243,151,0,0.6)]"
          />

          {/* Hibiya Line (Silver/Gray) Roppongi -> Ginza -> Akihabara -> Ueno */}
          <path 
            d="M 420 440 L 550 410 L 600 230 L 500 150" 
            fill="none" 
            stroke="#b5b5ac" 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60 drop-shadow-[0_0_10px_rgba(181,181,172,0.6)]"
          />

          {/* Marunouchi Line (Red) Shinjuku -> Ginza -> Tokyo -> Ikebukuro */}
          <path 
            d="M 200 325 Q 350 450 550 410 Q 580 325 600 325 Q 450 200 300 150" 
            fill="none" 
            stroke="#e60012" 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60 drop-shadow-[0_0_10px_rgba(230,0,18,0.6)]"
          />

          {mapData.map((node) => {
            const isHovered = hoveredStation === node.slug;
            const isDeparture = currentDeparture === node.slug;
            const isDestination = currentDestination === node.slug;
            const isSelected = isDeparture || isDestination;
            
            return (
              <g 
                key={node.slug}
                onClick={(e) => handleNodeClick(node.slug, e)}
                onMouseEnter={() => setHoveredStation(node.slug)}
                onMouseLeave={() => setHoveredStation(null)}
                className="transition-all duration-300 cursor-pointer" 
                style={{ transformOrigin: `${node.x}px ${node.y}px`, transform: isHovered || isSelected ? 'scale(1.15)' : 'scale(1)' }}
              >
                {(isHovered || isSelected) && (
                  <circle cx={node.x} cy={node.y} r="30" fill={isDeparture ? '#3b82f6' : isDestination ? '#ec4899' : node.color} className="opacity-30 animate-pulse" />
                )}
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r="12" 
                  fill="#0A0E17" 
                  stroke={isDeparture ? '#3b82f6' : isDestination ? '#ec4899' : node.color} 
                  strokeWidth={isSelected ? "6" : "4"}
                  className="transition-colors duration-300 shadow-xl"
                />
                
                {/* Station Label Background */}
                <rect 
                  x={node.x + node.textOffsetX - 40} 
                  y={node.y + node.textOffsetY - 12} 
                  width="80" 
                  height="24" 
                  rx="12" 
                  fill={isHovered || isSelected ? (isDeparture ? '#3b82f6' : isDestination ? '#ec4899' : 'white') : 'rgba(26, 34, 53, 0.8)'} 
                  className="transition-colors duration-300 backdrop-blur-sm"
                  stroke={isHovered || isSelected ? 'transparent' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="1"
                />
                {/* Station Label Text */}
                <text 
                  x={node.x + node.textOffsetX} 
                  y={node.y + node.textOffsetY + 4} 
                  textAnchor="middle"
                  fill={isHovered || isSelected ? (isSelected ? 'white' : '#0A0E17') : 'white'} 
                  fontSize="12" 
                  fontWeight="900"
                  className="transition-colors duration-300 select-none drop-shadow-sm"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
