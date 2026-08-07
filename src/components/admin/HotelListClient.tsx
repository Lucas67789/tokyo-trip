'use client';

import { Trash2, Pencil, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import AdminDataTable, { StatBadge } from './AdminDataTable';
import type { Column } from './AdminDataTable';
import { deleteHotel } from '@/app/actions/hotelActions';

type HotelWithStats = {
  id: string;
  name_ko: string;
  slug: string;
  lowest_price?: number;
  stations?: { name_ko: string } | null;
  views: number;
  totalClicks: number;
  uniqueClicks: number;
};

export default function HotelListClient({ hotels }: { hotels: HotelWithStats[] }) {
  const columns: Column<HotelWithStats>[] = [
    {
      key: 'name_ko',
      label: '호텔명',
      sortable: true,
      getValue: (item) => item.name_ko,
      render: (item) => (
        <div>
          <p className="font-bold text-slate-900 text-sm">{item.name_ko}</p>
          {item.stations?.name_ko && (
            <p className="text-xs text-slate-400 mt-0.5">{item.stations.name_ko}역</p>
          )}
        </div>
      ),
    },
    {
      key: 'station',
      label: '역',
      sortable: true,
      hideOnMobile: true,
      getValue: (item) => item.stations?.name_ko || '',
      render: (item) => (
        <span className="text-xs font-medium text-slate-500">{item.stations?.name_ko || '-'}</span>
      ),
    },
    {
      key: 'views',
      label: '조회수',
      sortable: true,
      align: 'center',
      width: '90px',
      getValue: (item) => item.views,
      render: (item) => (
        <StatBadge label="👀" value={item.views} color="slate" />
      ),
    },
    {
      key: 'totalClicks',
      label: '총 클릭',
      sortable: true,
      align: 'center',
      width: '90px',
      hideOnMobile: true,
      getValue: (item) => item.totalClicks,
      render: (item) => (
        <StatBadge label="🖱️" value={item.totalClicks} color="blue" />
      ),
    },
    {
      key: 'uniqueClicks',
      label: '순수 클릭',
      sortable: true,
      align: 'center',
      width: '100px',
      hideOnMobile: true,
      getValue: (item) => item.uniqueClicks,
      render: (item) => (
        <StatBadge label="👤" value={item.uniqueClicks} color="emerald" />
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 호텔을 삭제하시겠습니까?')) return;
    try {
      await deleteHotel(id);
    } catch (err: any) {
      alert("삭제 실패: " + err.message);
    }
  };

  return (
    <AdminDataTable<HotelWithStats>
      data={hotels}
      columns={columns}
      getId={(item) => item.id}
      searchPlaceholder="호텔명, 역 이름으로 검색..."
      searchFn={(item, q) =>
        item.name_ko.toLowerCase().includes(q) ||
        (item.stations?.name_ko || '').toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      }
      defaultPerPage={20}
      emptyIcon="🏨"
      emptyMessage="등록된 호텔이 없습니다."
      renderActions={(item) => (
        <>
          <a
            href={`/hotel/${item.slug}`}
            target="_blank"
            rel="noreferrer"
            title="페이지 보기"
            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
          >
            <ExternalLink size={14} />
          </a>
          <Link
            href={`/admin/hotel/edit/${item.id}`}
            title="수정"
            className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
          >
            <Pencil size={14} />
          </Link>
          <button
            onClick={() => handleDelete(item.id)}
            title="삭제"
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    />
  );
}
