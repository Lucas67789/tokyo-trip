import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PostEditForm from "@/components/admin/PostEditForm";
import { PenTool, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 포스팅 가져오기
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  // 교통 패스(passes) 목록 가져오기 (어필리에이트 연동용)
  const { data: passes } = await supabase
    .from("passes")
    .select("id, name_ko, slug")
    .order("created_at", { ascending: false });

  // 명소/액티비티 목록 가져오기
  const { data: attractions } = await supabase
    .from("station_attractions")
    .select("id, name, category, image_url")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/posts" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">포스팅 수정</h1>
        </div>
        <p className="text-slate-500 font-medium ml-12">기존에 작성된 여행 팁 포스팅을 수정합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
            <PenTool size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">{post.title} 수정하기</h2>
        </div>
        <PostEditForm initialData={post} passes={passes || []} attractions={attractions || []} />
      </div>
    </div>
  );
}
