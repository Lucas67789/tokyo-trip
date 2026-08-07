-- 0. Schema Updates (in case schema.sql was already executed before tags column was added)
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS distance_meters INTEGER;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS discount_rate INTEGER;

-- 1. Country & City
INSERT INTO public.countries (id, code, name_ko, name_en) 
VALUES ('c0000000-0000-0000-0000-000000000001', 'JP', '일본', 'Japan')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.cities (id, country_id, slug, name_ko, name_en)
VALUES ('c1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'tokyo', '도쿄', 'Tokyo')
ON CONFLICT (slug) DO NOTHING;

-- 2. Lines
INSERT INTO public.lines (id, city_id, slug, name_ko, color_hex) VALUES
('b0000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000002', 'ginza', '긴자선', '#FF9500'),
('b0000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000002', 'marunouchi', '마루노우치선', '#F62E36'),
('b0000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000002', 'jr_yamanote', 'JR 야마노테선', '#80C241')
ON CONFLICT (slug) DO NOTHING;

-- 3. Stations
INSERT INTO public.stations (id, city_id, slug, name_ko, name_en, name_jp, description) VALUES
('a0000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000002', 'shinjuku', '신주쿠역', 'Shinjuku', '新宿', '세계 1위 이용객을 자랑하는 도쿄 최대의 교통 허브. 가부키초, 백화점, 도쿄도청 등 관광 인프라가 밀집해 있습니다.'),
('a0000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000002', 'shibuya', '시부야역', 'Shibuya', '渋谷', '젊음과 유행의 거리. 시부야 스크램블 교차로와 충견 하치코 동상이 유명하며 나리타 익스프레스가 정차합니다.'),
('a0000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000002', 'ginza', '긴자역', 'Ginza', '銀座', '일본 최고급 명품 거리이자 쇼핑의 성지. 주말에는 보행자 천국으로 변신합니다.')
ON CONFLICT (slug) DO NOTHING;

-- Station Lines Mapping
INSERT INTO public.station_lines (station_id, line_id, station_order) VALUES
('a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000011', 10), -- Shinjuku Marunouchi
('a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000012', 10), -- Shinjuku Yamanote
('a0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000010', 1),  -- Shibuya Ginza
('a0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000012', 15), -- Shibuya Yamanote
('a0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000010', 10), -- Ginza Ginza
('a0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000011', 8)   -- Ginza Marunouchi
ON CONFLICT (station_id, line_id) DO NOTHING;

-- 4. Hotels
INSERT INTO public.hotels (id, station_id, slug, name_ko, name_en, star_rating, review_score, review_count, lowest_price, thumbnail_url, tags, view_count, distance_meters, discount_rate) VALUES
('f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', 'shinjuku-washington-hotel', '신주쿠 워싱턴 호텔', 'Shinjuku Washington Hotel', 3.5, 8.2, 8540, 125000, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', ARRAY['공항버스', '가성비', '비즈니스'], 412, 500, 25),
('f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000011', 'shibuya-excel-hotel-tokyu', '시부야 엑셀 호텔 도큐', 'Shibuya Excel Hotel Tokyu', 4.0, 8.8, 4215, 250000, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', ARRAY['역직결', '쇼핑접근성', '스크램블뷰'], 512, 10, 42)
ON CONFLICT (slug) DO UPDATE SET 
  distance_meters = EXCLUDED.distance_meters,
  discount_rate = EXCLUDED.discount_rate;

