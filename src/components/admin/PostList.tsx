"use client";

import { useTransition } from "react";
import { Trash2, ExternalLink, Eye, Pencil, Copy } from "lucide-react";
import Link from "next/link";
import { deletePost, duplicatePost } from "@/app/actions/postActions";
import AdminDataTable, { StatusBadge } from "./AdminDataTable";
import type { Column, FilterConfig } from "./AdminDataTable";

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  view_count: number;
  is_published: boolean;
  created_at: string;
  thumbnail_url: string;
}

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`"${title}" 포스팅을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deletePost(id);
      } catch (e: any) {
        alert("삭제 실패: " + e.message);
      }
    });
  };

  const handleDuplicate = (id: string, title: string) => {
    if (!confirm(`"${title}" 포스팅을 복사하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await duplicatePost(id);
      } catch (e: any) {
        alert("복사 실패: " + e.message);
      }
    });
  };

  // Get unique categories
  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];

  const columns: Column<Post>[] = [
    {
      key: 'thumbnail',
      label: '',
      width: '64px',
      render: (item) => item.thumbnail_url ? (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="w-full h-full object-contain bg-slate-50"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 text-lg">📝</div>
      ),
    },
    {
      key: 'category',
      label: '카테고리',
      sortable: true,
      width: '100px',
      getValue: (item) => item.category,
      render: (item) => (
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
          {item.category}
        </span>
      ),
    },
    {
      key: 'title',
      label: '제목',
      sortable: true,
      getValue: (item) => item.title,
      render: (item) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
        </div>
      ),
    },
    {
      key: 'is_published',
      label: '상태',
      sortable: true,
      align: 'center',
      width: '80px',
      getValue: (item) => item.is_published ? 1 : 0,
      render: (item) => (
        <StatusBadge active={item.is_published} activeLabel="공개" inactiveLabel="비공개" />
      ),
    },
    {
      key: 'view_count',
      label: '조회수',
      sortable: true,
      align: 'center',
      width: '80px',
      hideOnMobile: true,
      getValue: (item) => item.view_count,
      render: (item) => (
        <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
          <Eye size={12} />
          <span className="font-bold">{item.view_count.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: '등록일',
      sortable: true,
      align: 'center',
      width: '90px',
      hideOnMobile: true,
      getValue: (item) => item.created_at,
      render: (item) => (
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
        </span>
      ),
    },
  ];

  const tableFilters: FilterConfig<Post>[] = [
    {
      key: 'category',
      label: '카테고리',
      options: categories.map(c => ({ label: c, value: c })),
      filterFn: (item, val) => item.category === val,
    },
    {
      key: 'status',
      label: '상태',
      options: [
        { label: '공개', value: 'published' },
        { label: '비공개', value: 'draft' },
      ],
      filterFn: (item, val) => val === 'published' ? item.is_published : !item.is_published,
    },
  ];

  return (
    <AdminDataTable<Post>
      data={posts}
      columns={columns}
      getId={(item) => item.id}
      searchPlaceholder="제목, 설명, 카테고리로 검색..."
      searchFn={(item, q) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      }
      filters={tableFilters}
      defaultPerPage={20}
      emptyIcon="📝"
      emptyMessage="등록된 포스팅이 없습니다."
      renderActions={(item) => (
        <>
          <Link
            href={`/post/${item.slug}`}
            target="_blank"
            title="페이지 보기"
            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
          >
            <ExternalLink size={14} />
          </Link>
          <button
            onClick={() => handleDuplicate(item.id, item.title)}
            disabled={isPending}
            title="복사"
            className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Copy size={14} />
          </button>
          <Link
            href={`/admin/post/edit/${item.id}`}
            title="수정"
            className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
          >
            <Pencil size={14} />
          </Link>
          <button
            onClick={() => handleDelete(item.id, item.title)}
            disabled={isPending}
            title="삭제"
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
      renderStats={(all) => {
        const published = all.filter(p => p.is_published).length;
        return (
          <>
            <span>• 공개 <span className="text-emerald-600">{published}</span></span>
            <span>• 비공개 <span className="text-slate-400">{all.length - published}</span></span>
          </>
        );
      }}
    />
  );
}
