// 역 slug → 아고다 도시 정보 매핑
// 대부분의 역이 오사카이므로 기본값을 오사카로 설정

interface AgodaCity {
  cityId: string;
  destinationName: string;
}

const AGODA_CITY_MAP: Record<string, AgodaCity> = {
  // 교토 역들
  "kyoto": { cityId: "9590", destinationName: "교토, 일본" },
  "kyoto-kawaramachi": { cityId: "9590", destinationName: "교토, 일본" },
  "gion-shijo": { cityId: "9590", destinationName: "교토, 일본" },
  "sanjo": { cityId: "9590", destinationName: "교토, 일본" },
  "demachiyanagi": { cityId: "9590", destinationName: "교토, 일본" },
  "karasuma": { cityId: "9590", destinationName: "교토, 일본" },

  // 나라 역들
  "nara": { cityId: "9590", destinationName: "나라, 일본" },
  "yamato-saidaiji": { cityId: "9590", destinationName: "나라, 일본" },
  "shin-omiya": { cityId: "9590", destinationName: "나라, 일본" },
};

// 기본값: 오사카
const DEFAULT_CITY: AgodaCity = { cityId: "9590", destinationName: "오사카, 일본" };

export function getAgodaCity(stationSlug: string): AgodaCity {
  return AGODA_CITY_MAP[stationSlug] || DEFAULT_CITY;
}
