"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Image as ImageIcon, Type, Heading, Bold, Underline, Palette, MapPin, Link as LinkIcon, Type as TypeIcon } from "lucide-react";

type Block =
  | { id: string; type: "text"; content: string }
  | { id: string; type: "heading"; subtype: "h2" | "h3" | "h4"; content: string }
  | { id: string; type: "image-grid"; images: string[] }
  | { id: string; type: "map"; url: string };

function generateId(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// 구글 맵 URL → 임베드 URL 변환
function getMapEmbedUrl(url: string): string {
  try {
    if (url.includes("output=embed") || url.includes("maps/embed")) {
      return url;
    }
    const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=16&output=embed`;
    }
    const placeMatch = url.match(/\/place\/([^/@]+)/);
    if (placeMatch) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, " "))}&z=16&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&z=16&output=embed`;
  } catch {
    return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&z=16&output=embed`;
  }
}

const TEXT_COLORS = [
  { name: "빨강", value: "#EF4444" },
  { name: "파랑", value: "#3B82F6" },
  { name: "초록", value: "#16A34A" },
  { name: "주황", value: "#F97316" },
  { name: "보라", value: "#8B5CF6" },
  { name: "분홍", value: "#EC4899" },
  { name: "검정(기본)", value: "#334155" },
];

const FONT_SIZES = [
  { name: "가장 작게", value: "1", label: "10px" },
  { name: "작게", value: "2", label: "13px" },
  { name: "보통(기본)", value: "3", label: "16px" },
  { name: "조금 크게", value: "4", label: "18px" },
  { name: "크게", value: "5", label: "24px" },
  { name: "아주 크게", value: "6", label: "32px" },
  { name: "가장 크게", value: "7", label: "48px" },
];

export default function BlockEditor({ 
  initialContent, 
  inputName = "content", 
  title = "SEO 친화적 본문 작성",
  draftKey = "draft_blocks_default" 
}: { 
  initialContent?: string; 
  inputName?: string; 
  title?: string;
  draftKey?: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>([{ id: generateId(), type: "text", content: "" }]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [activeSizePicker, setActiveSizePicker] = useState<string | null>(null);

  // contentEditable 초기화 추적용 refs
  const initializedRefs = useRef<Set<string>>(new Set());
  // contentEditable의 최신 내용을 ref로 추적 (generateHTML에서 사용)
  const contentRefs = useRef<Record<string, string>>({});

  // 초기화 및 임시 저장 데이터 로드
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDraft = localStorage.getItem(draftKey);
    let draftLoaded = false;
    
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.length > 0) {
          if (window.confirm("이전에 작성 중이던 임시저장 내용이 있습니다. 불러오시겠습니까?\n(취소를 누르면 임시저장 내용이 삭제되고 기존 내용으로 시작합니다.)")) {
            setBlocks(parsed);
            parsed.forEach((b: Block) => { if (b.type === "text") contentRefs.current[b.id] = b.content; });
            draftLoaded = true;
          } else {
            localStorage.removeItem(draftKey);
          }
        }
      } catch (e) {
        console.error("임시저장 로드 실패:", e);
      }
    }

    // 임시저장을 불러오지 않았고, initialContent가 있다면 파싱해서 로드
    if (!draftLoaded && initialContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(initialContent, "text/html");
      const parsedBlocks: Block[] = [];
      
      Array.from(doc.body.children).forEach(child => {
        const isTextBlock = 
          child.tagName === "P" || 
          (child.tagName === "DIV" && 
           !child.className.includes("grid") && 
           !child.querySelector("iframe") &&
           !child.className.includes("image-zoom-caption"));

        if (isTextBlock) {
          const lastBlock = parsedBlocks[parsedBlocks.length - 1];
          let blockContent = child.tagName === "P" || child.className.includes("text-block") ? child.innerHTML : child.outerHTML;

          if (lastBlock && lastBlock.type === "text") {
            lastBlock.content += blockContent;
          } else {
            parsedBlocks.push({ id: generateId(), type: "text", content: blockContent });
          }
        } else if (child.tagName === "H2" || child.tagName === "H3" || child.tagName === "H4") {
          parsedBlocks.push({
            id: generateId(),
            type: "heading",
            subtype: child.tagName.toLowerCase() as "h2"|"h3"|"h4",
            content: child.textContent || ""
          });
        } else if (child.tagName === "DIV" && child.querySelector("iframe")) {
          const iframe = child.querySelector("iframe");
          if (iframe?.src) parsedBlocks.push({ id: generateId(), type: "map", url: iframe.src });
        } else if (child.tagName === "DIV" && child.className.includes("grid")) {
          const imgs = Array.from(child.querySelectorAll("img")).map(img => img.src);
          if (imgs.length > 0) parsedBlocks.push({ id: generateId(), type: "image-grid", images: imgs });
        }
      });
      if (parsedBlocks.length > 0) setBlocks(parsedBlocks);
    }
  }, [initialContent, draftKey]);

  const saveDraftToLocal = (currentBlocks: Block[]) => {
    try {
      const blocksToSave = currentBlocks.map(block => {
        if (block.type === 'text') {
          return { ...block, content: contentRefs.current[block.id] || block.content };
        }
        return block;
      });
      localStorage.setItem(draftKey, JSON.stringify(blocksToSave));
      setLastSaved(new Date());
    } catch (e) {
      console.error("임시저장 실패:", e);
    }
  };

  // 블록 구조가 변경될 때마다 자동 저장
  useEffect(() => {
    saveDraftToLocal(blocks);
  }, [blocks, initialContent]);

  // 창 닫기/새로고침 방지 경고 (BeforeUnload)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 작성된 내용이 있는지 확인
      const hasContent = blocks.some(b => {
        if (b.type === "text") {
          const c = contentRefs.current[b.id] ?? b.content;
          return c.trim() && c !== "<br>";
        }
        if (b.type === "heading") return b.content.trim() !== "";
        if (b.type === "image-grid") return b.images.length > 0;
        if (b.type === "map") return b.url.trim() !== "";
        return false;
      });

      if (hasContent) {
        e.preventDefault();
        e.returnValue = ""; // Chrome 등 모던 브라우저 요구사항
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [blocks]);

  // 네이버 및 구글의 상위 노출 로직에 완벽히 정합되는 HTML 자동 빌더
  const generateHTML = () => {
    return blocks
      .map((block) => {
        if (block.type === "text") {
          const content = contentRefs.current[block.id] ?? block.content;
          if (!content.trim() || content === "<br>") return "";
          return `<div class="text-block mb-5 text-slate-700 leading-relaxed font-medium text-base">${content}</div>`;
        } else if (block.type === "heading") {
          if (!block.content.trim()) return "";
          // 네이버 웹문서/구글 SERP 로봇이 본문 내 핵심 주제와 구조를 직관적으로 분석하도록 시맨틱 태그 지정
          const classes =
            block.subtype === "h2"
              ? "text-2xl font-black text-slate-900 mt-8 mb-4 border-b pb-2 border-slate-100"
              : block.subtype === "h3"
              ? "text-xl font-extrabold text-slate-800 mt-6 mb-3"
              : "text-lg font-bold text-slate-700 mt-4 mb-2";
          return `<${block.subtype} class="${classes}">${block.content}</${block.subtype}>`;
        } else if (block.type === "image-grid" && block.images.length > 0) {
          const cols =
            block.images.length === 1
              ? "grid-cols-1"
              : block.images.length === 2
              ? "grid-cols-2"
              : "grid-cols-3";
          const imgTags = block.images
            .map(
              (url) =>
                `<img src="${url}" class="w-full h-auto max-h-[600px] object-contain rounded-xl shadow-sm bg-slate-50" />`
            )
            .join("");
          return `<div class="grid ${cols} gap-3 mb-6">${imgTags}</div>`;
        } else if (block.type === "map" && block.url) {
          const embedUrl = getMapEmbedUrl(block.url);
          return `<div class="mb-6 rounded-xl overflow-hidden shadow-sm border border-slate-200"><iframe src="${embedUrl}" width="100%" height="400" style="border:0" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
        }
        return "";
      })
      .join("");
  };

  const addBlock = (type: "text" | "heading" | "image-grid" | "map", index: number) => {
    const newBlocks = [...blocks];
    const newBlock: Block =
      type === "text"
        ? { id: generateId(), type: "text" as const, content: "" }
        : type === "heading"
        ? { id: generateId(), type: "heading" as const, subtype: "h2" as const, content: "" }
        : type === "map"
        ? { id: generateId(), type: "map" as const, url: "" }
        : { id: generateId(), type: "image-grid" as const, images: [] };
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const removeBlock = (id: string) => {
    initializedRefs.current.delete(id);
    delete contentRefs.current[id];
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const updateText = (id: string, content: string) => {
    contentRefs.current[id] = content;
    setBlocks(prev =>
      prev.map((b) => (b.id === id && b.type === "text" ? { ...b, content } : b))
    );
  };

  const updateHeadingText = (id: string, content: string) => {
    setBlocks(
      blocks.map((b) =>
        b.id === id && b.type === "heading" ? { ...b, content } : b
      )
    );
  };

  const updateHeadingSubtype = (id: string, subtype: "h2" | "h3" | "h4") => {
    setBlocks(
      blocks.map((b) =>
        b.id === id && b.type === "heading" ? { ...b, subtype } : b
      )
    );
  };

  const updateMapUrl = (id: string, url: string) => {
    setBlocks(
      blocks.map((b) =>
        b.id === id && b.type === "map" ? { ...b, url } : b
      )
    );
  };

  // 서식 명령 실행 (굵게, 밑줄, 색상 등)
  const applyFormat = (blockId: string, command: string, value?: string) => {
    const editorEl = document.getElementById(`editor-${blockId}`);
    if (editorEl) {
      editorEl.focus();
      document.execCommand(command, false, value);
      // 서식 적용 후 content 동기화
      contentRefs.current[blockId] = editorEl.innerHTML;
      setBlocks(prev =>
        prev.map((b) => (b.id === blockId && b.type === "text" ? { ...b, content: editorEl.innerHTML } : b))
      );
    }
    if (command === "foreColor") {
      setActiveColorPicker(null);
    }
  };

  const handlePasteImage = async (e: React.ClipboardEvent, blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.type !== "image-grid") return;
    if (block.images.length >= 3) {
      alert(
        "한 그리드당 최대 3장의 사진만 넣을 수 있습니다. 더 필요하시면 새 이미지 블록을 추가해 주세요."
      );
      return;
    }

    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      setIsUploading(true);
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from("hotel-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) {
        alert(
          "이미지 업로드 실패: 권한 문제이거나 용량 제한이 있을 수 있습니다.\n" +
            error.message
        );
        setIsUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("hotel-images").getPublicUrl(filePath);

      setBlocks(
        blocks.map((b) => {
          if (b.id === blockId && b.type === "image-grid") {
            return { ...b, images: [...b.images, publicUrl] };
          }
          return b;
        })
      );
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.type !== "image-grid") return;
    if (block.images.length >= 3) {
      alert("한 그리드당 최대 3장의 사진만 넣을 수 있습니다.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("hotel-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) {
      alert("이미지 업로드 실패: " + error.message);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("hotel-images").getPublicUrl(filePath);

    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId && b.type === "image-grid") {
          return { ...b, images: [...b.images, publicUrl] };
        }
        return b;
      })
    );
    setIsUploading(false);
    
    // input 값 초기화
    e.target.value = '';
  };

  const removeImage = (blockId: string, imgIndex: number) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId && b.type === "image-grid") {
          const newImages = [...b.images];
          newImages.splice(imgIndex, 1);
          return { ...b, images: newImages };
        }
        return b;
      })
    );
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-sm mt-4">
      <input type="hidden" name={inputName} value={generateHTML()} />
      <h3 className="text-lg font-extrabold text-slate-800 mb-2 flex items-center gap-2">
        <span>🤖</span> {title}
      </h3>
      <p className="text-xs font-semibold text-slate-400 mb-6">
        * 네이버/구글 상위 노출에 가장 이상적인 시맨틱 주제 태그(H2~H4)를 배치해 드립니다. H1은 제목에 사용되므로 본문에는 H2~H4를 조합하여 사용해 주세요.
      </p>

      {isUploading && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg animate-pulse text-center">
          이미지를 서버에 업로드하는 중입니다... (창을 닫지 마세요)
        </div>
      )}

      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="relative group border border-transparent hover:border-slate-200 rounded-xl p-3 -mx-3 transition-colors"
          >
            {/* 삭제 버튼 */}
            <div className="absolute -left-12 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="이 블록 전체 삭제"
              >
                <X size={18} />
              </button>
            </div>

            {/* ─── 텍스트 블록 (리치 텍스트 에디터) ─── */}
            {block.type === "text" ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {/* 네이버 블로그 스타일 서식 툴바 */}
                <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-200 bg-white flex-wrap">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat(block.id, "bold")}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="굵게 (Ctrl+B)"
                  >
                    <Bold size={14} /> 굵게
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-0.5" />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat(block.id, "underline")}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="밑줄 (Ctrl+U)"
                  >
                    <Underline size={14} /> 밑줄
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-0.5" />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const url = window.prompt("연결할 링크(URL)를 입력하세요:", "https://");
                      if (url) {
                        applyFormat(block.id, "createLink", url);
                        // 링크에 스타일 및 새 창 열기 속성 적용
                        setTimeout(() => {
                          const editorEl = document.getElementById(`editor-${block.id}`);
                          if (editorEl) {
                            const links = editorEl.querySelectorAll('a');
                            links.forEach(a => {
                              if (!a.getAttribute('target')) {
                                a.setAttribute('target', '_blank');
                                a.setAttribute('rel', 'noopener noreferrer');
                                a.className = "text-blue-600 underline font-bold hover:text-blue-800 transition-colors";
                              }
                            });
                            contentRefs.current[block.id] = editorEl.innerHTML;
                            updateText(block.id, editorEl.innerHTML);
                          }
                        }, 10);
                      }
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    title="링크 삽입"
                  >
                    <LinkIcon size={14} /> 링크
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-0.5" />
                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setActiveColorPicker(activeColorPicker === block.id ? null : block.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        activeColorPicker === block.id
                          ? "text-rose-600 bg-rose-50"
                          : "text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                      }`}
                      title="글자 색상 변경"
                    >
                      <Palette size={14} /> 글자색
                    </button>
                    {activeColorPicker === block.id && (
                      <div className="absolute top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 flex gap-2 z-30">
                        {TEXT_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            title={c.name}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormat(block.id, "foreColor", c.value)}
                            className="w-7 h-7 rounded-full border-2 border-white shadow-md hover:scale-125 transition-transform ring-1 ring-slate-200"
                            style={{ backgroundColor: c.value }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-px h-5 bg-slate-200 mx-0.5" />
                  {/* 글씨 크기 */}
                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setActiveSizePicker(activeSizePicker === block.id ? null : block.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        activeSizePicker === block.id
                          ? "text-blue-600 bg-blue-50"
                          : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      title="글씨 크기"
                    >
                      <TypeIcon size={14} /> 크기
                    </button>

                    {activeSizePicker === block.id && (
                      <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col gap-1 w-32">
                        {FONT_SIZES.map((size) => (
                          <button
                            key={size.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFormat(block.id, "fontSize", size.value);
                              setActiveSizePicker(null);
                            }}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                            title={size.name}
                          >
                            <span className="text-sm font-bold text-slate-700">{size.name}</span>
                            <span className="text-[10px] font-medium text-slate-400">{size.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* 편집 영역 (contentEditable) */}
                <div
                  id={`editor-${block.id}`}
                  ref={(el) => {
                    if (el && !initializedRefs.current.has(block.id)) {
                      el.innerHTML = block.content;
                      initializedRefs.current.add(block.id);
                    }
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const el = e.currentTarget;
                    contentRefs.current[block.id] = el.innerHTML;
                    updateText(block.id, el.innerHTML);
                  }}
                  onBlur={(e) => {
                    const el = e.currentTarget;
                    contentRefs.current[block.id] = el.innerHTML;
                    saveDraftToLocal(blocks); // 포커스를 잃을 때마다 임시저장
                    setActiveColorPicker(null);
                  }}
                  className="w-full bg-slate-50 p-5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-inset min-h-[120px] text-slate-700 text-base leading-relaxed font-medium"
                  data-placeholder="여기에 본문 문단을 작성하세요... (글자를 드래그한 후 위 툴바로 서식을 적용할 수 있습니다)"
                />
              </div>

            /* ─── 제목/주제 블록 ─── */
            ) : block.type === "heading" ? (
              <div className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Heading size={14} className="text-emerald-500" /> 주제 크기 설정:
                  </span>
                  <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-black">
                    <button
                      type="button"
                      onClick={() => updateHeadingSubtype(block.id, "h2")}
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        block.subtype === "h2"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      대주제 (H2)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHeadingSubtype(block.id, "h3")}
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        block.subtype === "h3"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      중주제 (H3)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHeadingSubtype(block.id, "h4")}
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        block.subtype === "h4"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      소주제 (H4)
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateHeadingText(block.id, e.target.value)}
                  placeholder={
                    block.subtype === "h2"
                      ? "대주제 제목 입력 (예: 1. 난바역 가성비 호텔 TOP 3)"
                      : block.subtype === "h3"
                      ? "중주제 제목 입력 (예: 호텔의 주요 특장점 및 요금)"
                      : "소주제 제목 입력 (예: 숙소 위치 및 이동 동선)"
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-extrabold text-lg"
                />
              </div>

            /* ─── 구글 지도 블록 ─── */
            ) : block.type === "map" ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-red-500" />
                  <span className="text-sm font-bold text-slate-600">구글 지도 삽입</span>
                </div>
                <input
                  type="text"
                  value={block.url}
                  onChange={(e) => updateMapUrl(block.id, e.target.value)}
                  placeholder="구글 맵 URL을 붙여넣기 하세요 (예: https://www.google.com/maps/place/...)"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 text-sm font-medium text-slate-700 mb-3 bg-white"
                />
                {block.url ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <iframe
                      src={getMapEmbedUrl(block.url)}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <MapPin size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">구글 맵에서 장소를 검색한 후,<br/>공유 링크를 위에 붙여넣기 해주세요.</p>
                  </div>
                )}
              </div>

            /* ─── 이미지 그리드 블록 ─── */
            ) : (
              <div
                className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 outline-none focus:border-indigo-500 focus:bg-indigo-50/50 transition-colors"
                tabIndex={0}
                onPaste={(e) => handlePasteImage(e, block.id)}
              >
                {block.images.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 rounded-lg transition-colors group flex flex-col items-center">
                    <ImageIcon
                      size={40}
                      className="mb-3 opacity-40 text-indigo-500 group-hover:scale-110 transition-transform"
                    />
                    <p className="font-extrabold text-slate-600 mb-1">
                      아래 버튼을 눌러 이미지를 선택하거나,<br className="sm:hidden"/> Ctrl+V로 붙여넣기 하세요.
                    </p>
                    <p className="text-sm font-medium mb-5">
                      최대 3장까지 업로드 가능합니다.
                    </p>
                    <button 
                      type="button"
                      onClick={() => document.getElementById(`file-upload-${block.id}`)?.click()}
                      className="bg-white border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm transition-all"
                    >
                      📸 이미지 첨부하기
                    </button>
                    <input 
                      id={`file-upload-${block.id}`}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, block.id)} 
                    />
                  </div>
                ) : (
                  <div
                    className={`grid gap-3 ${
                      block.images.length === 1
                        ? "grid-cols-1"
                        : block.images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}
                  >
                    {block.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative group/img rounded-xl overflow-hidden bg-slate-50 shadow-sm border border-slate-200"
                      >
                        <img
                          src={img}
                          alt="Uploaded"
                          className="w-full h-auto max-h-[400px] object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(block.id, i)}
                          className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                    {block.images.length < 3 && (
                      <div 
                        className="h-[160px] w-full rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors"
                        onClick={() => document.getElementById(`file-upload-add-${block.id}`)?.click()}
                      >
                        <p className="text-sm font-bold text-slate-500 text-center px-2">
                          클릭하여 추가<br/>(또는 Ctrl+V)
                        </p>
                        <input 
                          id={`file-upload-add-${block.id}`}
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, block.id)} 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 블록 추가 버튼 */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white shadow-lg border border-slate-200 rounded-full p-1.5 z-10 w-max">
              <button
                type="button"
                onClick={() => addBlock("text", index)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                <Type size={14} className="text-blue-500" /> 본문 추가
              </button>
              <div className="w-px h-4 bg-slate-200"></div>
              <button
                type="button"
                onClick={() => addBlock("heading", index)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
              >
                <Heading size={14} className="text-emerald-500" /> 주제(H2/H3/H4)
              </button>
              <div className="w-px h-4 bg-slate-200"></div>
              <button
                type="button"
                onClick={() => addBlock("image-grid", index)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              >
                <ImageIcon size={14} className="text-indigo-500" /> 사진 추가
              </button>
              <div className="w-px h-4 bg-slate-200"></div>
              <button
                type="button"
                onClick={() => addBlock("map", index)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <MapPin size={14} className="text-red-500" /> 지도 추가
              </button>
            </div>
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => addBlock("text", -1)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-md"
          >
            <Type size={18} /> 새 글 작성 시작
          </button>
        </div>
      )}
    </div>
  );
}
