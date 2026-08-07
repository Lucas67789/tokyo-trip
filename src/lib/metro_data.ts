export type LineInfo = {
  id: string;
  name: string;
  color: string;
  code: string;
  is_express?: boolean;
  affiliate_url?: string;
};

export const METRO_LINES: Record<string, LineInfo> = {
  // Tokyo Metro
  ginza: { id: "ginza", name: "긴자선", color: "#FF9500", code: "G" },
  marunouchi: { id: "marunouchi", name: "마루노우치선", color: "#F62E36", code: "M" },
  hibiya: { id: "hibiya", name: "히비야선", color: "#B5B5AC", code: "H" },
  tozai: { id: "tozai", name: "도자이선", color: "#009BBF", code: "T" },
  chiyoda: { id: "chiyoda", name: "지요다선", color: "#00BB85", code: "C" },
  yurakucho: { id: "yurakucho", name: "유라쿠초선", color: "#C1A470", code: "Y" },
  hanzomon: { id: "hanzomon", name: "한조몬선", color: "#8F76D6", code: "Z" },
  namboku: { id: "namboku", name: "난보쿠선", color: "#00AC9B", code: "N" },
  fukutoshin: { id: "fukutoshin", name: "후쿠토신선", color: "#9C5E31", code: "F" },
  
  // Toei Subway
  asakusa: { id: "asakusa", name: "아사쿠사선", color: "#EC6E65", code: "A" },
  mita: { id: "mita", name: "미타선", color: "#006CB6", code: "I" },
  shinjuku: { id: "shinjuku", name: "신주쿠선", color: "#B0C124", code: "S" },
  oedo: { id: "oedo", name: "오에도선", color: "#CE045B", code: "E" },
  
  // JR Lines
  jr_yamanote: { id: "jr_yamanote", name: "JR 야마노테선", color: "#80C241", code: "JY" },
  jr_chuo: { id: "jr_chuo", name: "JR 주오선", color: "#F15A22", code: "JC" },
  jr_keihin: { id: "jr_keihin", name: "JR 게이힌토호쿠선", color: "#00B4E5", code: "JK" },
  
  // Airport & Express
  nex: { id: "nex", name: "나리타 익스프레스", color: "#E21F26", code: "NEX", is_express: true },
  skyliner: { id: "skyliner", name: "스카이라이너", color: "#003282", code: "KS", is_express: true },
  keikyu: { id: "keikyu", name: "케이큐 공항선", color: "#00BFFF", code: "KK" },
  monorail: { id: "monorail", name: "도쿄 모노레일", color: "#FF4500", code: "MO" },
  
  walk: { id: "walk", name: "도보/환승", color: "#94a3b8", code: "W" }
};

export type StationData = {
  slug: string;
  name_ko: string;
  name_jp: string;
  name_en: string;
  lines: string[];
};

export type Connection = {
  from: string;
  to: string;
  line: string;
  time: number;
};

const LINE_STATIONS_RAW: Record<string, Omit<StationData, "lines">[]> = {
  ginza: [
    { slug: "shibuya", name_ko: "시부야", name_jp: "渋谷", name_en: "Shibuya" },
    { slug: "omote-sando", name_ko: "오모테산도", name_jp: "表参道", name_en: "Omote-sando" },
    { slug: "gaiemmae", name_ko: "가이엔마에", name_jp: "外苑前", name_en: "Gaiemmae" },
    { slug: "aoyama-itchome", name_ko: "아오야마잇초메", name_jp: "青山一丁目", name_en: "Aoyama-itchome" },
    { slug: "akasaka-mitsuke", name_ko: "아카사카미쓰케", name_jp: "赤坂見附", name_en: "Akasaka-mitsuke" },
    { slug: "tameike-sanno", name_ko: "다메이케산노", name_jp: "溜池山王", name_en: "Tameike-sanno" },
    { slug: "toranomon", name_ko: "도라노몬", name_jp: "虎ノ門", name_en: "Toranomon" },
    { slug: "shimbashi", name_ko: "신바시", name_jp: "新橋", name_en: "Shimbashi" },
    { slug: "ginza", name_ko: "긴자", name_jp: "銀座", name_en: "Ginza" },
    { slug: "kyobashi", name_ko: "교바시", name_jp: "京橋", name_en: "Kyobashi" },
    { slug: "nihombashi", name_ko: "니혼바시", name_jp: "日本橋", name_en: "Nihombashi" },
    { slug: "mitsukoshimae", name_ko: "미쓰코시마에", name_jp: "三越前", name_en: "Mitsukoshimae" },
    { slug: "kanda", name_ko: "칸다", name_jp: "神田", name_en: "Kanda" },
    { slug: "suehirocho", name_ko: "스에히로초", name_jp: "末広町", name_en: "Suehirocho" },
    { slug: "ueno-hirokoji", name_ko: "우에노히로코지", name_jp: "上野広小路", name_en: "Ueno-hirokoji" },
    { slug: "ueno", name_ko: "우에노", name_jp: "上野", name_en: "Ueno" },
    { slug: "inaricho", name_ko: "이나리초", name_jp: "稲荷町", name_en: "Inaricho" },
    { slug: "tawaramachi", name_ko: "다와라마치", name_jp: "田原町", name_en: "Tawaramachi" },
    { slug: "asakusa", name_ko: "아사쿠사", name_jp: "浅草", name_en: "Asakusa" }
  ],
  marunouchi: [
    { slug: "ogikubo", name_ko: "오기쿠보", name_jp: "荻窪", name_en: "Ogikubo" },
    { slug: "shinjuku", name_ko: "신주쿠", name_jp: "新宿", name_en: "Shinjuku" },
    { slug: "shinjuku-sanchome", name_ko: "신주쿠산초메", name_jp: "新宿三丁目", name_en: "Shinjuku-sanchome" },
    { slug: "yotsuya", name_ko: "요쓰야", name_jp: "四ツ谷", name_en: "Yotsuya" },
    { slug: "akasaka-mitsuke", name_ko: "아카사카미쓰케", name_jp: "赤坂見附", name_en: "Akasaka-mitsuke" },
    { slug: "kokkai-gijidomae", name_ko: "고까이기지도마에", name_jp: "国会議事堂前", name_en: "Kokkai-gijidomae" },
    { slug: "kasumigaseki", name_ko: "가스미가세키", name_jp: "霞ヶ関", name_en: "Kasumigaseki" },
    { slug: "ginza", name_ko: "긴자", name_jp: "銀座", name_en: "Ginza" },
    { slug: "tokyo", name_ko: "도쿄", name_jp: "東京", name_en: "Tokyo" },
    { slug: "otemachi", name_ko: "오테마치", name_jp: "大手町", name_en: "Otemachi" },
    { slug: "korakuen", name_ko: "고라쿠엔", name_jp: "後楽園", name_en: "Korakuen" },
    { slug: "ikebukuro", name_ko: "이케부쿠로", name_jp: "池袋", name_en: "Ikebukuro" }
  ],
  hibiya: [
    { slug: "naka-meguro", name_ko: "나카메구로", name_jp: "中目黒", name_en: "Naka-meguro" },
    { slug: "ebisu", name_ko: "에비스", name_jp: "恵比寿", name_en: "Ebisu" },
    { slug: "hiro-o", name_ko: "히로오", name_jp: "広尾", name_en: "Hiro-o" },
    { slug: "roppongi", name_ko: "롯폰기", name_jp: "六本木", name_en: "Roppongi" },
    { slug: "kamiyacho", name_ko: "가미야초", name_jp: "神谷町", name_en: "Kamiyacho" },
    { slug: "kasumigaseki", name_ko: "가스미가세키", name_jp: "霞ヶ関", name_en: "Kasumigaseki" },
    { slug: "hibiya", name_ko: "히비야", name_jp: "日比谷", name_en: "Hibiya" },
    { slug: "ginza", name_ko: "긴자", name_jp: "銀座", name_en: "Ginza" },
    { slug: "higashi-ginza", name_ko: "히가시긴자", name_jp: "東銀座", name_en: "Higashi-ginza" },
    { slug: "tsukiji", name_ko: "쓰키지", name_jp: "築地", name_en: "Tsukiji" },
    { slug: "hatchobori", name_ko: "핫초보리", name_jp: "八丁堀", name_en: "Hatchobori" },
    { slug: "kayabacho", name_ko: "가야바초", name_jp: "茅場町", name_en: "Kayabacho" },
    { slug: "ningyocho", name_ko: "닝요초", name_jp: "人形町", name_en: "Ningyocho" },
    { slug: "kodemmacho", name_ko: "고덴마초", name_jp: "小伝馬町", name_en: "Kodemmacho" },
    { slug: "akihabara", name_ko: "아키하바라", name_jp: "秋葉原", name_en: "Akihabara" },
    { slug: "naka-okachimachi", name_ko: "나카오카치마치", name_jp: "仲御徒町", name_en: "Naka-okachimachi" },
    { slug: "ueno", name_ko: "우에노", name_jp: "上野", name_en: "Ueno" }
  ],
  hanzomon: [
    { slug: "shibuya", name_ko: "시부야", name_jp: "渋谷", name_en: "Shibuya" },
    { slug: "omote-sando", name_ko: "오모테산도", name_jp: "表参道", name_en: "Omote-sando" },
    { slug: "aoyama-itchome", name_ko: "아오야마잇초메", name_jp: "青山一丁目", name_en: "Aoyama-itchome" },
    { slug: "nagatacho", name_ko: "나가타초", name_jp: "永田町", name_en: "Nagatacho" },
    { slug: "hanzomon", name_ko: "한조몬", name_jp: "半蔵門", name_en: "Hanzomon" },
    { slug: "kudanshita", name_ko: "구단시타", name_jp: "九段下", name_en: "Kudanshita" },
    { slug: "jimbocho", name_ko: "진보초", name_jp: "神保町", name_en: "Jimbocho" },
    { slug: "otemachi", name_ko: "오테마치", name_jp: "大手町", name_en: "Otemachi" },
    { slug: "mitsukoshimae", name_ko: "미쓰코시마에", name_jp: "三越前", name_en: "Mitsukoshimae" },
    { slug: "oshiage", name_ko: "오시아게", name_jp: "押上", name_en: "Oshiage" }
  ],
  fukutoshin: [
    { slug: "ikebukuro", name_ko: "이케부쿠로", name_jp: "池袋", name_en: "Ikebukuro" },
    { slug: "shinjuku-sanchome", name_ko: "신주쿠산초메", name_jp: "新宿三丁目", name_en: "Shinjuku-sanchome" },
    { slug: "meiji-jingumae", name_ko: "메이지진구마에", name_jp: "明治神宮前", name_en: "Meiji-jingumae" },
    { slug: "shibuya", name_ko: "시부야", name_jp: "渋谷", name_en: "Shibuya" }
  ],
  asakusa: [
    { slug: "sengakuji", name_ko: "센가쿠지", name_jp: "泉岳寺", name_en: "Sengakuji" },
    { slug: "mita", name_ko: "미타", name_jp: "三田", name_en: "Mita" },
    { slug: "daimon", name_ko: "다이몬", name_jp: "大門", name_en: "Daimon" },
    { slug: "shimbashi", name_ko: "신바시", name_jp: "新橋", name_en: "Shimbashi" },
    { slug: "higashi-ginza", name_ko: "히가시긴자", name_jp: "東銀座", name_en: "Higashi-ginza" },
    { slug: "nihombashi", name_ko: "니혼바시", name_jp: "日本橋", name_en: "Nihombashi" },
    { slug: "asakusa", name_ko: "아사쿠사", name_jp: "浅草", name_en: "Asakusa" },
    { slug: "oshiage", name_ko: "오시아게", name_jp: "押上", name_en: "Oshiage" }
  ],
  oedo: [
    { slug: "tochomae", name_ko: "도초마에", name_jp: "都庁前", name_en: "Tochomae" },
    { slug: "shinjuku", name_ko: "신주쿠", name_jp: "新宿", name_en: "Shinjuku" },
    { slug: "roppongi", name_ko: "롯폰기", name_jp: "六本木", name_en: "Roppongi" },
    { slug: "daimon", name_ko: "다이몬", name_jp: "大門", name_en: "Daimon" },
    { slug: "shiodome", name_ko: "시오도메", name_jp: "汐留", name_en: "Shiodome" },
    { slug: "tsukijishijo", name_ko: "쓰키지시조", name_jp: "築地市場", name_en: "Tsukijishijo" },
    { slug: "kuramae", name_ko: "구라마에", name_jp: "蔵前", name_en: "Kuramae" },
    { slug: "ueno-okachimachi", name_ko: "우에노오카치마치", name_jp: "上野御徒町", name_en: "Ueno-okachimachi" },
    { slug: "kasuga", name_ko: "가스가", name_jp: "春日", name_en: "Kasuga" }
  ],
  jr_yamanote: [
    { slug: "tokyo", name_ko: "도쿄", name_jp: "東京", name_en: "Tokyo" },
    { slug: "kanda", name_ko: "칸다", name_jp: "神田", name_en: "Kanda" },
    { slug: "akihabara", name_ko: "아키하바라", name_jp: "秋葉原", name_en: "Akihabara" },
    { slug: "okachimachi", name_ko: "오카치마치", name_jp: "御徒町", name_en: "Okachimachi" },
    { slug: "ueno", name_ko: "우에노", name_jp: "上野", name_en: "Ueno" },
    { slug: "nippori", name_ko: "닛포리", name_jp: "日暮里", name_en: "Nippori" },
    { slug: "ikebukuro", name_ko: "이케부쿠로", name_jp: "池袋", name_en: "Ikebukuro" },
    { slug: "shinjuku", name_ko: "신주쿠", name_jp: "新宿", name_en: "Shinjuku" },
    { slug: "yoyogi", name_ko: "요요기", name_jp: "代々木", name_en: "Yoyogi" },
    { slug: "harajuku", name_ko: "하라주쿠", name_jp: "原宿", name_en: "Harajuku" },
    { slug: "shibuya", name_ko: "시부야", name_jp: "渋谷", name_en: "Shibuya" },
    { slug: "ebisu", name_ko: "에비스", name_jp: "恵比寿", name_en: "Ebisu" },
    { slug: "shinagawa", name_ko: "시나가와", name_jp: "品川", name_en: "Shinagawa" },
    { slug: "shimbashi", name_ko: "신바시", name_jp: "新橋", name_en: "Shimbashi" },
    { slug: "yurakucho", name_ko: "유라쿠초", name_jp: "有楽町", name_en: "Yurakucho" }
  ]
};

const EXTERNAL_STATIONS: Record<string, StationData> = {
  // 공항 방면
  "narita-airport": { slug: "narita-airport", name_ko: "나리타 공항", name_jp: "成田空港", name_en: "Narita Airport", lines: ["nex", "skyliner"] },
  "haneda-airport": { slug: "haneda-airport", name_ko: "하네다 공항", name_jp: "羽田空港", name_en: "Haneda Airport", lines: ["keikyu", "monorail"] },
  
  // 환승 연결용 추가 맵핑
  "hamamatsucho": { slug: "hamamatsucho", name_ko: "하마마쓰초", name_jp: "浜松町", name_en: "Hamamatsucho", lines: ["jr_yamanote", "monorail"] },
  "shinagawa": { slug: "shinagawa", name_ko: "시나가와", name_jp: "品川", name_en: "Shinagawa", lines: ["jr_yamanote", "keikyu", "nex"] }
};

const compiledStations: Record<string, StationData> = {};
const compiledConnections: Connection[] = [];

// 1. 역 데이터 병합 및 빌딩
Object.entries(LINE_STATIONS_RAW).forEach(([lineId, stations]) => {
  stations.forEach((st) => {
    if (!compiledStations[st.slug]) {
      compiledStations[st.slug] = {
        slug: st.slug,
        name_ko: st.name_ko,
        name_jp: st.name_jp,
        name_en: st.name_en,
        lines: [lineId]
      };
    } else {
      if (!compiledStations[st.slug].lines.includes(lineId)) {
        compiledStations[st.slug].lines.push(lineId);
      }
    }
  });
});

Object.entries(EXTERNAL_STATIONS).forEach(([slug, data]) => {
  if (!compiledStations[slug]) {
    compiledStations[slug] = data;
  } else {
    data.lines.forEach((line) => {
      if (!compiledStations[slug].lines.includes(line)) {
        compiledStations[slug].lines.push(line);
      }
    });
  }
});

// 2. 노선별 인접 역 순차 연결 생성 (엣지 빌딩)
Object.entries(LINE_STATIONS_RAW).forEach(([lineId, stations]) => {
  for (let i = 0; i < stations.length - 1; i++) {
    const from = stations[i].slug;
    const to = stations[i + 1].slug;
    
    const exists = compiledConnections.some(
      (c) =>
        c.line === lineId &&
        ((c.from === from && c.to === to) || (c.from === to && c.to === from))
    );

    if (!exists) {
      const time = 2; // 기본 2분 소요
      compiledConnections.push({ from, to, line: lineId, time });
    }
  }
});

// 야마노테선 순환 연결
compiledConnections.push({ from: "yurakucho", to: "tokyo", line: "jr_yamanote", time: 2 });

const SPECIAL_CONNECTIONS: Connection[] = [
  // --- 공항 특급 ---
  { from: "narita-airport", to: "nippori", line: "skyliner", time: 36 },
  { from: "nippori", to: "ueno", line: "skyliner", time: 5 },
  
  { from: "narita-airport", to: "tokyo", line: "nex", time: 53 },
  { from: "tokyo", to: "shibuya", line: "nex", time: 20 },
  { from: "shibuya", to: "shinjuku", line: "nex", time: 5 },
  
  // --- 하네다 공항 ---
  { from: "haneda-airport", to: "shinagawa", line: "keikyu", time: 13 },
  { from: "haneda-airport", to: "hamamatsucho", line: "monorail", time: 18 },
  
  // --- 주요 도보 환승 패널티 ---
  { from: "ueno", to: "ueno-okachimachi", line: "walk", time: 5 },
  { from: "ueno-hirokoji", to: "ueno-okachimachi", line: "walk", time: 3 },
  { from: "okachimachi", to: "ueno-okachimachi", line: "walk", time: 3 },
  { from: "naka-okachimachi", to: "ueno-okachimachi", line: "walk", time: 3 },
  { from: "harajuku", to: "meiji-jingumae", line: "walk", time: 3 },
  { from: "daimon", to: "hamamatsucho", line: "walk", time: 5 }
];

SPECIAL_CONNECTIONS.forEach((conn) => {
  compiledConnections.push(conn);
});

export const METRO_STATIONS: Record<string, StationData> = compiledStations;
export const METRO_CONNECTIONS: Connection[] = compiledConnections;
