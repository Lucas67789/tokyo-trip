"use client";

import { Trash2 } from "lucide-react";

export default function DeleteHotelButton() {
  return (
    <button 
      type="submit" 
      title="삭제" 
      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all active:scale-95" 
      onClick={(e) => {
        if (!confirm("정말 이 호텔을 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 size={14} />
    </button>
  );
}
