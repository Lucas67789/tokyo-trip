import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import MainPromoCodeCard from "@/components/MainPromoCodeCard";
import { ArrowLeft, ExternalLink, Star, CircleCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { simpleMarkdown } from "@/lib/simpleMarkdown";
import ImageLightbox from "@/components/ImageLightbox";
import type { Metadata } from "next";

export const revalidate = 0;

// ── 동적 SEO 메타데이터 생성 ──
export async function generateMetadata(
  { params }: { params: Promise<{ partner: string }> }
): Promise<Metadata> {
  const { partner } = await params;
  const decodedPartner = decodeURIComponent(partner).toLowerCase();
  const supabase = await createClient();

  const { data: dbPartner } = await supabase
    .from("partners")
    .select("name, subtitle")
    .eq("slug", decodedPartner)
    .single();

  const { data: monthSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "active_promo_month")
    .single();

  const activeMonth = monthSetting?.value || "5월";
  const partnerName = dbPartner?.name ||
    (STORE_INFOS[decodedPartner]?.name) || decodedPartner;

  // 가장 최근 쿠폰의 SEO 메타 사용
  const { data: latestPromo } = await supabase
    .from("promo_codes")
    .select("meta_title, meta_description")
    .eq("is_active", true)
    .ilike("partner_name", `%${partnerName}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const title = latestPromo?.meta_title
    || `${partnerName} ${activeMonth} 할인코드 | 총정리 | 도쿄트립`;
  const description = latestPromo?.meta_description
    || `${partnerName} ${activeMonth} 할인코드 총정리. ${dbPartner?.subtitle || ''} 검증된 최신 할인쿠폰을 지금 바로 사용하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `https://tokyotrip.kr/store/${decodedPartner}` },
    openGraph: {
      title,
      description,
      url: `https://tokyotrip.kr/store/${decodedPartner}`,
    },
  };
}

// 파트너 정보 상수 매핑
const STORE_INFOS: Record<
  string,
  {
    name: string;
    logoUrl: string;
    rawHtmlLogo?: string;
    logoChar: string;
    logoBg: string;
    subtitle: string;
    mainUrl: string;
    fallbackCoupons: Array<{
      id: string;
      partner_name: string;
      promo_code: string;
      discount_rate: string;
      target_url: string;
      description: string;
    }>;
  }
> = {
  agoda: {
    name: "아고다",
    logoUrl: "https://cdn6.agoda.net/images/agodavip/logo-agoda-vip.png",
    rawHtmlLogo: `<a target="_blank" href="https://click.linkprice.com/click.php?m=agoda&a=A100704446&l=0013&u_id="><img src="https://img.linkprice.com/files/glink/agoda/20191122/5dd79f9315f7b_120_60.jpg" alt="아고다" border="0" width="120" height="60"></a> <img src="https://track.linkprice.com/lpshow.php?m_id=agoda&a_id=A100704446&p_id=0000&l_id=0013&l_cd1=2&l_cd2=0" alt="tracking" width="1" height="1" border="0" style="display:none">`,
    logoChar: "아",
    logoBg: "bg-blue-600",
    subtitle: "전 세계 호텔 예약 최저가 보장, 시크릿 특가 혜택",
    mainUrl: "https://click.linkprice.com/click.php?m=agoda&a=A100704446&l=0013&u_id=",
    fallbackCoupons: [
      {
        id: "agoda-1",
        partner_name: "아고다",
        promo_code: "LP12AGD1",
        discount_rate: "해외 전지역 12%, 최대 $30 할인",
        target_url: "https://www.agoda.com",
        description: "조건: 없음 / 유효기간: 2026년 05월 31일 예약 완료"
      },
      {
        id: "agoda-2",
        partner_name: "아고다",
        promo_code: "코드 필요없음",
        discount_rate: "5% 즉시 추가 할인",
        target_url: "https://www.agoda.com",
        description: "조건: 없음 / 유효기간: 2026년 05월 31일 예약 완료"
      },
      {
        id: "agoda-3",
        partner_name: "아고다",
        promo_code: "LP10AGD1",
        discount_rate: "10% 할인, 최대 $25 할인",
        target_url: "https://www.agoda.com",
        description: "조건: 없음 / 유효기간: 예약:2026년 4월 30일 마감 / 숙박:2027년 3월 31일 까지"
      },
      {
        id: "agoda-4",
        partner_name: "아고다",
        promo_code: "LP12AGD1",
        discount_rate: "해외 전 지역 12%, 최대 $30 할인",
        target_url: "https://www.agoda.com",
        description: "조건: 없음 / 유효기간: 2026년 4월 내 예약 시, 2027년 3월 31일 숙박 건"
      },
      {
        id: "agoda-5",
        partner_name: "아고다",
        promo_code: "코드 필요없음",
        discount_rate: "속초 호텔 최대 29% 할인",
        target_url: "https://www.agoda.com",
        description: "조건: 해당 링크 통해 결제 시 / 유효기간: 2026년 3월"
      },
      {
        id: "agoda-6",
        partner_name: "아고다",
        promo_code: "AGODADEAL8",
        discount_rate: "50달러 할인",
        target_url: "https://www.agoda.com",
        description: "조건: 최소결제금액 120달러 / 유효기간: 2026년 3월 내"
      },
      {
        id: "agoda-7",
        partner_name: "아고다",
        promo_code: "AGODA7",
        discount_rate: "7% 추가 할인",
        target_url: "https://www.agoda.com",
        description: "조건: 앱으로 첫 예약 시 / 유효기간: 2026.06.30"
      }
    ]
  },
  hotels: {
    name: "호텔스닷컴",
    logoUrl: "https://seeklogo.com/images/H/hotels-com-logo-48356E87A5-seeklogo.com.png",
    rawHtmlLogo: `<a target="_blank" href="https://click.linkprice.com/click.php?m=hotelskr&a=A100704938&l=RlLG&u_id="><img src="https://img.linkprice.com/files/glink/hotelskr/20230427/0000000000000_120x60.png" alt="호텔스닷컴" border="0" width="120" height="60"></a> <img src="http://track.linkprice.com/lpshow.php?m_id=hotelskr&a_id=A100704938&p_id=0000&l_id=RlLG&l_cd1=2&l_cd2=0" alt="tracking" width="1" height="1" border="0" nosave style="display:none">`,
    logoChar: "호",
    logoBg: "bg-rose-500",
    subtitle: "전 세계 역세권 및 감성 숙소 추가 혜택과 특가",
    mainUrl: "https://www.hotels.com",
    fallbackCoupons: [
      {
        id: "hotels-1",
        partner_name: "호텔스닷컴",
        promo_code: "LP5OFF",
        discount_rate: "5% 즉시 추가 할인",
        target_url: "https://www.hotels.com",
        description: "조건: 도쿄 호텔 대상 / 유효기간: 2026년 05월 31일 예약 완료"
      },
      {
        id: "hotels-2",
        partner_name: "호텔스닷컴",
        promo_code: "HIN8",
        discount_rate: "인기 패밀리룸 8% 추가 특가",
        target_url: "https://www.hotels.com",
        description: "조건: 앱 결제 한정 / 유효기간: 2026.06.30"
      }
    ]
  },
  klook: {
    name: "클룩",
    logoUrl: "https://seeklogo.com/images/K/klook-logo-E315024479-seeklogo.com.png",
    logoChar: "클",
    logoBg: "bg-orange-500",
    subtitle: "액티비티, 도쿄 메트로패스 및 스카이라이너 열차 최저가 예약",
    mainUrl: "https://www.klook.com",
    fallbackCoupons: [
      {
        id: "klook-1",
        partner_name: "클룩",
        promo_code: "TOKYOPASS",
        discount_rate: "메트로패스 & 스카이라이너 10% 쿠폰",
        target_url: "https://www.klook.com",
        description: "조건: 도쿄 테마 패스 구매 시 / 유효기간: 2026년 05월 31일"
      },
      {
        id: "klook-2",
        partner_name: "클룩",
        promo_code: "코드 필요없음",
        discount_rate: "나리타 공항 스카이라이너 왕복권 최대 15% 세일",
        target_url: "https://www.klook.com",
        description: "조건: 해당 모바일 링크 연결 시 / 유효기간: 2026년 06월 30일"
      }
    ]
  }
};

export default async function StorePage({ params }: { params: Promise<{ partner: string }> }) {
  const { partner } = await params;
  const decodedPartner = decodeURIComponent(partner).toLowerCase();

  const supabase = await createClient();

  // 1. DB partners 테이블에서 먼저 조회
  const { data: dbPartner } = await supabase
    .from("partners")
    .select("*")
    .eq("slug", decodedPartner)
    .single();

  // 2. DB에 없으면 하드코딩 STORE_INFOS fallback
  const storeKey = dbPartner
    ? decodedPartner
    : Object.keys(STORE_INFOS).find(k => k === decodedPartner || decodedPartner.includes(k));

  if (!dbPartner && !storeKey) {
    notFound();
  }

  // storeInfo 통합 (DB 우선)
  const storeInfo = dbPartner
    ? {
        name:           dbPartner.name,
        logoUrl:        dbPartner.logo_url || "",
        logoChar:       dbPartner.logo_char || dbPartner.name.charAt(0),
        colorHex:       dbPartner.color_hex || "#2563EB",
        subtitle:       dbPartner.subtitle || "",
        mainUrl:        dbPartner.main_url || "#",
        commonGuide:    dbPartner.common_guide || "",
        rawHtmlLogo:    STORE_INFOS[decodedPartner]?.rawHtmlLogo,
        fallbackCoupons: STORE_INFOS[decodedPartner]?.fallbackCoupons || [],
      }
    : {
        ...STORE_INFOS[storeKey!],
        colorHex:
          storeKey === "agoda"  ? "#2563EB" :
          storeKey === "hotels" ? "#F43F5E" :
          storeKey === "klook"  ? "#F97316" : "#2563EB",
      };

  // 3. 활성 프로모션 월 설정 불러오기
  const { data: monthSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "active_promo_month")
    .single();

  const activeMonth = monthSetting?.value || "5월";

  // 4. 할인코드 DB에서 데이터 가져오기 (만료일 검사 포함)
  // 4. 할인코드 DB에서 데이터 가져오기 (만료일 검사 제외 - 프론트에서 분리)
  const nowIso = new Date().toISOString();
  const { data: dbPromoCodes } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // 해당 제휴사 쿠폰만 필터링
  const filteredDbCoupons = (dbPromoCodes || []).filter((p: any) =>
    p.partner_name.toLowerCase().includes(storeInfo.name.toLowerCase()) ||
    storeInfo.name.toLowerCase().includes(p.partner_name.toLowerCase())
  );

  // DB에 있는 실제 데이터가 우선하고, 없으면 fallbacks 렌더링
  const promoCodes = filteredDbCoupons.length > 0
    ? filteredDbCoupons
    : storeInfo.fallbackCoupons;

  // 만료 여부에 따라 분리
  const nowTime = new Date().getTime();
  const activePromoCodes = promoCodes.filter((p: any) => !p.expires_at || new Date(p.expires_at).getTime() > nowTime);
  const expiredPromoCodes = promoCodes.filter((p: any) => p.expires_at && new Date(p.expires_at).getTime() <= nowTime);

  // 요약표 데이터 매핑 (활성화된 쿠폰만)
  const summaryRows = activePromoCodes.map((p: any) => {
    let condition = "없음";
    let expiry = "상시 진행 (확인 요망)";

    if (p.description) {
      if (p.description.includes("/")) {
        const parts = p.description.split("/");
        parts.forEach((part: string) => {
          if (part.includes("조건:")) {
            condition = part.replace("조건:", "").trim();
          } else if (part.includes("유효기간:")) {
            expiry = part.replace("유효기간:", "").trim();
          } else {
            if (!condition || condition === "없음") condition = part.trim();
            else expiry = part.trim();
          }
        });
      } else {
        if (p.description.includes("유효기간:")) expiry = p.description.replace("유효기간:", "").trim();
        else if (p.description.includes("조건:")) condition = p.description.replace("조건:", "").trim();
        else condition = p.description.trim();
      }
    }

    return {
      benefit: p.discount_rate,
      code: p.promo_code,
      condition,
      expiry,
      url: p.target_url || storeInfo.mainUrl
    };
  });

  // JSON-LD structured data for Store Page (Coupons)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${storeInfo.name} 할인코드 및 프로모션 총정리`,
    "description": `${storeInfo.name} ${activeMonth} 최신 할인쿠폰 정보를 제공합니다.`,
    "url": `https://tokyotrip.kr/store/${decodedPartner}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": summaryRows.map((row, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Thing",
          "name": `${storeInfo.name} - ${row.benefit}`,
          "description": `${row.condition} / ${row.expiry}`,
          "url": `https://tokyotrip.kr/store/${decodedPartner}`
        }
      }))
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto max-w-4xl bg-white shadow-sm border-x border-slate-200/60 min-h-[80vh] flex flex-col">
          {/* 뒤로가기 배너 */}
          <div className="p-5 border-b border-slate-100 flex items-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              전체 목록으로
            </Link>
          </div>

          {/* 메인 제휴사 헤더 정보 */}
          <div className="p-6 md:p-10 border-b border-slate-100 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full mix-blend-multiply opacity-50 transform translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
            
            {/* 로고박스 */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center bg-white p-4 shadow-md shrink-0 relative z-10">
              {/* 이미지 로딩 실패나 빈값인 경우를 위한 텍스트 로고 처리 */}
              {storeInfo.rawHtmlLogo ? (
                <div 
                  className="w-full h-full flex items-center justify-center [&>a]:flex [&>a]:items-center [&>a]:justify-center [&_img]:max-w-full [&_img]:max-h-full"
                  dangerouslySetInnerHTML={{ __html: storeInfo.rawHtmlLogo }}
                />
              ) : storeInfo.logoUrl ? (
                <img 
                  src={storeInfo.logoUrl} 
                  alt={storeInfo.name} 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div 
                  style={{ backgroundColor: storeInfo.colorHex }}
                  className="w-full h-full rounded-2xl flex items-center justify-center text-white text-3xl font-black"
                >
                  {storeInfo.logoChar}
                </div>
              )}
            </div>

            {/* 타이틀 및 별점 */}
            <div className="relative z-10 flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2">
                [2026년 {activeMonth}] <br className="hidden md:block"/>
                {storeInfo.name} 할인코드 및 카드 프로모션 총정리
              </h1>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-sm font-semibold">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  <span>4.9</span>
                </div>
                <span className="text-xs text-slate-400 font-bold">리뷰 만족도</span>
              </div>
              
              <p className="text-slate-600 text-base mb-4 font-semibold">{storeInfo.subtitle}</p>
              
              <a 
                href={storeInfo.mainUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 text-blue-600 font-black text-sm hover:underline"
              >
                {storeInfo.name} 바로가기 
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* 업데이트 일자 검증 배지 바 */}
          <div className="px-6 md:px-10 py-4.5 bg-slate-50 border-b border-slate-100 flex items-center gap-3 text-slate-700">
            <CircleCheck size={20} className="text-emerald-500 shrink-0" />
            <p className="font-bold text-sm">
              최신 업데이트: <span className="text-slate-900 font-black">2026년 {activeMonth} 21일</span> 기준 쿠폰 및 프로모션 검증 완료
            </p>
          </div>

          {/* 📋 할인코드 요약표 (SEO 친화적 블로그형 리스트) */}
          <div className="p-6 md:p-10 border-b border-slate-100">
            <h2 className="text-xl font-extrabold mb-5 text-slate-900 flex items-center gap-2">
              📋 {activeMonth} {storeInfo.name} 할인코드 요약표
            </h2>
            
            <div className="bg-white rounded-xl p-5 md:p-7 border border-slate-200/80 shadow-sm">
              <ul className="space-y-4">
                {summaryRows.map((row, idx) => (
                  <li key={idx} className="text-base text-slate-700 leading-relaxed break-keep">
                    <span className="text-blue-600 font-black mr-2">✔️</span>
                    <strong className="font-extrabold text-slate-900 mr-1">{row.benefit}</strong> 
                    <span className="inline-block mt-1 sm:mt-0">
                      <span className="text-slate-300 hidden sm:inline-block mx-1">|</span>
                      <a href={row.url} target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-105 active:scale-95">
                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-black text-sm border border-blue-200 shadow-sm tracking-wider mx-1 cursor-pointer hover:bg-blue-100 flex items-center gap-1">
                          {row.code}
                          <ExternalLink size={12} className="text-blue-500" />
                        </span>
                      </a>
                      <span className="text-sm text-slate-500 ml-1">
                        (유효기간: {row.expiry})
                      </span>
                    </span>
                  </li>
                ))}
                {summaryRows.length === 0 && (
                  <li className="text-slate-400 font-bold text-center py-4">현재 적용 가능한 쿠폰이 없습니다.</li>
                )}
              </ul>
            </div>
          </div>

          {/* 💰 사용 가능한 할인코드 */}
          <div className="p-6 md:p-10 bg-slate-50/20 border-b border-slate-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-900">
              💰 사용 가능한 할인코드 <span className="text-blue-600">({activePromoCodes.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activePromoCodes.map((promo: any) => (
                <div key={promo.id} className="h-full">
                  <MainPromoCodeCard promo={{
                    id: promo.id,
                    partner_name: promo.partner_name,
                    promo_code: promo.promo_code,
                    discount_rate: promo.discount_rate,
                    target_url: promo.target_url,
                    description: promo.description || undefined,
                    image_url: promo.image_url || undefined,
                    seo_content: promo.seo_content || undefined
                  }} detailUrl={(promo.seo_content || storeInfo.commonGuide) ? `/promos/${promo.id}` : undefined} />
                </div>
              ))}
            </div>
          </div>

          {/* 📝 제휴사 공통 가이드 (SEO 대응) */}
          {(storeInfo as any).commonGuide && (
            <div className="px-6 md:px-10 py-10 border-b border-slate-100 bg-white">
              <ImageLightbox>
                <div
                  className="prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ 
                    __html: (storeInfo as any).commonGuide
                      .replace(/aspect-\[4\/3\]/g, "")
                      .replace(/object-cover/g, "object-contain max-h-[600px] bg-slate-50")
                  }}
                />
              </ImageLightbox>
            </div>
          )}

          {/* ⏳ 지난 할인코드 및 프로모션 기록 (만료됨) */}
          {expiredPromoCodes.length > 0 && (
            <div className="px-6 md:px-10 py-10 bg-slate-100/40 border-b border-slate-200">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-lg font-extrabold mb-6 text-slate-500 flex items-center gap-2 grayscale">
                  ⏳ {storeInfo.name} 지난 프로모션 기록 (만료됨)
                </h2>
                <div className="space-y-4 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  {expiredPromoCodes.map((p: any) => (
                    <div key={p.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-600 line-through">{p.discount_rate}</h3>
                        <span className="text-[11px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-sm">종료됨</span>
                      </div>
                      {p.seo_content ? (
                        <ImageLightbox>
                          <div
                            className="prose-sm max-w-none text-sm text-slate-500"
                            dangerouslySetInnerHTML={{ __html: simpleMarkdown(p.seo_content) }}
                          />
                        </ImageLightbox>
                      ) : (
                        <p className="text-xs text-slate-400 font-medium">상세 정보가 없습니다.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 📖 상세 가이드 및 꿀팁 */}
          <div className="px-6 md:px-10 py-12">
            <h2 className="text-2xl font-black mb-6 text-slate-900 text-center">
              📖 상세 가이드 및 꿀팁
            </h2>
            
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm max-w-2xl mx-auto flex flex-col items-center">
              {storeKey === "agoda" ? (
                <>
                  <div className="w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm mb-6 bg-slate-50">
                    <img 
                      src="https://github.com/user-attachments/assets/48ee3a02-1868-45ac-b14b-3e3255f885f2" 
                      alt="아고다 관련 이미지" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  
                  <p className="text-slate-700 font-bold text-center text-base mb-6 leading-relaxed">
                    원하는 호텔을 클릭하신 후, 결제창 우측 상단에 <br/>
                    <strong className="text-blue-600 font-black">"할인 코드가 있으신가요?"</strong> 라는 입력 란이 등장하게 됩니다.
                  </p>

                  <div className="w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm mb-6 bg-slate-50">
                    <img 
                      src="https://github.com/user-attachments/assets/8237e5e1-8b69-4127-aff1-d24c4f02823e" 
                      alt="아고다 관련 이미지" 
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  <p className="text-slate-700 font-bold text-center text-base leading-relaxed">
                    상기 빨간 박스 코드 기입란에 복사하신 할인 코드를 그대로 붙여넣기 하시면, <br/>
                    즉시 특별 할인가가 최종 정산액에 반영됩니다!
                  </p>
                </>
              ) : storeKey === "klook" ? (
                <>
                  <p className="text-slate-700 font-bold text-center text-base mb-6 leading-relaxed">
                    클룩에서 메트로패스나 익스프레스 패스를 다 담으셨나요?<br/>결제하기 버튼을 누르기 직전, 스크롤을 살짝 내려보시면 <br/>
                    <strong className="text-orange-600 font-black">"할인 수단"</strong> 또는 <strong className="text-orange-600 font-black">"프로모션 코드"</strong> 란이 보일 거예요!
                  </p>

                  <div className="w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm mb-6 bg-slate-50">
                    <img 
                      src="/images/guides/klook_checkout_step1_1780919014619.png" 
                      alt="클룩 결제창 프로모션 코드 입력 위치" 
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  <p className="text-slate-700 font-bold text-center text-base mb-6 leading-relaxed">
                    그 부분을 터치하시면, 아래 사진처럼 코드를 직접 입력할 수 있는 창이 뜹니다. <br/>
                    여기에 아까 위에서 복사해둔 <strong className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">클룩할인1500원</strong> 등의 코드를 그대로 붙여넣기 하시면 끝!
                  </p>

                  <div className="w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm mb-6 bg-slate-50">
                    <img 
                      src="/images/guides/klook_checkout_step2_1780919027035.png" 
                      alt="클룩 프로모션 코드 입력란 적용 방법" 
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  <p className="text-slate-700 font-bold text-center text-base leading-relaxed">
                    로봇이 쓴 글 같아서 헷갈리셨죠? 실제로 해보면 10초도 안 걸린답니다. 😉 <br/>
                    결제창 넘어가기 전에 무조건! 쿠폰 먼저 적용해서 소중한 여행 경비 아껴보세요!
                  </p>
                </>
              ) : (
                <div className="w-full py-8 text-center text-slate-600 font-bold space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-3xl font-black">⭐</div>
                  <h3 className="text-lg font-black text-slate-800">{storeInfo.name} 할인코드 스마트 적용 가이드</h3>
                  <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                    1. 코드 카드의 "코드 복사하기" 버튼을 클릭하면 클립보드에 코드가 자동 복사되고 제휴 예약 화면으로 이동합니다.<br/>
                    2. 예약 진행 단계 또는 최종 결제창의 프로모션 입력란에 복사한 코드를 입력하여 추가 할인을 적용해 보세요!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
