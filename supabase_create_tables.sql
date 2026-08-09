-- =============================================
-- 도쿄 메트로 가이드: 메뉴 및 여행 팁 포스팅 테이블 생성
-- Supabase SQL Editor에서 실행해 주세요.
-- =============================================

-- 1. menus 테이블: 최상단 네비게이션 메뉴 관리
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "menus_select_all" ON public.menus
  FOR SELECT USING (true);

-- 인증된 사용자만 쓰기
CREATE POLICY "menus_insert_auth" ON public.menus
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "menus_update_auth" ON public.menus
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "menus_delete_auth" ON public.menus
  FOR DELETE USING (auth.role() = 'authenticated');

-- 2. posts 테이블: 여행 팁 블로그 포스팅
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  category TEXT DEFAULT '여행팁',
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "posts_select_all" ON public.posts
  FOR SELECT USING (true);

-- 인증된 사용자만 쓰기
CREATE POLICY "posts_insert_auth" ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "posts_update_auth" ON public.posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "posts_delete_auth" ON public.posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON public.menus(sort_order);
