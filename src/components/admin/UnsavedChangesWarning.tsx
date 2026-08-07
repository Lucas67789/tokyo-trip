"use client";

import { useEffect } from "react";

export default function UnsavedChangesWarning({ isDirty }: { isDirty: boolean }) {
  useEffect(() => {
    if (!isDirty) return;

    // 1. 브라우저 닫기, 새로고침 방지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 2. Next.js 내부 Link 클릭에 의한 이탈 방지
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (
        target &&
        target.href &&
        !target.href.startsWith("javascript:") &&
        !target.href.includes(window.location.pathname + "#") &&
        target.target !== "_blank"
      ) {
        if (!window.confirm("저장되지 않은 변경 사항이 있습니다. 정말 나가시겠습니까?")) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    // capture: true를 사용하여 Next.js 라우터 핸들러보다 먼저 이벤트를 가로챕니다.
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [isDirty]);

  return null;
}
