import { createPublicClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ExternalLink } from "lucide-react";
import { Metadata } from "next";
import DiscountCodeBox from "@/components/DiscountCodeBox";
import ViewTracker from "@/components/ViewTracker";
import CommentSection from "@/components/CommentSection";
import ImageLightbox from "@/components/ImageLightbox";

export const revalidate = 2592000; // 30일 캐시 (무료 티어 ISR Writes 절약)

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data: hotels } = await supabase.from("hotels").select("slug");
  return (hotels || []).map((hotel) => ({ slug: hotel.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: hotel } = await supabase.from("hotels").select("name_ko, name_en, tags, thumbnail_url, content").eq("slug", slug).single();

  if (!hotel) return { title: "Not Found" };

  // 1. 본문(HTML)에서 이미지 URL 추출 (최대 3개 추가)
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  const contentImages: string[] = [];
  while ((match = imgRegex.exec(hotel.content || '')) !== null) {
    if (contentImages.length < 3) contentImages.push(match[1]);
  }
  
  const firstContentImage = contentImages[0];
  const isDefaultThumbnail = hotel.thumbnail_url?.includes("unsplash.com");
  const mainThumbnail = (isDefaultThumbnail && firstContentImage) ? firstContentImage : hotel.thumbnail_url;
  const allImages = [mainThumbnail, ...contentImages.filter(img => img !== mainThumbnail)].filter(Boolean);

  return {
    title: `${hotel.name_ko} - 아고다 할인코드 및 상세 리뷰 | 도쿄 트립 플래너`,
    description: `도쿄 ${hotel.name_ko} (${hotel.name_en}) 상세 리뷰 및 아고다 할인코드 혜택 정보를 확인하세요. 특징: ${(hotel.tags || []).join(", ")}.`,
    alternates: {
      canonical: `https://tokyotrip.kr/hotel/${slug}`
    },
    openGraph: {
      images: allImages, // 네이버/구글 봇에게 사진 여러 장을 던져줌
    }
  };
}

export default async function HotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: hotel } = await supabase
    .from("hotels")
    .select(`*`)
    .eq("slug", slug)
    .single();

  if (!hotel) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_type", "HOTEL")
    .eq("post_slug", slug)
    .eq("is_approved", true)
    .order("published_at", { ascending: true });

  const { data: monthSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "active_promo_month")
    .single();
  const activeMonth = monthSetting?.value || "5월";

  // 1순위: 이 호텔 전용 사이드바 할인코드 설정 가져오기
  const { data: hotelSidebarSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", `hotel_sidebar_promo_ids_${hotel.id}`)
    .single();

  let activeSettingValue = hotelSidebarSetting?.value;

  // 2순위: 개별 설정이 없으면 글로벌 설정(전체 사이드바) 가져오기
  if (!activeSettingValue) {
    const { data: sidebarSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "sidebar_promo_ids")
      .single();
    activeSettingValue = sidebarSetting?.value;
  }

  let sidebarPromos: any[] = [];
  let activePromo: any = null;

  try {
    if (activeSettingValue) {
      const ids = JSON.parse(activeSettingValue);
      if (ids && ids.length > 0) {
        const { data: promos } = await supabase
          .from("promo_codes")
          .select("*")
          .in("id", ids)
          .eq("is_active", true);
        if (promos) {
          const sortedPromos = ids.map((id: string) => promos.find(p => p.id === id)).filter(Boolean);
          if (sortedPromos.length > 0) {
            activePromo = sortedPromos[0]; // 1순위를 메인 노출로
            sidebarPromos = sortedPromos.slice(1); // 나머지를 사이드바 목록으로 분리
          }
        }
      }
    }
  } catch (e) {}

  // 설정된 코드가 없을 경우의 Fallback
  if (!activePromo) {
    activePromo = {
      promo_code: "AGODAKR24",
      discount_rate: "5% 추가 할인",
      partner_name: "아고다"
    };
  }

  // 1. JSON-LD용 이미지 배열 추출
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  const contentImages: string[] = [];
  while ((match = imgRegex.exec(hotel.content || '')) !== null) {
    if (contentImages.length < 5) contentImages.push(match[1]);
  }
  
  const firstContentImage = contentImages[0];
  const isDefaultThumbnail = !hotel.thumbnail_url || hotel.thumbnail_url.includes("unsplash.com");
  const mainThumbnail = (isDefaultThumbnail && firstContentImage) ? firstContentImage : hotel.thumbnail_url;
  const allImages = [mainThumbnail, ...contentImages.filter(img => img !== mainThumbnail)].filter(Boolean);

  // 2. JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.name_ko,
    "description": `도쿄 ${hotel.name_ko} (${hotel.name_en}) 상세 리뷰 및 할인코드 정보. ${(hotel.tags || []).join(", ")}`,
    "image": allImages,
    ...(hotel.address && {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Tokyo",
        "addressCountry": "JP",
        "streetAddress": hotel.address
      }
    }),
    ...(hotel.star_rating && { "starRating": { "@type": "Rating", "ratingValue": hotel.star_rating, "bestRating": 5 } }),
    ...(hotel.review_score && { "aggregateRating": { "@type": "AggregateRating", "ratingValue": hotel.review_score, "bestRating": 10, "reviewCount": hotel.review_count || 1 } }),
    "priceRange": hotel.lowest_price ? `₩${hotel.lowest_price.toLocaleString()}~` : "$$"
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "도쿄 트립 플래너",
        "item": "https://tokyotrip.kr"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "추천 숙소",
        "item": "https://tokyotrip.kr"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": hotel.name_ko,
        "item": `https://tokyotrip.kr/hotel/${hotel.slug}`
      }
    ]
  };

  return (
    <div className="flex flex-col items-center pb-24 relative overflow-hidden">
      {/* Background Cyberpunk Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px]"></div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbList]) }}
      />
      <div className="w-full max-w-5xl px-5 pt-12 relative z-10">
        {/* 공정위 문구 (최상단 노출) */}
        <p className="text-xs text-white/40 font-bold bg-[#1A2235]/40 backdrop-blur-md border border-white/5 rounded-lg px-4 py-2.5 mb-8 text-left w-full shadow-sm">
          ※ 이 포스팅은 파트너스 활동의 일환으로, 구매 시 이에 따른 일정액의 수수료를 제공받습니다.
        </p>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{hotel.name_ko}</h1>
        <p className="text-cyan-400 font-bold tracking-widest mb-8">{hotel.name_en}</p>

        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 mb-10">
          <Image 
            src={mainThumbnail} 
            alt={`${hotel.name_ko} 이미지`}
            fill
            className="object-contain bg-[#0A0E17]"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Star className="text-cyan-400" size={20} /> 호텔 하이라이트
            </h2>
            <div className="flex flex-wrap gap-2 mb-10">
              {(hotel.tags || []).map((tag: string, idx: number) => (
                <span key={idx} className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg font-bold text-sm shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                  #{tag}
                </span>
              ))}
            </div>

            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Star className="text-purple-400" size={20} /> 상세 리뷰 및 시설 정보
            </h2>
            <div className="bg-[#1A2235]/40 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-lg prose prose-invert prose-cyan max-w-none">
              {hotel.content ? (
                <ImageLightbox>
                  <div dangerouslySetInnerHTML={{ __html: hotel.content }} />
                </ImageLightbox>
              ) : (
                <p className="text-white/40 m-0 text-center py-12 font-bold">아직 등록된 상세 설명이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="md:col-span-1 relative">
            <div className="bg-[#1A2235]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-xl sticky top-6">
              
              <div className="mb-6">
                <DiscountCodeBox code={activePromo.promo_code} discountRate={activePromo.discount_rate} />
              </div>

              <a 
                href={`/api/go?target=${hotel.slug}`} 
                target="_blank" 
                rel="sponsored nofollow"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold py-4 rounded-xl shadow-md"
              >
                객실 및 요금 확인하기
                <ExternalLink size={18} />
              </a>
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400 font-semibold text-center leading-relaxed">
                  🔥 방금 3명이 이 호텔을 예약했습니다.<br/>원하는 객실이 매진되기 전에 확인하세요!
                </p>
              </div>

              {/* 동적 사이드바 할인코드 모음 */}
              {sidebarPromos.length > 0 && (
                <div className="mt-6 bg-[#0A0E17]/60 border border-cyan-500/20 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md tracking-wider">{activeMonth} 한정</span>
                    <h3 className="text-[13px] font-bold text-white">시크릿 할인코드 모음</h3>
                  </div>
                  <div className="space-y-3">
                    {sidebarPromos.map((promo: any) => (
                      <Link href={`/promos/${promo.id}`} key={promo.id} className="block group">
                        <div className="flex flex-col gap-2 bg-[#1A2235]/40 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl shadow-sm group-hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all group-hover:border-cyan-500/50">
                          <span className="text-[13px] font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {promo.partner_name} - {promo.discount_rate}
                          </span>
                          <div className="flex items-center justify-between bg-[#0A0E17]/50 rounded-lg p-1.5 border border-white/5 group-hover:bg-cyan-500/5 transition-colors">
                            <span className="text-[11px] font-medium text-white/50 pl-1.5">할인코드</span>
                            <span className="border border-dashed border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-mono font-bold px-3 py-1 rounded-md">
                              {promo.promo_code}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 댓글 영역 */}
        <CommentSection postType="HOTEL" postSlug={slug} comments={comments || []} />
      </div>
      <ViewTracker targetId={hotel.id} actionType="VIEW_HOTEL" />

      {/* 모바일 하단 고정 바 (Sticky Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A2235]/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 z-50 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] text-white/50 font-bold mb-0.5">이 숙소 최저가 예약</span>
          <span className="block text-sm text-white font-black truncate">{hotel.name_ko}</span>
        </div>
        <a
          href={`/api/go?target=${hotel.slug}`}
          target="_blank"
          rel="sponsored nofollow"
          className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-md active:scale-95 transition-all"
        >
          객실 요금 확인
        </a>
      </div>
    </div>
  );
}
