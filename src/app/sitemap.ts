import { MetadataRoute } from 'next';
import { METRO_STATIONS } from '@/lib/metro_data';
import { createPublicClient } from "@/utils/supabase/server";

// 주요 경로 조합 (SEO 핵심 페이지)
const KEY_ROUTES = [
  { from: 'narita', to: 'shinjuku' },
  { from: 'narita', to: 'shibuya' },
  { from: 'narita', to: 'tokyo' },
  { from: 'narita', to: 'ueno' },
  { from: 'haneda', to: 'shinjuku' },
  { from: 'haneda', to: 'shibuya' },
  { from: 'shinjuku', to: 'shibuya' },
  { from: 'shinjuku', to: 'asakusa' },
  { from: 'shinjuku', to: 'roppongi' },
  { from: 'shibuya', to: 'asakusa' },
  { from: 'tokyo', to: 'shinjuku' },
  { from: 'ueno', to: 'shibuya' },
  { from: 'ikebukuro', to: 'tokyo' },
];

const BASE_URL = 'https://tokyotrip.kr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const supabase = createPublicClient();

  // DB에서 등록된 모든 동적 콘텐츠의 slug를 가져옵니다 (오류가 나도 빈 배열로 처리)
  const { data: hotels } = await supabase.from("hotels").select("slug, updated_at");
  const { data: passes } = await supabase.from("passes").select("slug, updated_at");
  const { data: partners } = await supabase.from("partners").select("slug, updated_at").eq("is_active", true);
  const { data: posts } = await supabase.from("posts").select("slug, updated_at").eq("is_published", true);
  const { data: promoCodes } = await supabase.from("promo_codes").select("id, updated_at").not("seo_content", "is", null);

  // 1. 정적 핵심 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. 역별 상세 페이지 (station/[slug])
  const stationPages: MetadataRoute.Sitemap = Object.keys(METRO_STATIONS).map((slug) => ({
    url: `${BASE_URL}/station/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. 인기 경로 페이지 (route/[from]/[to]) - 검색 유입 핵심
  const routePages: MetadataRoute.Sitemap = KEY_ROUTES.map(({ from, to }) => ({
    url: `${BASE_URL}/route/${from}/${to}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 4. 동적 호텔 상세 페이지
  const hotelPages: MetadataRoute.Sitemap = (hotels || []).map((hotel) => ({
    url: `${BASE_URL}/hotel/${hotel.slug}`,
    lastModified: hotel.updated_at ? new Date(hotel.updated_at) : now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 5. 동적 패스 상세 페이지
  const passPages: MetadataRoute.Sitemap = (passes || []).map((pass) => ({
    url: `${BASE_URL}/pass/${pass.slug}`,
    lastModified: pass.updated_at ? new Date(pass.updated_at) : now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 6. 🔴 [신규] 제휴사 할인코드 전용 페이지 (store/[partner]) - 수익화 핵심!
  const hardcodedStores = ['agoda', 'hotels', 'klook'];
  const dbPartnerSlugs = (partners || []).map((p) => p.slug);
  const allStoreSlugs = [...new Set([...hardcodedStores, ...dbPartnerSlugs])];

  const storePages: MetadataRoute.Sitemap = allStoreSlugs.map((slug) => {
    const dbPartner = (partners || []).find((p) => p.slug === slug);
    return {
      url: `${BASE_URL}/store/${slug}`,
      lastModified: dbPartner?.updated_at ? new Date(dbPartner.updated_at) : now,
      changeFrequency: 'daily',
      priority: 0.95, // 수익화 직결 페이지이므로 매우 높은 우선순위
    };
  });

  // 7. 🔴 [신규] 여행 팁 블로그 포스팅 페이지 (post/[slug])
  const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${BASE_URL}/post/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 8. 🔴 [신규] 할인코드 단일 페이지 (promos/[id])
  const promoPages: MetadataRoute.Sitemap = (promoCodes || []).map((promo) => ({
    url: `${BASE_URL}/promos/${promo.id}`,
    lastModified: promo.updated_at ? new Date(promo.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...storePages,     // 수익화 페이지 우선 배치
    ...routePages,
    ...hotelPages,
    ...passPages,
    ...stationPages,
    ...postPages,
    ...promoPages,
  ];
}
