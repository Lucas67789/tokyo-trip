import { createClient } from "@/utils/supabase/server";
import PassRegisterForm from "@/components/admin/PassRegisterForm";
import PassList from "@/components/admin/PassList";
import { Train, Ticket } from "lucide-react";

export const revalidate = 0;

export default async function PassesAdminPage() {
  const supabase = await createClient();

  const { data: lines } = await supabase
    .from("lines")
    .select("*")
    .order("name_ko");

  const { data: stations } = await supabase
    .from("stations")
    .select("id, name_ko, subway_pass_link, express_pass_link")
    .order("name_ko");

  const { data: passes } = await supabase
    .from("passes")
    .select(`
      *,
      pass_targets (*)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">교통 패스 관리</h1>
        <p className="text-slate-500 font-medium">라피트, 주유패스 등 교통 패스를 등록하고 노출 대상을 설정합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <Ticket size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">등록된 교통 패스 목록</h2>
        </div>
        <PassList passes={passes || []} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <Train size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">신규 패스 등록</h2>
        </div>
        <PassRegisterForm stations={stations || []} lines={lines || []} />
      </div>
    </div>
  );
}
