"use client";

import { useState } from "react";
import { updatePass } from "@/app/actions/passActions";
import BlockEditor from "./BlockEditor";
import UnsavedChangesWarning from "./UnsavedChangesWarning";

interface Station {
  id: string;
  name_ko: string;
}

interface Line {
  id: string;
  name_ko: string;
}

interface PassTarget {
  target_type: string;
  target_id: string | null;
}

interface PassEditFormProps {
  stations: Station[];
  lines: Line[];
  initialData: {
    id: string;
    name_ko: string;
    slug: string;
    description: string;
    affiliate_url: string;
    affiliate_links?: any;
    content: string;
    pass_targets: PassTarget[];
  };
}

export default function PassEditForm({ stations, lines, initialData }: PassEditFormProps) {
  const initialTargetType = initialData.pass_targets && initialData.pass_targets.length > 0
    ? initialData.pass_targets[0].target_type as "ALL" | "LINE" | "STATION"
    : "ALL";
    
  const initialSelectedLine = initialTargetType === "LINE" 
    ? initialData.pass_targets[0].target_id || "" 
    : "";
    
  const initialSelectedStations = initialTargetType === "STATION"
    ? initialData.pass_targets.map(t => t.target_id).filter(Boolean) as string[]
    : [];

  const [targetType, setTargetType] = useState<"ALL" | "LINE" | "STATION">(initialTargetType);
  const [selectedStations, setSelectedStations] = useState<string[]>(initialSelectedStations);
  const [selectedLine, setSelectedLine] = useState<string>(initialSelectedLine);
  
  const [nameKo, setNameKo] = useState(initialData.name_ko || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [description, setDescription] = useState(initialData.description || "");
  
  // Parse affiliate_links from DB. If empty or null, fallback to the old affiliate_url format.
  const initialLinks = initialData.affiliate_links && Array.isArray(initialData.affiliate_links) && initialData.affiliate_links.length > 0
    ? initialData.affiliate_links
    : initialData.affiliate_url 
      ? [{ platform: "기본링크", url: initialData.affiliate_url }] 
      : [{ platform: "클룩", url: "" }];
      
  const [affiliateLinks, setAffiliateLinks] = useState<{platform: string, url: string}[]>(initialLinks);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStationToggle = (stationId: string) => {
    setSelectedStations((prev) => 
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  return (
    <form action={async (formData) => {
      setIsSubmitting(true);
      try {
        await updatePass(formData);
        alert("패스 정보가 성공적으로 수정되었습니다.");
        window.location.href = "/admin/passes";
      } catch (error: any) {
        alert("수정 실패: " + error.message);
        setIsSubmitting(false);
      }
    }} className="space-y-6">
      <UnsavedChangesWarning isDirty={true} />
      <input type="hidden" name="id" value={initialData.id} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"패스 이름"}</label>
          <input 
            type="text" 
            name="name_ko" 
            value={nameKo}
            onChange={(e) => setNameKo(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 font-bold" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
            {"URL 식별자 (Slug)"} 
          </label>
          <input 
            type="text" 
            name="slug" 
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold" 
            required 
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"1줄 요약 (목록 노출용)"}</label>
          <input 
            type="text" 
            name="description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          <h3 className="font-extrabold text-slate-900 mb-4 text-lg">{"🎯 노출 대상(타겟) 설정 수정"}</h3>
          
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
      </div>

      <div className="mt-8">
        <BlockEditor initialContent={initialData.content} draftKey={`pass_edit_${initialData.id}`} />
      </div>

      <div className="pt-6 border-t border-slate-100 flex gap-4">
        <button 
          type="button" 
          onClick={() => window.history.back()}
          className="flex-1 bg-slate-100 text-slate-700 font-extrabold py-4 rounded-xl hover:bg-slate-200 transition-all shadow-sm active:scale-95 text-lg cursor-pointer"
        >
          {"취소 및 돌아가기"}
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-emerald-600 text-white font-extrabold py-4 rounded-xl hover:bg-emerald-700 disabled:bg-emerald-400 transition-all shadow-md active:scale-95 text-lg cursor-pointer"
        >
          {isSubmitting ? "수정 중..." : "변경 사항 저장하기"}
        </button>
      </div>
    </form>
  );
}
