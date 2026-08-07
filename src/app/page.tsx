// Force redeploy - 2026-05-15 17:46 (Final Stable Version)
import PassCard from "@/components/PassCard";
import HotelCard from "@/components/HotelCard";
import JourneyVisualizer from "@/components/JourneyVisualizer";
import { Compass, TrendingUp, Star, Ticket, Lightbulb } from "lucide-react";
import { createPublicClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import MainPromoCodeCard from "@/components/MainPromoCodeCard";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import WeatherWidget from "@/components/WeatherWidget";
import ExchangeRateWidget from "@/components/ExchangeRateWidget";

export const revalidate = 2592000; // 30일 캐시 (무료 티어 ISR Writes 절약)

export const metadata: Metadata = {
  title: "도쿄 지하철 노선도 | 도쿄 여행 필수 교통·숙소·관광지 가이드",
  description:
    "도쿄 지하철 노선도 완벽 가이드! 나리타 공항에서 시부야·신주쿠 가는 법, 교통 패스 추천 및 고화질 노선도 다운로드까지 한 번에 해결하세요.",
  alternates: { canonical: "https://tokyotrip.kr" },
  openGraph: {
    title: "도쿄 지하철 노선도 | 도쿄 여행 필수 교통·숙소·관광지 가이드",
    description: "도쿄 지하철 노선도 완벽 가이드! 나리타 공항에서 시부야·신주쿠 가는 법, 교통 패스 추천 및 고화질 노선도 다운로드까지 한 번에 해결하세요.",
    url: "https://tokyotrip.kr",
    images: [{ url: "https://tokyotrip.kr/images/og-main.png", width: 1200, height: 630 }],
  },
};

export default async function Home() {
  const supabase = createPublicClient();

  // 병렬 처리를 위해 모든 쿼리를 Promise 배열로 담습니다.
  const stationsPromise = supabase
    .from("stations")
    .select(`
      id,
      slug,
      name_ko,
      name_en,
      name_jp,
      description,
      station_lines (
        lines (
          id,
          name_ko,
          color_hex
        )
      )
    `);

  const hotelsPromise = supabase
    .from("hotels")
    .select("*")
    .order("view_count", { ascending: false })
    .limit(8);

  const nowIso = new Date().toISOString();
  const promosPromise = supabase
    .from("promo_codes")
    .select("*")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("created_at", { ascending: false });

  const attractionsPromise = supabase
    .from("station_attractions")
    .select("*");

  const siteSettingsPromise = supabase
    .from("site_settings")
    .select("key, value");

  const linesPromise = supabase
    .from("lines")
    .select("id, slug, name_ko");

  const passesPromise = supabase
    .from("passes")
    .select(`
      *,
      pass_targets (*)
    `);

  const postsPromise = supabase
    .from("posts")
    .select("id, title, slug, description, thumbnail_url, category, view_count, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const [
    { data: stationsData },
    { data: hotelsData },
    { data: promosData },
    { data: attractions },
    { data: siteSettingsData },
    { data: lines },
    { data: passesData },
    { data: postsData }
  ] = await Promise.all([
    stationsPromise,
    hotelsPromise,
    promosPromise,
    attractionsPromise,
    siteSettingsPromise,
    linesPromise,
    passesPromise,
    postsPromise
  ]);

  const stations = (stationsData || []).map((station: any) => ({
    id: station.id,
    slug: station.slug,
    name_ko: station.name_ko,
    name_en: station.name_en,
    name_jp: station.name_jp,
    description: station.description,
    lines: (station.station_lines || []).map((sl: any) => ({
      id: sl.lines?.id,
      name: sl.lines?.name_ko,
      color: sl.lines?.color_hex,
    })),
  }));

  const siteSettings = siteSettingsData || [];
  const activePromoMonth = siteSettings.find((s: any) => s.key === "active_promo_month")?.value || null;

  const hotels = (hotelsData || []).map((hotel: any) => {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const match = imgRegex.exec(hotel.content || '');
    const firstContentImage = match ? match[1] : null;
    const isDefaultThumbnail = !hotel.thumbnail_url || hotel.thumbnail_url.includes("unsplash.com");
    const thumbnail = (isDefaultThumbnail && firstContentImage) ? firstContentImage : hotel.thumbnail_url;

    return {
      id: hotel.id,
      slug: hotel.slug,
      name_ko: hotel.name_ko,
      thumbnail_url: thumbnail,
      tags: hotel.tags || [],
      view_count_24h: hotel.view_count,
    };
  });

  const activeMonth = siteSettings.find((s: any) => s.key === "active_month")?.value || "5월";

  // 사용자가 Supabase 테이블 생성 및 데이터 등록 전이라도 레이아웃을 즉시 볼 수 있도록 고품격 샘플 코드를 기본값(fallback)으로 노출합니다.
  // 실제 데이터가 등록되면 아래 샘플은 자동으로 사라지고 등록하신 데이터가 표시됩니다.
  const promos = promosData && promosData.length > 0 ? promosData : [
    {
      id: "sample-agoda",
      partner_name: "아고다",
      promo_code: "AGODA8",
      discount_rate: "전 세계 호텔 8% 추가 할인",
      target_url: "https://www.agoda.com",
      description: "오사카 인기 역세권 호텔 대상 특별 할인 코드"
    },
    {
      id: "sample-hotels",
      partner_name: "호텔스닷컴",
      promo_code: "LP5OFF",
      discount_rate: "5% 즉시 추가 할인",
      target_url: "https://www.hotels.com",
      description: "여름 시즌 한정 오사카 숙소 특가 혜택"
    },
    {
      id: "sample-klook",
      partner_name: "클룩",
      promo_code: "OSAKAPASS",
      discount_rate: "주유패스 & 라피트 10% 쿠폰",
      target_url: "https://www.klook.com",
      description: "간사이 공항 수령 패스 결제 시 적용 가능"
    }
  ];

  // 제휴 파트너별 필터링
  const agodaPromos = promos.filter((p: any) => p.partner_name.toLowerCase().includes("아고다") || p.partner_name.toLowerCase().includes("agoda"));
  const hotelsPromos = promos.filter((p: any) => p.partner_name.toLowerCase().includes("호텔스닷컴") || p.partner_name.toLowerCase().includes("hotels"));
  const klookPromos = promos.filter((p: any) => p.partner_name.toLowerCase().includes("클룩") || p.partner_name.toLowerCase().includes("klook"));
  
  const otherPromos = promos.filter((p: any) => 
    !p.partner_name.toLowerCase().includes("아고다") && !p.partner_name.toLowerCase().includes("agoda") &&
    !p.partner_name.toLowerCase().includes("호텔스닷컴") && !p.partner_name.toLowerCase().includes("hotels") &&
    !p.partner_name.toLowerCase().includes("클룩") && !p.partner_name.toLowerCase().includes("klook")
  );

  // 사용자가 포스팅을 작성하기 전이라도 레이아웃을 볼 수 있도록 샘플 데이터를 노출합니다.
  const posts = postsData && postsData.length > 0 ? postsData : [
    {
      id: "sample-post-1",
      title: "나리타 공항에서 신주쿠, 시부야 가는 법! 스카이라이너 vs 넥스(N'EX) 전격 비교",
      slug: "narita-to-shinjuku-shibuya",
      description: "나리타 공항에서 도쿄 도심(신주쿠, 시부야)까지 가는 가장 빠르고 저렴한 방법을 비교해 드립니다.",
      thumbnail_url: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80",
      category: "교통가이드"
    },
    {
      id: "sample-post-2",
      title: "도쿄 서브웨이 티켓 24/48/72시간권 뽕뽑는 완벽 가이드",
      slug: "tokyo-subway-ticket-guide",
      description: "도쿄 메트로와 도에이 지하철을 무제한 탑승할 수 있는 필수 교통 패스의 모든 것.",
      thumbnail_url: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&w=800&q=80",
      category: "교통패스"
    },
    {
      id: "sample-post-3",
      title: "디즈니랜드 지하철로 가는 법 총정리 (마이하마역)",
      slug: "how-to-go-disneyland",
      description: "도쿄역에서 디즈니랜드와 디즈니씨까지 헤매지 않고 가는 가장 정확한 루트 안내.",
      thumbnail_url: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=800&q=80",
      category: "관광지"
    }
  ];

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://tokyotrip.kr/#webpage",
    url: "https://tokyotrip.kr",
    name: "도쿄 지하철 경로 안내 & 여행 가이드",
    description: "나리타·하네다 공항에서 신주쿠·시부야 가는 법 및 핵심 노선 안내",
    inLanguage: "ko-KR",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://tokyotrip.kr" },
        { "@type": "ListItem", position: 2, name: "도쿄", item: "https://tokyotrip.kr" },
        { "@type": "ListItem", position: 3, name: "도쿄 지하철 노선도", item: "https://tokyotrip.kr" }
      ]
    },
    primaryImageOfPage: { "@id": "https://tokyotrip.kr/#primaryimage" },
    image: { "@id": "https://tokyotrip.kr/#primaryimage" },
    thumbnailUrl: "https://tokyotrip.kr/images/og-main.png",
    mainEntity: promos && promos.length > 0 ? {
      "@type": "ItemList",
      name: "할인코드 목록",
      itemListElement: promos.slice(0, 10).map((promo: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: `${promo.partner_name} ${promo.discount_rate} 할인코드`,
          description: promo.description || `${promo.partner_name} 특별 할인코드 제공`,
          image: promo.image_url || undefined,
          url: promo.target_url
        }
      }))
    } : undefined
  };

  const imageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": "https://tokyotrip.kr/#primaryimage",
    "url": "https://tokyotrip.kr/images/og-main.png",
    "contentUrl": "https://tokyotrip.kr/images/og-main.png",
    "caption": "도쿄 트립 메인 배너 이미지",
    "width": "1200",
    "height": 630
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "나리타 공항에서 신주쿠, 시부야까지 가장 빠른 방법은 무엇인가요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "나리타 익스프레스(N'EX)를 이용하면 환승 없이 신주쿠, 시부야, 도쿄역까지 바로 갈 수 있어 가장 편리합니다. 반면 스카이라이너는 닛포리나 우에노까지 가장 빠르게(약 36분) 이동한 뒤 야마노테선으로 환승하는 방식입니다."
        }
      },
      {
        "@type": "Question",
        "name": "도쿄 서브웨이 티켓으로 JR 야마노테선을 탈 수 있나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "아니요, 탑승할 수 없습니다. 도쿄 서브웨이 티켓으로는 '도쿄 메트로'와 '도에이 지하철' 13개 노선만 무제한 이용 가능합니다. JR 노선(야마노테선 등)을 이용하려면 스이카(Suica)나 파스모(Pasmo) 같은 교통카드를 따로 사용하셔야 합니다."
        }
      },
      {
        "@type": "Question",
        "name": "도쿄 디즈니랜드는 지하철로 어떻게 가나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "도쿄역에서 JR 게이요선(Keiyo Line) 또는 무사시노선을 타고 마이하마역(Maihama Station)에서 하차하시면 됩니다. 마이하마역에 내리면 도쿄 디즈니랜드와 디즈니씨로 가는 리조트 라인을 탈 수 있습니다."
        }
      }
    ]
  };

  return (
    <div className="flex flex-col pb-10 items-center bg-[#05070A] min-h-screen text-white overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }}
      />
      
      {/* Background Cyberpunk Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-magenta-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]"></div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-8 relative z-10">
        
        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[auto]">

          {/* 1. 메인 타이틀 & 검색 타일 (Bento Item) */}
          <section className="md:col-span-8 lg:col-span-9 bg-[#1A2235]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                도쿄 지하철 <span className="text-cyan-400">노선도</span>
              </h1>
              <p className="text-lg text-white/60 font-medium mt-3">
                출발지와 도착지를 선택하면 도쿄의 복잡한 지하철망을 가장 직관적으로 안내합니다.
              </p>
            </div>
            
            <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse"><div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div></div>}>
              <JourneyVisualizer 
                stations={stations || []}
                attractions={attractions || []}
                lines={lines || []}
                passes={passesData || []}
                siteSettings={siteSettings}
              />
            </Suspense>
          </section>

          {/* 2. 날씨 및 운행 상태 타일 (Bento Item) */}
          <section className="md:col-span-4 lg:col-span-3 flex flex-col gap-4 md:gap-6">
            <Suspense fallback={<div className="bg-[#1A2235]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-lg h-full flex items-center justify-center animate-pulse"><div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div></div>}>
              <ExchangeRateWidget />
            </Suspense>

            <Suspense fallback={<div className="bg-[#1A2235]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-lg h-full flex flex-col justify-center items-center animate-pulse"><div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div></div>}>
              <WeatherWidget />
            </Suspense>
          </section>

          {/* 3. 여행 팁 & 매거진 (Bento Item) */}
          {posts && posts.length > 0 && (
            <section className="md:col-span-12 lg:col-span-6 bg-[#1A2235]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Lightbulb className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" size={24} />
                  <h2 className="text-2xl font-bold text-white">도쿄 가이드</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.slice(0,2).map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="group bg-[#0A0E17]/80 rounded-2xl border border-white/5 overflow-hidden hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all duration-300"
                  >
                    <div className="relative aspect-[16/9] bg-[#1A2235] overflow-hidden">
                      {post.thumbnail_url && (
                        <Image
                          src={post.thumbnail_url}
                          alt={post.title}
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent"></div>
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-cyan-400 px-2.5 py-1 rounded-full text-xs font-black border border-cyan-500/30">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-4 relative">
                      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 4. 호텔 추천 (Bento Item) */}
          <section className="md:col-span-12 lg:col-span-6 bg-[#1A2235]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-3 text-xl font-bold text-white m-0">
                <Star size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                역별 추천 숙소
              </h2>
              <span className="text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                실시간 인기
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hotels.slice(0, 4).map((hotel, idx) => (
                <HotelCard key={hotel.id} {...hotel} priority={idx < 2} />
              ))}
              {hotels.length === 0 && (
                <p className="text-white/40 text-sm py-4 col-span-full text-center">
                  등록된 호텔 정보가 없습니다.
                </p>
              )}
            </div>
          </section>

          {/* 5. 할인 프로모션 (Bento Item - Full Width) */}
          <section className="md:col-span-12 bg-[#1A2235]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-lg relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black mb-3">
                  <Ticket size={14} /> 매달 업데이트되는 혜택
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  이달의 할인 쿠폰 네트워크
                </h2>
              </div>
              <Link href="/promos" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)] whitespace-nowrap">
                전체 쿠폰 보기
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {promos.slice(0, 3).map((promo: any) => (
                <MainPromoCodeCard key={promo.id} promo={{
                  id: promo.id,
                  partner_name: promo.partner_name,
                  promo_code: promo.promo_code,
                  discount_rate: promo.discount_rate,
                  target_url: promo.target_url,
                  description: promo.description,
                  image_url: promo.image_url,
                  seo_content: promo.seo_content
                }} />
              ))}
            </div>
          </section>

          {/* 6. 교통 패스 (Bento Item) */}
          <section className="md:col-span-12 bg-[#1A2235]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Ticket className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" size={24} />
              <h2 className="text-2xl font-bold text-white">도쿄 패스 아카이브</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {passesData?.map((pass: any) => (
                <PassCard key={pass.id} {...pass} />
              ))}
              {(!passesData || passesData.length === 0) && (
                <p className="text-white/40 text-sm py-4 col-span-full text-center">
                  등록된 패스 정보가 없습니다.
                </p>
              )}
            </div>
          </section>

          {/* 7. SEO 내부 링크망 */}
          <section className="md:col-span-12 bg-transparent mt-4 border-t border-white/10 pt-6">
            <h3 className="text-white/40 text-sm font-bold mb-3">주요 역 및 노선 탐색</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/station/shinjuku" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">신주쿠역 가볼만한곳</Link>
              <Link href="/station/shibuya" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">시부야역 호텔</Link>
              <Link href="/station/tokyo" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">도쿄역 환승</Link>
              <Link href="/station/ueno" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">우에노역 공항철도</Link>
              <Link href="/station/ginza" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">긴자 노선도</Link>
              <Link href="/station/asakusa" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">아사쿠사 숙소 추천</Link>
              <Link href="/" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">긴자선</Link>
              <Link href="/" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">마루노우치선</Link>
              <Link href="/" className="text-xs text-white/50 hover:text-cyan-400 transition-colors">야마노테선</Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
