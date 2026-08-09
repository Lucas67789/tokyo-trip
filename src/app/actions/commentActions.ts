"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const RANDOM_NAMES = [
  "도쿄러버", "여행가고파", "김다은", "박지민", "travelholic99", "일본여행자", "tokyo_fan", "최민수", "스시킬러", "시부야 스크램블 교차로짱", 
  "이진우", "wanderlust88", "kyoto_dream", "정윤희", "백패커킴", "한소희", "도쿄정복자", "맛집탐험대", "유니버셜가자", "tasty_japan", 
  "김지훈", "박서준", "이지은", "최아린", "도쿄투어", "일본여행매니아", "travel_bug", "사쿠라유키", "김태형", "박보검",
  "minji_kim", "tokyo_trip_99", "우동조아", "라멘매니아", "현지인맛집", "칸사이특급", "제주항공러버", "신주쿠역에서", "시부야쇼핑", "신도쿄역"
];

// 1. 일반 유저용 댓글 등록 (승인 대기 상태로 저장)
export async function addUserComment(formData: FormData) {
  const supabase = await createClient();

  const post_type = formData.get("post_type") as string;
  const post_slug = formData.get("post_slug") as string;
  const author_name = formData.get("author_name") as string;
  const content = formData.get("content") as string;

  if (!author_name || !content) {
    throw new Error("이름과 내용을 모두 입력해주세요.");
  }

  const { error } = await supabase.from("comments").insert({
    post_type,
    post_slug,
    author_name,
    content,
    is_approved: false, // 관리자 승인 전까지 미노출
    is_admin: false,
    published_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  // 승인 대기 중이므로 화면에 바로 안 보임, 하지만 캐시 갱신은 안전하게 실행
  revalidatePath(`/${post_type.toLowerCase()}/${post_slug}`);
  revalidatePath('/admin/comments');
}

// 2. 관리자용 댓글 등록 (자동 랜덤 닉네임 + 즉시 승인 + 발행 시간 설정)
export async function addAdminComment(formData: FormData) {
  const supabase = await createClient();

  // 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized: 관리자만 접근 가능합니다.");
  }

  const post_type = formData.get("post_type") as string;
  const post_slug = formData.get("post_slug") as string;
  const content = formData.get("content") as string;
  const publishedAtInput = formData.get("published_at") as string; // YYYY-MM-DDTHH:mm 형식
  const customName = formData.get("custom_name") as string;

  if (!content) {
    throw new Error("내용을 입력해주세요.");
  }

  // 닉네임 설정 (직접 입력한 값이 없으면 랜덤 추출)
  const author_name = customName && customName.trim() !== "" 
    ? customName 
    : RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];

  // 발행 시간 설정
  const published_at = publishedAtInput ? new Date(publishedAtInput).toISOString() : new Date().toISOString();

  const { error } = await supabase.from("comments").insert({
    post_type,
    post_slug,
    author_name,
    content,
    is_approved: true, // 관리자가 쓰는 거니까 무조건 노출 승인
    is_admin: true,
    published_at,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/${post_type.toLowerCase()}/${post_slug}`);
  revalidatePath('/admin/comments');
}

// 3. 미승인 댓글 승인 처리
export async function approveComment(id: string, post_type: string, post_slug: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("comments").update({ is_approved: true }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/${post_type.toLowerCase()}/${post_slug}`);
  revalidatePath('/admin/comments');
}

// 4. 댓글 삭제 처리 (스팸 등)
export async function deleteComment(id: string, post_type: string, post_slug: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/${post_type.toLowerCase()}/${post_slug}`);
  revalidatePath('/admin/comments');
}
