// 역 slug → 아고다 도시 정보 매핑
// 대부분의 역이 도쿄이므로 기본값을 도쿄로 설정

interface AgodaCity {
  cityId: string;
  destinationName: string;
}

const AGODA_CITY_MAP: Record<string, AgodaCity> = {
  // 교토 역들
  "kyoto": { cityId: "5085", destinationName: "교토, 일본" },
  "kyoto-kawaramachi": { cityId: "5085", destinationName: "교토, 일본" },
  "gion-shijo": { cityId: "5085", destinationName: "교토, 일본" },
  "sanjo": { cityId: "5085", destinationName: "교토, 일본" },
  "demachiyanagi": { cityId: "5085", destinationName: "교토, 일본" },
  "karasuma": { cityId: "5085", destinationName: "교토, 일본" },

  // 나라 역들
  "nara": { cityId: "5085", destinationName: "나라, 일본" },
  "yamato-saidaiji": { cityId: "5085", destinationName: "나라, 일본" },
  "shin-omiya": { cityId: "5085", destinationName: "나라, 일본" },
};

// 기본값: 도쿄
const DEFAULT_CITY: AgodaCity = { cityId: "5085", destinationName: "도쿄, 일본" };

export function getAgodaCity(stationSlug: string): AgodaCity {
  return AGODA_CITY_MAP[stationSlug] || DEFAULT_CITY;
}
