import { createClient } from "@/utils/supabase/server";
import PostRegisterForm from "@/components/admin/PostRegisterForm";
import PostList from "@/components/admin/PostList";
import { FileText, PenTool } from "lucide-react";

export const revalidate = 0;

export default async function PostsAdminPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  // 교통 패스(passes) 목록 가져오기 (어필리에이트 연동용)
  const { data: passes } = await supabase
    .from("passes")
    .select("id, name_ko, slug")
    .order("created_at", { ascending: false });

  // 명소/액티비티 목록 가져오기 (어필리에이트 연동용)
  const { data: attractions } = await supabase
    .from("station_attractions")
    .select("id, name, category, image_url")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">여행 팁 포스팅 관리</h1>
        <p className="text-slate-500 font-medium">도쿄 여행 팁, 교통 가이드 등 블로그 포스팅을 작성하고 관리합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <FileText size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">등록된 포스팅 목록</h2>
          <span className="text-sm font-bold text-slate-400 ml-auto">{(posts || []).length}개</span>
        </div>
        <PostList posts={posts || []} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <PenTool size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">새 포스팅 작성</h2>
        </div>
        <PostRegisterForm passes={passes || []} attractions={attractions || []} />
      </div>
    </div>
  );
}
