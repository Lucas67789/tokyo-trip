import Link from 'next/link';
import { Map, Lightbulb, Train, Utensils, Info } from 'lucide-react';
import { createPublicClient } from '@/utils/supabase/server';
import HeaderMenuClient from './HeaderMenuClient';
import CategoryScrollMenu from './CategoryScrollMenu';

export default async function Header() {
  const supabase = createPublicClient();
  const { data: menus } = await supabase
    .from('menus')
    .select('id, title, url, sort_order')
    .eq('is_active', true)
    .order('sort_order');

  const fallbackMenus = menus && menus.length > 0 ? menus : [
    { id: 'sample-m1', title: '도쿄 필수 교통 패스', url: '/' },
    { id: 'sample-m2', title: '역별 추천 숙소', url: '/#stations' },
    { id: 'sample-m3', title: '이달의 할인 쿠폰', url: '/#promos' },
    { id: 'sample-m4', title: '도쿄 필수 여행 팁', url: '/#tips' },
    { id: 'sample-m5', title: '현지인 추천 맛집', url: '/#tips' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0E17]/80 backdrop-blur-xl border-b border-white/10 transform-gpu">
      {/* 메인 네비게이션 바 */}
      <div className="h-16 flex items-center justify-center">
        <div className="w-full max-w-7xl px-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-cyan-500/20 p-2 rounded-xl text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all duration-300">
              <Map size={18} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-sans group-hover:text-cyan-300 transition-colors">TokyoTrip</span>
          </Link>
          
          <HeaderMenuClient menus={fallbackMenus} />
        </div>
      </div>

      {/* 카테고리 메뉴 바 (메뉴가 있을 때만 표시) */}
      {fallbackMenus.length > 0 && (
        <div className="border-t border-white/5 bg-[#0A0E17]/60 backdrop-blur-md">
          <CategoryScrollMenu menus={fallbackMenus} />
        </div>
      )}
    </header>
  );
}
