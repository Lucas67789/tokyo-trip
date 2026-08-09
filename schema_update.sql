-- ==========================================
-- 역별 제휴 패스 및 명소 관리 기능 추가 업데이트
-- ==========================================

-- 1. stations 테이블에 제휴 패스 링크 컬럼 추가
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS subway_pass_link TEXT;
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS express_pass_link TEXT;

-- 2. 역 주변 명소 (Station Attractions) 테이블 생성
CREATE TABLE IF NOT EXISTS public.station_attractions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,            -- 예: '시부야 스크램블 교차로', '유니버설 스튜디오 재팬'
    category VARCHAR(100),                 -- 예: '관광지', '쇼핑', '맛집'
    icon VARCHAR(100),                     -- lucide-react 아이콘 이름 예: 'Camera', 'ShoppingBag'
    description TEXT,                      -- 1줄 요약 설명
    detail_content TEXT,                   -- 상세 설명 (어필리에이트 링크가 없을 때 모달에 표시될 내용)
    image_url TEXT,                        -- 명소 이미지 URL (CDN 또는 외부 링크)
    affiliate_url TEXT,                    -- 클룩 등 어필리에이트 제휴 링크 (있을 경우 외부 링크로 이동)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_station_attractions_station_id ON public.station_attractions(station_id);

-- RLS (Row Level Security) 설정
ALTER TABLE public.station_attractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read to station_attractions" 
ON public.station_attractions FOR SELECT 
USING (true);

CREATE POLICY "Allow admin all access to station_attractions" 
ON public.station_attractions FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- 할인코드 관리 업데이트
-- ==========================================
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
