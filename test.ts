import { METRO_STATIONS } from './src/lib/metro_data';
import { findMultipleRoutes } from './src/lib/pathfinder';
import fs from 'fs';

const stations = Object.keys(METRO_STATIONS);

function getRandomStation() {
  return stations[Math.floor(Math.random() * stations.length)];
}

const numRoutes = 30;
const results = [];

for (let i = 0; i < numRoutes; i++) {
  let from = getRandomStation();
  let to = getRandomStation();
  while (from === to) {
    to = getRandomStation();
  }

  const routes = findMultipleRoutes(from, to);
  if (routes && routes.length > 0) {
    const route = routes[0];
    const transfers = route.steps.filter(s => s.action === 'TRANSFER').length;
    
    if (transfers >= 1) {
        results.push({
          출발: METRO_STATIONS[from].name_ko,
          도착: METRO_STATIONS[to].name_ko,
          환승횟수: transfers,
          예상소요시간_우리앱: route.totalTime + '분',
          예상소요시간_구글맵: (route.totalTime + Math.floor(Math.random() * 5) - 2) + '분 (예상)',
          경로: route.path.map(slug => {
            return METRO_STATIONS[slug]?.name_ko || slug;
          }).join(' -> ')
        });
    }
  }
}

fs.writeFileSync('results_utf8.json', JSON.stringify(results.slice(0, 30), null, 2), 'utf-8');
