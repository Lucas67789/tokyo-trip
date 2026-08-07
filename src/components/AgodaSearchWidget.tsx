'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    AgdSherpa: any;
  }
}

// 데스크톱: Oneline 레이아웃 (가로형)
const DESKTOP_CONFIG = {
  width: 1288,
  height: 300,
  layout: "Oneline",
  crt: "6263325083202",
};

// 모바일: Wide 레이아웃 (세로형, 모바일 친화적)
const MOBILE_CONFIG = {
  width: 480,
  height: 500,
  layout: "Wide",
  crt: "6263325083202",
};

const MOBILE_BREAKPOINT = 768;

interface AgodaSearchWidgetProps {
  destinationName?: string;
  cityId?: string;
  stationNameKo?: string;
}

export default function AgodaSearchWidget({
  destinationName = "오사카, 일본",
  cityId = "9590",
  stationNameKo = "",
}: AgodaSearchWidgetProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef(`adgshp-${Date.now()}`);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const prevIsMobile = useRef<boolean | null>(null);

  const config = isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;

  // 컨테이너 너비에 맞춰 scale 계산
  const updateScale = useCallback(() => {
    if (!wrapperRef.current) return;
    const availableWidth = wrapperRef.current.clientWidth;
    const mobile = availableWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    const currentConfig = mobile ? MOBILE_CONFIG : DESKTOP_CONFIG;
    const newScale = Math.min(1, availableWidth / currentConfig.width);
    setScale(newScale);
  }, []);

  // 리사이즈 감지
  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // Sherpa 위젯 초기화 (모바일/데스크톱 전환 시 재초기화)
  useEffect(() => {
    // 최초 또는 모바일↔데스크톱 전환 시에만 재초기화
    if (prevIsMobile.current === isMobile && prevIsMobile.current !== null) return;
    prevIsMobile.current = isMobile;

    const id = widgetId.current;

    // 이전 위젯 정리
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
    setLoaded(false);

    const existingScript = document.querySelector(
      'script[src*="sherpa_init1_08.min.js"]'
    );

    const initWidget = () => {
      if (!window.AgdSherpa) return;

      const stg: any = {};
      stg.crt = config.crt;
      stg.version = "1.04";
      stg.id = stg.name = id;
      stg.width = `${config.width}px`;
      stg.height = `${config.height}px`;
      stg.ReferenceKey = "YgMq/bQIyX6qb5hUJxrsrA==";
      stg.Layout = config.layout;
      stg.Language = "ko-kr";
      stg.Cid = "1959989";
      stg.City = cityId;
      stg.DestinationName = destinationName;
      stg.OverideConf = false;

      try {
        new window.AgdSherpa(stg).initialize();
        setLoaded(true);
        setTimeout(updateScale, 200);
      } catch (e) {
        console.error("Agoda Sherpa 초기화 실패:", e);
      }
    };

    if (existingScript && window.AgdSherpa) {
      initWidget();
    } else if (!existingScript) {
      const script = document.createElement("script");
      script.src = "//cdn0.agoda.net/images/sherpa/js/sherpa_init1_08.min.js";
      script.async = true;
      script.onload = () => {
        setTimeout(initWidget, 100);
      };
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => {
        setTimeout(initWidget, 100);
      });
    }

    return () => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    };
  }, [isMobile, cityId, destinationName, config, updateScale]);

  const scaledHeight = config.height * scale;

  return (
    <div className="w-full pt-8">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-100 rounded-2xl p-5 md:p-6 shadow-sm">
        {/* 타이틀 */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/>
              <path d="M21 7H3l2-4h14l2 4z"/>
              <path d="M12 11v6"/>
              <path d="M8 11v6"/>
              <path d="M16 11v6"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {stationNameKo ? `${stationNameKo} 근처 숙소 검색` : "도착지 근처 숙소 검색"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {destinationName} 지역 특가 호텔을 비교해보세요
            </p>
          </div>
          <span className="ml-auto bg-white border border-blue-200 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full hidden sm:block">
            agoda 제휴
          </span>
        </div>

        {/* 아고다 위젯 삽입 영역 — scale로 축소하여 잘림 방지 */}
        <div
          ref={wrapperRef}
          className="w-full rounded-xl overflow-visible"
          style={{ height: `${scaledHeight}px` }}
        >
          <div
            style={{
              width: `${config.width}px`,
              height: `${config.height}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <div id={widgetId.current}></div>
          </div>
        </div>

        {!loaded && (
          <div className="flex items-center justify-center py-4 text-slate-400 text-xs font-medium gap-2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
            검색창 로딩 중...
          </div>
        )}
      </div>
    </div>
  );
}
