'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hotel, Ticket, Home, Train, MapPin, MessageSquare, Navigation, FileText, BarChart3 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: '종합 대시보드', icon: BarChart3 },
    { href: '/admin', label: '호텔 리스트 관리', icon: Hotel },
    { href: '/admin/coupons', label: '할인코드 관리', icon: Ticket },
    { href: '/admin/passes', label: '교통 패스 관리', icon: Train },
    { href: '/admin/attractions', label: '명소 및 액티비티 관리', icon: MapPin },
    { href: '/admin/comments', label: '댓글 관리 및 예약발행', icon: MessageSquare },
    { href: '/admin/menus', label: '상단 메뉴 관리', icon: Navigation },
    { href: '/admin/posts', label: '여행 팁 포스팅', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="text-white font-black text-xl tracking-tight">🔐 Admin Panel</div>
          <div className="text-slate-400 text-xs font-medium mt-1">관리자 전용 패널</div>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Home size={18} />
              메인 페이지로
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
