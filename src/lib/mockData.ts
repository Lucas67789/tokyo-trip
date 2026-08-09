export const MOCK_STATIONS = [
  {
    id: "s-shinjuku",
    slug: "shinjuku",
    name_ko: "신주쿠역",
    name_en: "Shinjuku",
    name_jp: "難波",
    lines: [
      { id: "l-midosuji", name: "미도스지선", color: "#E51720" },
      { id: "l-yotsubashi", name: "요츠바시선", color: "#0078D2" },
      { id: "l-sennichimae", name: "센니치마에선", color: "#E44D93" },
    ],
    description: "도쿄 남부의 중심. 시부야 스크램블 교차로, 아사쿠사 등 주요 관광지와 연결되어 있으며 나리타 공항 직통열차(스카이라이너)가 정차합니다.",
  },
  {
    id: "s-shibuya",
    slug: "shibuya",
    name_ko: "시부야역",
    name_en: "Shibuya",
    name_jp: "渋谷",
    lines: [
      { id: "l-midosuji", name: "미도스지선", color: "#E51720" },
    ],
    description: "도쿄 북부의 교통 허브. 거대 지하도시와 수많은 백화점이 밀집해 있어 쇼핑의 천국으로 불립니다.",
  },
  {
    id: "s-asakusa",
    slug: "asakusa",
    name_ko: "아사쿠사역",
    name_en: "Asakusa",
    name_jp: "浅草",
    lines: [
      { id: "l-midosuji", name: "미도스지선", color: "#E51720" },
      { id: "l-nagahori", name: "나가호리츠루미료쿠치선", color: "#A9CC51" },
    ],
    description: "도쿄의 대표적인 쇼핑 거리. 다이마루 백화점과 명품 거리가 위치해 있습니다.",
  }
];

export const MOCK_HOTELS = [
  {
    id: "h-swissotel",
    station_id: "s-shinjuku",
    slug: "keio-plaza-hotel-tokyo",
    name_ko: "게이오 플라자 호텔 도쿄",
    star_rating: 5,
    review_score: 9.0,
    review_count: 5432,
    lowest_price: 245000,
    thumbnail_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    tags: ["공항직통", "쇼핑접근성", "가족여행"],
    view_count_24h: 124,
  },
  {
    id: "h-candeo",
    station_id: "s-shinjuku",
    slug: "hotel-gracery-shinjuku",
    name_ko: "호텔 그레이서리 신주쿠",
    star_rating: 4,
    review_score: 8.6,
    review_count: 3215,
    lowest_price: 135000,
    thumbnail_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    tags: ["노천탕", "신주쿠도보5분", "가성비"],
    view_count_24h: 312,
  },
  {
    id: "h-tokyo-excel",
    station_id: "s-shibuya",
    slug: "shibuya-excel-hotel-tokyu",
    name_ko: "시부야 엑셀 호텔 도큐",
    star_rating: 4,
    review_score: 8.8,
    review_count: 1540,
    lowest_price: 180000,
    thumbnail_url: "https://images.unsplash.com/photo-1551882547-ff40c0d129df?auto=format&fit=crop&w=800&q=80",
    tags: ["신축", "야경맛집", "비즈니스"],
    view_count_24h: 89,
  }
];
