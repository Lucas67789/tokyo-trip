export function romanizeHangul(text: string): string {
  // 고정 매핑 딕셔너리 (호텔, 패스, 역, 명소 등 자주 쓰이는 단어)
  const dictionary: Record<string, string> = {
    "온야도": "onyado", "노노": "nono", "신주쿠": "shinjuku", "내추럴": "natural", "핫": "hot",
    "스프링": "spring", "호텔": "hotel", "게이오": "keio", "프린스": "prince", 
    "도쿄": "tokyo", "도큐": "tokyu", "엑셀": "excel", "시부야": "shibuya", 
    "오모테산도": "omotesando", "이케부쿠로": "ikebukuro", "우에노": "ueno", "아사쿠사": "asakusa",
    "뉴": "new", "한큐": "hankyu", "리가": "rihga", "로얄": "royal", "프리미어": "premier",
    "도미": "dormy", "인": "inn", "스파": "spa", "힐튼": "hilton",
    "아파": "apa", "몬테": "monte", "에르망": "herman", "그레이서리": "gracery",
    "일": "il", "그란": "gran", "센트라": "centara", "그랜드": "grand", "하얏트": "hyatt",
    "메트로": "metro", "더": "the", "플라자": "plaza", "웨스틴": "westin", 
    "인터컨티넨탈": "intercontinental", "쉐라톤": "sheraton", "크라운": "crowne", 
    "디즈니": "disney", "포트": "port", "비타": "vita", "타워": "tower", 
    "싱굴라리": "singulari", "케한": "keihan",
    
    // 패스 관련
    "스카이라이너": "skyliner", "특급": "express", "열차": "train", "나리타": "narita",
    "익스프레스": "express", "하네다": "haneda", "공항": "airport", "리무진": "limousine",
    "버스": "bus", "패스": "pass", "스이카": "suica", "파스모": "pasmo", "지하철": "subway", 
    "메트로패스": "metro-pass", "미니": "mini", "와이드": "wide", "티켓": "ticket",
    "투어리스트": "tourist", "스루": "thru"
  };

  let result = text;
  
  // 긴 단어부터 매핑 치환 수행
  const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const regex = new RegExp(key, "g");
    result = result.replace(regex, " " + dictionary[key] + " ");
  }

  // 1글자 단위 자모음 결합 로마자 변환 (딕셔너리 예외 단어 대응용)
  const cho = [
    "g", "kk", "n", "d", "tt", "r", "m", "b", "pp", 
    "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"
  ];
  const jung = [
    "a", "ae", "ya", "yae", "eo", "e", "ye", "ye", "o", "wa", 
    "wae", "oe", "yo", "u", "weo", "we", "wi", "yu", "eu", "ui", "i"
  ];
  const jong = [
    "", "g", "kk", "gs", "n", "nj", "nh", "d", "l", "lg", 
    "lm", "lb", "ls", "lt", "lpe", "lh", "m", "b", "bs", 
    "s", "ss", "ng", "j", "ch", "k", "t", "p", "h"
  ];

  let romanized = "";
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    const code = char.charCodeAt(0);
    
    // 한글 유니코드 판별 및 파싱
    if (code >= 0xac00 && code <= 0xd7a3) {
      const uniVal = code - 0xac00;
      const choIndex = Math.floor(uniVal / 588);
      const jungIndex = Math.floor((uniVal % 588) / 28);
      const jongIndex = uniVal % 28;
      
      const syllable = cho[choIndex] + jung[jungIndex] + jong[jongIndex];
      romanized += syllable;
    } else {
      romanized += char;
    }
  }

  // 소문자 변환, 특수문자 제거, 띄어쓰기는 하이픈(-)으로 연결 처리
  return romanized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
