import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PassEditForm from "@/components/admin/PassEditForm";

export const revalidate = 0;

export default async function PassEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">접근 권한이 없습니다</h1>
        <p className="text-slate-500">관리자 로그인이 필요합니다.</p>
      </div>
    );
  }

  // 데이터 조회
  const { data: pass } = await supabase
    .from("passes")
    .select(`
      *,
      pass_targets (*)
    `)
    .eq("id", id)
    .single();

  if (!pass) {
    notFound();
  }

  const { data: stations } = await supabase
    .from("stations")
    .select("id, name_ko")
    .order("name_ko");

  const { data: lines } = await supabase
    .from("lines")
    .select("*")
    .order("name_ko");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">교통 패스 수정</h1>
        <p className="text-slate-500 font-medium">기존에 등록된 패스의 정보 및 노출 대상을 수정합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <PassEditForm 
          stations={stations || []} 
          lines={lines || []}
          initialData={pass} 
        />
      </div>
    </div>
  );
}
