"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Copy, Check, ExternalLink, CircleCheck } from "lucide-react";

import Link from "next/link";

export type PromoCodeData = {
  id: string;
  partner_name: string;
  promo_code: string;
  discount_rate: string;
  target_url: string;
  description?: string; // 예: "조건: 앱 첫 예약 시 / 유효기간: 2026.06.30"
  image_url?: string | null;
  seo_content?: string | null;
};

export default function MainPromoCodeCard({ promo, redirectUrl, detailUrl }: { promo: PromoCodeData; redirectUrl?: string; detailUrl?: string }) {
  const [copied, setCopied] = useState(false);

  // 파트너별 첫 글자 추출
  const logoChar = promo.partner_name ? promo.partner_name.charAt(0) : "제";

  // 썸네일 자동 추출 (Fallback Logic)
  let displayImage = promo.image_url;
  if (!displayImage && promo.seo_content) {
    // 1. 마크다운 형식 이미지 파싱: ![alt](url)
    const mdMatch = promo.seo_content.match(/!\[.*?\]\((.*?)\)/);
    if (mdMatch && mdMatch[1]) {
      displayImage = mdMatch[1];
    } else {
      // 2. HTML 형식 이미지 파싱: <img src="url">
      const htmlMatch = promo.seo_content.match(/<img[^>]+src=["'](.*?)["']/i);
      if (htmlMatch && htmlMatch[1]) {
        displayImage = htmlMatch[1];
      }
    }
  }

  // description 파싱 (조건: XXX / 유효기간: YYY)
  let condition = "없음";
  let expiry = "상시 진행 (확인 요망)";

  if (promo.description) {
    if (promo.description.includes("/")) {
      const parts = promo.description.split("/");
      parts.forEach(part => {
        if (part.includes("조건:")) {
          condition = part.replace("조건:", "").trim();
        } else if (part.includes("유효기간:")) {
          expiry = part.replace("유효기간:", "").trim();
        } else {
          // 구분자는 있지만 라벨이 없는 경우 첫 파트는 조건, 두 번째는 유효기간으로 매핑
          if (!condition || condition === "없음") {
            condition = part.trim();
          } else {
            expiry = part.trim();
          }
        }
      });
    } else {
      // 구분자가 없는 경우
      if (promo.description.includes("유효기간:")) {
        expiry = promo.description.replace("유효기간:", "").trim();
      } else if (promo.description.includes("조건:")) {
        condition = promo.description.replace("조건:", "").trim();
      } else {
        condition = promo.description.trim();
      }
    }
  }

  // 코드 불필요 여부 체크
  const isNoCodeNeeded = 
    promo.promo_code.includes("코드 불필요") || 
    promo.promo_code.includes("코드 필요없음") || 
    promo.promo_code.includes("필요없음") || 
    promo.promo_code.includes("불필요");

  const handleCopyAndRedirect = async () => {
    // Track click
    fetch('/api/track', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_type: "CLICK_PROMO", target_id: promo.id }),
      keepalive: true,
    }).catch(() => {});

    if (isNoCodeNeeded) {
      window.open(promo.target_url, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      await navigator.clipboard.writeText(promo.promo_code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
        window.open(promo.target_url, "_blank", "noopener,noreferrer");
      }, 1000);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
      window.open(promo.target_url, "_blank", "noopener,noreferrer");
    }
  };

  if (redirectUrl) {
    const handleCardClick = () => {
      fetch('/api/track', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: "CLICK_PROMO", target_id: promo.id }),
      }).catch(() => {});
    };

    return (
      <Link href={redirectUrl} onClick={handleCardClick} className="block h-full cursor-pointer">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full overflow-hidden"
        >
          {/* 1. 쿠폰톡 시그니처 상단 에메랄드 포인트 라인 */}
          <div className="absolute left-0 top-0 right-0 h-1 bg-emerald-500 z-10"></div>

          {/* 썸네일 이미지 영역 */}
          {displayImage && (
            <div className="relative w-full aspect-square sm:aspect-[4/3] -mx-5 -mt-5 mb-5 rounded-t-2xl overflow-hidden border-b border-slate-100">
              <img src={displayImage} alt={`오사카 여행 필수 혜택, ${promo.partner_name} ${promo.discount_rate} 할인코드 공식 프로모션 썸네일`} className="w-full h-full object-contain bg-slate-50 group-hover:scale-105 transition-transform duration-300 bg-slate-50" />
            </div>
          )}

          <div className="flex-1 flex flex-col">
            {/* 2. 제휴사 정보 배지 및 서브 텍스트 */}
            <div className="flex items-center justify-between mb-3.5 gap-2">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider truncate max-w-[65%] inline-block leading-none">
                {promo.discount_rate}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm bg-emerald-500">
                  {logoChar}
                </div>
                <span className="text-[13px] text-gray-600 font-semibold tracking-tight">
                  {promo.partner_name}
                </span>
              </div>
            </div>

            {/* 3. 할인코드 혜택 제목 */}
            <h3 className="text-lg font-bold mb-3 text-gray-900 leading-tight line-clamp-2">
              {promo.partner_name} {promo.discount_rate} 할인 코드
            </h3>

            {/* 4. 쿠폰톡 스타일 조건 및 유효기간 불릿 정보 */}
            <ul className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CircleCheck size={16} className="text-green-500 shrink-0 mt-0.5" />
                <span>
                  조건: <strong className="text-gray-900 font-bold">{condition}</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400 shrink-0" />
                <span>
                  유효기간: <span className="text-gray-500">{expiry}</span>
                </span>
              </li>
            </ul>
          </div>

          {/* 5. 쿠폰톡 시그니처 점선 쿠폰 박스 & 복사 버튼 (단순 뷰어 div로 처리하여 중첩 태그 방지) */}
          <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
            <div className="w-full text-center">
              <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
                프로모션 코드
              </p>
              <div 
                className={`border-2 border-dashed py-3 px-4 rounded-lg font-mono text-lg text-center tracking-wider w-full select-all font-bold ${
                  isNoCodeNeeded 
                    ? "bg-gray-50 text-gray-400 border-gray-200" 
                    : "bg-gray-50 text-gray-800 border-gray-300"
                }`}
              >
                {promo.promo_code}
              </div>
            </div>

            <div
              className="w-full py-3 text-base rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <span className="flex items-center gap-2">
                {isNoCodeNeeded ? "할인 받기" : "코드 복사하기"}
                {isNoCodeNeeded ? <ExternalLink size={18} /> : <Copy size={18} />}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full overflow-hidden"
    >
      {/* 1. 쿠폰톡 시그니처 상단 에메랄드 포인트 라인 */}
      <div className="absolute left-0 top-0 right-0 h-1 bg-emerald-500 z-10"></div>

      {/* 썸네일 이미지 영역 */}
      {displayImage && (
        <div className="relative w-full aspect-square sm:aspect-[4/3] -mx-5 -mt-5 mb-5 rounded-t-2xl overflow-hidden border-b border-slate-100">
          <img src={displayImage} alt={`오사카 여행 필수 혜택, ${promo.partner_name} ${promo.discount_rate} 할인코드 공식 프로모션 썸네일`} className="w-full h-full object-contain bg-slate-50 group-hover:scale-105 transition-transform duration-300 bg-slate-50" />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* 2. 제휴사 정보 배지 및 서브 텍스트 */}
        <div className="flex items-center justify-between mb-3.5 gap-2">
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider truncate max-w-[65%] inline-block leading-none">
            {promo.discount_rate}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm bg-emerald-500">
              {logoChar}
            </div>
            <span className="text-[13px] text-gray-600 font-semibold tracking-tight">
              {promo.partner_name}
            </span>
          </div>
        </div>

        {/* 3. 할인코드 혜택 제목 */}
        <h3 className="text-lg font-bold mb-3 text-gray-900 leading-tight line-clamp-2">
          {promo.partner_name} {promo.discount_rate} 할인 코드
        </h3>

        {/* 4. 쿠폰톡 스타일 조건 및 유효기간 불릿 정보 */}
        <ul className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CircleCheck size={16} className="text-green-500 shrink-0 mt-0.5" />
            <span>
              조건: <strong className="text-gray-900 font-bold">{condition}</strong>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400 shrink-0" />
            <span>
              유효기간: <span className="text-gray-500">{expiry}</span>
            </span>
          </li>
        </ul>
      </div>

      {/* 5. 쿠폰톡 시그니처 점선 쿠폰 박스 & 복사 버튼 */}
      <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
        <div className="w-full text-center">
          <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
            프로모션 코드
          </p>
          <div 
            className={`border-2 border-dashed py-3 px-4 rounded-lg font-mono text-lg text-center tracking-wider w-full select-all font-bold ${
              isNoCodeNeeded 
                ? "bg-gray-50 text-gray-400 border-gray-200" 
                : "bg-gray-50 text-gray-800 border-gray-300"
            }`}
          >
            {promo.promo_code}
          </div>
        </div>

        <button
          onClick={handleCopyAndRedirect}
          className={`w-full py-3 text-base rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isNoCodeNeeded
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              : copied
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isNoCodeNeeded ? (
              <motion.div
                key="nocode"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2"
              >
                할인 받기
                <ExternalLink size={18} />
              </motion.div>
            ) : copied ? (
              <motion.div
                key="copied"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2"
              >
                <Check size={18} />
                코드 복사 완료! 바로가기
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2"
              >
                코드 복사하기
                <Copy size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {detailUrl && (
          <Link
            href={detailUrl}
            className="w-full py-2.5 mt-1 text-sm rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
          >
            할인코드 상세 가이드 보기 &rarr;
          </Link>
        )}
      </div>
    </motion.div>
  );
}
