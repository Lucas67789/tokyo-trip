"use client";

import { useState, useEffect, useTransition } from "react";
import TiptapEditor from "./TiptapEditor";
import SingleImageUploader from "./SingleImageUploader";
import { updatePost } from "@/app/actions/postActions";
import { romanizeHangul } from "@/utils/slugify";
import { useRouter } from "next/navigation";
import UnsavedChangesWarning from "./UnsavedChangesWarning";

const CATEGORIES = [
  "여행팁",
  "교통가이드",
  "맛집",
  "쇼핑",
  "숙소",
  "관광지",
];

interface Pass {
  id: string;
  name_ko: string;
  slug: string;
}

interface Attraction {
  id: string;
  name: string;
  category: string;
  image_url?: string;
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  content: string;
  linked_pass_ids: string[];
  linked_attraction_ids: string[];
  thumbnail_url?: string;
}

interface PostEditFormProps {
  initialData: PostData;
  passes?: Pass[];
  attractions?: Attraction[];
}

export default function PostEditForm({ initialData, passes = [], attractions = [] }: PostEditFormProps) {
  const [title, setTitle] = useState(initialData.title || "");
  const [selectedPasses, setSelectedPasses] = useState<string[]>(initialData.linked_pass_ids || []);
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>(initialData.linked_attraction_ids || []);
  const [slug, setSlug] = useState(initialData.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData.slug);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 제목 기반 자동 슬러그 생성 (수동 편집되지 않았을 때만)
  useEffect(() => {
    if (isSlugManuallyEdited) return;
    if (!title.trim()) {
      setSlug("");
      return;
    }
    setSlug(romanizeHangul(title));
  }, [title, isSlugManuallyEdited]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updatePost(formData);
        localStorage.removeItem(`post_edit_${initialData.id}`); // 성공 시 임시저장 삭제
        alert("포스팅이 성공적으로 수정되었습니다!");
        router.push("/admin/posts");
      } catch (err: any) {
        alert("수정 실패: " + err.message);
      }
    });
  };

  // Extract post_title from content if it exists
  const extractPostTitle = (htmlContent: string) => {
    // 본문의 다른 소제목을 뺏지 않도록 SEO H2 태그 고유 클래스만 타겟팅
    const match = htmlContent.match(/<h2 class="text-2xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100">(.*?)<\/h2>/);
    return match ? match[1] : "";
  };
  
  // Remove the h2 from the initial content if it exists
  const removeTitleFromContent = (htmlContent: string) => {
    // 본문의 다른 소제목을 지우지 않도록 SEO H2 태그 고유 클래스만 타겟팅
    return htmlContent.replace(/<h2 class="text-2xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100">.*?<\/h2>\s*/, "");
  };

  const initialPostTitle = extractPostTitle(initialData.content || "");
  const initialContent = removeTitleFromContent(initialData.content || "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <UnsavedChangesWarning isDirty={true} />
      <input type="hidden" name="id" value={initialData.id} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"포스팅 제목"}</label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 나리타공항에서 신주쿠역 가는법"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 font-bold"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
            {"URL 식별자 (Slug)"}
            <span className="text-xs text-emerald-500 font-semibold ml-2">*(자동 완성)*</span>
          </label>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugManuallyEdited(true);
            }}
            placeholder="예: narita-to-shinjuku"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"카테고리"}</label>
          <select
            name="category"
            defaultValue={initialData.category || "여행팁"}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-800"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"1줄 요약 (목록 노출용)"}</label>
          <input
            type="text"
            name="description"
            defaultValue={initialData.description || ""}
            placeholder="예: 스카이라이너 vs 공항급행, 어떤 게 더 나을까?"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 font-bold"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"SEO 노출용 제목 (본문 H2 삽입)"}</label>
          <input
            type="text"
            name="post_title"
            defaultValue={initialPostTitle}
            placeholder="예: 2026년 나리타공항에서 신주쿠역 가는 법 완벽 가이드"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 font-bold text-emerald-700"
          />
        </div>

        {/* 어필리에이트 연동 (교통패스 선택) */}
        <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <label className="block text-sm font-extrabold text-slate-900 mb-2">{"💸 연관 교통 패스 선택 (어필리에이트 노출용)"}</label>
          <p className="text-xs text-slate-500 mb-4 font-medium">이 포스팅의 PC 우측 배너, 모바일 하단 바, 본문 스마트 카드에 노출할 패스를 선택하세요.</p>
          
          <input type="hidden" name="linked_pass_ids" value={JSON.stringify(selectedPasses)} />
          
          {passes.length === 0 ? (
            <p className="text-sm text-slate-400 font-bold">등록된 패스가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {passes.map(pass => (
                <label key={pass.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPasses.includes(pass.id) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    checked={selectedPasses.includes(pass.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPasses(prev => [...prev, pass.id]);
                      } else {
                        setSelectedPasses(prev => prev.filter(id => id !== pass.id));
                      }
                    }}
                  />
                  <span className={`text-sm font-bold ${selectedPasses.includes(pass.id) ? 'text-emerald-700' : 'text-slate-700'}`}>{pass.name_ko}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 어필리에이트 연동 (명소/액티비티 선택) */}
        <div className="md:col-span-2 bg-amber-50/50 border border-amber-200 rounded-xl p-5">
          <label className="block text-sm font-extrabold text-slate-900 mb-2">{"🎯 연관 명소 및 액티비티 선택 (어필리에이트 노출용)"}</label>
          <p className="text-xs text-slate-500 mb-4 font-medium">이 포스팅의 본문 상단에 노출할 명소/액티비티를 선택하세요.</p>
          
          <input type="hidden" name="linked_attraction_ids" value={JSON.stringify(selectedAttractions)} />
          
          {attractions.length === 0 ? (
            <p className="text-sm text-slate-400 font-bold">등록된 명소/액티비티가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attractions.map(attr => (
                <label key={attr.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedAttractions.includes(attr.id) ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    checked={selectedAttractions.includes(attr.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAttractions(prev => [...prev, attr.id]);
                      } else {
                        setSelectedAttractions(prev => prev.filter(id => id !== attr.id));
                      }
                    }}
                  />
                  <div className="min-w-0">
                    <span className={`text-sm font-bold block ${selectedAttractions.includes(attr.id) ? 'text-amber-700' : 'text-slate-700'}`}>{attr.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{attr.category}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 대표 썸네일 이미지 지정 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
            {"🖼️ 대표 썸네일 이미지"}
            <span className="text-xs text-slate-400 font-medium ml-2">* 비워두면 본문 첫 번째 이미지가 자동 적용됩니다</span>
          </label>
          <SingleImageUploader
            name="thumbnail_url"
            defaultValue={initialData.thumbnail_url || ""}
            placeholder="대표 썸네일 이미지 URL을 입력하거나 업로드하세요"
          />
        </div>
      </div>

      <div className="mt-2">
        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"본문 작성"}</label>
        <TiptapEditor initialContent={initialContent} draftKey={`post_edit_${initialData.id}`} />
      </div>

      <div className="pt-6 border-t border-slate-100 flex gap-4">
        <a href="/admin/posts" className="flex-1 text-center bg-slate-100 text-slate-700 font-extrabold py-4 rounded-xl hover:bg-slate-200 transition-all text-lg cursor-pointer">
          취소
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="flex-[2] bg-emerald-600 text-white font-extrabold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "저장 중..." : "포스팅 수정 내역 저장하기"}
        </button>
      </div>
    </form>
  );
}
