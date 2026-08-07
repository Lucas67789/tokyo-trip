'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Trash2, Copy, Check, Pencil, ExternalLink
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────

type SortDirection = 'asc' | 'desc';

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
  getValue?: (item: T) => string | number;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
};

export type FilterConfig<T> = {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  filterFn: (item: T, value: string) => boolean;
};

type AdminDataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  getId: (item: T) => string;

  // Search
  searchPlaceholder?: string;
  searchFn?: (item: T, query: string) => boolean;

  // Filters
  filters?: FilterConfig<T>[];

  // Pagination
  defaultPerPage?: number;
  perPageOptions?: number[];

  // Bulk actions
  onBulkDelete?: (ids: string[]) => Promise<void>;
  bulkDeleteLabel?: string;

  // Row actions
  renderActions?: (item: T) => React.ReactNode;

  // Stats
  renderStats?: (all: T[], filtered: T[]) => React.ReactNode;

  // Empty
  emptyIcon?: string;
  emptyMessage?: string;

  // Sticky toolbar
  stickyTop?: string;
};

// ─── Component ───────────────────────────────────────────────────────

export default function AdminDataTable<T>({
  data,
  columns,
  getId,
  searchPlaceholder = '검색...',
  searchFn,
  filters = [],
  defaultPerPage = 20,
  perPageOptions = [10, 20, 50, 100],
  onBulkDelete,
  bulkDeleteLabel = '선택 삭제',
  renderActions,
  renderStats,
  emptyIcon = '📋',
  emptyMessage = '등록된 항목이 없습니다.',
  stickyTop = 'top-0',
}: AdminDataTableProps<T>) {
  // ─── State ──────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Filtering ──────────────────────────
  const filteredData = useMemo(() => {
    let result = [...data];

    // Text search
    if (searchQuery.trim() && searchFn) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(item => searchFn(item, q));
    }

    // Dropdown filters
    for (const filter of filters) {
      const val = filterValues[filter.key];
      if (val && val !== '__ALL__') {
        result = result.filter(item => filter.filterFn(item, val));
      }
    }

    return result;
  }, [data, searchQuery, searchFn, filters, filterValues]);

  // ─── Sorting ────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find(c => c.key === sortKey);
    if (!col?.getValue) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = col.getValue!(a);
      const bVal = col.getValue!(b);
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortKey, sortDir, columns]);

  // ─── Pagination ─────────────────────────
  const totalPages = Math.max(1, Math.ceil(sortedData.length / perPage));
  const safePage = Math.min(currentPage, totalPages);

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, safePage, perPage]);

  // Reset page on filter/search change
  const resetPage = useCallback(() => setCurrentPage(1), []);

  // ─── Selection ──────────────────────────
  const allPageSelected = pagedData.length > 0 && pagedData.every(item => selectedIds.has(getId(item)));
  const somePageSelected = pagedData.some(item => selectedIds.has(getId(item)));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      const next = new Set(selectedIds);
      pagedData.forEach(item => next.delete(getId(item)));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      pagedData.forEach(item => next.add(getId(item)));
      setSelectedIds(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // ─── Handlers ───────────────────────────
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || !onBulkDelete) return;
    if (!confirm(`선택한 ${selectedIds.size}개 항목을 삭제하시겠습니까?`)) return;
    setIsDeleting(true);
    try {
      await onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.');
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePerPageChange = (val: number) => {
    setPerPage(val);
    setCurrentPage(1);
  };

  // ─── Sort Icon ──────────────────────────
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown size={14} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={14} className="text-blue-600" />
      : <ChevronDown size={14} className="text-blue-600" />;
  };

  // ─── Page numbers ───────────────────────
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // ─── Render ─────────────────────────────
  return (
    <div className="space-y-0">
      {/* ── Toolbar ── */}
      <div className={`bg-white rounded-t-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3 sticky ${stickyTop} z-10`}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        {filters.map(f => (
          <select
            key={f.key}
            value={filterValues[f.key] || '__ALL__'}
            onChange={e => { setFilterValues(prev => ({ ...prev, [f.key]: e.target.value })); resetPage(); }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            <option value="__ALL__">{f.label}: 전체</option>
            {f.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ))}

        {/* Per page */}
        <select
          value={perPage}
          onChange={e => handlePerPageChange(Number(e.target.value))}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
        >
          {perPageOptions.map(n => (
            <option key={n} value={n}>{n}개씩</option>
          ))}
        </select>

        {/* Bulk delete */}
        {onBulkDelete && selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
            {bulkDeleteLabel} ({selectedIds.size})
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border-x border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {/* Checkbox column */}
              {onBulkDelete && (
                <th className="w-12 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-${col.align || 'left'} font-extrabold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {col.label}
                      <SortIcon columnKey={col.key} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {renderActions && (
                <th className="px-4 py-3 text-center font-extrabold text-slate-600 text-xs uppercase tracking-wider w-24">
                  관리
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onBulkDelete ? 1 : 0) + (renderActions ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="text-4xl mb-3">{emptyIcon}</div>
                  <p className="text-slate-400 text-sm font-medium">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              pagedData.map(item => {
                const id = getId(item);
                return (
                  <tr key={id} className="hover:bg-blue-50/30 transition-colors group">
                    {onBulkDelete && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(id)}
                          onChange={() => toggleSelect(id)}
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-${col.align || 'left'} ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                      >
                        {col.render(item)}
                      </td>
                    ))}
                    {renderActions && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {renderActions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: Stats + Pagination ── */}
      <div className="bg-white rounded-b-2xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span>총 <span className="text-slate-900">{data.length}</span>개</span>
          {filteredData.length !== data.length && (
            <span>• 필터 결과 <span className="text-blue-600">{filteredData.length}</span>개</span>
          )}
          {selectedIds.size > 0 && (
            <span>• 선택 <span className="text-purple-600">{selectedIds.size}</span>개</span>
          )}
          {renderStats && renderStats(data, filteredData)}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, i) =>
              page === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-slate-400 text-sm">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] h-8 rounded-lg text-sm font-bold transition-colors ${
                    safePage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper: Copy Button ─────────────────────────────────────────────

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? '복사 완료!' : '코드 복사'}
      className={`inline-flex items-center gap-1 transition-all active:scale-95 ${className || ''}`}
    >
      {copied ? (
        <Check size={14} className="text-emerald-500" />
      ) : (
        <Copy size={14} className="text-slate-400 hover:text-blue-500" />
      )}
    </button>
  );
}

// ─── Helper: Status Badge ────────────────────────────────────────────

export function StatusBadge({ active, activeLabel = '공개', inactiveLabel = '비공개' }: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${
      active
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-slate-100 text-slate-400'
    }`}>
      {active ? '●' : '○'} {active ? activeLabel : inactiveLabel}
    </span>
  );
}

// ─── Helper: Stat Badge ─────────────────────────────────────────────

export function StatBadge({ icon, label, value, color = 'slate' }: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'slate' | 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}) {
  const colorMap = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap ${colorMap[color]}`}>
      {icon}
      {label} <span className="font-black">{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </span>
  );
}
