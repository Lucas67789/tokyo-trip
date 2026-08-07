const fs = require('fs');

const lines = {
  "ginza": "Shibuya/시부야/渋谷,Omotesando/오모테산도/表参道,Gaiemmae/가이엔마에/外苑前,Aoyama-itchome/아오야마잇초메/青山一丁目,Akasaka-mitsuke/아카사카미쓰케/赤坂見附,Tameike-sanno/다메이케산노/溜池山王,Toranomon/도라노몬/虎ノ門,Shimbashi/신바시/新橋,Ginza/긴자/銀座,Kyobashi/교바시/京橋,Nihombashi/니혼바시/日本橋,Mitsukoshimae/미쓰코시마에/三越前,Kanda/칸다/神田,Suehirocho/스에히로초/末広町,Ueno-hirokoji/우에노히로코지/上野広小路,Ueno/우에노/上野,Inaricho/이나리초/稲荷町,Tawaramachi/다와라마치/田原町,Asakusa/아사쿠사/浅草",
  "marunouchi": "Ogikubo/오기쿠보/荻窪,Minami-asagaya/미나미아사가야/南阿佐ケ谷,Shin-koenji/신코엔지/新高円寺,Higashi-koenji/히가시코엔지/東高円寺,Shin-nakano/신나카노/新中野,Nakano-sakaue/나카노사카우에/中野坂上,Nishi-shinjuku/니시신주쿠/西新宿,Shinjuku/신주쿠/新宿,Shinjuku-sanchome/신주쿠산초메/新宿三丁目,Shinjuku-gyoemmae/신주쿠교엔마에/新宿御苑前,Yotsuya-sanchome/요쓰야산초메/四谷三丁目,Yotsuya/요쓰야/四ツ谷,Akasaka-mitsuke/아카사카미쓰케/赤坂見附,Kokkai-gijidomae/국회의사당앞/国会議事堂前,Kasumigaseki/가스미가세키/霞ケ関,Ginza/긴자/銀座,Tokyo/도쿄/東京,Otemachi/오테마치/大手町,Awajicho/아와지초/淡路町,Ochanomizu/오차노미즈/御茶ノ水,Hongo-sanchome/혼고산초메/本郷三丁目,Korakuen/고라쿠엔/後楽園,Myogadani/묘가다니/茗荷谷,Shin-otsuka/신오쓰카/新大塚,Ikebukuro/이케부쿠로/池袋",
  "hibiya": "Naka-meguro/나카메구로/中目黒,Ebisu/에비스/恵比寿,Hiro-o/히로오/広尾,Roppongi/롯폰기/六本木,Kamiyacho/가미야초/神谷町,Toranomon-hills/도라노몬힐즈/虎ノ門ヒルズ,Kasumigaseki/가스미가세키/霞ケ関,Hibiya/히비야/日比谷,Ginza/긴자/銀座,Higashi-ginza/히가시긴자/東銀座,Tsukiji/쓰키지/築地,Hatchobori/핫초보리/八丁堀,Kayabacho/가야바초/茅場町,Ningyocho/닝요초/人形町,Kodemmacho/고덴마초/小伝馬町,Akihabara/아키하바라/秋葉原,Naka-okachimachi/나카오카치마치/仲御徒町,Ueno/우에노/上野,Iriya/이리야/入谷,Minowa/미노와/三ノ輪,Minami-senju/미나미센주/南千住,Kita-senju/기타센주/北千住",
  "tozai": "Nakano/나카노/中野,Ochiai/오치아이/落合,Takadanobaba/다카다노바바/高田馬場,Waseda/와세다/早稲田,Kagurazaka/가구라자카/神楽坂,Iidabashi/이이다바시/飯田橋,Kudanshita/구단시타/九段下,Takebashi/다케바시/竹橋,Otemachi/오테마치/大手町,Nihombashi/니혼바시/日本橋,Kayabacho/가야바초/茅場町,Monzen-nakacho/몬젠나카초/門前仲町,Kiba/기바/木場,Toyocho/도요초/東陽町,Minami-sunamachi/미나미스나마치/南砂町,Nishi-kasai/니시카사이/西葛西,Kasai/카사이/葛西,Urayasu/우라야스/浦安,Minami-gyotoku/미나미교토쿠/南行徳,Gyotoku/교토쿠/行徳,Myoden/묘덴/妙典,Baraki-nakayama/바라키나카야마/原木中山,Nishi-funabashi/니시후나바시/西船橋",
  "chiyoda": "Yoyogi-uehara/요요기우에하라/代々木上原,Yoyogi-koen/요요기코엔/代々木公園,Meiji-jingumae/메이지진구마에/明治神宮前,Omotesando/오모테산도/表参道,Nogizaka/노기자카/乃木坂,Akasaka/아카사카/赤坂,Kokkai-gijidomae/국회의사당앞/国会議事堂前,Kasumigaseki/가스미가세키/霞ケ関,Hibiya/히비야/日比谷,Nijubashimae/니주바시마에/二重橋前,Otemachi/오테마치/大手町,Shin-ochanomizu/신오차노미즈/新御茶ノ水,Yushima/유시마/湯島,Nezu/네즈/根津,Sendagi/센다기/千駄木,Nishi-nippori/니시닛포리/西日暮里,Machiya/마치야/町屋,Kita-senju/기타센주/北千住,Ayase/아야세/綾瀬,Kita-ayase/기타아야세/北綾瀬",
  "yurakucho": "Wakoshi/와코시/和光市,Chikatetsu-narimasu/지카테쓰나리마스/地下鉄成増,Chikatetsu-akatsuka/지카테쓰아카쓰카/地下鉄赤塚,Heiwadai/헤이와다이/平和台,Hikawadai/히카와다이/氷川台,Kotake-mukaihara/고타케무카이하라/小竹向原,Senkawa/센카와/千川,Kanamecho/가나메초/要町,Ikebukuro/이케부쿠로/池袋,Higashi-ikebukuro/히가시이케부쿠로/東池袋,Gokokuji/고코쿠지/護国寺,Edogawabashi/에도가와바시/江戸川橋,Iidabashi/이이다바시/飯田橋,Ichigaya/이치가야/市ケ谷,Kojimachi/고지마치/麹町,Nagatacho/나가타초/永田町,Sakuradamon/사쿠라다몬/桜田門,Yurakucho/유라쿠초/有楽町,Ginza-itchome/긴자잇초메/銀座一丁目,Shintomicho/신토미초/新富町,Tsukishima/쓰키시마/月島,Toyosu/도요스/豊洲,Tatsumi/다쓰미/辰巳,Shin-kiba/신키바/新木場",
  "hanzomon": "Shibuya/시부야/渋谷,Omotesando/오모테산도/表参道,Aoyama-itchome/아오야마잇초메/青山一丁目,Nagatacho/나가타초/永田町,Hanzomon/한조몬/半蔵門,Kudanshita/구단시타/九段下,Jimbocho/진보초/神保町,Otemachi/오테마치/大手町,Mitsukoshimae/미쓰코시마에/三越前,Suitengumae/스이텐구마에/水天宮前,Kiyosumi-shirakawa/기요스미시라카와/清澄白河,Sumiyoshi/스미요시/住吉,Kinshicho/킨시초/錦糸町,Oshiage/오시아게/押上",
  "namboku": "Meguro/메구로/目黒,Shirokanedai/시로카네다이/白金台,Shirokane-takanawa/시로카네타카나와/白金高輪,Azabu-juban/아자부주반/麻布十番,Roppongi-itchome/롯폰기잇초메/六本木一丁目,Tameike-sanno/다메이케산노/溜池山王,Kokkai-gijidomae/국회의사당앞/国会議事堂前,Nagatacho/나가타초/永田町,Yotsuya/요쓰야/四ツ谷,Ichigaya/이치가야/市ケ谷,Iidabashi/이이다바시/飯田橋,Korakuen/고라쿠엔/後楽園,Todaimae/도다이마에/東大前,Hon-komagome/혼코마고메/本駒込,Komagome/고마고메/駒込,Nishigahara/니시가하라/西ケ原,Oji/오지/王子,Oji-kamiya/오지카미야/王子神谷,Shimo/시모/志茂,Akabane-iwabuchi/아카바네이와부치/赤羽岩淵",
  "fukutoshin": "Wakoshi/와코시/和光市,Chikatetsu-narimasu/지카테쓰나리마스/地下鉄成増,Chikatetsu-akatsuka/지카테쓰아카쓰카/地下鉄赤塚,Heiwadai/헤이와다이/平和台,Hikawadai/히카와다이/氷川台,Kotake-mukaihara/고타케무카이하라/小竹向原,Senkawa/센카와/千川,Kanamecho/가나메초/要町,Ikebukuro/이케부쿠로/池袋,Zoshigaya/조시가야/雑司が谷,Nishi-waseda/니시와세다/西早稲田,Higashi-shinjuku/히가시신주쿠/東新宿,Shinjuku-sanchome/신주쿠산초메/新宿三丁目,Kita-sando/기타산도/北参道,Meiji-jingumae/메이지진구마에/明治神宮前,Shibuya/시부야/渋谷",
  "asakusa": "Nishi-magome/니시마고메/西馬込,Magome/마고메/馬込,Nakanobu/나카노부/中延,Togoshi/도고시/戸越,Gotanda/고탄다/五反田,Takanawadai/다카나와다이/高輪台,Sengakuji/센가쿠지/泉岳寺,Mita/미타/三田,Daimon/다이몬/大門,Shimbashi/신바시/新橋,Higashi-ginza/히가시긴자/東銀座,Takaracho/다카라초/宝町,Nihombashi/니혼바시/日本橋,Ningyocho/닝요초/人形町,Higashi-nihombashi/히가시니혼바시/東日本橋,Asakusabashi/아사쿠사바시/浅草橋,Kuramae/구라마에/蔵前,Asakusa/아사쿠사/浅草,Honjo-azumabashi/혼조아즈마바시/本所吾妻橋,Oshiage/오시아게/押上",
  "mita": "Meguro/메구로/目黒,Shirokanedai/시로카네다이/白金台,Shirokane-takanawa/시로카네타카나와/白金高輪,Mita/미타/三田,Shibakoen/시바코엔/芝公園,Onarimon/오나리몬/御成門,Uchisaiwaicho/우치사이와이초/内幸町,Hibiya/히비야/日比谷,Otemachi/오테마치/大手町,Jimbocho/진보초/神保町,Suidobashi/스이도바시/水道橋,Kasuga/가스가/春日,Hakusan/하쿠산/白山,Sengoku/센고쿠/千石,Sugamo/스가모/巣鴨,Nishi-sugamo/니시스가모/西巣鴨,Shin-itabashi/신이타바시/新板橋,Itabashikuyakushomae/이타바시쿠야쿠쇼마에/板橋区役所前,Itabashihoncho/이타바시혼초/板橋本町,Motohasunuma/모토하스누마/本蓮沼,Shimura-sakaue/시무라사카우에/志村坂上,Shimura-sanchome/시무라산초메/志村三丁目,Hasune/하스네/蓮根,Nishidai/니시다이/西台,Takashimadaira/다카시마다이라/高島平,Shin-takashimadaira/신타카시마다이라/新高島平,Nishi-takashimadaira/니시타카시마다이라/西高島平",
  "shinjuku": "Shinjuku/신주쿠/新宿,Shinjuku-sanchome/신주쿠산초메/新宿三丁目,Akebonobashi/아케보노바시/曙橋,Ichigaya/이치가야/市ケ谷,Kudanshita/구단시타/九段下,Jimbocho/진보초/神保町,Ogawamachi/오가와마치/小川町,Iwamotocho/이와모토초/岩本町,Bakuro-yokoyama/바쿠로요코야마/馬喰横山,Hamacho/하마초/浜町,Morishita/모리시타/森下,Kikukawa/기쿠카와/菊川,Sumiyoshi/스미요시/住吉,Nishi-ojima/니시오지마/西大島,Ojima/오지마/大島,Higashi-ojima/히가시오지마/東大島,Funabori/후나보리/船堀,Ichinoe/이치노에/一之江,Mizue/미즈에/瑞江,Shinozaki/시노자키/篠崎,Motoyawata/모토야와타/本八幡",
  "oedo": "Tochomae/도초마에/都庁前,Shinjuku-nishiguchi/신주쿠니시구치/新宿西口,Higashi-shinjuku/히가시신주쿠/東新宿,Wakamatsu-kawada/와카마쓰카와다/若松河田,Ushigome-yanagicho/우시고메야나기초/牛込柳町,Ushigome-kagurazaka/우시고메가구라자카/牛込神楽坂,Iidabashi/이이다바시/飯田橋,Kasuga/가스가/春日,Hongo-sanchome/혼고산초메/本郷三丁目,Ueno-okachimachi/우에노오카치마치/上野御徒町,Shin-okachimachi/신오카치마치/新御徒町,Kuramae/구라마에/蔵前,Ryogoku/료고쿠/両国,Morishita/모리시타/森下,Kiyosumi-shirakawa/기요스미시라카와/清澄白河,Monzen-nakacho/몬젠나카초/門前仲町,Tsukishima/쓰키시마/月島,Kachidoki/가치도키/勝どき,Tsukijishijo/쓰키지시조/築地市場,Shiodome/시오도메/汐留,Daimon/다이몬/大門,Akabanebashi/아카바네바시/赤羽橋,Azabu-juban/아자부주반/麻布十番,Roppongi/롯폰기/六本木,Aoyama-itchome/아오야마잇초메/青山一丁目,Kokuritsu-kyogijo/고쿠리쓰쿄기조/国立競技場,Yoyogi/요요기/代々木,Shinjuku/신주쿠/新宿,Tochomae/도초마에/都庁前,Nishi-shinjuku-gochome/니시신주쿠고초메/西新宿五丁目,Nakano-sakaue/나카노사카우에/中野坂上,Higashi-nakano/히가시나카노/東中野,Nakai/나카이/中井,Ochiai-minami-nagasaki/오치아이미나미나가사키/落合南長崎,Shin-egota/신에고타/新江古田,Nerima/네리마/練馬,Toshimaen/도시마엔/豊島園,Nerima-kasugacho/네리마카스가초/練馬春日町,Hikarigaoka/히카리가오카/光が丘",
  "jr_yamanote": "Tokyo/도쿄/東京,Kanda/칸다/神田,Akihabara/아키하바라/秋葉原,Okachimachi/오카치마치/御徒町,Ueno/우에노/上野,Uguisudani/우구이스다니/鶯谷,Nippori/닛포리/日暮里,Nishi-nippori/니시닛포리/西日暮里,Tabata/다바타/田端,Komagome/고마고메/駒込,Sugamo/스가모/巣鴨,Otsuka/오쓰카/大塚,Ikebukuro/이케부쿠로/池袋,Mejiro/메지로/目白,Takadanobaba/다카다노바바/高田馬場,Shin-okubo/신오쿠보/新大久保,Shinjuku/신주쿠/新宿,Yoyogi/요요기/代々木,Harajuku/하라주쿠/原宿,Shibuya/시부야/渋谷,Ebisu/에비스/恵比寿,Meguro/메구로/目黒,Gotanda/고탄다/五反田,Osaki/오사키/大崎,Shinagawa/시나가와/品川,Takanawa-gateway/다카나와게이트웨이/高輪ゲートウェイ,Tamachi/다마치/田町,Hamamatsucho/하마마쓰초/浜松町,Shimbashi/신바시/新橋,Yurakucho/유라쿠초/有楽町,Tokyo/도쿄/東京"
};

let output = `import { StaticImageData } from "next/image";

export type StationData = {
  slug: string;
  name_ko: string;
  name_en: string;
  name_jp: string;
  lines: string[];
};

export type LineInfo = {
  id: string;
  name: string;
  color: string;
  code: string;
  is_express?: boolean;
};

export type Connection = {
  from: string;
  to: string;
  line: string;
  time: number;
};

export const METRO_LINES: Record<string, LineInfo> = {
  ginza: { id: "ginza", name: "긴자선", color: "#F39700", code: "G" },
  marunouchi: { id: "marunouchi", name: "마루노우치선", color: "#E60012", code: "M" },
  hibiya: { id: "hibiya", name: "히비야선", color: "#9CAEB7", code: "H" },
  tozai: { id: "tozai", name: "도자이선", color: "#00A7DB", code: "T" },
  chiyoda: { id: "chiyoda", name: "지요다선", color: "#009944", code: "C" },
  yurakucho: { id: "yurakucho", name: "유라쿠초선", color: "#D7C447", code: "Y" },
  hanzomon: { id: "hanzomon", name: "한조몬선", color: "#9B7CB6", code: "Z" },
  namboku: { id: "namboku", name: "난보쿠선", color: "#00ADA9", code: "N" },
  fukutoshin: { id: "fukutoshin", name: "후쿠토신선", color: "#BB641D", code: "F" },
  asakusa: { id: "asakusa", name: "아사쿠사선", color: "#E85298", code: "A" },
  mita: { id: "mita", name: "미타선", color: "#0079C2", code: "I" },
  shinjuku: { id: "shinjuku", name: "신주쿠선", color: "#6CBB5A", code: "S" },
  oedo: { id: "oedo", name: "오에도선", color: "#B6007A", code: "E" },
  jr_yamanote: { id: "jr_yamanote", name: "JR 야마노테선", color: "#80C241", code: "JY" },
  walk: { id: "walk", name: "도보/환승", color: "#94a3b8", code: "W" },
  skyliner: { id: "skyliner", name: "게이세이 스카이라이너", color: "#002F6C", code: "KS", is_express: true },
  nex: { id: "nex", name: "나리타 익스프레스", color: "#E2001A", code: "NEX", is_express: true },
  keikyu: { id: "keikyu", name: "게이큐 공항선", color: "#00A1E9", code: "KK" },
  monorail: { id: "monorail", name: "도쿄 모노레일", color: "#D7C447", code: "MO" },
  jr_keiyo: { id: "jr_keiyo", name: "JR 게이요선", color: "#C9242F", code: "JE" }
};

export const LINE_STATIONS_RAW: Record<string, StationData[]> = {
`;

for (const [lineId, dataStr] of Object.entries(lines)) {
  output += `  ${lineId}: [\n`;
  const stations = dataStr.split(',');
  for (const st of stations) {
    const [en, ko, jp] = st.split('/');
    const slug = en.toLowerCase().replace(/ /g, '-');
    output += `    { slug: "${slug}", name_ko: "${ko}", name_en: "${en}", name_jp: "${jp}", lines: [] },\n`;
  }
  output += `  ],\n`;
}

output += `};

const EXTERNAL_STATIONS: Record<string, StationData> = {
  // 공항 방면
  "narita-airport": { slug: "narita-airport", name_ko: "나리타 공항", name_jp: "成田空港", name_en: "Narita Airport", lines: ["nex", "skyliner"] },
  "haneda-airport": { slug: "haneda-airport", name_ko: "하네다 공항", name_jp: "羽田空港", name_en: "Haneda Airport", lines: ["keikyu", "monorail"] },
  
  // 환승 연결용 추가 맵핑
  "hamamatsucho": { slug: "hamamatsucho", name_ko: "하마마쓰초", name_jp: "浜松町", name_en: "Hamamatsucho", lines: ["jr_yamanote", "monorail"] },
  "shinagawa": { slug: "shinagawa", name_ko: "시나가와", name_jp: "品川", name_en: "Shinagawa", lines: ["jr_yamanote", "keikyu", "nex"] },
  
  // 디즈니랜드 방면
  "maihama": { slug: "maihama", name_ko: "마이하마(디즈니)", name_jp: "舞浜", name_en: "Maihama", lines: ["jr_keiyo"] },
  "tokyo": { slug: "tokyo", name_ko: "도쿄", name_jp: "東京", name_en: "Tokyo", lines: ["jr_keiyo", "jr_yamanote", "marunouchi", "chiyoda"] }
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
  
  // --- 디즈니랜드 ---
  { from: "tokyo", to: "maihama", line: "jr_keiyo", time: 15 },
  
  // --- 주요 도보 환승 패널티 ---
  { from: "ueno", to: "ueno-okachimachi", line: "walk", time: 5 },
  { from: "ueno-hirokoji", to: "ueno-okachimachi", line: "walk", time: 3 },
  { from: "okachimachi", to: "ueno-okachimachi", line: "walk", time: 3 },
  { from: "naka-okachimachi", to: "ueno-okachimachi", line: "walk", time: 3 },
  { from: "harajuku", to: "meiji-jingumae", line: "walk", time: 3 },
  { from: "daimon", to: "hamamatsucho", line: "walk", time: 5 },
  { from: "shinjuku", to: "shinjuku-nishiguchi", line: "walk", time: 5 }
];

SPECIAL_CONNECTIONS.forEach((conn) => {
  compiledConnections.push(conn);
});

export const METRO_STATIONS: Record<string, StationData> = compiledStations;
export const METRO_CONNECTIONS: Connection[] = compiledConnections;
`;

fs.writeFileSync('src/lib/metro_data.ts', output, 'utf-8');
console.log('metro_data.ts has been successfully regenerated.');
