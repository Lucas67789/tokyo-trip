"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface DiscountCodeProps {
  code?: string;
  discountRate?: string;
}

export default function DiscountCodeBox({ code = "AGODAKR24", discountRate = "5% 추가 할인" }: DiscountCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-indigo-900">{discountRate} 혜택!</span>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold self-start mt-1">아고다 쿠폰</span>
      </div>
      
      <button 
        onClick={handleCopy}
        className={`flex flex-col items-center justify-center min-w-[70px] h-14 rounded-xl transition-all shadow-sm z-10 ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 hover:border-indigo-300 border border-slate-200'}`}
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        <span className="text-[10px] font-bold mt-0.5">{copied ? "복사완료" : "코드복사"}</span>
      </button>

      {copied && (
        <div className="absolute top-0 left-0 w-full h-full bg-slate-900/90 text-white text-xs font-bold flex items-center justify-center animate-in fade-in duration-200">
          할인 코드가 복사되었습니다.
        </div>
      )}
    </div>
  );
}
