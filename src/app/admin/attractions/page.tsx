import { createClient } from "@/utils/supabase/server";
import StationContentManager from "@/components/admin/StationContentManager";
import LineContentManager from "@/components/admin/LineContentManager";
import { MapPin } from "lucide-react";

export const revalidate = 0;

export default async function AttractionsAdminPage() {
  const supabase = await createClient();

  const { data: stations } = await supabase
    .from("stations")
    .select("id, name_ko, subway_pass_link, express_pass_link")
    .order("name_ko");

  const { data: attractions } = await supabase
    .from("station_attractions")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: lines } = await supabase
    .from("lines")
    .select("*")
    .order("name_ko");

  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("key, value")
    .like("key", "station_panel_title_%");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">명소 및 액티비티 관리</h1>
        <p className="text-slate-500 font-medium">각 역 주변의 명소나 액티비티를 등록하고 제휴 링크를 설정합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
            <MapPin size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">역 주변 명소 관리 (기존 패스 링크 포함)</h2>
        </div>
        
        <StationContentManager 
          stations={stations || []} 
          attractions={attractions || []} 
          siteSettings={siteSettings || []}
        />
      </div>

      <LineContentManager lines={lines || []} stations={stations || []} />
    </div>
  );
}
