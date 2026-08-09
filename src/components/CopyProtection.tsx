"use client";

import { useEffect } from "react";

/**
 * CopyProtection 컴포넌트
 * 사용자가 도쿄 지하철 패스 및 상세 가이드를 복사해 갈 때 출처를 자동 표기합니다.
 * 단, 일반 사용자 UX(쿠폰 코드 복사, 짧은 텍스트 복사)에 지장을 주지 않도록 정교하게 필터링합니다.
 */
export default function CopyProtection() {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      // 1. 사용자가 텍스트 상자(Input, Textarea)나 편집 가능 영역에서 복사하는 경우 패스
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      // 2. 브라우저에서 드래그하여 선택한 텍스트 획득
      const selection = window.getSelection();
      if (!selection) return;
      const originalText = selection.toString();

      // 3. 복사한 텍스트 길이가 35자 미만인 경우 패스 (쿠폰코드, 지명, 역 이름 등 짧은 단위 복사 보호)
      if (originalText.length < 35) {
        return;
      }

      // 4. 공백이 하나도 없는 단일 문자열인 경우 패스 (쿠폰코드 특화 보호 예외처리)
      if (!originalText.trim().includes(" ")) {
        return;
      }

      // 5. 출처 문구 및 동적 원문 링크 포맷팅
      const currentUrl = window.location.href;
      const citationText =
        `\n\n[출처] 도쿄 지하철 노선도 & 도쿄 여행지 추천 (https://tokyotrip.kr)\n` +
        `(원문 링크: ${currentUrl})`;

      const combinedText = originalText + citationText;

      // 6. 클립보드 데이터 교체 및 기존 복사 이벤트 차단
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", combinedText);
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  return null;
}
