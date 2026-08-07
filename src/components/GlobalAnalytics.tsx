'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalAnalytics() {
  const pathname = usePathname();
  const tracked = useRef(false);

  useEffect(() => {
    // 세션당 최초 1회만 SITE_VISIT 이벤트를 발송합니다.
    if (tracked.current) return;
    
    // admin 경로는 추적에서 제외
    if (pathname && pathname.startsWith('/admin')) return;

    tracked.current = true;

    let action_type = 'SITE_VISIT';
    if (pathname === '/') {
      action_type = 'VISIT_HOME';
    }

    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action_type,
      }),
    }).catch(console.error);
  }, [pathname]);

  return null;
}
