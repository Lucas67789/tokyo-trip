-- ==========================================
-- 1. station_attractions.station_id를 optional로 변경
-- 2. posts에 linked_attraction_ids 컬럼 추가
-- Supabase SQL Editor 에서 아래 쿼리를 실행해주세요.
-- ==========================================

-- 1. 명소/액티비티가 특정 역에 종속되지 않아도 등록 가능하도록 변경
ALTER TABLE public.station_attractions ALTER COLUMN station_id DROP NOT NULL;

-- 2. 포스팅에 연관 명소/액티비티 연동용 컬럼 추가
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS linked_attraction_ids UUID[] DEFAULT '{}';
