import { createPublicClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import HotelCard from "@/components/HotelCard";
import SortOptions from "@/components/SortOptions";
import { Metadata } from "next";
import { METRO_STATIONS } from "@/lib/metro_data";

export const revalidate = 2592000; // 30일 캐시 (무료 티어 ISR Writes 절약)

const BASE_URL = "https://tokyotrip.kr";

// ─── 동적 메타데이터 (각 역마다 고유한 제목·설명) ─────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: station } = await supabase
    .from("stations")
    .select("name_ko, name_en, description")
    .eq("slug", slug)
    .single();

  const stationMeta = METRO_STATIONS[slug];
  const nameKo = station?.name_ko || stationMeta?.name_ko || slug;
  const nameEn = station?.name_en || stationMeta?.name_en || slug;
  const nameJp = stationMeta?.name_jp || "";

  if (!station && !stationMeta) return { title: "Not Found" };

  const title = `${nameKo}역 주변 추천 호텔·숙소 | 도쿄 트립 플래너`;
  const description =
    station?.description ||
    `도쿄 ${nameKo}역(${nameJp}) 근처 최고 평점 호텔과 최저가 예약. ` +
      `${nameKo} 역세권 숙소 위치·가격 비교, 주변 관광지·맛집 안내.`;

  return {
    title,
    description,
    keywords: [
      `${nameKo}역 호텔`,
      `${nameKo} 숙소`,
      `${nameKo}역 근처 호텔`,
      `도쿄 ${nameKo}`,
      `${nameEn} hotel`,
      `${nameEn} accommodation`,
      "도쿄 호텔 추천",
      "도쿄 여행",
    ],
    alternates: {
      canonical: `${BASE_URL}/station/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/station/${slug}`,
      type: "website",
      locale: "ko_KR",
      siteName: "도쿄 트립 플래너",
      images: [
        {
          url: `${BASE_URL}/images/og-station-${slug}.png`,
          width: 1200,
          height: 630,
          alt: `${nameKo}역 주변 추천 호텔`,
        },
        {
          url: `${BASE_URL}/images/og-main.png`,
          width: 1200,
          height: 630,
          alt: `${nameKo}역 주변 추천 호텔`,
        }
      ],
    },
  };
}

// ─── 정적 경로 사전 생성 (빌드 시 모든 역 페이지 pre-render) ──────────────
export async function generateStaticParams() {
  return Object.keys(METRO_STATIONS).map((slug) => ({ slug }));
}

export default async function StationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; order?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = resolvedSearchParams.sort || "popularity";
  const order =
    resolvedSearchParams.order ||
    (sort === "distance" ? "asc" : "desc");
  const ascending = order === "asc";

  const supabase = createPublicClient();
  const stationMeta = METRO_STATIONS[slug];

  const { data: station } = await supabase
    .from("stations")
    .select("id, name_ko, name_en, description")
    .eq("slug", slug)
    .single();

  if (!station && !stationMeta) notFound();

  const nameKo = station?.name_ko || stationMeta?.name_ko || slug;
  const nameEn = station?.name_en || stationMeta?.name_en || slug;
  const nameJp = stationMeta?.name_jp || "";
  const description =
    station?.description ||
    `도쿄 ${nameKo}역 주변의 추천 호텔과 관광 정보를 안내합니다.`;

  let hotels: any[] = [];
  if (station?.id) {
    let query = supabase
      .from("hotels")
      .select("*")
      .eq("station_id", station.id);

    if (sort === "distance") {
      query = query.order("distance_meters", { ascending });
    } else if (sort === "discount") {
      query = query.order("discount_rate", { ascending });
    } else {
      query = query.order("view_count", { ascending: false });
    }

    const { data: hotelsData } = await query;
    hotels = (hotelsData || []).map((hotel: any) => {
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const match = imgRegex.exec(hotel.content || '');
      const firstContentImage = match ? match[1] : null;
      const isDefaultThumbnail = !hotel.thumbnail_url || hotel.thumbnail_url.includes("unsplash.com");
      const thumbnail = (isDefaultThumbnail && firstContentImage) ? firstContentImage : hotel.thumbnail_url;

      return {
        slug: hotel.slug,
        name_ko: hotel.name_ko,
        thumbnail_url: thumbnail,
        tags: hotel.tags || [],
        view_count_24h: hotel.view_count,
        distance_meters: hotel.distance_meters,
      };
    });
  }

  // ─── JSON-LD 구조화 데이터 ──────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // 빵부스러기 경로
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "홈",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `${nameKo}역`,
            item: `${BASE_URL}/station/${slug}`,
          },
        ],
      },
      // 장소 정보
      {
        "@type": "TrainStation",
        name: `${nameKo}역 (${nameJp})`,
        alternateName: [nameEn, nameJp],
        description,
        address: {
          "@type": "PostalAddress",
          addressLocality: "도쿄",
          addressRegion: "도쿄도",
          addressCountry: "JP",
        },
        url: `${BASE_URL}/station/${slug}`,
      },
      // 숙소 목록 (호텔이 있을 때)
      ...(hotels.length > 0
        ? [
            {
              "@type": "ItemList",
              name: `${nameKo}역 주변 추천 호텔`,
              numberOfItems: hotels.length,
              itemListElement: hotels.slice(0, 5).map((hotel, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: hotel.name_ko,
                url: `${BASE_URL}/hotel/${hotel.slug}`,
              })),
            },
          ]
        : []),
    ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 페이지 헤더 — h1에 핵심 키워드 포함 */}
      <header className="w-full bg-[#1A2235]/60 backdrop-blur-3xl border-b border-white/10 p-8 text-center pt-24 relative z-10">
        {/* 빵부스러기 네비게이션 */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center justify-center gap-2 text-sm text-white/50 font-medium">
            <li>
              <a href="/" className="hover:text-white transition-colors">
                홈
              </a>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-white font-bold">{nameKo}역</li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {nameKo}역 주변 추천 호텔 & 숙소
        </h1>
        {nameJp && (
          <p className="text-cyan-400 text-sm md:text-base mb-4 font-bold tracking-widest">
            {nameJp} / {nameEn} Station
          </p>
        )}
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
          {description}
        </p>
      </header>

      <div className="w-full max-w-7xl px-5 pt-12 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <p className="text-white/50 font-bold whitespace-nowrap">
            총 <strong className="text-cyan-400 text-lg">{hotels.length}개</strong>의
            추천 숙소
          </p>
          <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
          <SortOptions />
        </div>

        {/* 숙소 그리드 */}
        <section aria-label={`${nameKo}역 주변 호텔 목록`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotels.map((hotel, idx) => (
              <HotelCard key={hotel.id} {...hotel} priority={idx < 4} />
            ))}
            {hotels.length === 0 && (
              <div className="col-span-full py-24 text-center bg-[#1A2235]/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl">
                <p className="text-white/50 mb-2 font-bold text-lg">
                  아직 등록된 주변 호텔이 없습니다.
                </p>
                <p className="text-white/30 text-sm">
                  곧 {nameKo}역 주변 최저가 숙소를 추가할 예정입니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
