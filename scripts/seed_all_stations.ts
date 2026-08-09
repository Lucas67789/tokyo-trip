import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { METRO_STATIONS } from '../src/lib/metro_data';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAllStations() {
  console.log("Starting full stations database sync...");

  const city_id = 'c1000000-0000-0000-0000-000000000001'; // 도쿄 도시 ID

  const stationsToInsert = Object.entries(METRO_STATIONS).map(([key, station]) => {
    // 자연스러운 한글 역명 이름 지정 규칙
    let displayName = station.name_ko;
    if (!displayName.endsWith('역') && !displayName.endsWith('공항') && !displayName.endsWith('시티')) {
      displayName = displayName + '역';
    }

    return {
      city_id,
      slug: station.slug,
      name_ko: displayName,
      name_en: station.name_en,
      name_jp: station.name_jp,
      description: `${displayName} 인근의 교통 정보 및 추천 호텔/숙소 목록입니다. 도쿄 메트로를 이용해 가장 빠른 길을 탐색해 보세요.`
    };
  });

  console.log(`Prepared ${stationsToInsert.length} stations for upsert.`);

  const { data, error } = await supabase
    .from('stations')
    .upsert(stationsToInsert, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error("Error upserting stations:", error);
    process.exit(1);
  }

  console.log("Successfully synced all stations into Supabase database!");
  console.log("Current DB Stations:");
  console.table(data.map(s => ({ id: s.id, name_ko: s.name_ko, slug: s.slug })));
}

seedAllStations();
