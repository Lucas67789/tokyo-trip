-- ==========================================
-- 포스팅 어필리에이트(교통패스 연동) 기능 추가
-- Supabase SQL Editor 에서 아래 쿼리를 실행해주세요.
-- ==========================================

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS linked_pass_ids UUID[] DEFAULT '{}';
