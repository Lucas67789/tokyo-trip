-- ==========================================
-- 교통 패스 통합 관리 및 노출 타겟팅 스키마 업데이트
-- ==========================================

-- 1. 패스 기본 정보 테이블
CREATE TABLE IF NOT EXISTS public.passes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,       -- 예: 'skyliner'
    name_ko VARCHAR(255) NOT NULL,           -- 예: '스카이라이너 특급 열차'
    thumbnail_url TEXT,                      -- 목록 및 썸네일에 노출될 이미지 URL
    description TEXT,                        -- 1줄 요약 (리스트에서 보일 설명)
    content TEXT,                            -- 상세 설명 (블로그형 본문 내용, 마크다운/HTML)
    affiliate_url TEXT NOT NULL,             -- 실제 구매로 이동할 제휴 링크
    meta_title VARCHAR(255),                 -- SEO 타이틀
    meta_description VARCHAR(500),           -- SEO 메타 설명
    view_count INTEGER DEFAULT 0,            -- 상세페이지 조회수
    click_count INTEGER DEFAULT 0,           -- 제휴링크 클릭수
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 패스 적용 대상(타겟팅) 테이블
-- target_type: 'ALL'(전체 역), 'LINE'(특정 노선 전체), 'STATION'(특정 역)
CREATE TABLE IF NOT EXISTS public.pass_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pass_id UUID REFERENCES public.passes(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('ALL', 'LINE', 'STATION')),
    target_id UUID,                          -- 'ALL'인 경우 NULL, 'LINE'이면 line_id, 'STATION'이면 station_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_passes_slug ON public.passes(slug);
CREATE INDEX IF NOT EXISTS idx_pass_targets_pass_id ON public.pass_targets(pass_id);
CREATE INDEX IF NOT EXISTS idx_pass_targets_target_type ON public.pass_targets(target_type, target_id);

-- RLS(Row Level Security) 설정
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pass_targets ENABLE ROW LEVEL SECURITY;

-- passes 권한
CREATE POLICY "Allow public read to passes" 
ON public.passes FOR SELECT USING (true);

CREATE POLICY "Allow admin all access to passes" 
ON public.passes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- pass_targets 권한
CREATE POLICY "Allow public read to pass_targets" 
ON public.pass_targets FOR SELECT USING (true);

CREATE POLICY "Allow admin all access to pass_targets" 
ON public.pass_targets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- (선택) 기존 역별 하드코딩된 패스 컬럼 삭제 또는 무시
-- 안전을 위해 삭제하지는 않고 놔둡니다. UI에서만 제외.
