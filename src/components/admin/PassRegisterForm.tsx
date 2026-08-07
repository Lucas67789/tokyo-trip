"use client";

import { useState, useEffect, useTransition } from "react";
import BlockEditor from "./BlockEditor";
import { addPass } from "@/app/actions/passActions";
import { romanizeHangul } from "@/utils/slugify";
import { useRouter } from "next/navigation";
import UnsavedChangesWarning from "./UnsavedChangesWarning";

interface Station {
  id: string;
  name_ko: string;
}

interface Line {
  id: string;
  name_ko: string;
}

interface PassRegisterFormProps {
  stations: Station[];
  lines: Line[];
}

export default function PassRegisterForm({ stations, lines }: PassRegisterFormProps) {
  const [nameKo, setNameKo] = useState("");
  const [slug, setSlug] = useState("");
  const [affiliateLinks, setAffiliateLinks] = useState<{platform: string, url: string}[]>([{ platform: "클룩", url: "" }]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [targetType, setTargetType] = useState<"ALL" | "LINE" | "STATION">("ALL");
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStationToggle = (stationId: string) => {
    setSelectedStations((prev) => 
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  // 1. URL에서 슬러그 파싱 시도 (선택적)
  useEffect(() => {
    if (affiliateLinks.length === 0 || !affiliateLinks[0].url.trim()) return;
    const klookRegex = /klook\.com\/(?:[a-z]{2}-[a-z]{2}\/)?(?:activity|experiences)\/[0-9]+-([^\/]+)/i;
    const match = affiliateLinks[0].url.match(klookRegex);
    if (match && match[1]) {
      setSlug(match[1].toLowerCase());
      setIsSlugManuallyEdited(true);
    }
  }, [affiliateLinks]);

  // 2. 사용자가 직접 슬러그를 수정하지 않았다면 한글 이름 기반 자동 변환
  useEffect(() => {
    if (isSlugManuallyEdited) return;
    if (!nameKo.trim()) {
      setSlug("");
      return;
    }
    setSlug(romanizeHangul(nameKo));
  }, [nameKo, isSlugManuallyEdited]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addPass(formData);
        localStorage.removeItem("pass_register");
        alert("패스가 성공적으로 등록되었습니다!");
        router.push("/admin/passes");
      } catch (err: any) {
        alert("등록 실패: " + err.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <UnsavedChangesWarning isDirty={nameKo !== "" || slug !== ""} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"패스 이름"}</label>
          <input 
            type="text" 
            name="name_ko" 
            value={nameKo}
            onChange={(e) => setNameKo(e.target.value)}
            placeholder="예: 라피트 특급 열차"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 font-bold" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
            {"URL 식별자 (Slug)"} 
            <span className="text-xs text-blue-500 font-semibold ml-2">*(자동 완성)*</span>
          </label>
          <input 
            type="text" 
            name="slug" 
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugManuallyEdited(true);
            }}
            placeholder="예: rapit-express"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold" 
            required 
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"1줄 요약 (목록 노출용)"}</label>
          <input 
            type="text" 
            name="description" 
            placeholder="예: 간사이 공항에서 난바역까지 34분만에 도착하는 가장 빠른 방법!"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 font-bold" 
            required 
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">
              {"어필리에이트 제휴 링크 다중 추가"} 
            </label>
            <button
              type="button"
              onClick={() => setAffiliateLinks([...affiliateLinks, { platform: "", url: "" }])}
              className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
            >
              + 링크 추가하기
            </button>
          </div>
          
          <input type="hidden" name="affiliate_links" value={JSON.stringify(affiliateLinks)} />
          
          <div className="space-y-3">
            {affiliateLinks.map((link, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input 
                  type="text" 
                  placeholder="플랫폼 (예: 클룩, KKDAY)"
                  value={link.platform}
                  onChange={(e) => {
                    const newLinks = [...affiliateLinks];
                    newLinks[index].platform = e.target.value;
                    setAffiliateLinks(newLinks);
                  }}
                  className="w-1/3 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 text-sm font-bold" 
                />
                <input 
                  type="url" 
                  placeholder="제휴 URL (https://...)"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...affiliateLinks];
                    newLinks[index].url = e.target.value;
                    setAffiliateLinks(newLinks);
                  }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold" 
                />
                <button
                  type="button"
                  onClick={() => {
                    const newLinks = affiliateLinks.filter((_, i) => i !== index);
                    setAffiliateLinks(newLinks);
                  }}
                  className="px-4 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 font-bold transition-colors"
                >
                  삭제
                </button>
              </div>
            ))}
            {affiliateLinks.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">등록된 제휴 링크가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 노출 대상 (Target) 설정 구역 */}
        <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="font-extrabold text-slate-900 mb-4 text-lg">{"🎯 노출 대상(타겟) 설정"}</h3>
          
          <input type="hidden" name="target_type" value={targetType} />
          
          <div className="flex flex-wrap gap-4 mb-6">
            <label className={`cursor-pointer px-4 py-3 border rounded-xl font-bold flex items-center gap-2 transition-all ${targetType === 'ALL' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}>
              <input type="radio" name="_target_type_ui" checked={targetType === 'ALL'} onChange={() => setTargetType('ALL')} className="hidden" />
              🌐 전체 역 (모두 노출)
            </label>
            <label className={`cursor-pointer px-4 py-3 border rounded-xl font-bold flex items-center gap-2 transition-all ${targetType === 'LINE' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}>
              <input type="radio" name="_target_type_ui" checked={targetType === 'LINE'} onChange={() => setTargetType('LINE')} className="hidden" />
              🚇 특정 호선 전체
            </label>
            <label className={`cursor-pointer px-4 py-3 border rounded-xl font-bold flex items-center gap-2 transition-all ${targetType === 'STATION' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}>
              <input type="radio" name="_target_type_ui" checked={targetType === 'STATION'} onChange={() => setTargetType('STATION')} className="hidden" />
              📍 특정 역 직접 선택
            </label>
          </div>

          {targetType === 'LINE' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"노선 선택"}</label>
              <select 
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800"
              >
                <option value="">노선을 선택해주세요</option>
                {lines.map((line) => (
                  <option key={line.id} value={line.id}>{line.name_ko}</option>
                ))}
              </select>
              <input type="hidden" name="target_ids" value={selectedLine} />
            </div>
          )}

          {targetType === 'STATION' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">{"노출할 역 선택 (다중 선택 가능)"}</label>
              <input type="hidden" name="target_ids" value={selectedStations.join(',')} />
              <div className="max-h-60 overflow-y-auto border border-slate-200 bg-white p-4 rounded-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {stations.map(station => (
                  <label key={station.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${selectedStations.includes(station.id) ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedStations.includes(station.id)} 
                      onChange={() => handleStationToggle(station.id)} 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm truncate">{station.name_ko}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 mt-4">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"상세 페이지 포스팅 (SEO 노출용 제목)"}</label>
          <input type="text" name="post_title" placeholder="예: 라피트 특급 열차 완벽 가이드" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 font-bold text-blue-700" required />
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"상세 설명 (블로그형)"}</label>
        <BlockEditor draftKey="pass_register" />
      </div>

      <div className="pt-6 border-t border-slate-100">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "저장 중..." : "패스 등록 및 사이트 즉시 발행하기"}
        </button>
      </div>
    </form>
  );
}
