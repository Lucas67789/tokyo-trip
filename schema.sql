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


