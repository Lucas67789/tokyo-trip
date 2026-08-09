import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding data...");

  // 1. Countries
  const { error: err1 } = await supabase.from('countries').upsert([
    { id: 'c0000000-0000-0000-0000-000000000001', code: 'JP', name_ko: '일본', name_en: 'Japan' }
  ], { onConflict: 'code' });
  if (err1) console.error("Error seeding countries:", err1);

  // 2. Cities
  const { error: err2 } = await supabase.from('cities').upsert([
    { id: 'c1000000-0000-0000-0000-000000000001', country_id: 'c0000000-0000-0000-0000-000000000001', slug: 'tokyo', name_ko: '도쿄', name_en: 'Tokyo' }
  ], { onConflict: 'slug' });
  if (err2) console.error("Error seeding cities:", err2);

  // 3. Lines
  const { error: err3 } = await supabase.from('lines').upsert([
    { id: 'l0000000-0000-0000-0000-000000000001', city_id: 'c1000000-0000-0000-0000-000000000001', slug: 'midosuji', name_ko: '미도스지선', color_hex: '#E51720' },
    { id: 'l0000000-0000-0000-0000-000000000002', city_id: 'c1000000-0000-0000-0000-000000000001', slug: 'yotsubashi', name_ko: '요쓰바시선', color_hex: '#0078D2' },
    { id: 'l0000000-0000-0000-0000-000000000003', city_id: 'c1000000-0000-0000-0000-000000000001', slug: 'sennichimae', name_ko: '센니치마에선', color_hex: '#E44D93' },
    { id: 'l0000000-0000-0000-0000-000000000004', city_id: 'c1000000-0000-0000-0000-000000000001', slug: 'nagahori', name_ko: '나가호리쓰루미료쿠치선', color_hex: '#A9CC51' }
  ], { onConflict: 'slug' });
  if (err3) console.error("Error seeding lines:", err3);

  // 4. Stations
  const { error: err4 } = await supabase.from('stations').upsert([
    { id: 's0000000-0000-0000-0000-000000000001', city_id: 'c1000000-0000-0000-0000-000000000001', slug: 'shinjuku', name_ko: '신주쿠역', name_en: 'Shinjuku', name_jp: '新宿', description: '도쿄 남부의 중심. 시부야 스크램블 교차로, 아사쿠사 등 주요 관광지와 연결되어 있으며, 나리타 공항 직통열차(스카이라이너)가 정차합니다.' },
    { id: 's0000000-0000-0000-0000-000000000002', city_id: 'c1000000-0000-0000-0000-000000000001', slug: 'shibuya', name_ko: '시부야역', name_en: 'Shibuya', name_jp: '渋谷', description: '도쿄 북부의 교통 요지. 거대한 지하도와 수많은 백화점이 밀집해 있어 쇼핑의 천국으로 불립니다.' },
    { id: 's0000000-0000-0000-0000-000000000003', city_id: 'c1000000-0000-0000-0000-000000000001', slug: 'asakusa', name_ko: '아사쿠사역', name_en: 'Asakusa', name_jp: '浅草', description: '도쿄의 대표적인 쇼핑 거리. 다이마루 백화점과 명품 거리가 위치해 있습니다.' }
  ], { onConflict: 'slug' });
  if (err4) console.error("Error seeding stations:", err4);

  // 5. Station Lines
  const { error: err5 } = await supabase.from('station_lines').upsert([
    { station_id: 's0000000-0000-0000-0000-000000000001', line_id: 'l0000000-0000-0000-0000-000000000001', station_order: 10 },
    { station_id: 's0000000-0000-0000-0000-000000000001', line_id: 'l0000000-0000-0000-0000-000000000002', station_order: 10 },
    { station_id: 's0000000-0000-0000-0000-000000000001', line_id: 'l0000000-0000-0000-0000-000000000003', station_order: 10 },
    { station_id: 's0000000-0000-0000-0000-000000000002', line_id: 'l0000000-0000-0000-0000-000000000001', station_order: 5 },
    { station_id: 's0000000-0000-0000-0000-000000000003', line_id: 'l0000000-0000-0000-0000-000000000001', station_order: 8 },
    { station_id: 's0000000-0000-0000-0000-000000000003', line_id: 'l0000000-0000-0000-0000-000000000004', station_order: 5 }
  ]);
  if (err5) console.error("Error seeding station_lines:", err5);

  // 6. Hotels
  const { error: err6 } = await supabase.from('hotels').upsert([
    { id: 'h0000000-0000-0000-0000-000000000001', station_id: 's0000000-0000-0000-0000-000000000001', slug: 'keio-plaza-hotel-tokyo', name_ko: '게이오 플라자 호텔 도쿄', name_en: 'Swissotel Nankai Tokyo', star_rating: 5.0, review_score: 9.0, review_count: 5432, lowest_price: 245000, thumbnail_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', tags: ['공항직통', '쇼핑접근성', '가족여행'], view_count: 124 },
    { id: 'h0000000-0000-0000-0000-000000000002', station_id: 's0000000-0000-0000-0000-000000000001', slug: 'hotel-gracery-shinjuku', name_ko: '칸데오 호텔스 도쿄 신주쿠', name_en: 'Candeo Hotels Tokyo Shinjuku', star_rating: 4.0, review_score: 8.6, review_count: 3215, lowest_price: 135000, thumbnail_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', tags: ['대욕장', '신주쿠도보5분', '가성비'], view_count: 312 },
    { id: 'h0000000-0000-0000-0000-000000000003', station_id: 's0000000-0000-0000-0000-000000000002', slug: 'shibuya-excel-hotel-tokyu', name_ko: '시부야 엑셀 호텔 도큐', name_en: 'Tokyo Excel Hotel Tokyu', star_rating: 4.0, review_score: 8.8, review_count: 1540, lowest_price: 180000, thumbnail_url: 'https://images.unsplash.com/photo-1551882547-ff40c0d129df?auto=format&fit=crop&w=800&q=80', tags: ['신축', '야경맛집', '비즈니스'], view_count: 89 }
  ], { onConflict: 'slug' });
  if (err6) console.error("Error seeding hotels:", err6);

  console.log("Seeding complete!");
}

seed();
