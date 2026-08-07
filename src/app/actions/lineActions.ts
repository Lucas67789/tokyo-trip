"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLineAffiliate(lineId: string, affiliateUrl: string) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized: 로그인 세션이 만료되었거나 관리자 권한이 없습니다.");

  const { error } = await supabase
    .from("lines")
    .update({ affiliate_url: affiliateUrl })
    .eq("id", lineId);

  if (error) {
    console.error("Error updating line affiliate:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
