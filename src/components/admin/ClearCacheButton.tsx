"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { clearAllCache } from "@/app/actions/cacheActions";

export default function ClearCacheButton() {
  const [isPending, setIsPending] = useState(false);

  const handleClearCache = async () => {
    if (!confirm("전체 사이트 캐시를 초기화하시겠습니까?\nSupabase에서 직접 데이터를 수정했거나 스크립트를 돌린 경우에만 사용하세요.")) return;
    
    setIsPending(true);
    try {
      await clearAllCache();
      alert("✅ 전체 사이트 캐시가 성공적으로 초기화되었습니다.\n이제 새로고침하면 최신 데이터가 반영됩니다.");
    } catch (error) {
      console.error(error);
      alert("캐시 초기화 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleClearCache}
      disabled={isPending}
      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
      title="수동 캐시 초기화"
    >
      <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
      <span className="hidden sm:inline">
        {isPending ? "초기화 중..." : "전체 캐시 초기화"}
      </span>
      <span className="sm:hidden">
        {isPending ? "진행 중" : "캐시 리셋"}
      </span>
    </button>
  );
}
