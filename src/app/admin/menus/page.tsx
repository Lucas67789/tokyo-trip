import { createClient } from "@/utils/supabase/server";
import MenuManager from "@/components/admin/MenuManager";
import { Navigation } from "lucide-react";

export const revalidate = 0;

export default async function MenusAdminPage() {
  const supabase = await createClient();

  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .order("sort_order");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">상단 메뉴 관리</h1>
        <p className="text-slate-500 font-medium">사이트 최상단에 노출되는 카테고리 메뉴를 관리합니다.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Navigation size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">💡 사용법 안내</p>
            <p className="text-sm text-amber-700 mt-1">
              메뉴 이름과 이동할 링크 주소를 입력하세요. 정렬 순서 숫자가 작을수록 왼쪽에 배치됩니다.
              외부 링크(https://...)나 내부 경로(/post/slug) 모두 사용 가능합니다.
            </p>
          </div>
        </div>
      </div>

      <MenuManager menus={menus || []} />
    </div>
  );
}
