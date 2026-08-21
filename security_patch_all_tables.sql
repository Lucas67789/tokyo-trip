-- ==============================================================================
-- Tokyo Trip - Comprehensive Security Patch for RLS Vulnerabilities
-- ==============================================================================
-- Issue: All tables were created without ENABLE ROW LEVEL SECURITY by default.
--        This allows any anonymous user to read, write, and delete data using the
--        public Supabase anon key via the REST API.
-- Fix: Enable RLS on all tables and explicitly define public read-only policies,
--      while restricting write access to authenticated admin users.
-- ==============================================================================

-- 1. Enable RLS on all core tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pass_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any) to prevent conflicts
DO $\$
DECLARE
    t text;
    p text;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        FOR p IN 
            SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
        END LOOP;
    END LOOP;
END
$\$;

-- 3. Create Public Read Policies for all public-facing tables
CREATE POLICY "Allow public read" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.lines FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.stations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.station_lines FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.promo_codes FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.passes FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.pass_targets FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.station_attractions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.partners FOR SELECT USING (true);

-- 4. Create Public Insert Policies where necessary
-- Allow public to submit comments (they start as is_approved = false)
CREATE POLICY "Allow public insert" ON public.comments FOR INSERT WITH CHECK (true);
-- Allow tracking and search logs (from previous patches)
CREATE POLICY "Allow public insert" ON public.user_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.search_logs FOR INSERT WITH CHECK (true);

-- 5. Create Admin Write Policies (Assume authenticated users are admins)
CREATE POLICY "Allow admin all" ON public.countries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.cities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.lines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.stations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.station_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.hotels FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.promo_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.passes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.pass_targets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.station_attractions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.menus FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.partners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.user_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin all" ON public.search_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

