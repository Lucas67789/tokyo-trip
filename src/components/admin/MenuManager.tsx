"use client";

import { useState, useTransition } from "react";
import { Trash2, GripVertical, Plus, Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import { addMenu, updateMenu, deleteMenu, toggleMenuActive } from "@/app/actions/menuActions";

interface Menu {
  id: string;
  title: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

interface MenuManagerProps {
  menus: Menu[];
}

export default function MenuManager({ menus: initialMenus }: MenuManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editOrder, setEditOrder] = useState(0);

  const handleEdit = (menu: Menu) => {
    setEditingId(menu.id);
    setEditTitle(menu.title);
    setEditUrl(menu.url);
    setEditOrder(menu.sort_order);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    startTransition(async () => {
      try {
        await updateMenu(editingId, editTitle, editUrl, editOrder);
        setEditingId(null);
        alert("메뉴가 수정되었습니다.");
      } catch (e: any) {
        alert("수정 실패: " + e.message);
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`"${title}" 메뉴를 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deleteMenu(id);
        alert("삭제되었습니다.");
      } catch (e: any) {
        alert("삭제 실패: " + e.message);
      }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      try {
        await toggleMenuActive(id, !current);
      } catch (e: any) {
        alert("변경 실패: " + e.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 등록된 메뉴 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">등록된 메뉴 목록</h2>
        {initialMenus.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">등록된 메뉴가 없습니다. 아래에서 새 메뉴를 추가해 주세요.</p>
        ) : (
          <div className="space-y-2">
            {initialMenus
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((menu) => (
              <div key={menu.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${menu.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <GripVertical size={16} className="text-slate-300 flex-shrink-0" />
                
                {editingId === menu.id ? (
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold flex-1 min-w-[120px]"
                      placeholder="메뉴명"
                    />
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono flex-1 min-w-[120px]"
                      placeholder="/post/slug"
                    />
                    <input
                      type="number"
                      value={editOrder}
                      onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-16 text-center"
                    />
                    <button onClick={handleSaveEdit} disabled={isPending} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-900 text-sm">{menu.title}</span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">{menu.url}</span>
                    </div>
                    <span className="text-xs text-slate-300 font-mono w-8 text-center flex-shrink-0">#{menu.sort_order}</span>
                    <button
                      onClick={() => handleToggle(menu.id, menu.is_active)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title={menu.is_active ? "비활성화" : "활성화"}
                    >
                      {menu.is_active ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-slate-300" />}
                    </button>
                    <button
                      onClick={() => handleEdit(menu)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id, menu.title)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 새 메뉴 추가 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-blue-500" />
          새 메뉴 추가
        </h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const formEl = e.currentTarget;
          startTransition(async () => {
            try {
              await addMenu(formData);
              alert("메뉴가 추가되었습니다.");
              formEl.reset();
            } catch (err: any) {
              alert("메뉴 추가 실패: " + err.message);
            }
          });
        }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">메뉴 이름</label>
              <input
                type="text"
                name="title"
                placeholder="예: 도쿄 여행팁"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">링크 URL</label>
              <input
                type="text"
                name="url"
                placeholder="예: /post/narita-to-shinjuku"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">정렬 순서</label>
              <input
                type="number"
                name="sort_order"
                defaultValue={0}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-center"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white font-extrabold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "추가 중..." : "메뉴 추가하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
