"use server";

import { revalidatePath } from "next/cache";

export async function clearAllCache() {
  // layout 파라미터를 사용하면 '/' 하위의 모든 페이지 캐시가 한 번에 지워집니다.
  revalidatePath("/", "layout");
}
