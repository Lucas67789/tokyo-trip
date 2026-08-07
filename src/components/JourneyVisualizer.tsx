"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  METRO_STATIONS,
  METRO_CONNECTIONS,
  METRO_LINES,
  StationData,
  Connection
} from "@/lib/metro_data";

export const CATEGORY_COLORS: Record<string, string> = {
  '테마파크': 'from-blue-500 to-indigo-600',
  '야경': 'from-purple-500 to-pink-600',
  '수족관': 'from-cyan-500 to-blue-600',
  '명소': 'from-amber-500 to-orange-600',
  '관광지': 'from-amber-500 to-orange-600',
  '맛집': 'from-orange-500 to-red-600',
  '신사': 'from-red-500 to-rose-700',
  '쇼핑': 'from-pink-500 to-rose-600',
  '자연': 'from-green-500 to-emerald-600',
};
import {
  Search,
  MapPin,
  ArrowRight,
  ArrowLeftRight,
  Train,
  Map as MapIcon,
  Hotel,
  CheckCircle2,
  Navigation,
  ExternalLink,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Dijkstra pathfinding with multi-route support
const findMultipleRoutes = (startSlug: string, endSlug: string) => {
  if (startSlug === endSlug) return [];
  
  const solve = (excludeEdge?: { from: string; to: string; line: string }, excludedLines: string[] = []) => {
    const distances: Record<string, number> = {};
    const previous: Record<string, { station: string; line: string | null } | null> = {};
    const nodes = new Set<string>();

    Object.keys(METRO_STATIONS).forEach(slug => {
      distances[slug] = slug === startSlug ? 0 : Infinity;
      nodes.add(slug);
    });

    while (nodes.size > 0) {
      let closestNode = Array.from(nodes).reduce((min, node) => 
        distances[node] < distances[min] ? node : min
      );

      if (distances[closestNode] === Infinity) break;
      if (closestNode === endSlug) break;

      nodes.delete(closestNode);

      const neighbors = METRO_CONNECTIONS.filter(c => 
        (c.from === closestNode || c.to === closestNode) &&
        !excludedLines.includes(c.line) &&
        !(excludeEdge && ((c.from === excludeEdge.from && c.to === excludeEdge.to && c.line === excludeEdge.line) || (c.from === excludeEdge.to && c.to === excludeEdge.from && c.line === excludeEdge.line)))
      );

      neighbors.forEach(conn => {
        const neighbor = conn.from === closestNode ? conn.to : conn.from;
        if (!nodes.has(neighbor)) return;

        let penalty = 0;
        const prev = previous[closestNode];
        // Add 5 min penalty if changing to a different train line
        if (prev && prev.line && conn.line !== 'walk' && prev.line !== 'walk' && prev.line !== conn.line) {
          penalty = 5;
        }

        const alt = distances[closestNode] + conn.time + penalty;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = { station: closestNode, line: conn.line };
        }
      });
    }

    if (!previous[endSlug]) return null;

    const path: any[] = [];
    let curr = endSlug;
    while (curr !== startSlug) {
      const prev = previous[curr]!;
      const line = METRO_LINES[prev.line!];
      path.unshift({ station: METRO_STATIONS[curr], line, action: 'MOVE', time: METRO_CONNECTIONS.find(c => (c.from === curr && c.to === prev.station) || (c.to === curr && c.from === prev.station))?.time || 0 });
      curr = prev.station;
    }
    path.unshift({ station: METRO_STATIONS[startSlug], line: null, action: 'START', time: 0 });

    const steps = path.map((p, i) => {
      if (i === 0) return { ...p, action: 'START' };
      if (i === path.length - 1) return { ...p, action: 'END' };
      const nextP = path[i+1];
      if (!nextP.line && i === path.length - 2) return { ...p, action: 'WALK' };
      if (p.line?.id !== nextP?.line?.id) return { ...p, action: 'TRANSFER' };
      return p;
    });

    const instructions: string[] = [];
    steps.forEach((s, i) => {
      if (s.action === 'START') {
        const next = steps[i+1];
        instructions.push(`${s.station.name_ko}에서 ${next.line.name} 승차`);
      } else if (s.action === 'TRANSFER') {
        const next = steps[i+1];
        instructions.push(`${s.station.name_ko}에서 ${next.line.name}(으)로 환승`);
      } else if (s.action === 'END') {
        instructions.push(`${s.station.name_ko} 도착`);
      }
    });

    return { steps, totalTime: distances[endSlug], instructions };
  };

  const primary = solve();
  if (!primary) return [];

  const routes = [primary];
  const firstRealLine = primary.steps.find(s => s.line && s.line.id !== 'walk')?.line?.id;
  const usedLines = new Set<string>();
  if (firstRealLine) usedLines.add(firstRealLine);
  
  for (let i = 0; i < 3; i++) {
    const alt = solve(undefined, Array.from(usedLines));
    if (alt) {
      // Check if this route uses a different primary train line than existing routes
      const altFirstLine = alt.steps.find(s => s.line && s.line.id !== 'walk')?.line?.id;
      const isDuplicate = routes.some(r => r.steps.find(s => s.line && s.line.id !== 'walk')?.line?.id === altFirstLine);
      
      if (!isDuplicate) {
        routes.push(alt);
      }
      
      const nextLine = alt.steps.find(s => s.line && s.line.id !== 'walk' && !usedLines.has(s.line.id))?.line?.id;
      if (nextLine) usedLines.add(nextLine);
      else break;
    } else {
      break;
    }
  }

  const sortedRoutes = routes.sort((a, b) => a.totalTime - b.totalTime);
  if (sortedRoutes.length === 0) return [];
  const minTime = sortedRoutes[0].totalTime;
  return sortedRoutes.filter(r => r.totalTime <= minTime * 1.8 || r.totalTime <= minTime + 30).slice(0, 4);
};

type JourneyVisualizerProps = {
  initialFrom?: string;
  initialTo?: string;
  stations?: any[];
  attractions?: any[];
  lines?: any[];
  passes?: any[];
  siteSettings?: { key: string; value: string }[];
};

export default function JourneyVisualizer({ initialFrom = "", initialTo = "", stations = [], attractions = [], lines = [], passes = [], siteSettings = [] }: JourneyVisualizerProps) {
  const searchParams = useSearchParams();
  const fromParam = initialFrom || searchParams.get("from") || "";
  const toParam = initialTo || searchParams.get("to") || "";

  const [depQuery, setDepQuery] = useState(
    fromParam ? (METRO_STATIONS[fromParam]?.name_ko ?? "") : ""
  );
  const [destQuery, setDestQuery] = useState(
    toParam ? (METRO_STATIONS[toParam]?.name_ko ?? "") : ""
  );
  const [departure, setDeparture] = useState(fromParam);
  const [destination, setDestination] = useState(toParam);

  const [showDepList, setShowDepList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);

  // Modal State
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null);
  const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({});

  const toggleSegment = (key: string) => {
    setExpandedSegments(p => ({ ...p, [key]: !p[key] }));
  };

  // Create a map to link METRO_LINES ids to DB UUIDs and affiliate data
  const { lineToDbIdMap, lineAffiliateMap } = useMemo(() => {
    const dbIdMap: Record<string, string> = {};
    const affiliateMap: Record<string, { url: string, text: string, stationSlug: string | null }> = {};
    
    if (lines.length > 0) {
      lines.forEach((dbLine: any) => {
        const matchKey = Object.keys(METRO_LINES).find(key => {
          if (dbLine.slug && METRO_LINES[key].id === dbLine.slug) return true;
          if (dbLine.name_ko && dbLine.name_ko.includes(METRO_LINES[key].name)) return true;
          return false;
        });
        
        if (matchKey) {
          dbIdMap[matchKey] = dbLine.id;
          
          if (dbLine.affiliate_url) {
            let text = "🎟️ 예매하기";
            let url = dbLine.affiliate_url;
            let stationId = null;
            if (dbLine.affiliate_url.startsWith("{")) {
              try {
                const parsed = JSON.parse(dbLine.affiliate_url);
                text = parsed.text || text;
                url = parsed.url || url;
                stationId = parsed.stationId || null;
              } catch (e) {}
            }
            let stationSlug = null;
            if (stationId && stations && stations.length > 0) {
              const st = stations.find((s: any) => s.id === stationId);
              if (st) stationSlug = st.slug;
            }
            affiliateMap[matchKey] = { url, text, stationSlug };
          }
        }
      });
    }
    return { lineToDbIdMap: dbIdMap, lineAffiliateMap: affiliateMap };
  }, [lines, stations]);

  // Map attractions by station_id
  const stationAttractionsMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (attractions.length > 0 && stations.length > 0) {
      attractions.forEach(attr => {
        const station = stations.find(s => s.id === attr.station_id);
        if (station && station.slug) {
          if (!map[station.slug]) map[station.slug] = [];
          map[station.slug].push(attr);
        }
      });
    }
    return map;
  }, [attractions, stations]);

  const destinationStationData = stations.find(s => s.slug === destination);
  const departureStationData = stations.find(s => s.slug === departure);

  const quickRoutes = [
    { from: 'narita-airport', to: 'shinjuku', label: '나리타 → 신주쿠', icon: '✈️' },
    { from: 'narita-airport', to: 'shibuya', label: '나리타 → 시부야', icon: '🚆' },
    { from: 'haneda-airport', to: 'shinjuku', label: '하네다 → 신주쿠', icon: '✈️' },
    { from: 'shinjuku', to: 'shibuya', label: '신주쿠 → 시부야', icon: '🛍️' },
    { from: 'tokyo', to: 'ginza', label: '도쿄역 → 긴자', icon: '🗼' },
    { from: 'asakusa', to: 'ueno', label: '아사쿠사 → 우에노', icon: '🏮' },
    { from: 'shinjuku', to: 'roppongi', label: '신주쿠 → 롯폰기', icon: '🌃' },
  ];

  const filteredDep = useMemo(() => 
    Object.values(METRO_STATIONS).filter(s => 
      s.name_ko.includes(depQuery) || s.name_en.toLowerCase().includes(depQuery.toLowerCase())
    ).slice(0, 5)
  , [depQuery]);

  const filteredDest = useMemo(() => 
    Object.values(METRO_STATIONS).filter(s => 
      s.name_ko.includes(destQuery) || s.name_en.toLowerCase().includes(destQuery.toLowerCase())
    ).slice(0, 5)
  , [destQuery]);

  const routeOptions = useMemo(() => {
    if (departure && destination) return findMultipleRoutes(departure, destination);
    return [];
  }, [departure, destination]);

  const lastTrackedSearch = useRef("");

  useEffect(() => {
    if (departure && destination) {
      const searchKey = `${departure}-${destination}`;
      if (lastTrackedSearch.current !== searchKey) {
        lastTrackedSearch.current = searchKey;
        fetch('/api/track/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start_slug: departure, end_slug: destination }),
        }).catch(console.error);
      }
    }
  }, [departure, destination]);

  const activeRoute = routeOptions[selectedOptionIdx] || null;

  const selectDeparture = (s: StationData) => {
    setDeparture(s.slug);
    setDepQuery(s.name_ko);
    setShowDepList(false);
    setSelectedOptionIdx(0);
  };

  const selectDestination = (s: StationData) => {
    setDestination(s.slug);
    setDestQuery(s.name_ko);
    setShowDestList(false);
    setSelectedOptionIdx(0);
  };

  const swapStations = () => {
    const oldDep = departure;
    const oldDepQuery = depQuery;
    const oldDest = destination;
    const oldDestQuery = destQuery;
    setDeparture(oldDest);
    setDepQuery(oldDestQuery);
    setDestination(oldDep);
    setDestQuery(oldDepQuery);
    setSelectedOptionIdx(0);
  };

  return (
    <div className="w-full space-y-8">
      {/* Search Section */}
      <div className="relative">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 hidden">
                {/* Title is moved to page.tsx, hidden here to avoid duplication */}
                <h2 className="text-3xl font-black text-white tracking-tight">도쿄 지하철 노선도 검색</h2>
                <a 
                  href="/tokyo-metro-subway-route-map-ko.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => {
                    fetch('/api/track', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action_type: 'DOWNLOAD_PDF' })
                    }).catch(console.error);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-extrabold hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] active:scale-95"
                >
                  <MapIcon size={18} />
                  도쿄 메트로 한글 노선도 다운로드
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 w-full relative mt-2 md:mt-0">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 flex items-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                  <MapIcon size={12} /> 인기 추천 경로
                </span>
                <span className="text-[10px] text-white/40 font-bold flex items-center gap-1 md:hidden animate-pulse bg-white/5 px-2 py-0.5 rounded-full">
                  <ArrowLeftRight size={10} /> 옆으로 밀어보기
                </span>
              </div>
              <div className="relative w-full group">
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x relative z-0">
                  {quickRoutes.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        selectDeparture(METRO_STATIONS[qr.from]);
                        selectDestination(METRO_STATIONS[qr.to]);
                      }}
                      className="shrink-0 snap-start bg-[#0A0E17]/80 border border-white/5 hover:border-cyan-500/50 hover:text-cyan-400 px-3.5 py-2 rounded-xl text-xs font-bold text-white/70 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    >
                      <span className="text-sm">{qr.icon}</span> {qr.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
            <div className="relative group z-30">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all">
                <MapPin size={24} />
              </div>
              <input 
                type="text"
                placeholder="출발역 검색"
                value={depQuery}
                onChange={(e) => {
                  setDepQuery(e.target.value);
                  setShowDepList(true);
                  if (departure) setDeparture("");
                }}
                onFocus={() => setShowDepList(true)}
                className="w-full bg-[#0A0E17]/80 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-5 text-lg font-bold text-white focus:border-cyan-500 outline-none transition-all placeholder-white/30 focus:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
              />
              {showDepList && filteredDep.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1A2235] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden z-50">
                  {filteredDep.map(s => (
                    <button key={s.slug} onClick={() => selectDeparture(s)} className="w-full px-6 py-4 text-left hover:bg-cyan-500/10 flex justify-between items-center transition-colors border-b border-white/5 last:border-0">
                      <span className="font-bold text-white">{s.name_ko}</span>
                      <span className="text-xs text-white/40">{s.name_en}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center pt-2 md:pt-4">
              <button
                onClick={swapStations}
                disabled={!departure && !destination}
                title="출발지/도착지 바꾸기"
                className="w-11 h-11 rounded-full bg-[#0A0E17] border border-white/10 hover:border-cyan-500/50 text-white/50 hover:text-cyan-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <ArrowLeftRight size={18} className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            <div className="relative group z-30">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-magenta-400 group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(255,0,255,0.8)] transition-all">
                <Navigation size={24} />
              </div>
              <input 
                type="text"
                placeholder="도착역 검색"
                value={destQuery}
                onChange={(e) => {
                  setDestQuery(e.target.value);
                  setShowDestList(true);
                  if (destination) setDestination("");
                }}
                onFocus={() => setShowDestList(true)}
                className="w-full bg-[#0A0E17]/80 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-5 text-lg font-bold text-white focus:border-magenta-500 outline-none transition-all placeholder-white/30 focus:shadow-[0_0_20px_rgba(255,0,255,0.15)]"
              />
              {showDestList && filteredDest.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1A2235] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden z-50">
                  {filteredDest.map(s => (
                    <button key={s.slug} onClick={() => selectDestination(s)} className="w-full px-6 py-4 text-left hover:bg-magenta-500/10 flex justify-between items-center transition-colors border-b border-white/5 last:border-0">
                      <span className="font-bold text-white">{s.name_ko}</span>
                      <span className="text-xs text-white/40">{s.name_en}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Options Selection (Up to 4 routes) */}
      {((departure === "narita-airport" && destination === "shinjuku") || (departure === "shinjuku" && destination === "narita-airport")) && (
        <div className="mb-4 p-6 bg-red-500/10 border-2 border-red-500/30 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.2)] text-center backdrop-blur-sm">
          <p className="text-red-400 font-extrabold text-lg md:text-xl flex flex-col md:flex-row items-center justify-center gap-2">
            <span>🚨</span> 나리타 익스프레스(N'EX)로 환승 없이 바로 가세요!
          </p>
          <p className="text-red-300 text-sm md:text-base mt-2 font-medium">
            신주쿠와 나리타 공항을 오갈 때는 N'EX(나리타 익스프레스)가 가장 편리합니다. 지정석 티켓을 미리 예매하는 것을 추천합니다.
          </p>
        </div>
      )}

      {routeOptions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {routeOptions.map((opt, idx) => {
            const hasAffiliate = opt.steps.some((s: any) => {
              if (!s.line || s.line.id === 'walk') return false;
              const affiliate = lineAffiliateMap[s.line.id];
              if (!affiliate) return false;
              if (!affiliate.stationSlug) return true;
              return opt.steps.some((routeStep: any) => routeStep.station.slug === affiliate.stationSlug);
            });
            
            // 태그 계산
            const tags: { text: string; color: string }[] = [];
            // 1. 가장 빠름
            if (idx === 0) tags.push({ text: '최단시간', color: 'bg-blue-600' });
            
            // 2. 특급권(추가요금)
            const hasExpress = opt.steps.some(s => s.line?.is_express);
            if (hasExpress) {
              tags.push({ text: '특급(유료)', color: 'bg-rose-500' });
            }
            
            // 3. 가장 저렴 (특급을 안타는 첫번째 경로)
            const firstCheapestIdx = routeOptions.findIndex(r => !r.steps.some(s => s.line?.is_express));
            if (idx === firstCheapestIdx) {
              tags.push({ text: '가장 저렴', color: 'bg-emerald-500' });
            }

            return (
              <button
                key={idx}
                onClick={() => setSelectedOptionIdx(idx)}
                className={`p-4 rounded-2xl border-2 transition-all text-left relative flex flex-col justify-between ${
                  selectedOptionIdx === idx 
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                  : 'border-white/5 bg-[#0A0E17]/60 hover:border-white/20 hover:bg-[#0A0E17]/80'
                }`}
              >
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      idx === selectedOptionIdx ? 'bg-cyan-500 text-[#0A0E17]' : 'bg-white/10 text-white/50'
                    }`}>
                      경로 {idx + 1}
                    </span>
                    <span className="text-lg font-black text-white">{opt.totalTime}분</span>
                  </div>
                  <p className="text-white/50 text-[10px] font-bold truncate">
                    {opt.instructions[0].split(' ')[0]} ...
                  </p>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex gap-1 mt-2.5 flex-wrap w-full">
                    {tags.map((t, i) => (
                      <span key={i} className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white ${t.color}`}>
                        {t.text}
                      </span>
                    ))}
                  </div>
                )}

                {hasAffiliate && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Result Section (Journey Ribbon) */}
      {activeRoute && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700" key={selectedOptionIdx}>
          <div className="bg-[#1A2235]/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_0_30px_rgba(0,0,0,0.5)] p-8 md:p-12 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-12">
              <div className="flex-1">
                <div className="flex flex-col">
                  {(() => {
                    const segments: any[] = [];
                    if (activeRoute && activeRoute.steps.length > 0) {
                      let currentSegment = { startStep: activeRoute.steps[0], intermediateSteps: [] as any[], endStep: null as any };
                      for (let i = 1; i < activeRoute.steps.length; i++) {
                        const step = activeRoute.steps[i];
                        if (step.action === 'MOVE') {
                          currentSegment.intermediateSteps.push(step);
                        } else {
                          currentSegment.endStep = step;
                          segments.push(currentSegment);
                          currentSegment = { startStep: step, intermediateSteps: [], endStep: null as any };
                        }
                      }
                    }

                    return (
                      <>
                        {segments.map((seg, idx) => {
                          const step = seg.startStep;
                          const nextStep = seg.endStep;
                          const inter = seg.intermediateSteps;
                          const totalTime = inter.reduce((acc: number, s: any) => acc + s.time, 0) + (nextStep?.time || 0);
                          const stationsCount = inter.length + 1;
                          const segmentKey = `${selectedOptionIdx}-${idx}`;
                          const isExpanded = expandedSegments[segmentKey];

                          return (
                            <React.Fragment key={idx}>
                              {/* Station Row */}
                              <div className="relative flex gap-6 items-center group">
                                <div 
                                  className={`relative z-10 w-8 h-8 rounded-full border-[3px] border-white shadow-lg flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${
                                    step.action === 'START' ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-slate-900' : ''
                                  }`}
                                  style={{ backgroundColor: step.line?.color || nextStep?.line?.color || '#94a3b8' }}
                                >
                                  {step.action === 'TRANSFER' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 py-3">
                                  <div className="flex items-baseline gap-3">
                                    <h3 className="text-xl font-black text-white tracking-tight">{step.station.name_ko}</h3>
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{step.station.name_en}</span>
                                  </div>
                                  {step.action === 'TRANSFER' && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black px-3 py-1 rounded-full">
                                      <CheckCircle2 size={12} /> 여기서 환승
                                    </div>
                                  )}
                                  {step.action === 'WALK' && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-black px-3 py-1 rounded-full">
                                      <MapPin size={12} /> 목적지로 도보 이동
                                    </div>
                                  )}
                                  {step.action === 'START' && (
                                    <div className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                      출발
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Segment Row */}
                              <div className="flex gap-6 items-stretch">
                                <div className="flex flex-col items-center w-8 flex-shrink-0">
                                  <div 
                                    className="w-1 flex-1 min-h-[44px] rounded-full opacity-60"
                                    style={{ backgroundColor: nextStep?.line?.color || '#94a3b8' }}
                                  ></div>
                                </div>
                                
                                <div className="flex-1 py-1 flex flex-col justify-center">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white text-[11px] font-black px-1.5 py-0.5 rounded-sm shrink-0" style={{ backgroundColor: nextStep.line.color }}>
                                        {nextStep.line.code}
                                      </span>
                                      <span className="text-white text-sm font-bold">
                                        {nextStep.line.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {nextStep.line.is_express && (
                                        <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
                                          특급(유료)
                                        </span>
                                      )}
                                      {(() => {
                                        const affiliate = lineAffiliateMap[nextStep.line.id];
                                        const shouldShowAffiliate = affiliate && (!affiliate.stationSlug || 
                                          step.station.slug === affiliate.stationSlug || 
                                          nextStep.station.slug === affiliate.stationSlug || 
                                          inter.some((s:any) => s.station.slug === affiliate.stationSlug)
                                        );
                                        return shouldShowAffiliate ? (
                                          <a href={affiliate.url} target="_blank" rel="noreferrer" 
                                            className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0">
                                            {affiliate.text}
                                          </a>
                                        ) : null;
                                      })()}
                                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                        <Clock size={12} className="opacity-70" /> 약 {totalTime}분
                                      </span>
                                    </div>
                                    
                                    {nextStep?.line?.affiliate_url && (
                                      <a
                                        href={nextStep.line.affiliate_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-black rounded-lg shadow-md transition-all active:scale-95 border border-amber-400/50"
                                      >
                                        <Ticket size={14} /> {(nextStep.line as any).affiliate_text || "예매하기"}
                                      </a>
                                    )}
                                    
                                    {inter.length > 0 && (
                                      <button 
                                        onClick={() => toggleSegment(segmentKey)}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 transition-colors"
                                      >
                                        {stationsCount}개역 이동
                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                      </button>
                                    )}
                                  </div>

                                  {/* Expanded Intermediate Stations */}
                                  {isExpanded && inter.length > 0 && (
                                    <div className="mt-4 flex flex-col gap-3 pl-4 border-l-2 border-white/10 ml-6 py-2">
                                      {inter.map((s: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                                          {s.station.name_ko}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}

                        {/* Final END Station Row */}
                        {segments.length > 0 && (() => {
                          const step = segments[segments.length - 1].endStep;
                          return (
                            <div className="relative flex gap-6 items-center group">
                              <div 
                                className="relative z-10 w-8 h-8 rounded-full border-[3px] border-white shadow-lg flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ring-2 ring-white/30 ring-offset-2 ring-offset-slate-900"
                                style={{ backgroundColor: step.line?.color || '#94a3b8' }}
                              ></div>
                              <div className="flex-1 py-3">
                                <div className="flex items-baseline gap-3">
                                  <h3 className="text-xl font-black text-white tracking-tight">{step.station.name_ko}</h3>
                                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{step.station.name_en}</span>
                                </div>
                                <div className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  도착
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="md:w-80 space-y-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4 text-white">
                    <span className="text-slate-400 font-bold text-sm">총 소요 시간</span>
                    <div className="text-2xl font-black">약 {activeRoute.totalTime}분</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <a href={`https://www.google.com/maps/dir/?api=1&origin=${METRO_STATIONS[departure].name_jp}駅&destination=${METRO_STATIONS[destination].name_jp}駅&travelmode=transit`} target="_blank" rel="noreferrer"
                      onClick={() => {
                        fetch('/api/track', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action_type: 'CLICK_GOOGLE_MAPS' }),
                          keepalive: true
                        }).catch(console.error);
                      }}
                      className="flex items-center justify-center gap-2 bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all">
                      <MapIcon size={20} /> 구글맵 상세 보기
                    </a>
                    <Link
                      href={`/station/${destination}`}
                      onClick={() => {
                        fetch('/api/track', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action_type: 'CLICK_STATION_HOTEL', target_id: destinationStationData?.id || null }),
                          keepalive: true
                        }).catch(console.error);
                      }}
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                      <Hotel size={20} />
                      {METRO_STATIONS[destination]?.name_ko} 숙소 안내
                    </Link>
                    
                    {/* 동적으로 배정된 교통 패스 노출 */}
                    {passes.filter(pass => {
                      if (!pass.pass_targets || pass.pass_targets.length === 0) return false;
                      const activeLinesInRoute = activeRoute.steps.filter((s:any) => s.line && s.line.id !== 'walk').map((s:any) => lineToDbIdMap[s.line.id]).filter(Boolean);
                      
                      return pass.pass_targets.some((target: any) => {
                        if (target.target_type === 'ALL') return true;
                        if (target.target_type === 'STATION' && (target.target_id === destinationStationData?.id || target.target_id === departureStationData?.id)) return true;
                        if (target.target_type === 'LINE' && activeLinesInRoute.includes(target.target_id)) return true;
                        return false;
                      });
                    }).map((pass, i) => (
                      <Link 
                        key={pass.id} 
                        href={`/pass/${pass.slug}`}
                        onClick={() => {
                          fetch('/api/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action_type: 'CLICK_SUGGESTED_PASS', target_id: pass.id }),
                            keepalive: true
                          }).catch(console.error);
                        }}
                        className="flex flex-col items-center justify-center gap-1 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 group relative overflow-hidden"
                        style={{ background: i % 2 === 0 ? 'linear-gradient(to right, #f59e0b, #ef4444)' : 'linear-gradient(to right, #3b82f6, #6366f1)' }}
                      >
                        <div className="flex items-center gap-2 relative z-10"><Ticket size={20} /> {pass.name_ko} 알아보기</div>
                        {pass.description && <span className="text-[10px] opacity-90 relative z-10">{pass.description}</span>}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Destination Attractions Panel */}
                {destination && stationAttractionsMap[destination] && stationAttractionsMap[destination].length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-5 border border-white/10">
                    <h4 className="text-white font-black text-sm mb-3 flex items-center gap-2">
                      <span className="text-base">📍</span>
                      {siteSettings.find((s) => s.key === `station_panel_title_${destination}`)?.value || `${METRO_STATIONS[destination]?.name_ko} 주변 명소`}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {stationAttractionsMap[destination].map((attr: any, i: number) => {
                        const isLink = !!attr.affiliate_url;
                        const Wrapper = isLink ? "a" : "button";
                        return (
                          <Wrapper
                            key={i}
                            href={isLink ? attr.affiliate_url : undefined}
                            target={isLink ? "_blank" : undefined}
                            rel={isLink ? "noreferrer" : undefined}
                            onClick={isLink ? undefined : () => setSelectedAttraction(attr)}
                            className={`group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 rounded-2xl px-4 py-3 transition-all active:scale-95 text-left w-full`}
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[attr.category] || 'from-slate-500 to-slate-700'} flex items-center justify-center text-lg flex-shrink-0 shadow-md`}>
                              {attr.icon === 'MapPin' ? <MapPin size={20} className="text-white" /> : <span className="text-xl">{attr.icon || '📍'}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2">
                                <span className="text-white font-bold text-sm leading-snug break-keep">{attr.name}</span>
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-slate-400 flex-shrink-0 mt-0.5">{attr.category}</span>
                              </div>
                              <p className="text-slate-500 text-[10px] font-medium mt-1 leading-tight break-keep">{attr.description}</p>
                            </div>
                            {isLink ? (
                              <ExternalLink size={13} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold flex-shrink-0 group-hover:text-white transition-colors">상세보기</span>
                            )}
                          </Wrapper>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Popular Destinations Cards Section */}
      <div className="pt-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">가장 많이 찾는 인기 목적지</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-white/50 font-bold text-sm">도쿄 여행자들이 가장 사랑하는 관광지 경로를 확인해 보세요.</p>
              <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-3 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                <Search size={10} /> 실시간 소요 시간 자동 계산 중
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'shinjuku', title: '신주쿠', desc: '도쿄 최대 번화가', color: 'from-rose-600 to-pink-700', icon: '🏙️' },
            { id: 'shibuya', title: '시부야', desc: '스크램블 교차로', color: 'from-emerald-600 to-teal-700', icon: '🚶' },
            { id: 'asakusa', title: '아사쿠사', desc: '센소지와 전통 거리', color: 'from-red-600 to-rose-700', icon: '🏮' },
            { id: 'ginza', title: '긴자', desc: '명품 쇼핑 거리', color: 'from-amber-500 to-orange-600', icon: '🛍️' },
            { id: 'roppongi', title: '롯폰기', desc: '도쿄타워 야경 뷰', color: 'from-indigo-500 to-purple-600', icon: '🗼' },
            { id: 'ueno', title: '우에노', desc: '우에노 공원과 동물원', color: 'from-green-600 to-emerald-700', icon: '🐼' },
            { id: 'tokyo', title: '도쿄역', desc: '도쿄의 중심 붉은 벽돌', color: 'from-slate-700 to-slate-900', icon: '🚉' },
            { id: 'ikebukuro', title: '이케부쿠로', desc: '선샤인 시티와 쇼핑', color: 'from-blue-500 to-cyan-600', icon: '🏢' },
            { id: 'omote-sando', title: '오모테산도', desc: '세련된 패션과 카페', color: 'from-fuchsia-500 to-pink-600', icon: '☕' },
            { id: 'akihabara', title: '아키하바라', desc: '서브컬처와 게임의 성지', color: 'from-violet-600 to-purple-700', icon: '🎮' },
            { id: 'harajuku', title: '하라주쿠', desc: '일본 스트릿 패션의 중심', color: 'from-pink-400 to-rose-500', icon: '👗' },
            { id: 'ebisu', title: '에비스', desc: '맥주와 감성적인 밤거리', color: 'from-yellow-600 to-amber-700', icon: '🍺' },
          ].map((dest, idx) => {
            const baseStation = departure || 'shinjuku';
            const dynamicRoutes = findMultipleRoutes(baseStation, dest.id);
            const travelTime = dynamicRoutes.length > 0 ? dynamicRoutes[0].totalTime : '--';
            const baseName = METRO_STATIONS[baseStation]?.name_ko || '신주쿠';
            return (
              <button key={`${dest.id}-${idx}`} onClick={() => { if (!departure) selectDeparture(METRO_STATIONS['shinjuku']); selectDestination(METRO_STATIONS[dest.id]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group relative overflow-hidden rounded-[1.5rem] p-5 text-left transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5 hover:border-cyan-500/30">
                <div className={`absolute inset-0 bg-gradient-to-br ${dest.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">{dest.icon}</span>
                    <div className="flex flex-col items-end">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">{travelTime}분 소요</span>
                      <span className="text-[8px] text-white/60 font-bold mt-1">{baseName} 기준</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white mb-1.5 leading-tight flex items-center gap-1.5 flex-wrap">
                      <span>{dest.title}</span>
                      <span className="inline-flex items-center gap-0.5 bg-white/20 backdrop-blur-md shadow-sm border border-white/10 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        <MapPin size={10} />
                        {METRO_STATIONS[dest.id]?.name_ko}역
                      </span>
                    </h3>
                    <p className="text-white/80 text-[10px] font-bold leading-relaxed line-clamp-1">{dest.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Attraction Detail Modal */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative w-full h-56 bg-slate-100">
              {selectedAttraction.image_url ? (
                <img src={selectedAttraction.image_url} alt={selectedAttraction.name} className="w-full h-full object-contain bg-slate-50" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <span className="text-4xl">{selectedAttraction.icon || '📍'}</span>
                </div>
              )}
              <button 
                onClick={() => setSelectedAttraction(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-1 text-xs font-black rounded-lg text-white bg-gradient-to-r ${CATEGORY_COLORS[selectedAttraction.category] || 'from-slate-500 to-slate-700'}`}>
                  {selectedAttraction.category}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedAttraction.name}</h3>
              <p className="text-slate-600 font-medium mb-6">{selectedAttraction.description}</p>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedAttraction.detail_content || '상세 정보가 없습니다.'}
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedAttraction(null)}
                className="w-full mt-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-colors shadow-lg shadow-slate-900/20"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
