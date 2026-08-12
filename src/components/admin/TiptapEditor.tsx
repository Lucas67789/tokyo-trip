"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { ImagePair } from "./ImagePairExtension";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import "./tiptap-editor.css";

// ── 색상 팔레트 ──
const TEXT_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#16A34A", "#3B82F6",
  "#8B5CF6", "#EC4899", "#334155", "#64748B", "#000000",
];

const BG_COLORS = [
  "#FEF08A", "#BBF7D0", "#BAE6FD", "#DDD6FE", "#FECDD3",
  "#FED7AA", "#E2E8F0", "#FFFFFF",
];

interface TiptapEditorProps {
  initialContent?: string;
  inputName?: string;
  title?: string;
  draftKey?: string;
}

export default function TiptapEditor({
  initialContent,
  inputName = "content",
  title = "",
  draftKey = "draft_tiptap_default",
}: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftContentToLoad, setDraftContentToLoad] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const draftLoaded = useRef(false);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  // ── Tiptap 에디터 초기화 ──
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        horizontalRule: {},
        bulletList: {},
        orderedList: {},
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder: "여기에 글을 작성하세요... 네이버 블로그처럼 자유롭게 텍스트, 이미지, 지도를 넣을 수 있습니다.",
      }),
      ImagePair,
    ],
    immediatelyRender: false,
    content: "",
    editorProps: {
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          event.preventDefault();
          const imageFile = Array.from(files).find((f) => f.type.startsWith("image/"));
          if (imageFile) {
            uploadAndInsertImage(imageFile);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
          if (imageItem) {
            event.preventDefault();
            const file = imageItem.getAsFile();
            if (file) uploadAndInsertImage(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // ── 이미지 업로드 (Supabase Storage) ──
  const uploadAndInsertImage = useCallback(async (file: File) => {
    if (!editor) return;
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error } = await supabase.storage
        .from("hotel-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) {
        alert("이미지 업로드 실패: " + error.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("hotel-images").getPublicUrl(filePath);

      let handled = false;
      
      let targetSide = "right"; // default
      if (document.activeElement?.classList.contains("left-slot")) {
        targetSide = "left";
      }

      if (editor.isActive("imagePair")) {
        const attrs = editor.getAttributes("imagePair");
        if (attrs && attrs.src1 && !attrs.src2) {
          if (targetSide === "left") {
            editor.commands.updateAttributes("imagePair", { src1: publicUrl, src2: attrs.src1 });
          } else {
            editor.commands.updateAttributes("imagePair", { src2: publicUrl });
          }
          handled = true;
        }
      }

      if (!handled) {
        editor.chain().focus().insertContent({ type: "imagePair", attrs: { src1: publicUrl, src2: null } }).run();
      }
    } catch (e) {
      console.error("업로드 오류:", e);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  }, [editor, supabase]);

  // ── 임시저장 로드 ──
  useEffect(() => {
    if (!editor || draftLoaded.current) return;
    draftLoaded.current = true;

    const savedDraft = typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;

    if (savedDraft) {
      try {
        const draftContent = JSON.parse(savedDraft);
        if (draftContent && typeof draftContent === "string" && draftContent.trim() && draftContent !== initialContent) {
          setDraftContentToLoad(draftContent);
          setShowDraftBanner(true);
          return;
        }
      } catch {}
    }

    if (initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, draftKey]);

  // ── 자동 임시저장 (5초마다) ──
  useEffect(() => {
    if (!editor) return;

    autoSaveInterval.current = setInterval(() => {
      const html = editor.getHTML();
      if (html && html !== "<p></p>") {
        try {
          localStorage.setItem(draftKey, JSON.stringify(html));
          setLastSaved(new Date());
        } catch {}
      }
    }, 5000);

    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
    };
  }, [editor, draftKey]);

  // ── 폼 제출 시 임시저장 삭제 및 자동저장 중지 ──
  useEffect(() => {
    if (!editor) return;
    const form = document.querySelector(`input[name="${inputName}"]`)?.closest("form");
    if (!form) return;

    const handleSubmit = () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      localStorage.removeItem(draftKey);
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [editor, draftKey, inputName]);

  // ── 창 닫기 경고 ──
  useEffect(() => {
    if (!editor) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const html = editor.getHTML();
      if (html && html !== "<p></p>") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editor]);

  // ── 툴바 액션들 ──
  const addLink = () => {
    if (!editor) return;
    const url = window.prompt("링크 URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => fileInputRef.current?.click();

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAndInsertImage(file);
    e.target.value = "";
  };

  const addMap = () => {
    if (!editor) return;
    const url = window.prompt("구글맵 URL 또는 장소명을 입력하세요:");
    if (!url) return;

    let embedUrl = url;
    try {
      if (url.includes("output=embed") || url.includes("maps/embed")) {
        embedUrl = url;
      } else {
        const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (coordMatch) {
          embedUrl = `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=16&output=embed`;
        } else {
          const placeMatch = url.match(/\/place\/([^/@]+)/);
          if (placeMatch) {
            embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, " "))}&z=16&output=embed`;
          } else {
            embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(url)}&z=16&output=embed`;
          }
        }
      }
    } catch {
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(url)}&z=16&output=embed`;
    }

    const iframeHtml = `<div class="mb-6 rounded-xl overflow-hidden shadow-sm border border-slate-200"><iframe src="${embedUrl}" width="100%" height="400" style="border:0" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
    editor.chain().focus().insertContent(iframeHtml).run();
  };

  if (!editor) return null;

  const handleLoadDraft = () => {
    if (draftContentToLoad && editor) {
      editor.commands.setContent(draftContentToLoad);
    }
    setShowDraftBanner(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(draftKey);
    setShowDraftBanner(false);
    if (initialContent && editor) {
      editor.commands.setContent(initialContent);
    }
  };

  return (
    <div className="mt-4">
      {title && (
        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
          {title}
        </label>
      )}

      {showDraftBanner && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-sm shadow-sm">
          <div className="text-blue-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            이전에 작성 중이던 임시저장 내용이 있습니다.
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleLoadDraft} className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
              불러오기
            </button>
            <button type="button" onClick={handleDiscardDraft} className="px-3 py-1.5 bg-white text-slate-600 border border-slate-300 rounded-md font-medium hover:bg-slate-50 transition-colors">
              무시하기
            </button>
          </div>
        </div>
      )}

      {/* 숨겨진 form input */}
      <input type="hidden" name={inputName} value={editor.getHTML()} />

      {/* 숨겨진 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelect}
      />

      <div className="tiptap-editor-wrapper">
        {/* ── 툴바 ── */}
        <div className="tiptap-toolbar">
          {/* 제목 드롭다운 */}
          <div className="tiptap-dropdown">
            <button
              type="button"
              onClick={() => { setShowHeadingMenu(!showHeadingMenu); setShowColorPicker(false); setShowBgPicker(false); }}
              className={editor.isActive("heading") ? "is-active" : ""}
              title="제목"
            >
              H
            </button>
            {showHeadingMenu && (
              <div className="tiptap-dropdown-menu">
                <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false); }}>
                  <span style={{ fontSize: "18px", fontWeight: 900 }}>H2 대주제</span>
                </button>
                <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowHeadingMenu(false); }}>
                  <span style={{ fontSize: "16px", fontWeight: 800 }}>H3 중주제</span>
                </button>
                <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 4 }).run(); setShowHeadingMenu(false); }}>
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>H4 소주제</span>
                </button>
                <button type="button" onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); }}>
                  <span style={{ fontSize: "14px" }}>본문</span>
                </button>
              </div>
            )}
          </div>

          <div className="toolbar-divider" />

          {/* 서식 */}
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "is-active" : ""} title="굵게 (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "is-active" : ""} title="밑줄 (Ctrl+U)">
            <span style={{ textDecoration: "underline" }}>U</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "is-active" : ""} title="취소선">
            <span style={{ textDecoration: "line-through" }}>S</span>
          </button>

          <div className="toolbar-divider" />

          {/* 글자색 */}
          <div className="tiptap-dropdown">
            <button
              type="button"
              onClick={() => { setShowColorPicker(!showColorPicker); setShowBgPicker(false); setShowHeadingMenu(false); }}
              title="글자색"
            >
              <span style={{ borderBottom: "3px solid #EF4444", paddingBottom: "1px" }}>A</span>
            </button>
            {showColorPicker && (
              <div className="tiptap-dropdown-menu">
                <div className="tiptap-color-grid">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="tiptap-color-swatch"
                      style={{ background: color }}
                      onClick={() => { editor.chain().focus().setColor(color).run(); setShowColorPicker(false); }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                  style={{ fontSize: "11px", color: "#94a3b8", width: "100%", textAlign: "center", padding: "4px" }}
                >
                  색상 초기화
                </button>
              </div>
            )}
          </div>

          {/* 배경색(하이라이트) */}
          <div className="tiptap-dropdown">
            <button
              type="button"
              onClick={() => { setShowBgPicker(!showBgPicker); setShowColorPicker(false); setShowHeadingMenu(false); }}
              className={editor.isActive("highlight") ? "is-active" : ""}
              title="배경색"
            >
              <span style={{ background: "#FEF08A", padding: "0 4px", borderRadius: "2px" }}>A</span>
            </button>
            {showBgPicker && (
              <div className="tiptap-dropdown-menu">
                <div className="tiptap-color-grid">
                  {BG_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="tiptap-color-swatch"
                      style={{ background: color, border: color === "#FFFFFF" ? "1px solid #e2e8f0" : undefined }}
                      onClick={() => { editor.chain().focus().toggleHighlight({ color }).run(); setShowBgPicker(false); }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowBgPicker(false); }}
                  style={{ fontSize: "11px", color: "#94a3b8", width: "100%", textAlign: "center", padding: "4px" }}
                >
                  배경색 초기화
                </button>
              </div>
            )}
          </div>

          <div className="toolbar-divider" />

          {/* 정렬 */}
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""} title="왼쪽 정렬">
            ≡
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""} title="가운데 정렬">
            ≡
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""} title="오른쪽 정렬">
            ≡
          </button>

          <div className="toolbar-divider" />

          {/* 목록 */}
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "is-active" : ""} title="글머리 기호">
            •≡
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "is-active" : ""} title="번호 목록">
            1.
          </button>

          <div className="toolbar-divider" />

          {/* 삽입 */}
          <button type="button" onClick={addLink} className={editor.isActive("link") ? "is-active" : ""} title="링크 삽입">
            🔗
          </button>
          <button type="button" onClick={addImage} title="이미지 삽입">
            🖼️
          </button>
          <button type="button" onClick={addMap} title="구글맵 삽입">
            📍
          </button>
          <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
            ─
          </button>
        </div>

        {/* 업로드 상태 */}
        {isUploading && (
          <div className="tiptap-upload-bar">
            이미지를 서버에 업로드하는 중입니다... (창을 닫지 마세요)
          </div>
        )}

        {/* ── 에디터 캔버스 ── */}
        <div className="tiptap-canvas" onClick={() => editor.chain().focus().run()}>
          <EditorContent editor={editor} />
        </div>

        {/* 하단 상태바 */}
        <div className="tiptap-status-bar">
          <span>
            {editor.storage.characterCount
              ? `${editor.storage.characterCount.characters()} 자`
              : ""}
          </span>
          <span>
            {lastSaved
              ? `임시저장됨 ${lastSaved.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
              : "자동 임시저장 활성화됨"}
          </span>
        </div>
      </div>
    </div>
  );
}
