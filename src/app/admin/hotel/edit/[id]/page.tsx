import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import HotelEditForm from "@/components/admin/HotelEditForm";
import SidebarPromoSelectorClient from "@/components/admin/SidebarPromoSelectorClient";

export const revalidate = 0;

export default async function AdminHotelEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-500 font-bold">
        권한이 없습니다. 관리자로 로그인해주세요.
      </div>
    );
  }

  // 1. 역(station) 목록 가져오기 (폼에서 표시할 용도)
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name_ko")
    .order("name_ko");

  // 2. 수정할 호텔 정보 가져오기
  const { data: hotel } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", id)
    .single();

  if (!hotel) {
    notFound();
  }

  // 3. 전체 프로모션 목록 가져오기
  const { data: allPromos } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // 4. 이 호텔만의 전용 사이드바 할인코드 목록 가져오기
  const { data: siteSettingsData } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", `hotel_sidebar_promo_ids_${id}`)
    .single();

  let selectedPromoIds: string[] = [];
  if (siteSettingsData?.value) {
    try {
      selectedPromoIds = JSON.parse(siteSettingsData.value);
    } catch(e) {}
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          호텔 정보 수정
        </h1>
        <p className="text-slate-500 font-medium">
          기존에 등록된 호텔의 세부 정보와 포스팅 본문(HTML)을 수정할 수 있습니다.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
        <HotelEditForm stations={stations || []} initialData={hotel} />
      </div>

      <SidebarPromoSelectorClient 
        allPromos={allPromos || []} 
        initialSelectedIds={selectedPromoIds} 
        hotelId={id}
        title="개별 호텔 사이드바 할인코드 설정 (우선 적용)"
      />
    </div>
  );
}
