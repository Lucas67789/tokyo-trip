"use client";

import { deletePass } from "@/app/actions/passActions";
import { Trash2, ExternalLink, Ticket, Eye, Pencil } from "lucide-react";
import Image from "next/image";

interface PassTarget {
  target_type: string;
  target_id: string | null;
}

interface Pass {
  id: string;
  name_ko: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  view_count: number;
  click_count: number;
  pass_targets: PassTarget[];
}

interface PassListProps {
  passes: Pass[];
}

export default function PassList({ passes }: PassListProps) {
  if (!passes || passes.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500 font-bold">
        등록된 교통 패스가 없습니다. 위에서 새로운 패스를 등록해보세요.
      </div>
    );
  }

  const getTargetBadge = (targets: PassTarget[]) => {
    if (!targets || targets.length === 0) return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">설정 안됨</span>;
    
    const allCount = targets.filter(t => t.target_type === 'ALL').length;
    if (allCount > 0) return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">🌐 전체 역 노출</span>;

    const lineCount = targets.filter(t => t.target_type === 'LINE').length;
    if (lineCount > 0) return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">🚇 {lineCount}개 노선 노출</span>;

    const stationCount = targets.filter(t => t.target_type === 'STATION').length;
    if (stationCount > 0) return <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-200">📍 {stationCount}개 역 노출</span>;

    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {passes.map((pass) => (
        <div key={pass.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
          <div className="relative h-40 w-full bg-slate-100 border-b border-slate-100 overflow-hidden">
            {pass.thumbnail_url ? (
              <img 
                src={pass.thumbnail_url} 
                alt={pass.name_ko}
                className="w-full h-full object-contain bg-slate-50 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Ticket size={48} />
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              {getTargetBadge(pass.pass_targets)}
            </div>
          </div>
          
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">{pass.name_ko}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{pass.description}</p>
            
            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-3 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1" title="상세 페이지 조회수">
                  <Eye size={14} className="text-slate-400" /> {pass.view_count || 0}
                </span>
                <span className="flex items-center gap-1 text-blue-600" title="제휴 링크 클릭수">
                  <ExternalLink size={14} /> {pass.click_count || 0}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href={`/pass/${pass.slug}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  페이지 확인
                </a>
                <a 
                  href={`/admin/pass/edit/${pass.id}`}
                  title="수정"
                  className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Pencil size={16} />
                </a>
                <form action={deletePass.bind(null, pass.id)}>
                  <button 
                    type="submit"
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={(e) => {
                      if (!confirm(`'${pass.name_ko}' 패스를 정말 삭제하시겠습니까?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
