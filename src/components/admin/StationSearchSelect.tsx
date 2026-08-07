"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, MapPin } from "lucide-react";

interface Station {
  id: string;
  name_ko: string;
}

interface StationSearchSelectProps {
  stations: Station[];
  onChange?: (station: Station) => void;
  defaultValue?: Station | null;
}

export default function StationSearchSelect({ stations, onChange, defaultValue }: StationSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState<Station | null>(
    defaultValue !== undefined ? defaultValue : (stations.length > 0 ? stations[0] : null)
  );
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dropdown 닫기 및 검색어 리셋 처리
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredStations = useMemo(() => {
    if (!searchTerm.trim()) return stations;
    const lower = searchTerm.toLowerCase();
    return stations.filter(s => s.name_ko.toLowerCase().includes(lower));
  }, [searchTerm, stations]);

  const handleSelect = (station: Station) => {
    setSelectedStation(station);
    setSearchTerm("");
    setIsOpen(false);
    if (onChange) {
      onChange(station);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 폼 전송 시 선택된 역 ID를 서버 액션으로 전송하기 위한 hidden input */}
      <input type="hidden" name="station_id" value={selectedStation?.id || ""} required />
      
      <div 
        className="w-full flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all font-bold text-slate-700"
        onClick={() => setIsOpen(true)}
      >
        <MapPin size={18} className="text-slate-400 mr-2 shrink-0" />
        
        {isOpen ? (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="역 이름을 입력하여 검색하세요..."
            className="w-full bg-transparent outline-none text-slate-900 font-bold border-none p-0 focus:ring-0 placeholder-slate-400 text-base"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="w-full text-slate-900 font-bold text-base">
            {selectedStation ? selectedStation.name_ko : "소속 역 선택"}
          </span>
        )}
        
        <ChevronDown 
          size={18} 
          className={`text-slate-400 ml-2 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
          {filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <div
                key={station.id}
                onClick={() => handleSelect(station)}
                className={`flex items-center justify-between px-5 py-3.5 cursor-pointer text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors ${
                  selectedStation?.id === station.id ? 'bg-blue-50/50 text-blue-600' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className={selectedStation?.id === station.id ? 'text-blue-500' : 'text-slate-400'} />
                  <span>{station.name_ko}</span>
                </div>
                {selectedStation?.id === station.id && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-extrabold">선택됨</span>
                )}
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-slate-400 font-bold text-sm">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
