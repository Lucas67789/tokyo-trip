import { createClient } from "@/utils/supabase/server";
import CommentManager from "@/components/admin/CommentManager";

export const revalidate = 0;

export default async function AdminCommentsPage() {
  const supabase = await createClient();

  // 1. 모든 댓글 조회
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. 관리자용 댓글 작성을 위해 타겟 목록(호텔/패스) 조회
  const { data: hotels } = await supabase.from("hotels").select("slug, name_ko");
  const { data: passes } = await supabase.from("passes").select("slug, name_ko");

  const targetList = [
    ...(hotels || []).map(h => ({ type: "HOTEL", slug: h.slug, name: h.name_ko })),
    ...(passes || []).map(p => ({ type: "PASS", slug: p.slug, name: p.name_ko }))
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">댓글 관리 및 예약 발행</h1>
        <p className="text-slate-500 font-medium">일반 사용자의 댓글을 승인/삭제하고, SEO 점수용 댓글을 예약 발행할 수 있습니다.</p>
      </div>

      <CommentManager comments={comments || []} targetList={targetList} />
    </div>
  );
}
