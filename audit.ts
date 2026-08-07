import { METRO_STATIONS, METRO_CONNECTIONS, METRO_LINES } from './src/lib/metro_data';
import { findMultipleRoutes } from './src/lib/pathfinder';

console.log('=== 1. STATION COUNT PER LINE ===');
const lineStationCounts: Record<string, number> = {};
for (const [slug, st] of Object.entries(METRO_STATIONS)) {
  for (const line of st.lines) {
    lineStationCounts[line] = (lineStationCounts[line] || 0) + 1;
  }
}

// Real station counts (Wikipedia)
const expected: Record<string, [number, string]> = {
  ginza:      [19, '긴자선'],
  marunouchi: [25, '마루노우치선 (본선만)'],  // 25 본선, 3 지선 = 28
  hibiya:     [22, '히비야선'],  // 나카메구로~기타센주 = 22 (도라노몬힐즈 포함하면 22)
  tozai:      [23, '도자이선'],
  chiyoda:    [20, '지요다선'],
  yurakucho:  [24, '유라쿠초선'],
  hanzomon:   [14, '한조몬선'],
  namboku:    [19, '난보쿠선'],  // 메구로 포함 시 19 (공식: 목흑~아카바네이와부치)
  fukutoshin: [16, '후쿠토신선'],
  asakusa:    [20, '아사쿠사선'],
  mita:       [27, '미타선'],
  shinjuku:   [21, '신주쿠선'],
  oedo:       [38, '오에도선'],  // 순환부+방사부
  jr_yamanote:[30, 'JR 야마노테선'],
};

for (const [lineId, [exp, name]] of Object.entries(expected)) {
  const actual = lineStationCounts[lineId] || 0;
  const status = actual >= exp ? '✅' : '❌ MISSING';
  console.log(`${status} ${name} (${lineId}): 데이터=${actual}개 / 실제=${exp}개`);
}

console.log('\n=== 2. TOTAL UNIQUE STATIONS ===');
console.log(`총 고유 역 수: ${Object.keys(METRO_STATIONS).length}`);

console.log('\n=== 3. CONNECTIONS CHECK ===');
console.log(`총 엣지(연결) 수: ${METRO_CONNECTIONS.length}`);

console.log('\n=== 4. MISSING WALK CONNECTIONS (known issues) ===');
// Check critical walk connections that should exist
const criticalWalks = [
  ['awajicho', 'ogawamachi', '아와지초 ↔ 오가와마치 (마루노우치선 ↔ 신주쿠선)'],
  ['shin-ochanomizu', 'ogawamachi', '신오차노미즈 ↔ 오가와마치 (지요다선 ↔ 신주쿠선)'],
  ['higashi-nihombashi', 'bakuro-yokoyama', '히가시니혼바시 ↔ 바쿠로요코야마 (아사쿠사선 ↔ 신주쿠선)'],
  ['kasuga', 'korakuen', '가스가 ↔ 고라쿠엔 (미타선/오에도선 ↔ 마루노우치선/난보쿠선)'],
  ['iwamotocho', 'akihabara', '이와모토초 ↔ 아키하바라 (신주쿠선 ↔ 히비야선/JR)'],
  ['shin-okachimachi', 'okachimachi', '신오카치마치 ↔ 오카치마치 (오에도선 ↔ JR)'],
  ['sengakuji', 'takanawadai', '센가쿠지 ↔ 다카나와다이'],
  ['nagatacho', 'akasaka-mitsuke', '나가타초 ↔ 아카사카미쓰케 (한조몬선 ↔ 긴자선/마루노우치선)'],
  ['toranomon', 'toranomon-hills', '도라노몬 ↔ 도라노몬힐즈 (긴자선 ↔ 히비야선)'],
  ['hibiya', 'yurakucho', '히비야 ↔ 유라쿠초 (지요다선/히비야선/미타선 ↔ 유라쿠초선/JR)'],
];
for (const [from, to, desc] of criticalWalks) {
  const exists = METRO_CONNECTIONS.some(c =>
    c.line === 'walk' &&
    ((c.from === from && c.to === to) || (c.from === to && c.to === from))
  );
  // Also check if they share a slug (same station)
  const sameStation = METRO_STATIONS[from] && METRO_STATIONS[to] &&
    METRO_STATIONS[from].lines.some(l => METRO_STATIONS[to].lines.includes(l));
  const status = exists ? '✅' : (sameStation ? '⚠️ Same slug, no walk needed' : '❌ MISSING');
  console.log(`${status} ${desc}`);
}

console.log('\n=== 5. PATHFINDER TEST (complex routes) ===');
const testCases = [
  ['shibuya', 'asakusa', '시부야 → 아사쿠사'],
  ['shinjuku', 'tokyo', '신주쿠 → 도쿄'],
  ['ikebukuro', 'roppongi', '이케부쿠로 → 롯폰기'],
  ['naka-meguro', 'kita-senju', '나카메구로 → 기타센주 (히비야선 직행)'],
  ['ogikubo', 'ikebukuro', '오기쿠보 → 이케부쿠로 (마루노우치선 직행)'],
  ['wakoshi', 'shin-kiba', '와코시 → 신키바 (유라쿠초선 직행)'],
  ['nishi-takashimadaira', 'meguro', '니시타카시마다이라 → 메구로 (미타선 직행)'],
  ['hikarigaoka', 'shibuya', '히카리가오카 → 시부야 (오에도선→기타)'],
  ['motoyawata', 'shinjuku', '모토야와타 → 신주쿠 (신주쿠선 직행)'],
];

for (const [from, to, desc] of testCases) {
  const routes = findMultipleRoutes(from, to);
  if (routes.length === 0) {
    console.log(`❌ ${desc}: NO ROUTE FOUND`);
  } else {
    const r = routes[0];
    const transferCount = r.steps.filter(s => s.action === 'TRANSFER').length;
    const stationNames = r.path.map(s => METRO_STATIONS[s]?.name_ko || s).join(' → ');
    console.log(`✅ ${desc}: ${r.totalTime}분, 환승 ${transferCount}회, 루트 ${routes.length}개`);
    console.log(`   경로: ${stationNames}`);
  }
}

console.log('\n=== 6. OEDO LINE LOOP CHECK ===');
// Oedo line is a loop. Check that tochomae appears twice and connections wrap around properly
const oedoStations = Object.entries(METRO_STATIONS).filter(([_, s]) => s.lines.includes('oedo'));
console.log(`오에도선 역 수: ${oedoStations.length}`);
// Check if tochomae→shinjuku-nishiguchi and hikarigaoka→tochomae exist
const oedoConns = METRO_CONNECTIONS.filter(c => c.line === 'oedo');
console.log(`오에도선 연결 수: ${oedoConns.length}`);
// Verify the loop: tochomae should connect to both shinjuku-nishiguchi AND nishi-shinjuku-gochome
const tocho_conn_1 = oedoConns.some(c => 
  (c.from === 'tochomae' && c.to === 'shinjuku-nishiguchi') || 
  (c.to === 'tochomae' && c.from === 'shinjuku-nishiguchi')
);
const tocho_conn_2 = oedoConns.some(c =>
  (c.from === 'tochomae' && c.to === 'nishi-shinjuku-gochome') ||
  (c.to === 'tochomae' && c.from === 'nishi-shinjuku-gochome')
);
console.log(`도초마에 → 신주쿠니시구치: ${tocho_conn_1 ? '✅' : '❌'}`);
console.log(`도초마에 → 니시신주쿠고초메: ${tocho_conn_2 ? '✅' : '❌'}`);

console.log('\n=== 7. JR YAMANOTE LOOP CHECK ===');
const jrConns = METRO_CONNECTIONS.filter(c => c.line === 'jr_yamanote');
console.log(`야마노테선 연결 수: ${jrConns.length}`);
// Check if yurakucho→tokyo exists (closing the loop)
const loopClosed = jrConns.some(c =>
  (c.from === 'yurakucho' && c.to === 'tokyo') ||
  (c.to === 'yurakucho' && c.from === 'tokyo')
);
console.log(`순환 연결 (유라쿠초→도쿄): ${loopClosed ? '✅' : '❌'}`);
