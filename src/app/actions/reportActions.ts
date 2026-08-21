'use server';

import { createClient } from '@/utils/supabase/server';

export async function getYesterdayReport() {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) throw new Error("Unauthorized: 로그인 세션이 만료되었거나 관리자 권한이 없습니다.");

  // 1. Calculate Yesterday's Start and End times in KST, converted to UTC ISO strings
  const now = new Date();
  const kstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  kstNow.setDate(kstNow.getDate() - 1); // Yesterday in KST

  const year = kstNow.getFullYear();
  const month = kstNow.getMonth();
  const date = kstNow.getDate();

  // KST 00:00 is UTC 15:00 (previous day). Date.UTC handles negative hours nicely.
  const yesterdayStartUtc = new Date(Date.UTC(year, month, date, -9, 0, 0)).toISOString();
  // KST 23:59:59 is UTC 14:59:59
  const yesterdayEndUtc = new Date(Date.UTC(year, month, date, 14, 59, 59, 999)).toISOString();

  // 2. Fetch data concurrently
  const [
    { data: activities, error: activityError },
    { data: searches, error: searchError },
    { data: stations }
  ] = await Promise.all([
    supabase
      .from('user_activities')
      .select('action_type, session_id')
      .gte('created_at', yesterdayStartUtc)
      .lte('created_at', yesterdayEndUtc),
    supabase
      .from('search_logs')
      .select('start_slug, end_slug')
      .gte('created_at', yesterdayStartUtc)
      .lte('created_at', yesterdayEndUtc),
    supabase
      .from('stations')
      .select('slug, name_ko')
  ]);

  if (activityError) console.error("Error fetching activities:", activityError);
  if (searchError) console.error("Error fetching searches:", searchError);

  const allActivities = activities || [];
  const allSearches = searches || [];

  // 3. Process Data
  // Unique Visits (SITE_VISIT or VISIT_HOME)
  const visitActivities = allActivities.filter(a => a.action_type === 'SITE_VISIT' || a.action_type === 'VISIT_HOME');
  const uniqueVisits = new Set(visitActivities.map(a => a.session_id)).size;

  // Clicks
  const agodaClicks = allActivities.filter(a => a.action_type === 'CLICK_AGODA').length;
  const pdfDownloads = allActivities.filter(a => a.action_type === 'DOWNLOAD_PDF').length;

  // Search Paths
  const stationMap: Record<string, string> = {};
  (stations || []).forEach(s => {
    stationMap[s.slug] = s.name_ko;
  });

  const searchPathCounts: Record<string, { start: string, end: string, count: number }> = {};
  allSearches.forEach(log => {
    const startName = stationMap[log.start_slug] || log.start_slug;
    const endName = stationMap[log.end_slug] || log.end_slug;
    const key = `${startName} → ${endName}`;
    if (!searchPathCounts[key]) {
      searchPathCounts[key] = { start: startName, end: endName, count: 0 };
    }
    searchPathCounts[key].count += 1;
  });

  const topSearchPaths = Object.values(searchPathCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // TOP 3

  // Format date string for display
  const reportDateStr = `${month + 1}월 ${date}일`;

  return {
    success: true,
    data: {
      dateStr: reportDateStr,
      uniqueVisits,
      agodaClicks,
      pdfDownloads,
      topSearchPaths,
      totalSearches: allSearches.length,
      hasData: uniqueVisits > 0 || allSearches.length > 0 || agodaClicks > 0 || pdfDownloads > 0
    }
  };
}
