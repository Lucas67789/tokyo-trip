'use client';

import { useState, useMemo } from 'react';
import { updateSidebarPromos, updateHotelSidebarPromos } from '@/app/actions/settingActions';
import { Layers, Search, Filter, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

type Promo = {
  id: string;
  partner_name: string;
  discount_rate: string;
  promo_code: string;
  is_active: boolean;
};

export default function SidebarPromoSelectorClient({
  allPromos,
  initialSelectedIds,
  hotelId,
  title,
}: {
  allPromos: Promo[];
  initialSelectedIds: string[];
  hotelId?: string;
  title?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('ALL');

  // 제휴사 목록 추출
  const partners = useMemo(() => {
    const unique = Array.from(new Set(allPromos.map(p => p.partner_name)));
    return ['ALL', ...unique];
  }, [allPromos]);

  // 필터링 적용
  const filteredPromos = useMemo(() => {
    return allPromos.filter(promo => {
      const matchPartner = selectedPartner === 'ALL' || promo.partner_name === selectedPartner;
      const matchSearch = promo.promo_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          promo.discount_rate.toLowerCase().includes(searchTerm.toLowerCase());
      return matchPartner && matchSearch;
    });
  }, [allPromos, selectedPartner, searchTerm]);

  // 선택된 항목 리스트 추출
  const selectedPromos = useMemo(() => {
    return selectedIds.map(id => allPromos.find(p => p.id === id)).filter(Boolean) as Promo[];
  }, [selectedIds, allPromos]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(val => val !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('최대 4개까지만 선택할 수 있습니다.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const movePromo = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedIds.length) return;
    
    const newSelectedIds = [...selectedIds];
    const temp = newSelectedIds[index];
    newSelectedIds[index] = newSelectedIds[newIndex];
    newSelectedIds[newIndex] = temp;
    setSelectedIds(newSelectedIds);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (hotelId) {
        await updateHotelSidebarPromos(hotelId, selectedIds);
      } else {
        await updateSidebarPromos(selectedIds);
      }
      alert('성공적으로 저장되었습니다.');
    } catch (e: any) {
      alert('저장 중 오류 발생: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <Layers size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {title || '호텔 사이드바 할인코드 설정'}
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white font-extrabold py-2 px-5 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          {isSaving ? '저장 중...' : '선택사항 저장하기'}
        </button>
      </div>

      {/* 선택된 항목 요약 트레이 (보관함) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-slate-600 font-bold mb-3 flex items-center justify-between">
          <span>선택된 항목 보관함 <span className="text-indigo-600">({selectedIds.length}/4)</span></span>
          {selectedIds.length > 0 && (
            <button onClick={() => setSelectedIds([])} className="text-xs text-slate-400 hover:text-slate-600 underline">
              전체 해제
            </button>
          )}
        </p>
        {selectedPromos.length === 0 ? (
          <p className="text-xs text-slate-400 italic">선택된 항목이 없습니다. 아래 목록에서 클릭하여 추가하세요.</p>
        ) : (
          <div className="flex flex-wrap gap-4 mt-2">
            {selectedPromos.map((promo, index) => (
              <div key={`selected-${promo.id}`} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm relative group transition-all ${index === 0 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-800 border-indigo-200'}`}>
                {index === 0 && (
                  <span className="absolute -top-2.5 -left-2 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 whitespace-nowrap">
                    👑 메인 노출
                  </span>
                )}
                
                <button 
                  onClick={(e) => { e.stopPropagation(); movePromo(index, -1); }} 
                  disabled={index === 0}
                  className={`p-0.5 rounded-full transition-colors ${index === 0 ? 'text-indigo-400 hover:text-white disabled:opacity-30' : 'text-indigo-400 hover:text-indigo-700 hover:bg-indigo-200 disabled:opacity-30'}`}
                >
                  <ChevronLeft size={14} strokeWidth={3} />
                </button>

                <span className="text-xs font-bold">{promo.partner_name}</span>
                <span className={`text-[10px] truncate max-w-[100px] ${index === 0 ? 'text-indigo-200' : 'text-indigo-600'}`}>{promo.promo_code}</span>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); movePromo(index, 1); }} 
                  disabled={index === selectedPromos.length - 1}
                  className={`p-0.5 rounded-full transition-colors ${index === 0 ? 'text-indigo-400 hover:text-white disabled:opacity-30' : 'text-indigo-400 hover:text-indigo-700 hover:bg-indigo-200 disabled:opacity-30'}`}
                >
                  <ChevronRight size={14} strokeWidth={3} />
                </button>

                <div className={`w-px h-4 mx-1 ${index === 0 ? 'bg-indigo-500' : 'bg-indigo-200'}`}></div>

                <button onClick={(e) => { e.stopPropagation(); toggleSelection(promo.id); }} className={`rounded-full p-0.5 transition-colors ${index === 0 ? 'text-indigo-300 hover:text-rose-300' : 'text-indigo-400 hover:text-rose-500 hover:bg-rose-100'}`}>
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 검색 및 필터 바 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative w-full sm:w-48 shrink-0">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-slate-400" />
          </div>
          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="ALL">전체 제휴사</option>
            {partners.filter(p => p !== 'ALL').map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="할인코드 명이나 혜택을 검색하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* 엑셀 형식 리스트 (Table) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">선택</th>
                <th className="px-4 py-3 w-20">상태</th>
                <th className="px-4 py-3">제휴사</th>
                <th className="px-4 py-3">할인/혜택 내용</th>
                <th className="px-4 py-3">할인코드</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPromos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    검색 조건에 맞는 할인코드가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredPromos.map(promo => {
                  const isSelected = selectedIds.includes(promo.id);
                  return (
                    <tr 
                      key={promo.id}
                      onClick={() => toggleSelection(promo.id)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mx-auto transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                          promo.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {promo.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{promo.partner_name}</td>
                      <td className="px-4 py-3 font-medium text-slate-600 truncate max-w-[200px]" title={promo.discount_rate}>{promo.discount_rate}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {promo.promo_code}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3 text-right">총 {filteredPromos.length}개의 항목이 검색되었습니다.</p>
    </div>
  );
}
