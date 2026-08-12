"use client";

import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// ── React NodeView 컴포넌트 ──
function ImagePairView({ node, updateAttributes, deleteNode, selected }: any) {
  const { src1, src2 } = node.attrs;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSide, setUploadingSide] = useState<"left" | "right" | null>(null);
  const targetSideRef = useRef<"left" | "right">("right");
  const supabase = createClient();

  const triggerUpload = (side: "left" | "right") => {
    targetSideRef.current = side;
    fileInputRef.current?.click();
  };

  const handleUploadSecond = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const side = targetSideRef.current;
    setUploadingSide(side);
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
      
      if (side === "left") {
        updateAttributes({ src1: publicUrl, src2: src1 });
      } else {
        updateAttributes({ src2: publicUrl });
      }
    } catch {
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingSide(null);
      if (e.target) e.target.value = "";
    }
  };

  const removeImage = (which: "src1" | "src2") => {
    if (which === "src2") {
      updateAttributes({ src2: null });
    } else if (src2) {
      // src1 삭제 시 src2가 있으면 → src2를 src1으로 승격
      updateAttributes({ src1: src2, src2: null });
    } else {
      // 이미지가 하나뿐이면 노드 전체 삭제
      deleteNode();
    }
  };

  const isPaired = !!src2;

  return (
    <NodeViewWrapper className="image-pair-wrapper" data-drag-handle>
      <div
        className={`image-pair-container ${isPaired ? "is-paired" : "is-single"}`}
        style={{ outline: selected ? "2px solid #3b82f6" : "none", outlineOffset: "2px" }}
      >
        {/* 왼쪽 영역 (싱글일 때만) */}
        {!isPaired && (
          <div
            className="image-pair-add-btn left-slot focus:outline-none focus:ring-2 focus:ring-blue-400"
            tabIndex={0}
            title="여기를 클릭(선택) 후 Ctrl+V로 왼쪽에 사진 추가"
          >
            <div
              className="image-pair-circle-btn"
              onClick={(e) => { e.stopPropagation(); triggerUpload("left"); }}
              title="클릭하여 파일 선택"
            >
              {uploadingSide === "left" ? <div className="image-pair-spinner" /> : <span className="image-pair-plus">+</span>}
            </div>
          </div>
        )}

        {/* 이미지 1 */}
        <div className={`image-pair-slot ${isPaired ? "paired" : "single"}`}>
          <img src={src1} alt="" draggable={false} />
          <button type="button" className="image-pair-remove" onClick={() => removeImage("src1")}>
            ×
          </button>
        </div>

        {/* 이미지 2 또는 오른쪽 영역 */}
        {isPaired ? (
          <div className="image-pair-slot paired">
            <img src={src2} alt="" draggable={false} />
            <button type="button" className="image-pair-remove" onClick={() => removeImage("src2")}>
              ×
            </button>
          </div>
        ) : (
          <div
            className="image-pair-add-btn right-slot focus:outline-none focus:ring-2 focus:ring-blue-400"
            tabIndex={0}
            title="여기를 클릭(선택) 후 Ctrl+V로 오른쪽에 사진 추가"
          >
            <div
              className="image-pair-circle-btn"
              onClick={(e) => { e.stopPropagation(); triggerUpload("right"); }}
              title="클릭하여 파일 선택"
            >
              {uploadingSide === "right" ? <div className="image-pair-spinner" /> : <span className="image-pair-plus">+</span>}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleUploadSecond}
      />
    </NodeViewWrapper>
  );
}

// ── Tiptap Node Extension ──
export const ImagePair = Node.create({
  name: "imagePair",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src1: { default: null },
      src2: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-image-pair]",
        getAttrs: (dom: HTMLElement) => {
          const images = dom.querySelectorAll("img");
          return {
            src1: images[0]?.getAttribute("src") || null,
            src2: images[1]?.getAttribute("src") || null,
          };
        },
      },
      {
        tag: "img",
        getAttrs: (dom: HTMLElement) => {
          return {
            src1: dom.getAttribute("src") || null,
            src2: null,
          };
        },
      }
    ];
  },

  renderHTML({ node }) {
    const { src1, src2 } = node.attrs;

    if (src2) {
      // 2장 페어 — 높이 맞춤 flex 레이아웃
      return [
        "div",
        {
          "data-image-pair": "",
          style: "display:flex;gap:4px;margin-bottom:1rem;border-radius:12px;overflow:hidden;",
        },
        [
          "div",
          { style: "flex:1;min-width:0;overflow:hidden;border-radius:12px;max-height:400px;" },
          [
            "img",
            {
              src: src1,
              style: "width:100%;height:100%;object-fit:cover;display:block;border-radius:12px;",
            },
          ],
        ],
        [
          "div",
          { style: "flex:1;min-width:0;overflow:hidden;border-radius:12px;max-height:400px;" },
          [
            "img",
            {
              src: src2,
              style: "width:100%;height:100%;object-fit:cover;display:block;border-radius:12px;",
            },
          ],
        ],
      ];
    }

    // 1장 단독
    return [
      "div",
      {
        "data-image-pair": "",
        style: "margin-bottom:1rem;",
      },
      [
        "img",
        {
          src: src1,
          style:
            "width:100%;height:auto;max-height:600px;object-fit:contain;display:block;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);background:#f8fafc;",
        },
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImagePairView);
  },
});
