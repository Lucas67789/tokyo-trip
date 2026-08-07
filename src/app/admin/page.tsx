// Force redeploy - 2026-05-15 17:45 (Unicode Escape Version)
import { createClient } from "@/utils/supabase/server";
import { addHotel } from "@/app/actions/hotelActions";
import { addPromoCode } from "@/app/actions/promoActions";
import { updatePromoMonthSetting } from "@/app/actions/settingActions";
import HotelRegisterForm from "@/components/admin/HotelRegisterForm";
import HotelListClient from "@/components/admin/HotelListClient";
import SidebarPromoSelectorClient from "@/components/admin/SidebarPromoSelectorClient";
import { Ticket } from "lucide-react";

export const revalidate = 0;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = await createClient();

  const { data: hotels } = await supabase
    .from("hotels")
    .select(`
      id,
      name_ko,
      slug,
      lowest_price,
      stations ( name_ko )
    `)
    .order("created_at", { ascending: false });

  const { data: stations } = await supabase
    .from("stations")
    .select("id, name_ko, subway_pass_link, express_pass_link")
    .order("name_ko");

  const { data: activities } = await supabase
    .from("user_activities")
    .select("action_type, target_id, session_id");

  const hotelsWithStats = (hotels || []).map((hotel: any) => {
    const hotelActivities = (activities || []).filter((a: any) => a.target_id === hotel.id);
    const views = hotelActivities.filter((a: any) => a.action_type === 'VIEW_HOTEL').length;
    const clicks = hotelActivities.filter((a: any) => a.action_type === 'CLICK_AGODA');
    const totalClicks = clicks.length;
    const uniqueClicks = new Set(clicks.map((c: any) => c.session_id)).size;

    return {
      ...hotel,
      views,
      totalClicks,
      uniqueClicks
    };
  });

  const { data: monthSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "active_promo_month")
    .single();

  const activeMonth = monthSetting?.value || "5월";

  const { data: sidebarSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "sidebar_promo_ids")
    .single();
  let selectedPromoIds: string[] = [];
  try {
    if (sidebarSetting?.value) {
      selectedPromoIds = JSON.parse(sidebarSetting.value);
    }
  } catch(e) {}

  const { data: allPromos } = await supabase
    .from("promo_codes")
    .select("id, partner_name, discount_rate, promo_code, is_active")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          도쿄 트립 어드민 관리
        </h1>
        <p className="text-white/60 font-medium">
          오직 최고 관리자만 접근 가능합니다. SEO 블로그 포스팅과 호텔 기본 정보를 등록하세요.
        </p>
        
        {searchParams?.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold whitespace-pre-wrap">
            🚨 등록 실패: {searchParams.error}
            <p className="text-sm font-medium mt-1">
              (작성하시던 글은 다행히 임시저장되어 있습니다. '신규 호텔 등록'의 에디터를 클릭하면 다시 불러옵니다!)
            </p>
          </div>
        )}
      </div>

      {/* Hotel Data Table */}
      <div>
        <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
          🏨 등록된 호텔 및 통계
          <span className="text-sm font-bold text-cyan-400 bg-cyan-500/20 px-2.5 py-1 rounded-full">{hotelsWithStats.length}개</span>
        </h2>
        <HotelListClient hotels={hotelsWithStats} />
      </div>

      {/* Settings & Forms */}
      <div className="flex flex-col gap-8">
        {/* 프로모션 월 설정 */}
        <div className="bg-[#1A2235]/40 backdrop-blur-2xl rounded-[2rem] shadow-sm border border-white/5 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <Ticket size={24} />
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {"📢 현재 사이트 프로모션 월 설정"}
            </h2>
          </div>
          
          <form action={updatePromoMonthSetting} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-white/80 mb-1.5 ml-1">
                {"활성 프로모션 월 (예: 5월, 6월, 7월)"}
              </label>
              <input 
                type="text" 
                name="active_promo_month" 
                placeholder="예: 5월" 
                defaultValue={activeMonth}
                className="w-full border border-white/10 bg-[#0A0E17]/50 text-white rounded-xl px-4 py-3 focus:bg-[#0A0E17] focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-white/30 font-bold" 
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-emerald-600 text-white font-extrabold py-3.5 px-6 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 text-base shrink-0 cursor-pointer"
            >
              {"설정 저장하기"}
            </button>
          </form>
        </div>

        {/* 호텔 사이드바 할인코드 선택기 */}
        <div className="bg-[#1A2235]/40 backdrop-blur-2xl rounded-[2rem] border border-white/5 p-8">
          <SidebarPromoSelectorClient allPromos={allPromos || []} initialSelectedIds={selectedPromoIds} />
        </div>

        {/* 신규 호텔 등록 */}
        <div className="bg-[#1A2235]/40 backdrop-blur-2xl rounded-[2rem] border border-white/5 p-8">
          <h2 className="text-xl font-extrabold text-white mb-6">{"신규 호텔 & 블로그 포스팅 등록"}</h2>
          <HotelRegisterForm stations={stations || []} />
        </div>
      </div>
    </div>
  );
}
