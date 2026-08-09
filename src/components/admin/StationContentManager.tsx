"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import { Plus, Trash2, Link as LinkIcon, Save, RefreshCw, ExternalLink, ImagePlus, Edit2, X } from "lucide-react";
import StationSearchSelect from "./StationSearchSelect";
import { updateStationPasses, addStationAttraction, deleteStationAttraction, updateStationAttraction } from "@/app/actions/stationActions";
import { createClient } from "@/utils/supabase/client";
import AdminDataTable from "./AdminDataTable";
import type { Column, FilterConfig } from "./AdminDataTable";

interface Station {
  id: string;
  name_ko: string;
  subway_pass_link?: string | null;
  express_pass_link?: string | null;
}

interface Attraction {
  id: string;
  station_id: string | null;
  name: string;
  category: string;
  icon: string;
  description: string;
  detail_content: string;
  image_url: string;
  affiliate_url: string;
}

interface StationContentManagerProps {
  stations: Station[];
  attractions: Attraction[];
  siteSettings?: { key: string; value: string }[];
}

export default function StationContentManager({ stations, attractions, siteSettings = [] }: StationContentManagerProps) {
  const [selectedStation, setSelectedStation] = useState<Station | null>(stations[0] || null);
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<'station' | 'all'>('all');

  // Pass Form State
  const [subwayPassLink, setSubwayPassLink] = useState(selectedStation?.subway_pass_link || "");
  const [expressPassLink, setExpressPassLink] = useState(selectedStation?.express_pass_link || "");
  
  const getInitialPanelTitle = (stationId: string) => {
    return siteSettings.find(s => s.key === `station_panel_title_${stationId}`)?.value || "";
  };
  const [panelTitle, setPanelTitle] = useState(getInitialPanelTitle(selectedStation?.id || ""));

  // Edit State
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);

  // Attraction Form State
  const [newAttraction, setNewAttraction] = useState({
    name: "",
    category: "관광지",
    icon: "MapPin",
    description: "",
    detail_content: "",
    image_url: "",
    affiliate_url: ""
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const supabase = createClient();
      
      const fileExt = file.name.split(".").pop();
      const fileName = `attr_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `promos/${fileName}`;

      const { error } = await supabase.storage
        .from("hotel-images")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("hotel-images")
        .getPublicUrl(filePath);

      setNewAttraction(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      alert("이미지 업로드에 실패했습니다. " + err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePasteImage = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    let imageFile = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageFile = items[i].getAsFile();
        break;
      }
    }

    if (imageFile) {
      e.preventDefault(); // 기본 붙여넣기(텍스트) 방지
      try {
        setUploading(true);
        const supabase = createClient();
        
        const fileExt = imageFile.name.split(".").pop() || "png";
        const fileName = `attr_paste_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `promos/${fileName}`;

        const { error } = await supabase.storage
          .from("hotel-images")
          .upload(filePath, imageFile);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("hotel-images")
          .getPublicUrl(filePath);

        setNewAttraction(prev => ({ ...prev, image_url: publicUrl }));
      } catch (err) {
        alert("붙여넣은 이미지 업로드에 실패했습니다. " + err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleStationChange = (station: Station) => {
    setSelectedStation(station);
    setSubwayPassLink(station.subway_pass_link || "");
    setExpressPassLink(station.express_pass_link || "");
    setPanelTitle(getInitialPanelTitle(station.id));
  };

  const handleUpdatePasses = () => {
    if (!selectedStation) return;
    
    startTransition(async () => {
      const res = await updateStationPasses(selectedStation.id, subwayPassLink, expressPassLink, panelTitle);
      if (res.success) {
        alert("저장되었습니다.");
      } else {
        alert("저장 실패: " + res.error);
      }
    });
  };

  const handleAddAttraction = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const res = await addStationAttraction({
        ...newAttraction,
        station_id: viewMode === 'station' && selectedStation ? selectedStation.id : (newAttraction as any).station_id || null
      });
      
      if (res.success) {
        alert("명소가 추가되었습니다.");
        setNewAttraction({
          name: "", category: "관광지", icon: "MapPin", description: "", detail_content: "", image_url: "", affiliate_url: ""
        });
      } else {
        alert("오류 발생: " + res.error);
      }
    });
  };

  const handleUpdateAttraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttraction) return;
    
    startTransition(async () => {
      const res = await updateStationAttraction(editingAttraction.id, {
        station_id: editingAttraction.station_id,
        name: editingAttraction.name,
        category: editingAttraction.category,
        icon: editingAttraction.icon,
        description: editingAttraction.description,
        detail_content: editingAttraction.detail_content,
        image_url: editingAttraction.image_url,
        affiliate_url: editingAttraction.affiliate_url
      });
      
      if (res.success) {
        alert("명소가 수정되었습니다.");
        setEditingAttraction(null);
      } else {
        alert("수정 실패: " + res.error);
      }
    });
  };

  const handleDeleteAttraction = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    startTransition(async () => {
      const res = await deleteStationAttraction(id);
      if (res.success) {
        // revalidated
      } else {
        alert("삭제 실패: " + res.error);
      }
    });
  };

  // Build station name lookup
  const stationMap = useMemo(() => {
    const map: Record<string, string> = {};
    stations.forEach(s => { map[s.id] = s.name_ko; });
    return map;
  }, [stations]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(attractions.map(a => a.category).filter(Boolean))];
  }, [attractions]);

  // Table columns for ALL attractions view
  const columns: Column<Attraction>[] = [
    {
      key: 'name',
      label: '명소',
      sortable: true,
      getValue: (item) => item.name,
      render: (item) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-sm">{item.name}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[250px]">{item.description}</p>
        </div>
      ),
    },
    {
      key: 'station',
      label: '역',
      sortable: true,
      getValue: (item) => item.station_id ? stationMap[item.station_id] || '' : '',
      render: (item) => (
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          {item.station_id ? (stationMap[item.station_id] || '알 수 없음') : '전체 (역 없음)'}
        </span>
      ),
    },
    {
      key: 'category',
      label: '카테고리',
      sortable: true,
      width: '100px',
      getValue: (item) => item.category,
      render: (item) => (
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
          {item.category}
        </span>
      ),
    },
    {
      key: 'link_type',
      label: '링크',
      align: 'center',
      width: '80px',
      hideOnMobile: true,
      render: (item) => item.affiliate_url ? (
        <a href={item.affiliate_url} target="_blank" rel="noreferrer"
          className="text-blue-500 hover:text-blue-700 transition-colors">
          <ExternalLink size={14} />
        </a>
      ) : (
        <span className="text-[10px] text-emerald-500 font-bold">📝 내부</span>
      ),
    },
  ];

  const tableFilters: FilterConfig<Attraction>[] = [
    {
      key: 'station',
      label: '역',
      options: stations.map(s => ({ label: s.name_ko, value: s.id })),
      filterFn: (item, val) => item.station_id === val,
    },
    {
      key: 'category',
      label: '카테고리',
      options: categories.map(c => ({ label: c, value: c })),
      filterFn: (item, val) => item.category === val,
    },
  ];

  if (!selectedStation) return <div>역이 없습니다.</div>;

  return (
    <div className="space-y-8">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            viewMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          📋 전체 명소 ({attractions.length})
        </button>
        <button
          onClick={() => setViewMode('station')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            viewMode === 'station' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🚉 역별 관리
        </button>
      </div>

      {viewMode === 'all' ? (
        /* ── ALL attractions data table + form ── */
        <>
        <AdminDataTable<Attraction>
          data={attractions}
          columns={columns}
          getId={(item) => item.id}
          searchPlaceholder="명소명, 설명으로 검색..."
          searchFn={(item, q) =>
            (item.name || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.station_id ? (stationMap[item.station_id] || '') : '').toLowerCase().includes(q)
          }
          filters={tableFilters}
          defaultPerPage={20}
          emptyIcon="📍"
          emptyMessage="등록된 명소가 없습니다."
          renderActions={(item) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditingAttraction(item)}
                disabled={isPending}
                title="수정"
                className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDeleteAttraction(item.id)}
                disabled={isPending}
                title="삭제"
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />

        {/* 새 명소 추가 폼 (역 선택 optional) */}
        <form onSubmit={handleAddAttraction} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 mt-6">
          <h4 className="font-bold text-slate-700">새 명소/액티비티 추가</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">소속 역 (선택)</label>
              <select value={(newAttraction as any).station_id || ''} onChange={e => setNewAttraction({...newAttraction, station_id: e.target.value || null} as any)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="">전체 (역 없음)</option>
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.name_ko}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">명소 이름</label>
              <input required type="text" value={newAttraction.name} onChange={e => setNewAttraction({...newAttraction, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="예: 시부야 스크램블 교차로" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">카테고리</label>
              <input required type="text" value={newAttraction.category} onChange={e => setNewAttraction({...newAttraction, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="예: 관광지, 맛집, 쇼핑" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">아이콘/이모지</label>
              <input required type="text" value={newAttraction.icon} onChange={e => setNewAttraction({...newAttraction, icon: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="예: 📍, MapPin, Ticket" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">1줄 요약 (리스트용)</label>
            <input required type="text" value={newAttraction.description} onChange={e => setNewAttraction({...newAttraction, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="예: 도쿄를 대표하는 최고의 번화가" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">상세 설명 (링크가 없을 때 팝업용)</label>
            <textarea value={newAttraction.detail_content} onChange={e => setNewAttraction({...newAttraction, detail_content: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none min-h-24" placeholder="팝업에 노출될 상세 내용을 입력하세요. 제휴 링크가 있으면 무시됩니다." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">대표 사진 URL</label>
              <div className="relative flex items-center">
                <input 
                  required 
                  type="text" 
                  value={newAttraction.image_url} 
                  onChange={e => setNewAttraction({...newAttraction, image_url: e.target.value})} 
                  onPaste={handlePasteImage}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none pr-28" 
                  placeholder="https://... 또는 이미지 복사 후 Ctrl+V" 
                />
                <div className="absolute right-1.5 flex items-center">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50">
                    {uploading ? <RefreshCw size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                    {uploading ? "업로드" : "사진 첨부"}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">제휴 링크 (선택)</label>
              <input type="text" value={newAttraction.affiliate_url} onChange={e => setNewAttraction({...newAttraction, affiliate_url: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="입력 시 팝업 대신 해당 링크로 이동" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {isPending ? <RefreshCw className="animate-spin" size={18} /> : <Plus size={18} />}
            새 명소 등록
          </button>
        </form>
        </>

      ) : (
        /* ── Station-specific view ── */
        <>
          {/* 1. 역 선택기 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">역 선택</h3>
            <StationSearchSelect 
              stations={stations} 
              onChange={handleStationChange} 
              defaultValue={selectedStation} 
            />
          </div>

          {/* 2. 패스 링크 관리 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LinkIcon size={20} className="text-blue-500" />
              역별 패스 제휴 링크 (Klook 등)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">지하철 패스 구매 링크</label>
                <input 
                  type="text" 
                  value={subwayPassLink} 
                  onChange={e => setSubwayPassLink(e.target.value)}
                  placeholder="예: https://klook.com/... (도쿄 메트로 패스)"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">특급열차 패스 구매 링크</label>
                <input 
                  type="text" 
                  value={expressPassLink} 
                  onChange={e => setExpressPassLink(e.target.value)}
                  placeholder="예: https://klook.com/... (스카이라이너, 하루카 등)"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  명소 패널 커스텀 타이틀 <span className="text-xs text-slate-500 font-normal">(선택)</span>
                </label>
                <input 
                  type="text" 
                  value={panelTitle} 
                  onChange={e => setPanelTitle(e.target.value)}
                  placeholder="예: 클룩 디즈니랜드 스튜디오 입장권 (비워두면 'OO역 주변 명소'로 표시)"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-700"
                />
              </div>
              
              <button 
                onClick={handleUpdatePasses}
                disabled={isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {isPending ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                패스 링크 저장
              </button>
            </div>
          </div>

          {/* 3. 선택된 역의 명소 리스트 (data table) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-emerald-500" />
              {selectedStation.name_ko} 주변 명소
            </h3>

            <AdminDataTable<Attraction>
              data={attractions.filter(a => a.station_id === selectedStation.id)}
              columns={columns.filter(c => c.key !== 'station')}
              getId={(item) => item.id}
              searchPlaceholder="명소명으로 검색..."
              searchFn={(item, q) =>
                (item.name || '').toLowerCase().includes(q) ||
                (item.description || '').toLowerCase().includes(q)
              }
              defaultPerPage={10}
              perPageOptions={[5, 10, 20]}
              emptyIcon="📍"
              emptyMessage={`${selectedStation.name_ko}에 등록된 명소가 없습니다.`}
              renderActions={(item) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingAttraction(item)}
                    disabled={isPending}
                    title="수정"
                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteAttraction(item.id)}
                    disabled={isPending}
                    title="삭제"
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            />
          </div>

          {/* 4. 새 명소 추가 폼 */}
          <form onSubmit={handleAddAttraction} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-700">새 명소 추가 ({selectedStation.name_ko})</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">명소 이름</label>
                <input required type="text" value={newAttraction.name} onChange={e => setNewAttraction({...newAttraction, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="예: 시부야 스크램블 교차로" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">카테고리</label>
                <input required type="text" value={newAttraction.category} onChange={e => setNewAttraction({...newAttraction, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="예: 관광지, 맛집, 쇼핑" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">아이콘/이모지</label>
                <input required type="text" value={newAttraction.icon} onChange={e => setNewAttraction({...newAttraction, icon: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="예: 📍, MapPin, Ticket" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">1줄 요약 (리스트용)</label>
              <input required type="text" value={newAttraction.description} onChange={e => setNewAttraction({...newAttraction, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="예: 도쿄를 대표하는 최고의 번화가" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">상세 설명 (링크가 없을 때 팝업용)</label>
              <textarea value={newAttraction.detail_content} onChange={e => setNewAttraction({...newAttraction, detail_content: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none min-h-24" placeholder="팝업에 노출될 상세 내용을 입력하세요. 제휴 링크가 있으면 무시됩니다." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">대표 사진 URL</label>
                <div className="relative flex items-center">
                  <input 
                    required 
                    type="text" 
                    value={newAttraction.image_url} 
                    onChange={e => setNewAttraction({...newAttraction, image_url: e.target.value})} 
                    onPaste={handlePasteImage}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none pr-28" 
                    placeholder="https://... 또는 이미지 복사 후 Ctrl+V" 
                  />
                  <div className="absolute right-1.5 flex items-center">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50">
                      {uploading ? <RefreshCw size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                      {uploading ? "업로드" : "사진 첨부"}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">제휴 링크 (선택)</label>
                <input type="text" value={newAttraction.affiliate_url} onChange={e => setNewAttraction({...newAttraction, affiliate_url: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="입력 시 팝업 대신 해당 링크로 이동" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {isPending ? <RefreshCw className="animate-spin" size={18} /> : <Plus size={18} />}
              새 명소 등록
            </button>
          </form>
        </>
      )}

      {/* 5. 수정 모달 */}
      {editingAttraction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateAttraction} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-slate-900">명소 수정</h4>
              <button type="button" onClick={() => setEditingAttraction(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">소속 역 (선택)</label>
                <select value={editingAttraction.station_id || ''} onChange={e => setEditingAttraction({...editingAttraction, station_id: e.target.value || null})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">전체 (역 없음)</option>
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name_ko}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">명소 이름</label>
                <input required type="text" value={editingAttraction.name} onChange={e => setEditingAttraction({...editingAttraction, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">카테고리</label>
                <input required type="text" value={editingAttraction.category} onChange={e => setEditingAttraction({...editingAttraction, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">아이콘</label>
                <input required type="text" value={editingAttraction.icon} onChange={e => setEditingAttraction({...editingAttraction, icon: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">1줄 요약 (리스트용)</label>
              <input required type="text" value={editingAttraction.description} onChange={e => setEditingAttraction({...editingAttraction, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">상세 설명 (링크가 없을 때 팝업용)</label>
              <textarea value={editingAttraction.detail_content} onChange={e => setEditingAttraction({...editingAttraction, detail_content: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-24" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">대표 사진 URL</label>
                <input required type="text" value={editingAttraction.image_url} onChange={e => setEditingAttraction({...editingAttraction, image_url: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <p className="text-[10px] text-slate-400 mt-1">* 수정창에서는 URL 직접 입력만 지원합니다.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">제휴 링크 (선택)</label>
                <input type="text" value={editingAttraction.affiliate_url || ''} onChange={e => setEditingAttraction({...editingAttraction, affiliate_url: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <button type="submit" disabled={isPending} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 mt-4">
              {isPending ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              명소 수정 완료
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
