import { createClient } from "@/utils/supabase/server";
import { addPromoCode, deletePromoCode } from "@/app/actions/promoActions";
import { addPartner, deletePartner } from "@/app/actions/partnerActions";
import { updatePromoMonthSetting } from "@/app/actions/settingActions";
import {
  Ticket, Trash2, PlusCircle, Settings2, Tag, Link2, FileText,
  Clock, CheckCircle2, Calendar, Building2, Palette, Globe, Image,
} from "lucide-react";
import PartnerListClient from "@/components/admin/PartnerListClient";
import PromoCodeListClient from "@/components/admin/PromoCodeListClient";
import MarkdownImageUploader from "@/components/admin/MarkdownImageUploader";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import TiptapEditor from "@/components/admin/TiptapEditor";

export const revalidate = 0;

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

export default async function CouponsAdminPage() {
  const supabase = await createClient();

  // 제휴사 목록 (partners 테이블 — 없으면 빈 배열)
  const { data: partnersRaw } = await supabase
    .from("partners")
    .select("*")
    .order("created_at");
  const partners: any[] = partnersRaw || [];

  // 할인코드 목록
  const { data: promoCodes } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  // 활성 월 설정
  const { data: monthSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "active_promo_month")
    .single();
  const activeMonth = monthSetting?.value || "5월";

  // 제휴사별 코드 그룹핑
  const codesByPartner: Record<string, any[]> = {};
  (promoCodes || []).forEach((p: any) => {
    const key = p.partner_name;
    if (!codesByPartner[key]) codesByPartner[key] = [];
    codesByPartner[key].push(p);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ── 페이지 헤더 ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Ticket className="text-blue-600" size={30} />
            할인코드 관리
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            제휴사 등록부터 할인코드 발행까지 한 곳에서 관리합니다.
          </p>
        </div>
        <div className="flex gap-4">
          <a href="#partner-section" className="block bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3 text-center hover:bg-purple-100 transition-colors">
            <div className="text-2xl font-black text-purple-700">{partners.length}</div>
            <div className="text-xs font-bold text-purple-400 mt-0.5">등록 제휴사</div>
          </a>
          <a href="#promo-section" className="block bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-center hover:bg-blue-100 transition-colors">
            <div className="text-2xl font-black text-blue-700">{(promoCodes || []).length}</div>
            <div className="text-xs font-bold text-blue-400 mt-0.5">등록 코드</div>
          </a>
        </div>
      </div>

      {/* ── 활성 월 설정 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-3 mr-2">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm">활성 프로모션 월</h2>
              <p className="text-xs text-slate-400">사이트 전체 헤딩에 표시되는 월</p>
            </div>
          </div>
          <form action={updatePromoMonthSetting} className="flex gap-3 flex-1 max-w-xs">
            <input
              type="text"
              name="active_promo_month"
              defaultValue={activeMonth}
              placeholder="예: 6월"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800"
              required
            />
            <button type="submit"
              className="bg-emerald-600 text-white font-extrabold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all active:scale-95 cursor-pointer whitespace-nowrap">
              저장
            </button>
          </form>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 1 : 제휴사 관리
      ══════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-purple-600" />
          <h2 className="text-xl font-extrabold text-slate-900">제휴사 관리</h2>
          <span className="text-sm text-slate-400 font-medium ml-1">
            — 제휴사를 등록하면 /store/[슬러그] 페이지가 자동 생성됩니다
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* 등록된 제휴사 목록 (Client Component) */}
          <PartnerListClient partners={partners} />

          {/* 새 제휴사 등록 폼 */}
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-purple-700 px-8 py-5">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/30 p-2 rounded-xl">
                  <Building2 size={20} className="text-purple-200" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">새 제휴사 등록</h3>
                  <p className="text-purple-300 text-xs">등록 즉시 /store/[슬러그] 페이지에 반영됩니다</p>
                </div>
              </div>
            </div>

            <form action={addPartner} className="p-7 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 제휴사명 */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <Building2 size={13} className="text-slate-400" />
                    제휴사명 <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal">(예: 야놀자)</span>
                  </label>
                  <input type="text" name="name" placeholder="야놀자, Booking.com 등"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-bold placeholder-slate-300"
                    required />
                </div>

                {/* URL 슬러그 */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <Settings2 size={13} className="text-slate-400" />
                    URL 슬러그 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
                    <span className="px-3 py-3 text-xs font-bold text-slate-400 bg-slate-50 border-r border-slate-200 whitespace-nowrap">
                      /store/
                    </span>
                    <input type="text" name="slug" placeholder="yanolja"
                      className="flex-1 px-3 py-3 outline-none font-mono font-bold text-sm placeholder-slate-300" required />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">영문 소문자·숫자·하이픈만 사용</p>
                </div>

                {/* 로고 첫 글자 */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <Tag size={13} className="text-slate-400" />
                    로고 대표 글자
                    <span className="text-slate-400 font-normal">(비워두면 자동)</span>
                  </label>
                  <input type="text" name="logo_char" placeholder="야" maxLength={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-black text-center text-lg placeholder-slate-300" />
                </div>

                {/* 브랜드 색상 — radio 인풋 기반 (서버 컴포넌트 호환) */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <Palette size={13} className="text-slate-400" />
                    브랜드 색상
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c, i) => (
                      <label key={c.hex} className="cursor-pointer" title={c.label}>
                        <input
                          type="radio"
                          name="color_hex"
                          value={c.hex}
                          defaultChecked={i === 0}
                          className="sr-only peer"
                        />
                        <div
                          style={{ backgroundColor: c.hex }}
                          className="w-8 h-8 rounded-xl border-2 border-white shadow-sm hover:scale-110 transition-transform peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-slate-700"
                        />
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    선택한 색상이 /store 페이지 로고에 반영됩니다
                  </p>
                </div>
              </div>

              {/* 서브타이틀 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <FileText size={13} className="text-slate-400" />
                  소개 문구 (서브타이틀)
                  <span className="text-slate-400 font-normal">(선택)</span>
                </label>
                <input type="text" name="subtitle" placeholder="예: 국내 숙박·레저 최저가 보장 예약 플랫폼"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none placeholder-slate-300 font-medium" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 홈페이지 URL */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <Globe size={13} className="text-slate-400" />
                    홈페이지 URL
                    <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <input type="url" name="main_url" placeholder="https://www.yanolja.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm placeholder-slate-300" />
                </div>

                {/* 로고 이미지 URL */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                    <Image size={13} className="text-slate-400" />
                    로고 이미지 URL
                    <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <input type="url" name="logo_url" placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm placeholder-slate-300" />
                </div>
              </div>

              {/* 공통 가이드 (SEO 블로그 에디터) */}
              <div className="pt-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <FileText size={13} className="text-slate-400" />
                  제휴사 공통 가이드 (SEO 최적화)
                  <span className="text-slate-400 font-normal">(선택)</span>
                </label>
                <TiptapEditor inputName="common_guide" title="제휴사 공통 가이드 에디터" />
              </div>

              <button type="submit"
                className="w-full bg-purple-700 text-white font-extrabold py-4 rounded-xl hover:bg-purple-800 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                <Building2 size={18} />
                제휴사 등록하기
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 : 할인코드 관리
      ══════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════
          SECTION 2 : 할인코드 관리 — 전체 너비 테이블
      ══════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Ticket size={20} className="text-blue-600" />
          <h2 className="text-xl font-extrabold text-slate-900">할인코드 관리</h2>
        </div>

        {/* 등록된 코드 목록 — 전체 너비 */}
        <PromoCodeListClient promoCodes={promoCodes || []} partners={partners} />
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 : 새 할인코드 등록 폼
      ══════════════════════════════════════════ */}
      <section>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2.5 rounded-xl">
                <PlusCircle size={20} className="text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">새 쿠폰 추가</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  저장하기 즉시 사이트에 반영됩니다.
                </p>
              </div>
            </div>
          </div>

          <form action={addPromoCode} className="p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 공개 여부 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <CheckCircle2 size={13} className="text-slate-400" />
                  상태
                </label>
                <select name="is_active"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700">
                  <option value="true">● 공개 (바로 노출)</option>
                  <option value="false">○ 임시저장 (비공개)</option>
                </select>
              </div>

              {/* 제휴사 선택 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <Tag size={13} className="text-slate-400" />
                  직속 스토어 <span className="text-red-500">*</span>
                </label>
                <select name="partner_name"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                  required>
                  <option value="">스토어를 선택하세요</option>
                  {partners.length > 0 ? (
                    partners.map((p: any) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="아고다">아고다</option>
                      <option value="호텔스닷컴">호텔스닷컴</option>
                      <option value="클룩">클룩</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* 할인 내용 */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <FileText size={13} className="text-slate-400" />
                할인 내용 <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal">(예: 전 세계 호텔 8% 추가 할인)</span>
              </label>
              <input type="text" name="discount_rate"
                placeholder="예: 전 세계 호텔 8% 추가 할인"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300 font-bold"
                required />
            </div>

            {/* 프로모션 코드 */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <Settings2 size={13} className="text-slate-400" />
                프로모션 코드 <span className="text-red-500">*</span>
              </label>
              <input type="text" name="promo_code"
                placeholder="예: AGODA8  (코드 없으면: 코드 불필요)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono placeholder-slate-300 font-bold uppercase tracking-wider"
                required />
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 코드 없이 링크로만 할인되는 경우 <strong>코드 불필요</strong> 입력
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 사용 조건 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <CheckCircle2 size={13} className="text-slate-400" />
                  사용 조건 <span className="text-slate-400 font-normal">(선택)</span>
                </label>
                <input type="text" name="condition"
                  placeholder="예: 앱으로 첫 예약 시"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300 font-medium" />
              </div>

              {/* 유효기간 (텍스트) */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <Clock size={13} className="text-slate-400" />
                  표시용 유효기간 <span className="text-slate-400 font-normal">(텍스트)</span>
                </label>
                <input type="text" name="expiry"
                  placeholder="예: 2026년 06월 30일 마감"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300 font-medium" />
              </div>
            </div>

            {/* 자동 만료일 (시스템 설정) */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <Clock size={13} className="text-red-400" />
                시스템 자동 만료일 <span className="text-slate-400 font-normal">(선택 - 이 시간이 지나면 자동 비공개됨)</span>
              </label>
              <input type="datetime-local" name="expires_at"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none font-medium" />
            </div>

            {/* 제휴 링크 URL */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <Link2 size={13} className="text-slate-400" />
                제휴 링크 URL <span className="text-red-500">*</span>
              </label>
              <input type="url" name="target_url" placeholder="https://..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm placeholder-slate-300"
                required />
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 코드 복사 후 사용자가 이동할 어필리에이트 URL
              </p>
            </div>

            {/* 썸네일 이미지 URL */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <Image size={13} className="text-slate-400" />
                썸네일 이미지 URL <span className="text-slate-400 font-normal">(선택)</span>
              </label>
              <SingleImageUploader name="image_url" placeholder="https://..." />
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 1:1 또는 4:3 비율의 이미지 권장. 입력 시 메인 화면에 썸네일형 할인코드로 노출됩니다.
              </p>
            </div>

            {/* ── 네이버 SEO 설정 섹션 ── */}
            <div className="pt-2 border-t border-slate-100">

              {/* SEO 가이드 안내 박스 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                <p className="text-sm font-extrabold text-blue-800 mb-2">🚀 네이버/구글 SEO 상위 노출 가이드</p>
                <ul className="space-y-1.5 text-xs text-blue-700 font-medium list-disc pl-4">
                  <li>SEO 제목에는 키워드(할인코드, 프로모션, 쿠폰)를 자연스럽게 포함하세요.<br />
                    <span className="text-blue-500">(예: 2026년 6월 아고다 공식 할인코드 모음)</span>
                  </li>
                  <li>상세 콘텐츠(본문)는 <strong>단순한 링크 모음이 아닌 500자 이상의 유용한 정보글 형태</strong>로 작성해야 C-Rank 점수가 높아집니다.</li>
                  <li>마크다운의 헤딩(##, ###)을 활용하여 문단을 나누고, 사용 팁과 주의사항을 상세히 적어주세요.</li>
                </ul>
              </div>

              <p className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                🔍 SEO 상세 설정
              </p>

              {/* SEO 제목 */}
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <span className="text-red-500 text-base">📌</span>
                  SEO 제목
                  <span className="text-blue-600 font-bold text-xs">(title 태그 + H1 + 검색결과 제목)</span>
                </label>
                <input
                  type="text"
                  name="meta_title"
                  placeholder="예: 아고다 할인코드 5월 | 전 세계 숙소 7% 할인쿠폰"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  비워두면 자동생성: &quot;[스토어명] [할인율] 할인 [N]월 | 도쿄트립&quot;
                </p>
              </div>

              {/* SEO 설명 */}
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <span className="text-red-500 text-base">📌</span>
                  SEO 설명
                  <span className="text-blue-600 font-bold text-xs">(meta description - 검색결과 설명문)</span>
                </label>
                <textarea
                  name="meta_description"
                  rows={3}
                  placeholder="예: 2026년 아고다 할인코드를 정리했습니다. 전 세계 숙소 7% 할인을 받으세요. 검증된 최신 할인쿠폰을 지금 바로 사용하세요."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300 font-medium text-sm resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">150자 내외 권장. 비워두면 자동생성됩니다.</p>
              </div>

              {/* 상세 콘텐츠 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <span className="text-red-500 text-base">📌</span>
                  상세 콘텐츠
                  <span className="text-blue-600 font-bold text-xs">(H2/H3 본문 - 네이버가 가장 중시하는 정보성 텍스트)</span>
                  <span className="text-slate-400 text-[10px] ml-auto font-normal">마크다운 지원</span>
                </label>
                <MarkdownImageUploader
                  name="seo_content"
                  placeholder={`## 이 쿠폰 사용 방법\n1. 할인 링크를 클릭합니다\n2. 원하는 숙소를 검색합니다\n3. 결제 시 프로모션 코드를 입력합니다\n\n## 적용 조건 및 주의사항\n- 조건 1\n- 조건 2\n\n(참고: 가이드와 추천 이유는 최대한 길고 자세하게 적을수록 검색 노출에 유리합니다.)`}
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  💡 ## 제목, ### 소제목, - 목록, **굵게** 사용 가능. 500자 이상 권장.
                </p>
              </div>
            </div>

            <button type="submit"
              className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
              <PlusCircle size={18} />
              저장하기
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
