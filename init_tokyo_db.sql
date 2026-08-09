-- ==========================================
-- 도쿄 메트로 가이드 전역 DB 스키마 (Supabase / PostgreSQL)
-- Country -> City -> Line -> Station 구조
-- ==========================================

-- 1. 국가 (Country)
CREATE TABLE public.countries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(2) NOT NULL UNIQUE, -- 예: 'JP'
    name_ko VARCHAR(100) NOT NULL,   -- 예: '일본'
    name_en VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 도시 (City)
CREATE TABLE public.cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
    slug VARCHAR(50) NOT NULL UNIQUE, -- 예: 'tokyo'
    name_ko VARCHAR(100) NOT NULL,    -- 예: '도쿄'
    name_en VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 노선 (Line)
CREATE TABLE public.lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
    slug VARCHAR(50) NOT NULL UNIQUE, -- 예: 'midosuji'
    name_ko VARCHAR(100) NOT NULL,    -- 예: '미도스지선'
    color_hex VARCHAR(7) NOT NULL,    -- 예: '#E51720'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 지하철역 (Station)
CREATE TABLE public.stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
    slug VARCHAR(50) NOT NULL UNIQUE, -- 예: 'shinjuku'
    name_ko VARCHAR(100) NOT NULL,    -- 예: '신주쿠역'
    name_en VARCHAR(100) NOT NULL,
    name_jp VARCHAR(100),             -- 예: '新宿駅'
    latitude DECIMAL(10, 8),          -- 구글맵 연동용
    longitude DECIMAL(11, 8),         -- 구글맵 연동용
    description TEXT,                 -- AI/CMS로 생성될 역 소개 (SEO용)
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 역과 노선의 N:M 매핑 테이블 (환승역 지원)
CREATE TABLE public.station_lines (
    station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
    line_id UUID REFERENCES public.lines(id) ON DELETE CASCADE,
    station_order INTEGER, -- 노선 내 역 순서
    PRIMARY KEY (station_id, line_id)
);

-- 5. 호텔 (Hotel)
CREATE TABLE public.hotels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL, -- 가장 가까운 역
    agoda_id VARCHAR(50) UNIQUE,      -- 아고다 연동용 ID
    slug VARCHAR(100) NOT NULL UNIQUE,-- 예: 'keio-plaza-hotel-tokyo'
    name_ko VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    star_rating DECIMAL(2,1),         -- 성급
    review_score DECIMAL(3,1),        -- 평점
    review_count INTEGER,             -- 리뷰 수
    lowest_price INTEGER,             -- 실시간 최저가 저장용
    agoda_link TEXT,                  -- 어필리에이트 원본 링크
    thumbnail_url TEXT,               -- CDN 연동될 썸네일 이미지
    address TEXT,                     -- 실제 주소
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    content TEXT,                     -- 블록 에디터/마크다운 내용 (네이버 View용)
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    tags TEXT[],                      -- UI의 특장점 태그 (예: ['대욕장', '역세권'])
    view_count INTEGER DEFAULT 0,     -- FOMO UI용 ("최근 24시간 내 조회수" 등에 활용)
    distance_meters INTEGER,          -- 역과의 거리(미터)
    discount_rate INTEGER,            -- 할인율(%)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 사용자 데이터 (User Generated Data) - 확장성 고려
-- 나중에 로그인 기능을 추가하거나 비회원 식별(쿠키 UUID)을 위해
CREATE TABLE public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,         -- 쿠키/로컬 스토리지에 저장된 유저 고유 ID
    action_type VARCHAR(50),          -- 'VIEW_STATION', 'VIEW_HOTEL', 'CLICK_AGODA' 등
    target_id UUID,                   -- 역 ID 또는 호텔 ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (SEO, 검색 성능 향상용)
CREATE INDEX idx_stations_slug ON public.stations(slug);
CREATE INDEX idx_hotels_slug ON public.hotels(slug);
CREATE INDEX idx_hotels_station ON public.hotels(station_id);
CREATE INDEX idx_user_activities_session ON public.user_activities(session_id);

-- 7. 제휴사 할인코드 (Promo Codes)
CREATE TABLE public.promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_name VARCHAR(100) NOT NULL,   -- 예: '아고다', '호텔스닷컴', '클룩'
    promo_code VARCHAR(100) NOT NULL,     -- 예: 'AGODA8', 'HOTELS5'
    discount_rate VARCHAR(100) NOT NULL,  -- 예: '8% 할인', '5% 추가 할인'
    target_url TEXT NOT NULL,             -- 클릭 시 연결될 제휴 어필리에이트 URL
    description TEXT,                     -- 적용 조건 (예: '10만원 이상 결제 시', '전세계 호텔 대상')
    image_url TEXT,                       -- 썸네일 이미지 URL (네이버 SEO 리치 스니펫 및 UI 노출용)
    is_active BOOLEAN DEFAULT TRUE,       -- 노출 활성화 여부
    click_count INTEGER DEFAULT 0,        -- 할인코드 클릭수
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 설정
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read to promo_codes" 
ON public.promo_codes FOR SELECT 
USING (true);

CREATE POLICY "Allow admin all access to promo_codes" 
ON public.promo_codes FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 8. 사이트 설정 (Site Settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 프로모션 월 설정 삽입 (기본값: '5월')
INSERT INTO public.site_settings (key, value) 
VALUES ('active_promo_month', '5월')
ON CONFLICT (key) DO NOTHING;

-- RLS 정책 설정 (누구나 조회 가능, 인증된 관리자만 편집 가능)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read to site_settings" 
ON public.site_settings FOR SELECT 
USING (true);

CREATE POLICY "Allow admin all access to site_settings" 
ON public.site_settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);



-- ==========================================
-- Supabase Row-Level Security (RLS) 통합 적용 스크립트
-- 모든 테이블에 대해 RLS를 활성화하고 안전한 정책을 설정합니다.
-- ==========================================

-- 1. 모든 주요 테이블에 RLS 활성화
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pass_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- (기존에 설정된 테이블들도 명시적으로 활성화)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 2. "읽기 전용" 성격의 테이블들 정책
-- (일반 유저는 조회(SELECT)만 가능, 데이터 추가/수정/삭제는 인증된 관리자만 가능)

-- countries
DROP POLICY IF EXISTS "Allow public read countries" ON public.countries;
DROP POLICY IF EXISTS "Allow admin all countries" ON public.countries;
CREATE POLICY "Allow public read countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Allow admin all countries" ON public.countries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- cities
DROP POLICY IF EXISTS "Allow public read cities" ON public.cities;
DROP POLICY IF EXISTS "Allow admin all cities" ON public.cities;
CREATE POLICY "Allow public read cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Allow admin all cities" ON public.cities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- lines
DROP POLICY IF EXISTS "Allow public read lines" ON public.lines;
DROP POLICY IF EXISTS "Allow admin all lines" ON public.lines;
CREATE POLICY "Allow public read lines" ON public.lines FOR SELECT USING (true);
CREATE POLICY "Allow admin all lines" ON public.lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- stations
DROP POLICY IF EXISTS "Allow public read stations" ON public.stations;
DROP POLICY IF EXISTS "Allow admin all stations" ON public.stations;
CREATE POLICY "Allow public read stations" ON public.stations FOR SELECT USING (true);
CREATE POLICY "Allow admin all stations" ON public.stations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- station_lines
DROP POLICY IF EXISTS "Allow public read station_lines" ON public.station_lines;
DROP POLICY IF EXISTS "Allow admin all station_lines" ON public.station_lines;
CREATE POLICY "Allow public read station_lines" ON public.station_lines FOR SELECT USING (true);
CREATE POLICY "Allow admin all station_lines" ON public.station_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- hotels
DROP POLICY IF EXISTS "Allow public read hotels" ON public.hotels;
DROP POLICY IF EXISTS "Allow admin all hotels" ON public.hotels;
CREATE POLICY "Allow public read hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Allow admin all hotels" ON public.hotels FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- passes
DROP POLICY IF EXISTS "Allow public read passes" ON public.passes;
DROP POLICY IF EXISTS "Allow admin all passes" ON public.passes;
CREATE POLICY "Allow public read passes" ON public.passes FOR SELECT USING (true);
CREATE POLICY "Allow admin all passes" ON public.passes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- pass_targets
DROP POLICY IF EXISTS "Allow public read pass_targets" ON public.pass_targets;
DROP POLICY IF EXISTS "Allow admin all pass_targets" ON public.pass_targets;
CREATE POLICY "Allow public read pass_targets" ON public.pass_targets FOR SELECT USING (true);
CREATE POLICY "Allow admin all pass_targets" ON public.pass_targets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- station_attractions
DROP POLICY IF EXISTS "Allow public read station_attractions" ON public.station_attractions;
DROP POLICY IF EXISTS "Allow admin all station_attractions" ON public.station_attractions;
CREATE POLICY "Allow public read station_attractions" ON public.station_attractions FOR SELECT USING (true);
CREATE POLICY "Allow admin all station_attractions" ON public.station_attractions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- posts
DROP POLICY IF EXISTS "Allow public read posts" ON public.posts;
DROP POLICY IF EXISTS "Allow admin all posts" ON public.posts;
CREATE POLICY "Allow public read posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow admin all posts" ON public.posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- menus
DROP POLICY IF EXISTS "Allow public read menus" ON public.menus;
DROP POLICY IF EXISTS "Allow admin all menus" ON public.menus;
CREATE POLICY "Allow public read menus" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Allow admin all menus" ON public.menus FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 3. 유저가 데이터를 생성(추가)할 수 있는 테이블 정책

-- comments: 누구나 조회 및 작성(INSERT) 가능, 수정/삭제는 인증된 관리자만 가능
DROP POLICY IF EXISTS "Allow public read comments" ON public.comments;
DROP POLICY IF EXISTS "Allow public insert comments" ON public.comments;
DROP POLICY IF EXISTS "Allow admin all comments" ON public.comments;
CREATE POLICY "Allow public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all comments" ON public.comments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- user_activities: 활동 로그용, 누구나 조회 및 작성 가능
DROP POLICY IF EXISTS "Allow public read user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Allow public insert user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Allow admin all user_activities" ON public.user_activities;
CREATE POLICY "Allow public read user_activities" ON public.user_activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_activities" ON public.user_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all user_activities" ON public.user_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 끝

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

