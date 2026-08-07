"use client";

import { useState, useTransition } from "react";
import { Link as LinkIcon, Save, RefreshCw } from "lucide-react";
import { updateLineAffiliate } from "@/app/actions/lineActions";

interface LineInfo {
  id: string;
  name_ko: string;
  affiliate_url?: string | null;
}

interface StationInfo {
  id: string;
  name_ko: string;
}

interface LineContentManagerProps {
  lines: LineInfo[];
  stations: StationInfo[];
}

export default function LineContentManager({ lines, stations }: LineContentManagerProps) {
  const [selectedLineId, setSelectedLineId] = useState<string>(lines[0]?.id || "");
  const [isPending, startTransition] = useTransition();

  const selectedLine = lines.find(l => l.id === selectedLineId);
  
  // Parse JSON if it exists
  let initialText = "";
  let initialUrl = "";
  let initialStationId = "";
  if (selectedLine?.affiliate_url) {
    if (selectedLine.affiliate_url.startsWith("{")) {
      try {
        const parsed = JSON.parse(selectedLine.affiliate_url);
        initialText = parsed.text || "";
        initialUrl = parsed.url || "";
        initialStationId = parsed.stationId || "";
      } catch (e) {
        initialUrl = selectedLine.affiliate_url;
      }
    } else {
      initialUrl = selectedLine.affiliate_url;
    }
  }

  const [linkText, setLinkText] = useState(initialText);
  const [linkUrl, setLinkUrl] = useState(initialUrl);
  const [targetStationId, setTargetStationId] = useState(initialStationId);

  const handleLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedLineId(newId);
    
    const newLine = lines.find(l => l.id === newId);
    let nText = "";
    let nUrl = "";
    let nStationId = "";
    if (newLine?.affiliate_url) {
      if (newLine.affiliate_url.startsWith("{")) {
        try {
          const parsed = JSON.parse(newLine.affiliate_url);
          nText = parsed.text || "";
          nUrl = parsed.url || "";
          nStationId = parsed.stationId || "";
        } catch (e) {
          nUrl = newLine.affiliate_url;
        }
      } else {
        nUrl = newLine.affiliate_url;
      }
    }
    setLinkText(nText);
    setLinkUrl(nUrl);
    setTargetStationId(nStationId);
  };

  const handleUpdate = () => {
    if (!selectedLineId) return;
    
    let finalPayload = "";
    if (linkUrl) {
      finalPayload = JSON.stringify({
        text: linkText || "🎟️ 예매하기",
        url: linkUrl,
        stationId: targetStationId || null
      });
    }

    startTransition(async () => {
      const res = await updateLineAffiliate(selectedLineId, finalPayload);
      if (res.success) {
        alert("노선 예매 링크가 업데이트 되었습니다.");
      } else {
        alert("오류 발생: " + res.error);
      }
    });
  };

  if (!lines || lines.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
          <LinkIcon size={24} />
        </div>
        노선별 제휴 링크 관리 (라피트 등)
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">대상 노선 선택</label>
            <select 
              value={selectedLineId} 
              onChange={handleLineChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
            >
              {lines.map(line => (
                <option key={line.id} value={line.id}>{line.name_ko}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">대상 역 지정 (선택)</label>
            <select 
              value={targetStationId} 
              onChange={(e) => setTargetStationId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
            >
              <option value="">전체 역 (지정 안 함)</option>
              {stations?.map(station => (
                <option key={station.id} value={station.id}>{station.name_ko}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">버튼 상품명 텍스트 (예: 클룩 라피트 왕복권)</label>
            <input 
              type="text" 
              value={linkText} 
              onChange={e => setLinkText(e.target.value)}
              placeholder="예: 클룩 라피트 특가 예매"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">제휴 구매 링크 (URL)</label>
            <input 
              type="text" 
              value={linkUrl} 
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="예: https://klook.com/... (비워두면 버튼 삭제)"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400 font-mono text-sm"
            />
          </div>
        </div>
        
        <button 
          onClick={handleUpdate}
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-extrabold transition-colors disabled:opacity-50 mt-2 shadow-md active:scale-95"
        >
          {isPending ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          노선 링크 저장하기
        </button>
      </div>
    </div>
  );
}
