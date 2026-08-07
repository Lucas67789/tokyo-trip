'use client';

import { useState } from 'react';
import { Trash2, Pencil, X, Building2, Palette, Tag, Globe, FileText, Settings2, Image as ImageIcon } from 'lucide-react';
import { deletePartner, updatePartner } from '@/app/actions/partnerActions';
import BlockEditor from './BlockEditor';

const PRESET_COLORS = [
  { hex: "#2563EB", label: "Blue"   },
  { hex: "#F43F5E", label: "Rose"   },
  { hex: "#F97316", label: "Orange" },
  { hex: "#9333EA", label: "Purple" },
  { hex: "#16A34A", label: "Green"  },
  { hex: "#4F46E5", label: "Indigo" },
  { hex: "#0D9488", label: "Teal"   },
  { hex: "#F59E0B", label: "Amber"  },
  { hex: "#EC4899", label: "Pink"   },
  { hex: "#6366F1", label: "Violet" },
];

export default function PartnerListClient({ partners }: { partners: any[] }) {
  const [editingPartner, setEditingPartner] = useState<any | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPartner) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updatePartner(editingPartner.id, formData);
      setEditingPartner(null);
    } catch (error: any) {
      alert('제휴사 수정 중 오류가 발생했습니다: ' + error.message);
      console.error(error);
    }
  };

  return (
    <>
      <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" id="partner-section">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="font-extrabold text-slate-800 text-sm">등록된 제휴사</span>
          <span className="text-xs text-purple-600 font-black bg-purple-50 px-2.5 py-0.5 rounded-full">
            {partners.length}개
          </span>
        </div>
        {partners.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">🏢</div>
            <p className="text-slate-400 text-sm font-medium">
              아직 등록된 제휴사가 없습니다.
            </p>
            <p className="text-slate-300 text-xs mt-1">오른쪽 폼으로 먼저 등록해주세요.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {partners.map((p: any) => (
              <li key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {/* 색상 & 이니셜 */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-sm"
                  style={{ backgroundColor: p.color_hex || "#2563EB" }}
                >
                  {p.logo_char || p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{p.name}</span>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                      /store/{p.slug}
                    </span>
                  </div>
                  {p.subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{p.subtitle}</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <button 
                    onClick={() => setEditingPartner(p)}
                    title="수정"
                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all active:scale-95 cursor-pointer">
                    <Pencil size={14} />
                  </button>
                  <form action={async () => { try { await deletePartner(p.id); } catch (err: any) { alert("삭제 실패: " + err.message); } }}>
                    <button type="submit" title="삭제"
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95 cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 제휴사 수정 모달 */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-purple-600" /> 제휴사 수정
              </h3>
              <button onClick={() => setEditingPartner(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              <form id="edit-partner-form" onSubmit={handleUpdate} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Building2 size={13} className="text-slate-400" /> 제휴사명 <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="name" defaultValue={editingPartner.name} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-bold placeholder-slate-300" required />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Settings2 size={13} className="text-slate-400" /> URL 슬러그 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
                      <span className="px-3 py-3 text-xs font-bold text-slate-400 bg-slate-50 border-r border-slate-200 whitespace-nowrap">/store/</span>
                      <input type="text" name="slug" defaultValue={editingPartner.slug} className="flex-1 px-3 py-3 outline-none font-mono font-bold text-sm placeholder-slate-300" required />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Tag size={13} className="text-slate-400" /> 로고 대표 글자
                    </label>
                    <input type="text" name="logo_char" defaultValue={editingPartner.logo_char} maxLength={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-black text-center text-lg placeholder-slate-300" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Palette size={13} className="text-slate-400" /> 브랜드 색상
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((c) => (
                        <label key={c.hex} className="cursor-pointer" title={c.label}>
                          <input type="radio" name="color_hex" value={c.hex} defaultChecked={c.hex === editingPartner.color_hex} className="sr-only peer" />
                          <div style={{ backgroundColor: c.hex }} className="w-8 h-8 rounded-xl border-2 border-white shadow-sm hover:scale-110 transition-transform peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-slate-700" />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <FileText size={13} className="text-slate-400" /> 소개 문구 (서브타이틀)
                  </label>
                  <input type="text" name="subtitle" defaultValue={editingPartner.subtitle || ''} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none placeholder-slate-300 font-medium" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Globe size={13} className="text-slate-400" /> 홈페이지 URL
                    </label>
                    <input type="url" name="main_url" defaultValue={editingPartner.main_url || ''} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm placeholder-slate-300" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <ImageIcon size={13} className="text-slate-400" /> 로고 이미지 URL
                    </label>
                    <input type="url" name="logo_url" defaultValue={editingPartner.logo_url || ''} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm placeholder-slate-300" />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <FileText size={13} className="text-slate-400" /> 공통 가이드 (SEO 최적화)
                  </label>
                  <BlockEditor inputName="common_guide" title="제휴사 공통 가이드 에디터" initialContent={editingPartner.common_guide} draftKey={`partner_edit_${editingPartner.id}`} />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditingPartner(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                취소
              </button>
              <button form="edit-partner-form" type="submit" className="bg-purple-600 text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
