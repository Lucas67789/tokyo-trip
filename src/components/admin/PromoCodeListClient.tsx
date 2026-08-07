'use client';

import { useState, useMemo } from 'react';
import { Trash2, Pencil, CheckCircle2, Ticket, Link2, FileText, Clock, Settings2, Tag, Copy, Check, CopyPlus, Image } from 'lucide-react';
import { deletePromoCode, deletePromoCodes, updatePromoCode, addPromoCode } from '@/app/actions/promoActions';
import AdminDataTable, { CopyButton, StatusBadge, StatBadge } from './AdminDataTable';
import MarkdownImageUploader from './MarkdownImageUploader';
import SingleImageUploader from './SingleImageUploader';
import type { Column, FilterConfig } from './AdminDataTable';

type PromoCode = {
  id: string;
  partner_name: string;
  promo_code: string;
  discount_rate: string;
  target_url: string;
  description: string | null;
  is_active: boolean;
  click_count: number;
  meta_title?: string;
  meta_description?: string;
  seo_content?: string;
  image_url?: string | null;
  expires_at?: string | null;
  created_at: string;
};

type Partner = {
  id: string;
  name: string;
  color_hex?: string;
};

export default function PromoCodeListClient({ promoCodes, partners }: { promoCodes: PromoCode[], partners: Partner[] }) {
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [duplicatingCode, setDuplicatingCode] = useState<PromoCode | null>(null);

  // Helper to parse description back into condition/expiry
  const parseDescription = (desc: string | null) => {
    if (!desc) return { condition: '', expiry: '', descriptionRaw: '' };
    if (desc.includes('조건:') || desc.includes('유효기간:')) {
      const parts = desc.split(' / ');
      let cond = '';
      let exp = '';
      parts.forEach(p => {
        if (p.startsWith('조건: ')) cond = p.replace('조건: ', '');
        else if (p.startsWith('유효기간: ')) exp = p.replace('유효기간: ', '');
      });
      return { condition: cond, expiry: exp, descriptionRaw: '' };
    }
    return { condition: '', expiry: '', descriptionRaw: desc };
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCode) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updatePromoCode(editingCode.id, formData);
      setEditingCode(null);
    } catch (error) {
      alert('수정 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  // ── Column definitions ──
  const columns: Column<PromoCode>[] = [
    {
      key: 'is_active',
      label: '상태',
      sortable: true,
      width: '90px',
      align: 'center',
      getValue: (item) => item.is_active ? 1 : 0,
      render: (item) => {
        const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
        if (isExpired) {
          return <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap bg-slate-200 text-slate-500">
            만료됨
          </span>;
        }
        return <StatusBadge active={item.is_active} />;
      },
    },
    {
      key: 'partner_name',
      label: '제휴사',
      sortable: true,
      getValue: (item) => item.partner_name,
      render: (item) => {
        const p = partners.find(pp => pp.name === item.partner_name);
        const color = p?.color_hex || '#64748b';
        return (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="font-bold text-sm text-slate-800">{item.partner_name}</span>
          </div>
        );
      },
    },
    {
      key: 'discount_rate',
      label: '할인 내용',
      sortable: true,
      getValue: (item) => item.discount_rate,
      render: (item) => (
        <span className="font-extrabold text-sm text-slate-900">{item.discount_rate}</span>
      ),
    },
    {
      key: 'promo_code',
      label: '코드',
      sortable: true,
      getValue: (item) => item.promo_code,
      render: (item) => {
        const p = partners.find(pp => pp.name === item.partner_name);
        const color = p?.color_hex || '#6366f1';
        const isNoCode = item.promo_code.includes('불필요') || item.promo_code.includes('필요없음');
        return (
          <div className="flex items-center gap-2">
            <code className="font-mono text-xs font-bold tracking-wider px-2 py-1 rounded-md" 
              style={{ color, backgroundColor: color + '15' }}>
              {item.promo_code}
            </code>
            {!isNoCode && <CopyButton text={item.promo_code} />}
          </div>
        );
      },
    },
    {
      key: 'click_count',
      label: '클릭',
      sortable: true,
      align: 'center',
      width: '80px',
      hideOnMobile: true,
      getValue: (item) => item.click_count || 0,
      render: (item) => (
        <StatBadge label="👆" value={item.click_count || 0} color="blue" />
      ),
    },
    {
      key: 'description',
      label: '조건/유효기간',
      hideOnMobile: true,
      getValue: (item) => item.description || '',
      render: (item) => (
        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
          {item.description || '-'}
        </p>
      ),
    },
  ];

  // ── Filters ──
  const tableFilters: FilterConfig<PromoCode>[] = [
    {
      key: 'partner',
      label: '제휴사',
      options: partners.map(p => ({ label: p.name, value: p.name })),
      filterFn: (item, val) => item.partner_name === val,
    },
    {
      key: 'status',
      label: '상태',
      options: [
        { label: '공개', value: 'active' },
        { label: '비공개', value: 'inactive' },
      ],
      filterFn: (item, val) => val === 'active' ? item.is_active : !item.is_active,
    },
  ];

  return (
    <>
      <AdminDataTable<PromoCode>
        data={promoCodes}
        columns={columns}
        getId={(item) => item.id}
        searchPlaceholder="코드명, 제휴사, 할인내용 검색..."
        searchFn={(item, q) =>
          item.promo_code.toLowerCase().includes(q) ||
          item.partner_name.toLowerCase().includes(q) ||
          item.discount_rate.toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q)
        }
        filters={tableFilters}
        defaultPerPage={20}
        onBulkDelete={async (ids) => { await deletePromoCodes(ids); }}
        emptyIcon="🎟️"
        emptyMessage="등록된 할인코드가 없습니다."
        renderActions={(item) => (
          <>
            <button
              onClick={() => setDuplicatingCode(item)}
              title="복사(복제)"
              className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <CopyPlus size={14} />
            </button>
            <button
              onClick={() => setEditingCode(item)}
              title="수정"
              className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <Pencil size={14} />
            </button>
            <form action={async () => { try { await deletePromoCode(item.id); } catch (err: any) { alert("삭제 실패: " + err.message); } }}>
              <button type="submit" title="삭제"
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95 cursor-pointer">
                <Trash2 size={14} />
              </button>
            </form>
          </>
        )}
        renderStats={(all, filtered) => {
          const activeCount = all.filter(c => c.is_active).length;
          const inactiveCount = all.length - activeCount;
          return (
            <>
              <span>• 공개 <span className="text-emerald-600">{activeCount}</span></span>
              <span>• 비공개 <span className="text-slate-400">{inactiveCount}</span></span>
            </>
          );
        }}
      />

      {/* Edit Promo Code Modal */}
      {editingCode && (() => {
        const parsed = parseDescription(editingCode.description);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                  <Ticket size={18} className="text-blue-600" /> 할인코드 수정
                </h3>
                <button onClick={() => setEditingCode(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors">
                  <span className="font-mono text-lg leading-none">&times;</span>
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 flex-1">
                <form id="edit-promo-form" onSubmit={handleUpdate} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <CheckCircle2 size={13} className="text-slate-400" /> 상태
                      </label>
                      <select name="is_active" defaultValue={editingCode.is_active ? "true" : "false"}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700">
                        <option value="true">● 공개 (바로 노출)</option>
                        <option value="false">○ 임시저장 (비공개)</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <Tag size={13} className="text-slate-400" /> 직속 스토어 <span className="text-red-500">*</span>
                      </label>
                      <select name="partner_name" defaultValue={editingCode.partner_name}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                        required>
                        {partners.map((p: any) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <FileText size={13} className="text-slate-400" /> 할인 내용 <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="discount_rate" defaultValue={editingCode.discount_rate}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold" required />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Settings2 size={13} className="text-slate-400" /> 프로모션 코드 <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="promo_code" defaultValue={editingCode.promo_code}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase tracking-wider font-bold" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <CheckCircle2 size={13} className="text-slate-400" /> 사용 조건
                      </label>
                      <input type="text" name="condition" defaultValue={parsed.condition}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <Clock size={13} className="text-slate-400" /> 표시용 유효기간
                      </label>
                      <input type="text" name="expiry" defaultValue={parsed.expiry}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Clock size={13} className="text-red-400" /> 시스템 자동 만료일 <span className="text-slate-400 font-normal">(선택)</span>
                    </label>
                    <input type="datetime-local" name="expires_at" 
                      defaultValue={editingCode.expires_at ? new Date(new Date(editingCode.expires_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none font-medium" />
                  </div>

                  {!parsed.condition && !parsed.expiry && parsed.descriptionRaw && (
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <FileText size={13} className="text-slate-400" /> 커스텀 설명 (조건/유효기간 대신)
                      </label>
                      <input type="text" name="description" defaultValue={parsed.descriptionRaw}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Link2 size={13} className="text-slate-400" /> 제휴 링크 URL <span className="text-red-500">*</span>
                    </label>
                    <input type="url" name="target_url" defaultValue={editingCode.target_url}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" required />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Image size={13} className="text-slate-400" /> 썸네일 이미지 URL <span className="text-slate-400 font-normal">(선택)</span>
                    </label>
                    <SingleImageUploader name="image_url" defaultValue={editingCode.image_url || ''} />
                  </div>

                  {/* SEO Fields */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-sm font-extrabold text-slate-800 mb-4">🔍 SEO 상세 설정</p>
                    <div className="mb-4">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">SEO 제목</label>
                      <input type="text" name="meta_title" defaultValue={editingCode.meta_title || ''} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="mb-4">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">SEO 설명</label>
                      <textarea name="meta_description" defaultValue={editingCode.meta_description || ''} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">상세 콘텐츠 (마크다운)</label>
                      <MarkdownImageUploader name="seo_content" defaultValue={editingCode.seo_content || ''} />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setEditingCode(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                  취소
                </button>
                <button form="edit-promo-form" type="submit" className="bg-blue-600 text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  저장하기
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Duplicate Promo Code Modal */}
      {duplicatingCode && (() => {
        const parsed = parseDescription(duplicatingCode.description);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50">
                <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                  <CopyPlus size={18} className="text-emerald-600" /> 할인코드 복사하여 새로 등록
                </h3>
                <button onClick={() => setDuplicatingCode(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors">
                  <span className="font-mono text-lg leading-none">&times;</span>
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 flex-1">
                <form id="duplicate-promo-form" onSubmit={async (e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); try { await addPromoCode(formData); setDuplicatingCode(null); alert("할인코드가 성공적으로 복사 등록되었습니다."); } catch (err: any) { alert("등록 실패: " + err.message); } }} className="space-y-5">
                  <div className="bg-emerald-50 text-emerald-800 text-sm font-bold p-4 rounded-xl border border-emerald-100 mb-4 flex gap-2">
                    <span className="text-emerald-600">💡</span>
                    선택한 할인코드의 내용을 그대로 복사했습니다. 필요한 부분만 수정 후 저장하세요!
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <CheckCircle2 size={13} className="text-slate-400" /> 상태
                      </label>
                      <select name="is_active" defaultValue={duplicatingCode.is_active ? "true" : "false"}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700">
                        <option value="true">● 공개 (바로 노출)</option>
                        <option value="false">○ 임시저장 (비공개)</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <Tag size={13} className="text-slate-400" /> 직속 스토어 <span className="text-red-500">*</span>
                      </label>
                      <select name="partner_name" defaultValue={duplicatingCode.partner_name}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700"
                        required>
                        {partners.map((p: any) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <FileText size={13} className="text-slate-400" /> 할인 내용 <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="discount_rate" defaultValue={duplicatingCode.discount_rate}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" required />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Settings2 size={13} className="text-slate-400" /> 프로모션 코드 <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="promo_code" defaultValue={duplicatingCode.promo_code}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase tracking-wider font-bold" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <CheckCircle2 size={13} className="text-slate-400" /> 사용 조건
                      </label>
                      <input type="text" name="condition" defaultValue={parsed.condition}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <Clock size={13} className="text-slate-400" /> 표시용 유효기간
                      </label>
                      <input type="text" name="expiry" defaultValue={parsed.expiry}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Clock size={13} className="text-red-400" /> 시스템 자동 만료일 <span className="text-slate-400 font-normal">(선택)</span>
                    </label>
                    <input type="datetime-local" name="expires_at" 
                      defaultValue={duplicatingCode.expires_at ? new Date(new Date(duplicatingCode.expires_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none font-medium" />
                  </div>

                  {!parsed.condition && !parsed.expiry && parsed.descriptionRaw && (
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                        <FileText size={13} className="text-slate-400" /> 커스텀 설명 (조건/유효기간 대신)
                      </label>
                      <input type="text" name="description" defaultValue={parsed.descriptionRaw}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Link2 size={13} className="text-slate-400" /> 제휴 링크 URL <span className="text-red-500">*</span>
                    </label>
                    <input type="url" name="target_url" defaultValue={duplicatingCode.target_url}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm" required />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                      <Image size={13} className="text-slate-400" /> 썸네일 이미지 URL <span className="text-slate-400 font-normal">(선택)</span>
                    </label>
                    <SingleImageUploader name="image_url" defaultValue={duplicatingCode.image_url || ''} />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-sm font-extrabold text-slate-800 mb-4">🔍 SEO 상세 설정</p>
                    <div className="mb-4">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">SEO 제목</label>
                      <input type="text" name="meta_title" defaultValue={duplicatingCode.meta_title || ''} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="mb-4">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">SEO 설명</label>
                      <textarea name="meta_description" defaultValue={duplicatingCode.meta_description || ''} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">상세 콘텐츠 (마크다운)</label>
                      <MarkdownImageUploader name="seo_content" defaultValue={duplicatingCode.seo_content || ''} />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setDuplicatingCode(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                  취소
                </button>
                <button form="duplicate-promo-form" type="submit" className="bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                  <CopyPlus size={16} /> 복사하여 저장하기
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
