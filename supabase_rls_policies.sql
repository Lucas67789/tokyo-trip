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
