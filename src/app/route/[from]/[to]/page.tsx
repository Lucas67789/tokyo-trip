import { Metadata } from "next";
import { notFound } from "next/navigation";
import { METRO_STATIONS } from "@/lib/metro_data";
import JourneyVisualizer from "@/components/JourneyVisualizer";
import { createPublicClient } from "@/utils/supabase/server";
import { Suspense } from "react";

export const revalidate = 2592000; // 30일 캐시 (무료 티어 ISR Writes 절약)

const BASE_URL = "https://tokyotrip.kr";

// 검색 볼륨 있는 경로 키워드 매핑
const ROUTE_KEYWORDS: Record<string, string[]> = {
  "narita-airport-shinjuku": ["나리타공항 신주쿠", "공항 신주쿠 지하철", "나리타 익스프레스 예약", "NEX", "스카이라이너"],
  "narita-airport-shibuya": ["나리타공항 시부야", "공항 시부야", "나리타 시부야 가는법"],
  "narita-airport-tokyo": ["나리타공항 도쿄역", "도쿄역 가는법", "나리타 도쿄"],
  "narita-airport-ueno": ["나리타 우에노", "스카이라이너 우에노", "우에노 가는법"],
  "haneda-airport-shinjuku": ["하네다공항 신주쿠", "하네다 신주쿠"],
  "haneda-airport-shibuya": ["하네다 시부야", "하네다공항 시부야 가는법"],
  "shinjuku-shibuya": ["신주쿠 시부야", "야마노테선 시부야"],
  "shinjuku-asakusa": ["신주쿠 아사쿠사", "아사쿠사 가는법"],
  "shinjuku-roppongi": ["신주쿠 롯폰기", "롯폰기 가는법"],
  "shibuya-asakusa": ["시부야 아사쿠사", "긴자선 아사쿠사"],
  "tokyo-shinjuku": ["도쿄역 신주쿠", "주오선 신주쿠"],
  "ueno-shibuya": ["우에노 시부야"],
  "ikebukuro-tokyo": ["이케부쿠로 도쿄역"],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ from: string; to: string }>;
}): Promise<Metadata> {
  const { from, to } = await params;
  const fromStation = METRO_STATIONS[from];
  const toStation = METRO_STATIONS[to];

  if (!fromStation || !toStation) return { title: "Not Found" };

  const routeKey = `${from}-${to}`;
  const extraKeywords = ROUTE_KEYWORDS[routeKey] || [];

  const title = `${fromStation.name_ko}에서 ${toStation.name_ko} 가는 법 | 도쿄 지하철 경로`;
  const description =
    `${fromStation.name_ko}(${fromStation.name_jp})에서 ` +
    `${toStation.name_ko}(${toStation.name_jp})까지 도쿄 지하철 최적 경로, ` +
    `소요시간, 요금, 환승 정보를 안내합니다. ` +
    (extraKeywords[0] ? `${extraKeywords[0]} 경로를 찾고 계신가요?` : "");

  return {
    title,
    description,
    keywords: [
      `${fromStation.name_ko} ${toStation.name_ko}`,
      `${fromStation.name_ko}에서 ${toStation.name_ko}`,
      `${fromStation.name_ko} ${toStation.name_ko} 가는법`,
      `${fromStation.name_ko} ${toStation.name_ko} 지하철`,
      `${fromStation.name_en} to ${toStation.name_en}`,
      ...extraKeywords,
      "도쿄 지하철",
      "도쿄 경로",
    ],
    alternates: {
      canonical: `${BASE_URL}/route/${from}/${to}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/route/${from}/${to}`,
      type: "website",
      locale: "ko_KR",
      siteName: "도쿄 트립 플래너",
      images: [
        {
          url: `${BASE_URL}/images/og-main.png`,
          width: 1200,
          height: 630,
          alt: `${fromStation.name_ko}→${toStation.name_ko} 지하철 경로`,
        },
      ],
    },
  };
}

// 빌드 시 모든 주요 경로 페이지 사전 생성
export async function generateStaticParams() {
  const KEY_ROUTES = [
    { from: "narita-airport", to: "shinjuku" },
    { from: "narita-airport", to: "shibuya" },
    { from: "narita-airport", to: "tokyo" },
    { from: "narita-airport", to: "ueno" },
    { from: "haneda-airport", to: "shinjuku" },
    { from: "haneda-airport", to: "shibuya" },
    { from: "shinjuku", to: "shibuya" },
    { from: "shinjuku", to: "asakusa" },
    { from: "shinjuku", to: "roppongi" },
    { from: "shibuya", to: "asakusa" },
    { from: "tokyo", to: "shinjuku" },
    { from: "ueno", to: "shibuya" },
    { from: "ikebukuro", to: "tokyo" },
  ];
  return KEY_ROUTES;
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = await params;
  const fromStation = METRO_STATIONS[from];
  const toStation = METRO_STATIONS[to];

  if (!fromStation || !toStation) notFound();

  const supabase = createPublicClient();
  
  const { data: stationsData } = await supabase
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

  const { data: attractions } = await supabase
    .from("station_attractions")
    .select("*");

  const { data: lines } = await supabase
    .from("lines")
    .select("id, name_ko, affiliate_url");

  const { data: passesData } = await supabase
    .from("passes")
    .select(`
      *,
      pass_targets (*)
    `);

  const { data: siteSettingsData } = await supabase
    .from("site_settings")
    .select("key, value");

  const siteSettings = siteSettingsData || [];

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

  // JSON-LD 구조화 데이터
  const routeKey = `${from}-${to}`;
  const reverseRouteKey = `${to}-${from}`;

  // FAQ 데이터 (경로별 맞춤 + 공통)
  const faqItems = [
    {
      question: `${fromStation.name_ko}에서 ${toStation.name_ko}까지 어떻게 가나요?`,
      answer: `${fromStation.name_ko}역(${fromStation.name_jp})에서 도쿄 지하철을 이용해 ${toStation.name_ko}역(${toStation.name_jp})까지 이동할 수 있습니다. 환승 유무와 최적 경로는 위 경로 검색 결과를 참고하세요.`,
    },
    {
      question: `${fromStation.name_ko}에서 ${toStation.name_ko}까지 교통비는 얼마인가요?`,
      answer: `도쿄 지하철 일반 요금 기준으로 이동 거리에 따라 190엔~380엔 정도입니다. 도쿄 메트로 1일권이나 교통패스를 사용하면 더 저렴하게 이동할 수 있습니다.`,
    },
    {
      question: `${toStation.name_ko} 근처에 추천 숙소가 있나요?`,
      answer: `${toStation.name_ko}역 주변에는 다양한 호텔과 숙소가 있습니다. 도쿄 메트로 가이드에서 역별 추천 호텔 정보를 확인해 보세요.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "경로 안내",
            item: `${BASE_URL}/route`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${fromStation.name_ko}→${toStation.name_ko}`,
            item: `${BASE_URL}/route/${from}/${to}`,
          },
        ],
      },
      {
        "@type": "HowTo",
        name: `${fromStation.name_ko}에서 ${toStation.name_ko} 가는 법`,
        description: `도쿄 지하철로 ${fromStation.name_ko}(${fromStation.name_jp})에서 ${toStation.name_ko}(${toStation.name_jp})까지 가는 최적 경로, 소요시간, 요금 안내`,
        inLanguage: "ko-KR",
        image: `${BASE_URL}/images/og-main.png`,
        step: [
          {
            "@type": "HowToStep",
            name: `${fromStation.name_ko}역 도착`,
            text: `${fromStation.name_ko}역(${fromStation.name_jp})에 도착하여 개찰구를 통과합니다. 행선지 안내판에서 '${toStation.name_ko}' 방면 플랫폼을 확인하세요.`,
          },
          {
            "@type": "HowToStep",
            name: "올바른 노선 탑승",
            text: `안내판에 표시된 노선의 열차에 탑승합니다. 환승이 필요한 경우, 경로 검색 결과에서 환승역과 노선을 미리 확인하세요.`,
          },
          {
            "@type": "HowToStep",
            name: `${toStation.name_ko}역 하차`,
            text: `${toStation.name_ko}역(${toStation.name_jp})에 도착하면 하차합니다. 출구 번호를 미리 확인하면 목적지까지 빠르게 이동할 수 있습니다.`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="flex flex-col items-center pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 페이지 헤더 */}
      <header className="w-full bg-slate-50 border-b border-slate-100 p-8 text-center pt-16">
        {/* 빵부스러기 */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center justify-center gap-2 text-sm text-slate-400 font-medium">
            <li>
              <a href="/" className="hover:text-slate-700 transition-colors">
                홈
              </a>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-slate-700 font-bold">
              {fromStation.name_ko} → {toStation.name_ko}
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          {fromStation.name_ko}에서 {toStation.name_ko} 가는 법
        </h1>
        <p className="text-slate-400 text-sm mb-3 font-medium">
          {fromStation.name_jp} → {toStation.name_jp} /{" "}
          {fromStation.name_en} → {toStation.name_en}
        </p>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          도쿄 지하철로 {fromStation.name_ko}에서 {toStation.name_ko}까지
          가는 최적 경로, 소요시간, 요금을 비교하세요.
        </p>
      </header>

      {/* 경로 시각화 (기존 JourneyVisualizer 재사용 - 초기값 지정) */}
      <section
        className="w-full max-w-6xl px-4 pt-10"
        aria-label={`${fromStation.name_ko}→${toStation.name_ko} 경로 안내`}
      >
        {((from === "shinjuku" && to === "kix") || (from === "kix" && to === "shinjuku")) && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl shadow-sm text-center max-w-4xl mx-auto">
            <p className="text-red-700 font-extrabold text-lg md:text-xl flex flex-col md:flex-row items-center justify-center gap-2">
              <span>🚨</span> 신주쿠역? 난카이 신주쿠역? 스카이라이너는 무조건 난카이 신주쿠역에서 탑승입니다!
            </p>
            <p className="text-red-600 text-sm md:text-base mt-2 font-medium">
              일반 지하철 신주쿠역과 난카이 신주쿠역은 완전 다른 곳입니다. 공항으로 가는 스카이라이너나 공항급행을 타시려면 '난카이 선(Nankai Line)' 표지판을 따라 난카이 신주쿠역으로 가셔야 합니다!
            </p>
          </div>
        )}
        
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-500 font-bold">로딩 중...</div>}>
          <JourneyVisualizer
            initialFrom={from}
            initialTo={to}
            stations={stations}
            attractions={attractions || []}
            lines={lines || []}
            passes={passesData || []}
            siteSettings={siteSettings}
          />
        </Suspense>
      </section>

      {/* FAQ 섹션 — FAQPage 스키마와 매칭되는 실제 콘텐츠 */}
      <section className="w-full max-w-5xl px-4 pt-12 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg text-sm">❓</span>
          자주 묻는 질문
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors font-bold text-slate-800 text-sm">
                {item.question}
                <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs ml-2">▼</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
