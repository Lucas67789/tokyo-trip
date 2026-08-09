import { createClient } from "@/utils/supabase/server";
import { Hotel, FileText, Train, Ticket, Eye, MousePointerClick, Users, TrendingUp, BarChart3, Crown, ArrowUpRight, Download, Calendar, MapIcon } from "lucide-react";
import Link from "next/link";
import DailyReportPopup from "@/components/admin/DailyReportPopup";
import ClearCacheButton from "@/components/admin/ClearCacheButton";

export const revalidate = 0;

export default async function DashboardPage(props: { searchParams: Promise<{ period?: string }> }) {
  const searchParams = await props.searchParams;
  const period = searchParams.period || "all";
  const supabase = await createClient();

  let startDate: Date | null = null;
  
  // 서버가 UTC를 사용할 수 있으므로 한국 시간(KST, +9:00) 기준으로 자정을 계산합니다.
  const now = new Date();
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + KST_OFFSET);

  if (period === "daily") {
    kstNow.setUTCHours(0, 0, 0, 0);
    startDate = new Date(kstNow.getTime() - KST_OFFSET);
  } else if (period === "weekly") {
    const day = kstNow.getUTCDay();
    const diff = kstNow.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
    kstNow.setUTCDate(diff);
    kstNow.setUTCHours(0, 0, 0, 0);
    startDate = new Date(kstNow.getTime() - KST_OFFSET);
  } else if (period === "monthly") {
    kstNow.setUTCDate(1);
    kstNow.setUTCHours(0, 0, 0, 0);
    startDate = new Date(kstNow.getTime() - KST_OFFSET);
  }

  let searchLogsQuery = supabase.from("search_logs").select("start_slug, end_slug");
  
  if (startDate) {
    searchLogsQuery = searchLogsQuery.gte("created_at", startDate.toISOString());
  }

  // 데이터베이스 1,000개 제한 우회 및 최신순 정렬을 위한 반복 조회 로직
  const fetchAllActivities = async () => {
    let allData: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let keepGoing = true;

    while (keepGoing) {
      let query = supabase
        .from("user_activities")
        .select("action_type, target_id, session_id, created_at")
        .range(from, from + pageSize - 1)
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query;
      if (error || !data) break;
      
      allData = allData.concat(data);
      if (data.length < pageSize) {
        keepGoing = false;
      } else {
        from += pageSize;
      }
    }
    return allData;
  };

  // 1. 데이터 로드
  const [
    { data: hotels },
    { data: posts },
    { data: passes },
    { data: promoCodes },
    allActivities,
    { data: comments },
    { data: searchLogs },
    { data: stations },
  ] = await Promise.all([
    supabase.from("hotels").select("id, name_ko, slug, view_count, stations(name_ko)"),
    supabase.from("posts").select("id, title, slug, view_count, category"),
    supabase.from("passes").select("id, name_ko, slug, view_count, click_count"),
    supabase.from("promo_codes").select("id, partner_name, promo_code, discount_rate, click_count, is_active"),
    fetchAllActivities(),
    supabase.from("comments").select("id, is_approved"),
    searchLogsQuery,
    supabase.from("stations").select("slug, name_ko"),
  ]);

  // 2. 유저 액티비티 분류
  const hotelViewActivities = allActivities.filter((a: any) => a.action_type === "VIEW_HOTEL");
  const agodaClickActivities = allActivities.filter((a: any) => a.action_type === "CLICK_AGODA");
  const pdfDownloadActivities = allActivities.filter((a: any) => a.action_type === "DOWNLOAD_PDF");
  const homeVisitActivities = allActivities.filter((a: any) => a.action_type === "VISIT_HOME");
  
  const googleMapClicks = allActivities.filter((a: any) => a.action_type === "CLICK_GOOGLE_MAPS").length;
  const stationHotelClicks = allActivities.filter((a: any) => a.action_type === "CLICK_STATION_HOTEL").length;
  const suggestedPassClicks = allActivities.filter((a: any) => a.action_type === "CLICK_SUGGESTED_PASS").length;
  
  const postViewActivities = allActivities.filter((a: any) => a.action_type === "VIEW_POST");
  const passViewActivities = allActivities.filter((a: any) => a.action_type === "VIEW_PASS");
  const passClickActivities = allActivities.filter((a: any) => a.action_type === "CLICK_PASS");
  const promoClickActivities = allActivities.filter((a: any) => a.action_type === "CLICK_PROMO");

  const totalHotelViews = hotelViewActivities.length;
  const totalAgodaClicks = agodaClickActivities.length;
  const totalPdfDownloads = pdfDownloadActivities.length;
  
  const uniqueAgodaClicks = new Set(agodaClickActivities.map((a: any) => a.session_id)).size;
  const uniqueHomeVisits = new Set(homeVisitActivities.map((a: any) => a.session_id)).size;
  const uniqueSessions = new Set(allActivities.map((a: any) => a.session_id)).size;

  // 3. 포스트, 패스, 프로모코드 합산 (all 이면 기존 legacy 데이터 + activities)
  let totalPostViews = 0, totalPassViews = 0, totalPassClicks = 0, totalPromoClicks = 0;
  
  if (period === "all") {
    totalPostViews = (posts || []).reduce((sum: number, p: any) => sum + (p.view_count || 0), 0) + postViewActivities.length;
    totalPassViews = (passes || []).reduce((sum: number, p: any) => sum + (p.view_count || 0), 0) + passViewActivities.length;
    totalPassClicks = (passes || []).reduce((sum: number, p: any) => sum + (p.click_count || 0), 0) + passClickActivities.length;
    totalPromoClicks = (promoCodes || []).reduce((sum: number, p: any) => sum + (p.click_count || 0), 0) + promoClickActivities.length;
  } else {
    totalPostViews = postViewActivities.length;
    totalPassViews = passViewActivities.length;
    totalPassClicks = passClickActivities.length;
    totalPromoClicks = promoClickActivities.length;
  }

  const activePromos = (promoCodes || []).filter((p: any) => p.is_active).length;
  const totalComments = (comments || []).length;
  const pendingComments = (comments || []).filter((c: any) => !c.is_approved).length;

  // 4. 아이템별 개별 통계 매핑 (호텔)
  const hotelClickMap: Record<string, { views: number; totalClicks: number; uniqueClicks: number }> = {};
  (hotels || []).forEach((h: any) => {
    const hViews = hotelViewActivities.filter((a: any) => a.target_id === h.id).length;
    const hClicks = agodaClickActivities.filter((a: any) => a.target_id === h.id);
    hotelClickMap[h.id] = {
      views: hViews,
      totalClicks: hClicks.length,
      uniqueClicks: new Set(hClicks.map((c: any) => c.session_id)).size,
    };
  });
  // 호텔을 실제 조회수 기준으로 정렬
  let sortedHotels = [...(hotels || [])].sort((a: any, b: any) => 
    (hotelClickMap[b.id]?.views || 0) - (hotelClickMap[a.id]?.views || 0)
  );
  if (period !== "all") {
    sortedHotels = sortedHotels.filter(h => (hotelClickMap[h.id]?.views || 0) > 0 || (hotelClickMap[h.id]?.totalClicks || 0) > 0);
  }

  // 포스트 개별 통계 매핑
  const postStatMap: Record<string, { views: number }> = {};
  (posts || []).forEach((p: any) => {
    const actViews = postViewActivities.filter((a: any) => a.target_id === p.id).length;
    postStatMap[p.id] = { views: period === "all" ? (p.view_count || 0) + actViews : actViews };
  });
  let sortedPosts = [...(posts || [])].sort((a: any, b: any) => (postStatMap[b.id]?.views || 0) - (postStatMap[a.id]?.views || 0));
  if (period !== "all") {
    sortedPosts = sortedPosts.filter(p => (postStatMap[p.id]?.views || 0) > 0);
  }

  // 패스 개별 통계 매핑
  const passStatMap: Record<string, { views: number; clicks: number }> = {};
  (passes || []).forEach((p: any) => {
    const actViews = passViewActivities.filter((a: any) => a.target_id === p.id).length;
    const actClicks = passClickActivities.filter((a: any) => a.target_id === p.id).length;
    passStatMap[p.id] = { 
      views: period === "all" ? (p.view_count || 0) + actViews : actViews,
      clicks: period === "all" ? (p.click_count || 0) + actClicks : actClicks
    };
  });
  let sortedPasses = [...(passes || [])].sort((a: any, b: any) => (passStatMap[b.id]?.views || 0) - (passStatMap[a.id]?.views || 0));
  if (period !== "all") {
    sortedPasses = sortedPasses.filter(p => (passStatMap[p.id]?.views || 0) > 0 || (passStatMap[p.id]?.clicks || 0) > 0);
  }

  // 할인코드 개별 통계 매핑
  const promoStatMap: Record<string, { clicks: number }> = {};
  (promoCodes || []).forEach((p: any) => {
    const actClicks = promoClickActivities.filter((a: any) => a.target_id === p.id).length;
    promoStatMap[p.id] = { clicks: period === "all" ? (p.click_count || 0) + actClicks : actClicks };
  });
  let sortedPromos = [...(promoCodes || [])].sort((a: any, b: any) => (promoStatMap[b.id]?.clicks || 0) - (promoStatMap[a.id]?.clicks || 0));
  if (period !== "all") {
    sortedPromos = sortedPromos.filter(p => (promoStatMap[p.id]?.clicks || 0) > 0);
  }


  // 종합 수치
  const totalAllViews = totalHotelViews + totalPostViews + totalPassViews;
  const totalAllClicks = totalAgodaClicks + totalPassClicks + totalPromoClicks;

  // 5. 지하철 노선도 검색어 집계
  const stationMap: Record<string, string> = {};
  (stations || []).forEach((s: any) => {
    stationMap[s.slug] = s.name_ko;
  });

  const searchPathCounts: Record<string, { start: string, end: string, raw_start: string, raw_end: string, count: number }> = {};
  (searchLogs || []).forEach((log: any) => {
    const startName = stationMap[log.start_slug] || log.start_slug;
    const endName = stationMap[log.end_slug] || log.end_slug;
    const key = `${startName} → ${endName}`;
    if (!searchPathCounts[key]) {
      searchPathCounts[key] = { start: startName, end: endName, raw_start: log.start_slug, raw_end: log.end_slug, count: 0 };
    }
    searchPathCounts[key].count += 1;
  });

  const topSearchPaths = Object.values(searchPathCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <DailyReportPopup />
      
      {/* Header with Period Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-600" />
            사이트 종합 대시보드
          </h1>
          <p className="text-slate-500 font-medium">
            도쿄트립 전체 통계를 한눈에 확인합니다. 조회수, 클릭수, 콘텐츠 현황을 실시간으로 모니터링하세요.
          </p>
        </div>
        
        {/* Period Tabs & Cache Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <ClearCacheButton />
          
          <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
            {[
            { id: "daily", label: "일간" },
            { id: "weekly", label: "주간" },
            { id: "monthly", label: "월간" },
            { id: "all", label: "전체 기간" }
          ].map((tab) => (
            <Link
              key={tab.id}
              href={`/admin/dashboard?period=${tab.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                period === tab.id 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </Link>
          ))}
          </div>
        </div>
      </div>

      {/* ===== KPI Summary Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard icon={Crown} label="메인 페이지 방문" value={uniqueHomeVisits.toLocaleString()} color="emerald" sub="네이버 유입 등 메인" />
        <KpiCard icon={Users} label="전체 방문자 (세션)" value={uniqueSessions.toLocaleString()} color="purple" sub="전체 페이지 누적" />
        <KpiCard icon={Eye} label="총 조회수 (전체)" value={totalAllViews.toLocaleString()} color="blue" sub="호텔+포스트+패스" />
        <KpiCard icon={MousePointerClick} label="총 클릭수 (전체)" value={totalAllClicks.toLocaleString()} color="amber" sub="아고다+패스+할인코드" />
        <KpiCard icon={Download} label="노선도 PDF 다운" value={totalPdfDownloads.toLocaleString()} color="rose" sub="DOWNLOAD_PDF" />
        <KpiCard icon={TrendingUp} label="전체 전환율" value={totalAllViews > 0 ? ((totalAllClicks / totalAllViews) * 100).toFixed(1) + "%" : "0%"} color="emerald" sub="클릭 ÷ 조회" />
      </div>

      {/* ===== Category Breakdown ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <CategoryCard
          icon={Hotel} title="호텔" color="blue"
          stats={[
            { label: "등록 수", value: (hotels || []).length },
            { label: "조회수", value: totalHotelViews },
            { label: "아고다 클릭", value: totalAgodaClicks },
            { label: "순수 클릭", value: uniqueAgodaClicks },
          ]}
          href="/admin"
        />
        <CategoryCard
          icon={FileText} title="포스팅" color="indigo"
          stats={[
            { label: "등록 수", value: (posts || []).length },
            { label: "총 조회수", value: totalPostViews },
            { label: "평균 조회", value: (posts || []).length > 0 ? Math.round(totalPostViews / (posts || []).length) : 0 },
          ]}
          href="/admin/posts"
        />
        <CategoryCard
          icon={Train} title="교통 패스" color="violet"
          stats={[
            { label: "등록 수", value: (passes || []).length },
            { label: "총 조회수", value: totalPassViews },
            { label: "총 클릭수", value: totalPassClicks },
          ]}
          href="/admin/passes"
        />
        <CategoryCard
          icon={Ticket} title="할인코드" color="rose"
          stats={[
            { label: "전체", value: (promoCodes || []).length },
            { label: "활성 중", value: activePromos },
            { label: "총 클릭수", value: totalPromoClicks },
          ]}
          href="/admin/coupons"
        />
        <CategoryCard
          icon={MapIcon} title="노선 검색결과 전환율" color="emerald"
          stats={[
            { label: "구글맵 클릭", value: googleMapClicks },
            { label: "숙소안내 클릭", value: stationHotelClicks },
            { label: "추천패스 클릭", value: suggestedPassClicks },
          ]}
          href="/"
        />
      </div>

      {/* ===== Top Rankings ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 호텔 TOP 10 */}
        <RankingCard title="🏨 호텔 조회수 TOP 10" href="/admin">
          {sortedHotels.slice(0, 10).map((h: any, i: number) => (
            <RankingRow
              key={h.id}
              rank={i + 1}
              name={h.name_ko}
              sub={(h.stations as any)?.name_ko ? `${(h.stations as any).name_ko}역` : ""}
              stats={[
                { label: "조회", value: hotelClickMap[h.id]?.views || 0 },
                { label: "클릭", value: hotelClickMap[h.id]?.totalClicks || 0 },
                { label: "순수", value: hotelClickMap[h.id]?.uniqueClicks || 0 },
              ]}
              href={`/hotel/${h.slug}`}
            />
          ))}
          {sortedHotels.length === 0 && <EmptyRanking />}
        </RankingCard>

        {/* 포스팅 TOP 10 */}
        <RankingCard title="📝 포스팅 조회수 TOP 10" href="/admin/posts">
          {sortedPosts.slice(0, 10).map((p: any, i: number) => (
            <RankingRow
              key={p.id}
              rank={i + 1}
              name={p.title}
              sub={p.category || ""}
              stats={[
                { label: "조회", value: postStatMap[p.id]?.views || 0 },
              ]}
              href={`/post/${p.slug}`}
            />
          ))}
          {sortedPosts.length === 0 && <EmptyRanking />}
        </RankingCard>

        {/* 패스 TOP 10 */}
        <RankingCard title="🚇 교통 패스 TOP 10" href="/admin/passes">
          {sortedPasses.slice(0, 10).map((p: any, i: number) => (
            <RankingRow
              key={p.id}
              rank={i + 1}
              name={p.name_ko}
              sub=""
              stats={[
                { label: "조회", value: passStatMap[p.id]?.views || 0 },
                { label: "클릭", value: passStatMap[p.id]?.clicks || 0 },
              ]}
              href={`/pass/${p.slug}`}
            />
          ))}
          {sortedPasses.length === 0 && <EmptyRanking />}
        </RankingCard>

        {/* 할인코드 TOP 10 */}
        <RankingCard title="🎟️ 할인코드 클릭수 TOP 10" href="/admin/coupons">
          {sortedPromos.slice(0, 10).map((p: any, i: number) => (
            <RankingRow
              key={p.id}
              rank={i + 1}
              name={`${p.partner_name} — ${p.promo_code}`}
              sub={p.discount_rate}
              stats={[
                { label: "클릭", value: promoStatMap[p.id]?.clicks || 0 },
              ]}
              href="/admin/coupons"
            />
          ))}
          {sortedPromos.length === 0 && <EmptyRanking />}
        </RankingCard>

        {/* 노선도 검색 TOP 10 */}
        <RankingCard title="🗺️ 노선도 인기 검색 경로 TOP 10" href="/admin/searches">
          {topSearchPaths.map((path: any, i: number) => (
            <RankingRow
              key={i}
              rank={i + 1}
              name={`${path.start} → ${path.end}`}
              sub=""
              stats={[
                { label: "검색", value: path.count },
              ]}
              href={`/?from=${path.raw_start}&to=${path.raw_end}`}
            />
          ))}
          {topSearchPaths.length === 0 && <EmptyRanking />}
        </RankingCard>
      </div>

      {/* ===== 댓글 현황 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            💬 댓글 현황
          </h3>
          <Link href="/admin/comments" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            관리 페이지 <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-slate-900">{totalComments}</div>
            <div className="text-xs font-bold text-slate-500 mt-1">전체 댓글</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-amber-600">{pendingComments}</div>
            <div className="text-xs font-bold text-amber-700 mt-1">승인 대기중</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Sub Components =====

function KpiCard({ icon: Icon, label, value, color, sub }: {
  icon: any; label: string; value: string; color: string; sub: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  const iconColorMap: Record<string, string> = {
    blue: "text-blue-500", emerald: "text-emerald-500", purple: "text-purple-500", amber: "text-amber-500", rose: "text-rose-500",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className={iconColorMap[color] || iconColorMap.blue} />
        <span className="text-xs font-bold opacity-80">{label}</span>
      </div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-[10px] font-bold opacity-60 mt-1">{sub}</div>
    </div>
  );
}

function CategoryCard({ icon: Icon, title, color, stats, href }: {
  icon: any; title: string; color: string; stats: { label: string; value: number }[]; href: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "border-l-blue-500", indigo: "border-l-indigo-500",
    violet: "border-l-violet-500", rose: "border-l-rose-500",
  };
  const iconColorMap: Record<string, string> = {
    blue: "text-blue-500", indigo: "text-indigo-500",
    violet: "text-violet-500", rose: "text-rose-500",
  };
  return (
    <Link href={href} className={`bg-white rounded-2xl shadow-sm border border-slate-200 border-l-4 ${colorMap[color]} p-5 hover:shadow-md transition-all group`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={iconColorMap[color]} />
        <span className="font-extrabold text-slate-900 text-sm">{title}</span>
        <ArrowUpRight size={14} className="text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
      </div>
      <div className="space-y-2">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">{s.label}</span>
            <span className="text-sm font-black text-slate-800">{s.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

function RankingCard({ title, href, children }: {
  title: string; href: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <span className="font-extrabold text-slate-800 text-sm">{title}</span>
        <Link href={href} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          전체보기 <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

function RankingRow({ rank, name, sub, stats, href }: {
  rank: number; name: string; sub: string; stats: { label: string; value: number }[]; href: string;
}) {
  const rankColor = rank <= 3
    ? rank === 1 ? "bg-amber-400 text-white" : rank === 2 ? "bg-slate-400 text-white" : "bg-amber-700 text-white"
    : "bg-slate-100 text-slate-500";
  return (
    <div className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${rankColor}`}>
        {rank <= 3 ? <Crown size={12} /> : rank}
      </div>
      <div className="flex-1 min-w-0">
        <a href={href} target="_blank" rel="noreferrer" className="font-bold text-slate-900 text-sm truncate block hover:text-blue-600 transition-colors">
          {name}
        </a>
        {sub && <span className="text-[10px] text-slate-400 font-bold">{sub}</span>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-xs font-black text-slate-800">{s.value.toLocaleString()}</div>
            <div className="text-[9px] font-bold text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyRanking() {
  return (
    <div className="py-8 text-center text-sm text-slate-400 font-medium">
      해당 기간에 집계된 데이터가 없습니다.
    </div>
  );
}
