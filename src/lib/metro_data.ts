

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
  keisei_skyaccess: { id: "keisei_skyaccess", name: "게이세이 스카이 액세스", color: "#FF7F00", code: "KS", is_express: true },
  monorail: { id: "monorail", name: "도쿄 모노레일", color: "#D7C447", code: "MO" },
  jr_keiyo: { id: "jr_keiyo", name: "JR 게이요선", color: "#C9242F", code: "JE" },
  jr_chuo: { id: "jr_chuo", name: "JR 츄오선", color: "#F15A22", code: "JC" },
  jr_sobu: { id: "jr_sobu", name: "JR 츄오·소부선", color: "#FFD400", code: "JB" },
  yurikamome: { id: "yurikamome", name: "유리카모메", color: "#0078FF", code: "U" },
  inokashira: { id: "inokashira", name: "게이오 이노카시라선", color: "#CC88C2", code: "IN" },
  toyoko: { id: "toyoko", name: "도큐 도요코선", color: "#DA0442", code: "TY" }
};

export const LINE_STATIONS_RAW: Record<string, StationData[]> = {
  ginza: [
    { slug: "shibuya", name_ko: "시부야", name_en: "Shibuya", name_jp: "渋谷", lines: [] },
    { slug: "omotesando", name_ko: "오모테산도", name_en: "Omotesando", name_jp: "表参道", lines: [] },
    { slug: "gaiemmae", name_ko: "가이엔마에", name_en: "Gaiemmae", name_jp: "外苑前", lines: [] },
    { slug: "aoyama-itchome", name_ko: "아오야마잇초메", name_en: "Aoyama-itchome", name_jp: "青山一丁目", lines: [] },
    { slug: "akasaka-mitsuke", name_ko: "아카사카미쓰케", name_en: "Akasaka-mitsuke", name_jp: "赤坂見附", lines: [] },
    { slug: "tameike-sanno", name_ko: "다메이케산노", name_en: "Tameike-sanno", name_jp: "溜池山王", lines: [] },
    { slug: "toranomon", name_ko: "도라노몬", name_en: "Toranomon", name_jp: "虎ノ門", lines: [] },
    { slug: "shimbashi", name_ko: "신바시", name_en: "Shimbashi", name_jp: "新橋", lines: [] },
    { slug: "ginza", name_ko: "긴자", name_en: "Ginza", name_jp: "銀座", lines: [] },
    { slug: "kyobashi", name_ko: "교바시", name_en: "Kyobashi", name_jp: "京橋", lines: [] },
    { slug: "nihombashi", name_ko: "니혼바시", name_en: "Nihombashi", name_jp: "日本橋", lines: [] },
    { slug: "mitsukoshimae", name_ko: "미쓰코시마에", name_en: "Mitsukoshimae", name_jp: "三越前", lines: [] },
    { slug: "kanda", name_ko: "칸다", name_en: "Kanda", name_jp: "神田", lines: [] },
    { slug: "suehirocho", name_ko: "스에히로초", name_en: "Suehirocho", name_jp: "末広町", lines: [] },
    { slug: "ueno-hirokoji", name_ko: "우에노히로코지", name_en: "Ueno-hirokoji", name_jp: "上野広小路", lines: [] },
    { slug: "ueno", name_ko: "우에노", name_en: "Ueno", name_jp: "上野", lines: [] },
    { slug: "inaricho", name_ko: "이나리초", name_en: "Inaricho", name_jp: "稲荷町", lines: [] },
    { slug: "tawaramachi", name_ko: "다와라마치", name_en: "Tawaramachi", name_jp: "田原町", lines: [] },
    { slug: "asakusa", name_ko: "아사쿠사", name_en: "Asakusa", name_jp: "浅草", lines: [] },
  ],
  marunouchi: [
    { slug: "ogikubo", name_ko: "오기쿠보", name_en: "Ogikubo", name_jp: "荻窪", lines: [] },
    { slug: "minami-asagaya", name_ko: "미나미아사가야", name_en: "Minami-asagaya", name_jp: "南阿佐ケ谷", lines: [] },
    { slug: "shin-koenji", name_ko: "신코엔지", name_en: "Shin-koenji", name_jp: "新高円寺", lines: [] },
    { slug: "higashi-koenji", name_ko: "히가시코엔지", name_en: "Higashi-koenji", name_jp: "東高円寺", lines: [] },
    { slug: "shin-nakano", name_ko: "신나카노", name_en: "Shin-nakano", name_jp: "新中野", lines: [] },
    { slug: "nakano-sakaue", name_ko: "나카노사카우에", name_en: "Nakano-sakaue", name_jp: "中野坂上", lines: [] },
    { slug: "nishi-shinjuku", name_ko: "니시신주쿠", name_en: "Nishi-shinjuku", name_jp: "西新宿", lines: [] },
    { slug: "shinjuku", name_ko: "신주쿠", name_en: "Shinjuku", name_jp: "新宿", lines: [] },
    { slug: "shinjuku-sanchome", name_ko: "신주쿠산초메", name_en: "Shinjuku-sanchome", name_jp: "新宿三丁目", lines: [] },
    { slug: "shinjuku-gyoemmae", name_ko: "신주쿠교엔마에", name_en: "Shinjuku-gyoemmae", name_jp: "新宿御苑前", lines: [] },
    { slug: "yotsuya-sanchome", name_ko: "요쓰야산초메", name_en: "Yotsuya-sanchome", name_jp: "四谷三丁目", lines: [] },
    { slug: "yotsuya", name_ko: "요쓰야", name_en: "Yotsuya", name_jp: "四ツ谷", lines: [] },
    { slug: "akasaka-mitsuke", name_ko: "아카사카미쓰케", name_en: "Akasaka-mitsuke", name_jp: "赤坂見附", lines: [] },
    { slug: "kokkai-gijidomae", name_ko: "국회의사당앞", name_en: "Kokkai-gijidomae", name_jp: "国会議事堂前", lines: [] },
    { slug: "kasumigaseki", name_ko: "가스미가세키", name_en: "Kasumigaseki", name_jp: "霞ケ関", lines: [] },
    { slug: "ginza", name_ko: "긴자", name_en: "Ginza", name_jp: "銀座", lines: [] },
    { slug: "tokyo", name_ko: "도쿄", name_en: "Tokyo", name_jp: "東京", lines: [] },
    { slug: "otemachi", name_ko: "오테마치", name_en: "Otemachi", name_jp: "大手町", lines: [] },
    { slug: "awajicho", name_ko: "아와지초", name_en: "Awajicho", name_jp: "淡路町", lines: [] },
    { slug: "ochanomizu", name_ko: "오차노미즈", name_en: "Ochanomizu", name_jp: "御茶ノ水", lines: [] },
    { slug: "hongo-sanchome", name_ko: "혼고산초메", name_en: "Hongo-sanchome", name_jp: "本郷三丁目", lines: [] },
    { slug: "korakuen", name_ko: "고라쿠엔", name_en: "Korakuen", name_jp: "後楽園", lines: [] },
    { slug: "myogadani", name_ko: "묘가다니", name_en: "Myogadani", name_jp: "茗荷谷", lines: [] },
    { slug: "shin-otsuka", name_ko: "신오쓰카", name_en: "Shin-otsuka", name_jp: "新大塚", lines: [] },
    { slug: "ikebukuro", name_ko: "이케부쿠로", name_en: "Ikebukuro", name_jp: "池袋", lines: [] },
  ],
  hibiya: [
    { slug: "naka-meguro", name_ko: "나카메구로", name_en: "Naka-meguro", name_jp: "中目黒", lines: [] },
    { slug: "ebisu", name_ko: "에비스", name_en: "Ebisu", name_jp: "恵比寿", lines: [] },
    { slug: "hiro-o", name_ko: "히로오", name_en: "Hiro-o", name_jp: "広尾", lines: [] },
    { slug: "roppongi", name_ko: "롯폰기", name_en: "Roppongi", name_jp: "六本木", lines: [] },
    { slug: "kamiyacho", name_ko: "가미야초", name_en: "Kamiyacho", name_jp: "神谷町", lines: [] },
    { slug: "toranomon-hills", name_ko: "도라노몬힐즈", name_en: "Toranomon-hills", name_jp: "虎ノ門ヒルズ", lines: [] },
    { slug: "kasumigaseki", name_ko: "가스미가세키", name_en: "Kasumigaseki", name_jp: "霞ケ関", lines: [] },
    { slug: "hibiya", name_ko: "히비야", name_en: "Hibiya", name_jp: "日比谷", lines: [] },
    { slug: "ginza", name_ko: "긴자", name_en: "Ginza", name_jp: "銀座", lines: [] },
    { slug: "higashi-ginza", name_ko: "히가시긴자", name_en: "Higashi-ginza", name_jp: "東銀座", lines: [] },
    { slug: "tsukiji", name_ko: "쓰키지", name_en: "Tsukiji", name_jp: "築地", lines: [] },
    { slug: "hatchobori", name_ko: "핫초보리", name_en: "Hatchobori", name_jp: "八丁堀", lines: [] },
    { slug: "kayabacho", name_ko: "가야바초", name_en: "Kayabacho", name_jp: "茅場町", lines: [] },
    { slug: "ningyocho", name_ko: "닝요초", name_en: "Ningyocho", name_jp: "人形町", lines: [] },
    { slug: "kodemmacho", name_ko: "고덴마초", name_en: "Kodemmacho", name_jp: "小伝馬町", lines: [] },
    { slug: "akihabara", name_ko: "아키하바라", name_en: "Akihabara", name_jp: "秋葉原", lines: [] },
    { slug: "naka-okachimachi", name_ko: "나카오카치마치", name_en: "Naka-okachimachi", name_jp: "仲御徒町", lines: [] },
    { slug: "ueno", name_ko: "우에노", name_en: "Ueno", name_jp: "上野", lines: [] },
    { slug: "iriya", name_ko: "이리야", name_en: "Iriya", name_jp: "入谷", lines: [] },
    { slug: "minowa", name_ko: "미노와", name_en: "Minowa", name_jp: "三ノ輪", lines: [] },
    { slug: "minami-senju", name_ko: "미나미센주", name_en: "Minami-senju", name_jp: "南千住", lines: [] },
    { slug: "kita-senju", name_ko: "기타센주", name_en: "Kita-senju", name_jp: "北千住", lines: [] },
  ],
  tozai: [
    { slug: "nakano", name_ko: "나카노", name_en: "Nakano", name_jp: "中野", lines: [] },
    { slug: "ochiai", name_ko: "오치아이", name_en: "Ochiai", name_jp: "落合", lines: [] },
    { slug: "takadanobaba", name_ko: "다카다노바바", name_en: "Takadanobaba", name_jp: "高田馬場", lines: [] },
    { slug: "waseda", name_ko: "와세다", name_en: "Waseda", name_jp: "早稲田", lines: [] },
    { slug: "kagurazaka", name_ko: "가구라자카", name_en: "Kagurazaka", name_jp: "神楽坂", lines: [] },
    { slug: "iidabashi", name_ko: "이이다바시", name_en: "Iidabashi", name_jp: "飯田橋", lines: [] },
    { slug: "kudanshita", name_ko: "구단시타", name_en: "Kudanshita", name_jp: "九段下", lines: [] },
    { slug: "takebashi", name_ko: "다케바시", name_en: "Takebashi", name_jp: "竹橋", lines: [] },
    { slug: "otemachi", name_ko: "오테마치", name_en: "Otemachi", name_jp: "大手町", lines: [] },
    { slug: "nihombashi", name_ko: "니혼바시", name_en: "Nihombashi", name_jp: "日本橋", lines: [] },
    { slug: "kayabacho", name_ko: "가야바초", name_en: "Kayabacho", name_jp: "茅場町", lines: [] },
    { slug: "monzen-nakacho", name_ko: "몬젠나카초", name_en: "Monzen-nakacho", name_jp: "門前仲町", lines: [] },
    { slug: "kiba", name_ko: "기바", name_en: "Kiba", name_jp: "木場", lines: [] },
    { slug: "toyocho", name_ko: "도요초", name_en: "Toyocho", name_jp: "東陽町", lines: [] },
    { slug: "minami-sunamachi", name_ko: "미나미스나마치", name_en: "Minami-sunamachi", name_jp: "南砂町", lines: [] },
    { slug: "nishi-kasai", name_ko: "니시카사이", name_en: "Nishi-kasai", name_jp: "西葛西", lines: [] },
    { slug: "kasai", name_ko: "카사이", name_en: "Kasai", name_jp: "葛西", lines: [] },
    { slug: "urayasu", name_ko: "우라야스", name_en: "Urayasu", name_jp: "浦安", lines: [] },
    { slug: "minami-gyotoku", name_ko: "미나미교토쿠", name_en: "Minami-gyotoku", name_jp: "南行徳", lines: [] },
    { slug: "gyotoku", name_ko: "교토쿠", name_en: "Gyotoku", name_jp: "行徳", lines: [] },
    { slug: "myoden", name_ko: "묘덴", name_en: "Myoden", name_jp: "妙典", lines: [] },
    { slug: "baraki-nakayama", name_ko: "바라키나카야마", name_en: "Baraki-nakayama", name_jp: "原木中山", lines: [] },
    { slug: "nishi-funabashi", name_ko: "니시후나바시", name_en: "Nishi-funabashi", name_jp: "西船橋", lines: [] },
  ],
  chiyoda: [
    { slug: "yoyogi-uehara", name_ko: "요요기우에하라", name_en: "Yoyogi-uehara", name_jp: "代々木上原", lines: [] },
    { slug: "yoyogi-koen", name_ko: "요요기코엔", name_en: "Yoyogi-koen", name_jp: "代々木公園", lines: [] },
    { slug: "meiji-jingumae", name_ko: "메이지진구마에", name_en: "Meiji-jingumae", name_jp: "明治神宮前", lines: [] },
    { slug: "omotesando", name_ko: "오모테산도", name_en: "Omotesando", name_jp: "表参道", lines: [] },
    { slug: "nogizaka", name_ko: "노기자카", name_en: "Nogizaka", name_jp: "乃木坂", lines: [] },
    { slug: "akasaka", name_ko: "아카사카", name_en: "Akasaka", name_jp: "赤坂", lines: [] },
    { slug: "kokkai-gijidomae", name_ko: "국회의사당앞", name_en: "Kokkai-gijidomae", name_jp: "国会議事堂前", lines: [] },
    { slug: "kasumigaseki", name_ko: "가스미가세키", name_en: "Kasumigaseki", name_jp: "霞ケ関", lines: [] },
    { slug: "hibiya", name_ko: "히비야", name_en: "Hibiya", name_jp: "日比谷", lines: [] },
    { slug: "nijubashimae", name_ko: "니주바시마에", name_en: "Nijubashimae", name_jp: "二重橋前", lines: [] },
    { slug: "otemachi", name_ko: "오테마치", name_en: "Otemachi", name_jp: "大手町", lines: [] },
    { slug: "shin-ochanomizu", name_ko: "신오차노미즈", name_en: "Shin-ochanomizu", name_jp: "新御茶ノ水", lines: [] },
    { slug: "yushima", name_ko: "유시마", name_en: "Yushima", name_jp: "湯島", lines: [] },
    { slug: "nezu", name_ko: "네즈", name_en: "Nezu", name_jp: "根津", lines: [] },
    { slug: "sendagi", name_ko: "센다기", name_en: "Sendagi", name_jp: "千駄木", lines: [] },
    { slug: "nishi-nippori", name_ko: "니시닛포리", name_en: "Nishi-nippori", name_jp: "西日暮里", lines: [] },
    { slug: "machiya", name_ko: "마치야", name_en: "Machiya", name_jp: "町屋", lines: [] },
    { slug: "kita-senju", name_ko: "기타센주", name_en: "Kita-senju", name_jp: "北千住", lines: [] },
    { slug: "ayase", name_ko: "아야세", name_en: "Ayase", name_jp: "綾瀬", lines: [] },
    { slug: "kita-ayase", name_ko: "기타아야세", name_en: "Kita-ayase", name_jp: "北綾瀬", lines: [] },
  ],
  yurakucho: [
    { slug: "wakoshi", name_ko: "와코시", name_en: "Wakoshi", name_jp: "和光市", lines: [] },
    { slug: "chikatetsu-narimasu", name_ko: "지카테쓰나리마스", name_en: "Chikatetsu-narimasu", name_jp: "地下鉄成増", lines: [] },
    { slug: "chikatetsu-akatsuka", name_ko: "지카테쓰아카쓰카", name_en: "Chikatetsu-akatsuka", name_jp: "地下鉄赤塚", lines: [] },
    { slug: "heiwadai", name_ko: "헤이와다이", name_en: "Heiwadai", name_jp: "平和台", lines: [] },
    { slug: "hikawadai", name_ko: "히카와다이", name_en: "Hikawadai", name_jp: "氷川台", lines: [] },
    { slug: "kotake-mukaihara", name_ko: "고타케무카이하라", name_en: "Kotake-mukaihara", name_jp: "小竹向原", lines: [] },
    { slug: "senkawa", name_ko: "센카와", name_en: "Senkawa", name_jp: "千川", lines: [] },
    { slug: "kanamecho", name_ko: "가나메초", name_en: "Kanamecho", name_jp: "要町", lines: [] },
    { slug: "ikebukuro", name_ko: "이케부쿠로", name_en: "Ikebukuro", name_jp: "池袋", lines: [] },
    { slug: "higashi-ikebukuro", name_ko: "히가시이케부쿠로", name_en: "Higashi-ikebukuro", name_jp: "東池袋", lines: [] },
    { slug: "gokokuji", name_ko: "고코쿠지", name_en: "Gokokuji", name_jp: "護国寺", lines: [] },
    { slug: "edogawabashi", name_ko: "에도가와바시", name_en: "Edogawabashi", name_jp: "江戸川橋", lines: [] },
    { slug: "iidabashi", name_ko: "이이다바시", name_en: "Iidabashi", name_jp: "飯田橋", lines: [] },
    { slug: "ichigaya", name_ko: "이치가야", name_en: "Ichigaya", name_jp: "市ケ谷", lines: [] },
    { slug: "kojimachi", name_ko: "고지마치", name_en: "Kojimachi", name_jp: "麹町", lines: [] },
    { slug: "nagatacho", name_ko: "나가타초", name_en: "Nagatacho", name_jp: "永田町", lines: [] },
    { slug: "sakuradamon", name_ko: "사쿠라다몬", name_en: "Sakuradamon", name_jp: "桜田門", lines: [] },
    { slug: "yurakucho", name_ko: "유라쿠초", name_en: "Yurakucho", name_jp: "有楽町", lines: [] },
    { slug: "ginza-itchome", name_ko: "긴자잇초메", name_en: "Ginza-itchome", name_jp: "銀座一丁目", lines: [] },
    { slug: "shintomicho", name_ko: "신토미초", name_en: "Shintomicho", name_jp: "新富町", lines: [] },
    { slug: "tsukishima", name_ko: "쓰키시마", name_en: "Tsukishima", name_jp: "月島", lines: [] },
    { slug: "toyosu", name_ko: "도요스", name_en: "Toyosu", name_jp: "豊洲", lines: [] },
    { slug: "tatsumi", name_ko: "다쓰미", name_en: "Tatsumi", name_jp: "辰巳", lines: [] },
    { slug: "shin-kiba", name_ko: "신키바", name_en: "Shin-kiba", name_jp: "新木場", lines: [] },
  ],
  hanzomon: [
    { slug: "shibuya", name_ko: "시부야", name_en: "Shibuya", name_jp: "渋谷", lines: [] },
    { slug: "omotesando", name_ko: "오모테산도", name_en: "Omotesando", name_jp: "表参道", lines: [] },
    { slug: "aoyama-itchome", name_ko: "아오야마잇초메", name_en: "Aoyama-itchome", name_jp: "青山一丁目", lines: [] },
    { slug: "nagatacho", name_ko: "나가타초", name_en: "Nagatacho", name_jp: "永田町", lines: [] },
    { slug: "hanzomon", name_ko: "한조몬", name_en: "Hanzomon", name_jp: "半蔵門", lines: [] },
    { slug: "kudanshita", name_ko: "구단시타", name_en: "Kudanshita", name_jp: "九段下", lines: [] },
    { slug: "jimbocho", name_ko: "진보초", name_en: "Jimbocho", name_jp: "神保町", lines: [] },
    { slug: "otemachi", name_ko: "오테마치", name_en: "Otemachi", name_jp: "大手町", lines: [] },
    { slug: "mitsukoshimae", name_ko: "미쓰코시마에", name_en: "Mitsukoshimae", name_jp: "三越前", lines: [] },
    { slug: "suitengumae", name_ko: "스이텐구마에", name_en: "Suitengumae", name_jp: "水天宮前", lines: [] },
    { slug: "kiyosumi-shirakawa", name_ko: "기요스미시라카와", name_en: "Kiyosumi-shirakawa", name_jp: "清澄白河", lines: [] },
    { slug: "sumiyoshi", name_ko: "스미요시", name_en: "Sumiyoshi", name_jp: "住吉", lines: [] },
    { slug: "kinshicho", name_ko: "킨시초", name_en: "Kinshicho", name_jp: "錦糸町", lines: [] },
    { slug: "oshiage", name_ko: "오시아게", name_en: "Oshiage", name_jp: "押上", lines: [] },
  ],
  namboku: [
    { slug: "meguro", name_ko: "메구로", name_en: "Meguro", name_jp: "目黒", lines: [] },
    { slug: "shirokanedai", name_ko: "시로카네다이", name_en: "Shirokanedai", name_jp: "白金台", lines: [] },
    { slug: "shirokane-takanawa", name_ko: "시로카네타카나와", name_en: "Shirokane-takanawa", name_jp: "白金高輪", lines: [] },
    { slug: "azabu-juban", name_ko: "아자부주반", name_en: "Azabu-juban", name_jp: "麻布十番", lines: [] },
    { slug: "roppongi-itchome", name_ko: "롯폰기잇초메", name_en: "Roppongi-itchome", name_jp: "六本木一丁目", lines: [] },
    { slug: "tameike-sanno", name_ko: "다메이케산노", name_en: "Tameike-sanno", name_jp: "溜池山王", lines: [] },
    { slug: "kokkai-gijidomae", name_ko: "국회의사당앞", name_en: "Kokkai-gijidomae", name_jp: "国会議事堂前", lines: [] },
    { slug: "nagatacho", name_ko: "나가타초", name_en: "Nagatacho", name_jp: "永田町", lines: [] },
    { slug: "yotsuya", name_ko: "요쓰야", name_en: "Yotsuya", name_jp: "四ツ谷", lines: [] },
    { slug: "ichigaya", name_ko: "이치가야", name_en: "Ichigaya", name_jp: "市ケ谷", lines: [] },
    { slug: "iidabashi", name_ko: "이이다바시", name_en: "Iidabashi", name_jp: "飯田橋", lines: [] },
    { slug: "korakuen", name_ko: "고라쿠엔", name_en: "Korakuen", name_jp: "後楽園", lines: [] },
    { slug: "todaimae", name_ko: "도다이마에", name_en: "Todaimae", name_jp: "東大前", lines: [] },
    { slug: "hon-komagome", name_ko: "혼코마고메", name_en: "Hon-komagome", name_jp: "本駒込", lines: [] },
    { slug: "komagome", name_ko: "고마고메", name_en: "Komagome", name_jp: "駒込", lines: [] },
    { slug: "nishigahara", name_ko: "니시가하라", name_en: "Nishigahara", name_jp: "西ケ原", lines: [] },
    { slug: "oji", name_ko: "오지", name_en: "Oji", name_jp: "王子", lines: [] },
    { slug: "oji-kamiya", name_ko: "오지카미야", name_en: "Oji-kamiya", name_jp: "王子神谷", lines: [] },
    { slug: "shimo", name_ko: "시모", name_en: "Shimo", name_jp: "志茂", lines: [] },
    { slug: "akabane-iwabuchi", name_ko: "아카바네이와부치", name_en: "Akabane-iwabuchi", name_jp: "赤羽岩淵", lines: [] },
  ],
  fukutoshin: [
    { slug: "wakoshi", name_ko: "와코시", name_en: "Wakoshi", name_jp: "和光市", lines: [] },
    { slug: "chikatetsu-narimasu", name_ko: "지카테쓰나리마스", name_en: "Chikatetsu-narimasu", name_jp: "地下鉄成増", lines: [] },
    { slug: "chikatetsu-akatsuka", name_ko: "지카테쓰아카쓰카", name_en: "Chikatetsu-akatsuka", name_jp: "地下鉄赤塚", lines: [] },
    { slug: "heiwadai", name_ko: "헤이와다이", name_en: "Heiwadai", name_jp: "平和台", lines: [] },
    { slug: "hikawadai", name_ko: "히카와다이", name_en: "Hikawadai", name_jp: "氷川台", lines: [] },
    { slug: "kotake-mukaihara", name_ko: "고타케무카이하라", name_en: "Kotake-mukaihara", name_jp: "小竹向原", lines: [] },
    { slug: "senkawa", name_ko: "센카와", name_en: "Senkawa", name_jp: "千川", lines: [] },
    { slug: "kanamecho", name_ko: "가나메초", name_en: "Kanamecho", name_jp: "要町", lines: [] },
    { slug: "ikebukuro", name_ko: "이케부쿠로", name_en: "Ikebukuro", name_jp: "池袋", lines: [] },
    { slug: "zoshigaya", name_ko: "조시가야", name_en: "Zoshigaya", name_jp: "雑司が谷", lines: [] },
    { slug: "nishi-waseda", name_ko: "니시와세다", name_en: "Nishi-waseda", name_jp: "西早稲田", lines: [] },
    { slug: "higashi-shinjuku", name_ko: "히가시신주쿠", name_en: "Higashi-shinjuku", name_jp: "東新宿", lines: [] },
    { slug: "shinjuku-sanchome", name_ko: "신주쿠산초메", name_en: "Shinjuku-sanchome", name_jp: "新宿三丁目", lines: [] },
    { slug: "kita-sando", name_ko: "기타산도", name_en: "Kita-sando", name_jp: "北参道", lines: [] },
    { slug: "meiji-jingumae", name_ko: "메이지진구마에", name_en: "Meiji-jingumae", name_jp: "明治神宮前", lines: [] },
    { slug: "shibuya", name_ko: "시부야", name_en: "Shibuya", name_jp: "渋谷", lines: [] },
  ],
  asakusa: [
    { slug: "nishi-magome", name_ko: "니시마고메", name_en: "Nishi-magome", name_jp: "西馬込", lines: [] },
    { slug: "magome", name_ko: "마고메", name_en: "Magome", name_jp: "馬込", lines: [] },
    { slug: "nakanobu", name_ko: "나카노부", name_en: "Nakanobu", name_jp: "中延", lines: [] },
    { slug: "togoshi", name_ko: "도고시", name_en: "Togoshi", name_jp: "戸越", lines: [] },
    { slug: "gotanda", name_ko: "고탄다", name_en: "Gotanda", name_jp: "五反田", lines: [] },
    { slug: "takanawadai", name_ko: "다카나와다이", name_en: "Takanawadai", name_jp: "高輪台", lines: [] },
    { slug: "sengakuji", name_ko: "센가쿠지", name_en: "Sengakuji", name_jp: "泉岳寺", lines: [] },
    { slug: "mita", name_ko: "미타", name_en: "Mita", name_jp: "三田", lines: [] },
    { slug: "daimon", name_ko: "다이몬", name_en: "Daimon", name_jp: "大門", lines: [] },
    { slug: "shimbashi", name_ko: "신바시", name_en: "Shimbashi", name_jp: "新橋", lines: [] },
    { slug: "higashi-ginza", name_ko: "히가시긴자", name_en: "Higashi-ginza", name_jp: "東銀座", lines: [] },
    { slug: "takaracho", name_ko: "다카라초", name_en: "Takaracho", name_jp: "宝町", lines: [] },
    { slug: "nihombashi", name_ko: "니혼바시", name_en: "Nihombashi", name_jp: "日本橋", lines: [] },
    { slug: "ningyocho", name_ko: "닝요초", name_en: "Ningyocho", name_jp: "人形町", lines: [] },
    { slug: "higashi-nihombashi", name_ko: "히가시니혼바시", name_en: "Higashi-nihombashi", name_jp: "東日本橋", lines: [] },
    { slug: "asakusabashi", name_ko: "아사쿠사바시", name_en: "Asakusabashi", name_jp: "浅草橋", lines: [] },
    { slug: "kuramae", name_ko: "구라마에", name_en: "Kuramae", name_jp: "蔵前", lines: [] },
    { slug: "asakusa", name_ko: "아사쿠사", name_en: "Asakusa", name_jp: "浅草", lines: [] },
    { slug: "honjo-azumabashi", name_ko: "혼조아즈마바시", name_en: "Honjo-azumabashi", name_jp: "本所吾妻橋", lines: [] },
    { slug: "oshiage", name_ko: "오시아게", name_en: "Oshiage", name_jp: "押上", lines: [] },
  ],
  mita: [
    { slug: "meguro", name_ko: "메구로", name_en: "Meguro", name_jp: "目黒", lines: [] },
    { slug: "shirokanedai", name_ko: "시로카네다이", name_en: "Shirokanedai", name_jp: "白金台", lines: [] },
    { slug: "shirokane-takanawa", name_ko: "시로카네타카나와", name_en: "Shirokane-takanawa", name_jp: "白金高輪", lines: [] },
    { slug: "mita", name_ko: "미타", name_en: "Mita", name_jp: "三田", lines: [] },
    { slug: "shibakoen", name_ko: "시바코엔", name_en: "Shibakoen", name_jp: "芝公園", lines: [] },
    { slug: "onarimon", name_ko: "오나리몬", name_en: "Onarimon", name_jp: "御成門", lines: [] },
    { slug: "uchisaiwaicho", name_ko: "우치사이와이초", name_en: "Uchisaiwaicho", name_jp: "内幸町", lines: [] },
    { slug: "hibiya", name_ko: "히비야", name_en: "Hibiya", name_jp: "日比谷", lines: [] },
    { slug: "otemachi", name_ko: "오테마치", name_en: "Otemachi", name_jp: "大手町", lines: [] },
    { slug: "jimbocho", name_ko: "진보초", name_en: "Jimbocho", name_jp: "神保町", lines: [] },
    { slug: "suidobashi", name_ko: "스이도바시", name_en: "Suidobashi", name_jp: "水道橋", lines: [] },
    { slug: "kasuga", name_ko: "가스가", name_en: "Kasuga", name_jp: "春日", lines: [] },
    { slug: "hakusan", name_ko: "하쿠산", name_en: "Hakusan", name_jp: "白山", lines: [] },
    { slug: "sengoku", name_ko: "센고쿠", name_en: "Sengoku", name_jp: "千石", lines: [] },
    { slug: "sugamo", name_ko: "스가모", name_en: "Sugamo", name_jp: "巣鴨", lines: [] },
    { slug: "nishi-sugamo", name_ko: "니시스가모", name_en: "Nishi-sugamo", name_jp: "西巣鴨", lines: [] },
    { slug: "shin-itabashi", name_ko: "신이타바시", name_en: "Shin-itabashi", name_jp: "新板橋", lines: [] },
    { slug: "itabashikuyakushomae", name_ko: "이타바시쿠야쿠쇼마에", name_en: "Itabashikuyakushomae", name_jp: "板橋区役所前", lines: [] },
    { slug: "itabashihoncho", name_ko: "이타바시혼초", name_en: "Itabashihoncho", name_jp: "板橋本町", lines: [] },
    { slug: "motohasunuma", name_ko: "모토하스누마", name_en: "Motohasunuma", name_jp: "本蓮沼", lines: [] },
    { slug: "shimura-sakaue", name_ko: "시무라사카우에", name_en: "Shimura-sakaue", name_jp: "志村坂上", lines: [] },
    { slug: "shimura-sanchome", name_ko: "시무라산초메", name_en: "Shimura-sanchome", name_jp: "志村三丁目", lines: [] },
    { slug: "hasune", name_ko: "하스네", name_en: "Hasune", name_jp: "蓮根", lines: [] },
    { slug: "nishidai", name_ko: "니시다이", name_en: "Nishidai", name_jp: "西台", lines: [] },
    { slug: "takashimadaira", name_ko: "다카시마다이라", name_en: "Takashimadaira", name_jp: "高島平", lines: [] },
    { slug: "shin-takashimadaira", name_ko: "신타카시마다이라", name_en: "Shin-takashimadaira", name_jp: "新高島平", lines: [] },
    { slug: "nishi-takashimadaira", name_ko: "니시타카시마다이라", name_en: "Nishi-takashimadaira", name_jp: "西高島平", lines: [] },
  ],
  shinjuku: [
    { slug: "shinjuku", name_ko: "신주쿠", name_en: "Shinjuku", name_jp: "新宿", lines: [] },
    { slug: "shinjuku-sanchome", name_ko: "신주쿠산초메", name_en: "Shinjuku-sanchome", name_jp: "新宿三丁目", lines: [] },
    { slug: "akebonobashi", name_ko: "아케보노바시", name_en: "Akebonobashi", name_jp: "曙橋", lines: [] },
    { slug: "ichigaya", name_ko: "이치가야", name_en: "Ichigaya", name_jp: "市ケ谷", lines: [] },
    { slug: "kudanshita", name_ko: "구단시타", name_en: "Kudanshita", name_jp: "九段下", lines: [] },
    { slug: "jimbocho", name_ko: "진보초", name_en: "Jimbocho", name_jp: "神保町", lines: [] },
    { slug: "ogawamachi", name_ko: "오가와마치", name_en: "Ogawamachi", name_jp: "小川町", lines: [] },
    { slug: "iwamotocho", name_ko: "이와모토초", name_en: "Iwamotocho", name_jp: "岩本町", lines: [] },
    { slug: "bakuro-yokoyama", name_ko: "바쿠로요코야마", name_en: "Bakuro-yokoyama", name_jp: "馬喰横山", lines: [] },
    { slug: "hamacho", name_ko: "하마초", name_en: "Hamacho", name_jp: "浜町", lines: [] },
    { slug: "morishita", name_ko: "모리시타", name_en: "Morishita", name_jp: "森下", lines: [] },
    { slug: "kikukawa", name_ko: "기쿠카와", name_en: "Kikukawa", name_jp: "菊川", lines: [] },
    { slug: "sumiyoshi", name_ko: "스미요시", name_en: "Sumiyoshi", name_jp: "住吉", lines: [] },
    { slug: "nishi-ojima", name_ko: "니시오지마", name_en: "Nishi-ojima", name_jp: "西大島", lines: [] },
    { slug: "ojima", name_ko: "오지마", name_en: "Ojima", name_jp: "大島", lines: [] },
    { slug: "higashi-ojima", name_ko: "히가시오지마", name_en: "Higashi-ojima", name_jp: "東大島", lines: [] },
    { slug: "funabori", name_ko: "후나보리", name_en: "Funabori", name_jp: "船堀", lines: [] },
    { slug: "ichinoe", name_ko: "이치노에", name_en: "Ichinoe", name_jp: "一之江", lines: [] },
    { slug: "mizue", name_ko: "미즈에", name_en: "Mizue", name_jp: "瑞江", lines: [] },
    { slug: "shinozaki", name_ko: "시노자키", name_en: "Shinozaki", name_jp: "篠崎", lines: [] },
    { slug: "motoyawata", name_ko: "모토야와타", name_en: "Motoyawata", name_jp: "本八幡", lines: [] },
  ],
  oedo: [
    { slug: "tochomae", name_ko: "도초마에", name_en: "Tochomae", name_jp: "都庁前", lines: [] },
    { slug: "shinjuku-nishiguchi", name_ko: "신주쿠니시구치", name_en: "Shinjuku-nishiguchi", name_jp: "新宿西口", lines: [] },
    { slug: "higashi-shinjuku", name_ko: "히가시신주쿠", name_en: "Higashi-shinjuku", name_jp: "東新宿", lines: [] },
    { slug: "wakamatsu-kawada", name_ko: "와카마쓰카와다", name_en: "Wakamatsu-kawada", name_jp: "若松河田", lines: [] },
    { slug: "ushigome-yanagicho", name_ko: "우시고메야나기초", name_en: "Ushigome-yanagicho", name_jp: "牛込柳町", lines: [] },
    { slug: "ushigome-kagurazaka", name_ko: "우시고메가구라자카", name_en: "Ushigome-kagurazaka", name_jp: "牛込神楽坂", lines: [] },
    { slug: "iidabashi", name_ko: "이이다바시", name_en: "Iidabashi", name_jp: "飯田橋", lines: [] },
    { slug: "kasuga", name_ko: "가스가", name_en: "Kasuga", name_jp: "春日", lines: [] },
    { slug: "hongo-sanchome", name_ko: "혼고산초메", name_en: "Hongo-sanchome", name_jp: "本郷三丁目", lines: [] },
    { slug: "ueno-okachimachi", name_ko: "우에노오카치마치", name_en: "Ueno-okachimachi", name_jp: "上野御徒町", lines: [] },
    { slug: "shin-okachimachi", name_ko: "신오카치마치", name_en: "Shin-okachimachi", name_jp: "新御徒町", lines: [] },
    { slug: "kuramae", name_ko: "구라마에", name_en: "Kuramae", name_jp: "蔵前", lines: [] },
    { slug: "ryogoku", name_ko: "료고쿠", name_en: "Ryogoku", name_jp: "両国", lines: [] },
    { slug: "morishita", name_ko: "모리시타", name_en: "Morishita", name_jp: "森下", lines: [] },
    { slug: "kiyosumi-shirakawa", name_ko: "기요스미시라카와", name_en: "Kiyosumi-shirakawa", name_jp: "清澄白河", lines: [] },
    { slug: "monzen-nakacho", name_ko: "몬젠나카초", name_en: "Monzen-nakacho", name_jp: "門前仲町", lines: [] },
    { slug: "tsukishima", name_ko: "쓰키시마", name_en: "Tsukishima", name_jp: "月島", lines: [] },
    { slug: "kachidoki", name_ko: "가치도키", name_en: "Kachidoki", name_jp: "勝どき", lines: [] },
    { slug: "tsukijishijo", name_ko: "쓰키지시조", name_en: "Tsukijishijo", name_jp: "築地市場", lines: [] },
    { slug: "shiodome", name_ko: "시오도메", name_en: "Shiodome", name_jp: "汐留", lines: [] },
    { slug: "daimon", name_ko: "다이몬", name_en: "Daimon", name_jp: "大門", lines: [] },
    { slug: "akabanebashi", name_ko: "아카바네바시", name_en: "Akabanebashi", name_jp: "赤羽橋", lines: [] },
    { slug: "azabu-juban", name_ko: "아자부주반", name_en: "Azabu-juban", name_jp: "麻布十番", lines: [] },
    { slug: "roppongi", name_ko: "롯폰기", name_en: "Roppongi", name_jp: "六本木", lines: [] },
    { slug: "aoyama-itchome", name_ko: "아오야마잇초메", name_en: "Aoyama-itchome", name_jp: "青山一丁目", lines: [] },
    { slug: "kokuritsu-kyogijo", name_ko: "고쿠리쓰쿄기조", name_en: "Kokuritsu-kyogijo", name_jp: "国立競技場", lines: [] },
    { slug: "yoyogi", name_ko: "요요기", name_en: "Yoyogi", name_jp: "代々木", lines: [] },
    { slug: "shinjuku", name_ko: "신주쿠", name_en: "Shinjuku", name_jp: "新宿", lines: [] },
    { slug: "tochomae", name_ko: "도초마에", name_en: "Tochomae", name_jp: "都庁前", lines: [] },
    { slug: "nishi-shinjuku-gochome", name_ko: "니시신주쿠고초메", name_en: "Nishi-shinjuku-gochome", name_jp: "西新宿五丁目", lines: [] },
    { slug: "nakano-sakaue", name_ko: "나카노사카우에", name_en: "Nakano-sakaue", name_jp: "中野坂上", lines: [] },
    { slug: "higashi-nakano", name_ko: "히가시나카노", name_en: "Higashi-nakano", name_jp: "東中野", lines: [] },
    { slug: "nakai", name_ko: "나카이", name_en: "Nakai", name_jp: "中井", lines: [] },
    { slug: "ochiai-minami-nagasaki", name_ko: "오치아이미나미나가사키", name_en: "Ochiai-minami-nagasaki", name_jp: "落合南長崎", lines: [] },
    { slug: "shin-egota", name_ko: "신에고타", name_en: "Shin-egota", name_jp: "新江古田", lines: [] },
    { slug: "nerima", name_ko: "네리마", name_en: "Nerima", name_jp: "練馬", lines: [] },
    { slug: "toshimaen", name_ko: "도시마엔", name_en: "Toshimaen", name_jp: "豊島園", lines: [] },
    { slug: "nerima-kasugacho", name_ko: "네리마카스가초", name_en: "Nerima-kasugacho", name_jp: "練馬春日町", lines: [] },
    { slug: "hikarigaoka", name_ko: "히카리가오카", name_en: "Hikarigaoka", name_jp: "光が丘", lines: [] },
  ],
  jr_yamanote: [
    { slug: "tokyo", name_ko: "도쿄", name_en: "Tokyo", name_jp: "東京", lines: [] },
    { slug: "kanda", name_ko: "칸다", name_en: "Kanda", name_jp: "神田", lines: [] },
    { slug: "akihabara", name_ko: "아키하바라", name_en: "Akihabara", name_jp: "秋葉原", lines: [] },
    { slug: "okachimachi", name_ko: "오카치마치", name_en: "Okachimachi", name_jp: "御徒町", lines: [] },
    { slug: "ueno", name_ko: "우에노", name_en: "Ueno", name_jp: "上野", lines: [] },
    { slug: "uguisudani", name_ko: "우구이스다니", name_en: "Uguisudani", name_jp: "鶯谷", lines: [] },
    { slug: "nippori", name_ko: "닛포리", name_en: "Nippori", name_jp: "日暮里", lines: [] },
    { slug: "nishi-nippori", name_ko: "니시닛포리", name_en: "Nishi-nippori", name_jp: "西日暮里", lines: [] },
    { slug: "tabata", name_ko: "다바타", name_en: "Tabata", name_jp: "田端", lines: [] },
    { slug: "komagome", name_ko: "고마고메", name_en: "Komagome", name_jp: "駒込", lines: [] },
    { slug: "sugamo", name_ko: "스가모", name_en: "Sugamo", name_jp: "巣鴨", lines: [] },
    { slug: "otsuka", name_ko: "오쓰카", name_en: "Otsuka", name_jp: "大塚", lines: [] },
    { slug: "ikebukuro", name_ko: "이케부쿠로", name_en: "Ikebukuro", name_jp: "池袋", lines: [] },
    { slug: "mejiro", name_ko: "메지로", name_en: "Mejiro", name_jp: "目白", lines: [] },
    { slug: "takadanobaba", name_ko: "다카다노바바", name_en: "Takadanobaba", name_jp: "高田馬場", lines: [] },
    { slug: "shin-okubo", name_ko: "신오쿠보", name_en: "Shin-okubo", name_jp: "新大久保", lines: [] },
    { slug: "shinjuku", name_ko: "신주쿠", name_en: "Shinjuku", name_jp: "新宿", lines: [] },
    { slug: "yoyogi", name_ko: "요요기", name_en: "Yoyogi", name_jp: "代々木", lines: [] },
    { slug: "harajuku", name_ko: "하라주쿠", name_en: "Harajuku", name_jp: "原宿", lines: [] },
    { slug: "shibuya", name_ko: "시부야", name_en: "Shibuya", name_jp: "渋谷", lines: [] },
    { slug: "ebisu", name_ko: "에비스", name_en: "Ebisu", name_jp: "恵比寿", lines: [] },
    { slug: "meguro", name_ko: "메구로", name_en: "Meguro", name_jp: "目黒", lines: [] },
    { slug: "gotanda", name_ko: "고탄다", name_en: "Gotanda", name_jp: "五反田", lines: [] },
    { slug: "osaki", name_ko: "오사키", name_en: "Osaki", name_jp: "大崎", lines: [] },
    { slug: "shinagawa", name_ko: "시나가와", name_en: "Shinagawa", name_jp: "品川", lines: [] },
    { slug: "takanawa-gateway", name_ko: "다카나와게이트웨이", name_en: "Takanawa-gateway", name_jp: "高輪ゲートウェイ", lines: [] },
    { slug: "tamachi", name_ko: "다마치", name_en: "Tamachi", name_jp: "田町", lines: [] },
    { slug: "hamamatsucho", name_ko: "하마마쓰초", name_en: "Hamamatsucho", name_jp: "浜松町", lines: [] },
    { slug: "shimbashi", name_ko: "신바시", name_en: "Shimbashi", name_jp: "新橋", lines: [] },
    { slug: "yurakucho", name_ko: "유라쿠초", name_en: "Yurakucho", name_jp: "有楽町", lines: [] },
    { slug: "tokyo", name_ko: "도쿄", name_en: "Tokyo", name_jp: "東京", lines: [] },
  ],
  jr_chuo: [
    { slug: "tokyo", name_ko: "도쿄", name_en: "Tokyo", name_jp: "東京", lines: [] },
    { slug: "kanda", name_ko: "칸다", name_en: "Kanda", name_jp: "神田", lines: [] },
    { slug: "ochanomizu", name_ko: "오차노미즈", name_en: "Ochanomizu", name_jp: "御茶ノ水", lines: [] },
    { slug: "yotsuya", name_ko: "요쓰야", name_en: "Yotsuya", name_jp: "四ツ谷", lines: [] },
    { slug: "shinjuku", name_ko: "신주쿠", name_en: "Shinjuku", name_jp: "新宿", lines: [] },
    { slug: "nakano", name_ko: "나카노", name_en: "Nakano", name_jp: "中野", lines: [] },
    { slug: "koenji", name_ko: "코엔지", name_en: "Koenji", name_jp: "高円寺", lines: [] },
    { slug: "kichijoji", name_ko: "기치조지", name_en: "Kichijoji", name_jp: "吉祥寺", lines: [] },
  ],
  jr_sobu: [
    { slug: "shinjuku", name_ko: "신주쿠", name_en: "Shinjuku", name_jp: "新宿", lines: [] },
    { slug: "yoyogi", name_ko: "요요기", name_en: "Yoyogi", name_jp: "代々木", lines: [] },
    { slug: "sendagaya", name_ko: "센다가야", name_en: "Sendagaya", name_jp: "千駄ケ谷", lines: [] },
    { slug: "shinano-machi", name_ko: "시나노마치", name_en: "Shinano-machi", name_jp: "信濃町", lines: [] },
    { slug: "yotsuya", name_ko: "요쓰야", name_en: "Yotsuya", name_jp: "四ツ谷", lines: [] },
    { slug: "ichigaya", name_ko: "이치가야", name_en: "Ichigaya", name_jp: "市ケ谷", lines: [] },
    { slug: "iidabashi", name_ko: "이다바시", name_en: "Iidabashi", name_jp: "飯田橋", lines: [] },
    { slug: "suidobashi", name_ko: "스이도바시", name_en: "Suidobashi", name_jp: "水道橋", lines: [] },
    { slug: "ochanomizu", name_ko: "오차노미즈", name_en: "Ochanomizu", name_jp: "御茶ノ水", lines: [] },
    { slug: "akihabara", name_ko: "아키하바라", name_en: "Akihabara", name_jp: "秋葉原", lines: [] },
    { slug: "asakuabashi", name_ko: "아사쿠사바시", name_en: "Asakusabashi", name_jp: "浅草橋", lines: [] },
    { slug: "ryogoku", name_ko: "료고쿠", name_en: "Ryogoku", name_jp: "両国", lines: [] },
  ],
  yurikamome: [
    { slug: "shimbashi", name_ko: "신바시", name_en: "Shimbashi", name_jp: "新橋", lines: [] },
    { slug: "shiodome", name_ko: "시오도메", name_en: "Shiodome", name_jp: "汐留", lines: [] },
    { slug: "odaiba-kaihinkoen", name_ko: "오다이바카이힌코엔", name_en: "Odaiba-kaihinkoen", name_jp: "お台場海浜公園", lines: [] },
    { slug: "daiba", name_ko: "다이바", name_en: "Daiba", name_jp: "台場", lines: [] },
    { slug: "tokyo-teleport", name_ko: "도쿄텔레포트", name_en: "Tokyo-teleport", name_jp: "東京テレポート", lines: [] },
    { slug: "toyosu", name_ko: "도요스", name_en: "Toyosu", name_jp: "豊洲", lines: [] },
  ],
  inokashira: [
    { slug: "shibuya", name_ko: "시부야", name_en: "Shibuya", name_jp: "渋谷", lines: [] },
    { slug: "shinsen", name_ko: "신센", name_en: "Shinsen", name_jp: "神泉", lines: [] },
    { slug: "shimokitazawa", name_ko: "시모키타자와", name_en: "Shimokitazawa", name_jp: "下北沢", lines: [] },
    { slug: "meidaimae", name_ko: "메이다이마에", name_en: "Meidaimae", name_jp: "明大前", lines: [] },
    { slug: "kichijoji", name_ko: "기치조지", name_en: "Kichijoji", name_jp: "吉祥寺", lines: [] },
  ],
  toyoko: [
    { slug: "shibuya", name_ko: "시부야", name_en: "Shibuya", name_jp: "渋谷", lines: [] },
    { slug: "daikanyama", name_ko: "다이칸야마", name_en: "Daikanyama", name_jp: "代官山", lines: [] },
    { slug: "naka-meguro", name_ko: "나카메구로", name_en: "Naka-meguro", name_jp: "中目黒", lines: [] },
    { slug: "yutenji", name_ko: "유텐지", name_en: "Yutenji", name_jp: "祐天寺", lines: [] },
    { slug: "gakugeidaigaku", name_ko: "가쿠게이다이가쿠", name_en: "Gakugeidaigaku", name_jp: "学芸大学", lines: [] },
    { slug: "jiyugaoka", name_ko: "지유가오카", name_en: "Jiyugaoka", name_jp: "自由が丘", lines: [] },
    { slug: "yokohama", name_ko: "요코하마", name_en: "Yokohama", name_jp: "横浜", lines: [] },
  ]
};

const EXTERNAL_STATIONS: Record<string, StationData> = {
  // 공항 방면
  "narita-airport": { slug: "narita-airport", name_ko: "나리타 공항", name_jp: "成田空港", name_en: "Narita Airport", lines: ["nex", "skyliner", "keisei_skyaccess"] },
  "haneda-airport": { slug: "haneda-airport", name_ko: "하네다 공항", name_jp: "羽田空港", name_en: "Haneda Airport", lines: ["keikyu", "monorail"] },
  
  // 환승 연결용 추가 맵핑
  "oshiage": { slug: "oshiage", name_ko: "오시아게", name_jp: "押上", name_en: "Oshiage", lines: ["hanzomon", "asakusa", "keisei_skyaccess"] },
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

  { from: "narita-airport", to: "oshiage", line: "keisei_skyaccess", time: 47 },
  
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
  { from: "shinjuku", to: "shinjuku-nishiguchi", line: "walk", time: 5 },
  // --- 이름이 다르지만 지하 통로로 연결된 역 ---
  { from: "awajicho", to: "ogawamachi", line: "walk", time: 3 },
  { from: "shin-ochanomizu", to: "ogawamachi", line: "walk", time: 5 },
  { from: "higashi-nihombashi", to: "bakuro-yokoyama", line: "walk", time: 3 },
  { from: "kasuga", to: "korakuen", line: "walk", time: 5 },
  { from: "iwamotocho", to: "akihabara", line: "walk", time: 5 },
  { from: "shin-okachimachi", to: "okachimachi", line: "walk", time: 5 },
  { from: "nagatacho", to: "akasaka-mitsuke", line: "walk", time: 3 },
  { from: "toranomon", to: "toranomon-hills", line: "walk", time: 5 },
  { from: "hibiya", to: "yurakucho", line: "walk", time: 3 },
  // --- 주요 터미널 내부 도보 환승 (새로 추가된 사철 노선 연결용) ---
  { from: "shinjuku", to: "yoyogi", line: "walk", time: 10 },
  { from: "shibuya", to: "shinsen", line: "walk", time: 10 },
  { from: "shibuya", to: "daikanyama", line: "walk", time: 15 }
];

SPECIAL_CONNECTIONS.forEach((conn) => {
  compiledConnections.push(conn);
});

export const METRO_STATIONS: Record<string, StationData> = compiledStations;
export const METRO_CONNECTIONS: Connection[] = compiledConnections;
