"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

type ImageLightboxProps = {
  children: React.ReactNode;
};

export default function ImageLightbox({ children }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Collect all images from the content area and attach click handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 기존에 생성된 캡션 모두 제거 (중복 방지)
    container.querySelectorAll('.image-zoom-caption').forEach(el => el.remove());

    const imgElements = container.querySelectorAll("img");
    const srcs: string[] = [];
    const processedContainers = new Set();

    imgElements.forEach((img, index) => {
      const src = img.getAttribute("src");
      if (src) {
        srcs.push(src);
        img.style.cursor = "zoom-in";
        img.style.transition = "filter 0.2s ease, transform 0.2s ease";

        // Hover effect
        const handleMouseEnter = () => {
          img.style.filter = "brightness(1.05)";
          img.style.transform = "scale(1.02)";
        };
        const handleMouseLeave = () => {
          img.style.filter = "";
          img.style.transform = "";
        };

        // Click handler
        const handleClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          setImages(srcs);
          setCurrentIndex(index);
          setScale(1);
          setPosition({ x: 0, y: 0 });
          setIsOpen(true);
        };

        img.addEventListener("mouseenter", handleMouseEnter);
        img.addEventListener("mouseleave", handleMouseLeave);
        img.addEventListener("click", handleClick);

        // 텍스트 안내문 추가 로직 (그룹당 1개만)
        // 가장 가까운 블록 레벨 부모를 찾아서 그 밑에 1번만 캡션을 삽입합니다.
        const blockContainer = img.closest('p, div.grid, div.flex, figure') || img.parentElement;
        
        if (blockContainer && !processedContainers.has(blockContainer)) {
          processedContainers.add(blockContainer);
          
          const caption = document.createElement("div");
          caption.className = "image-zoom-caption text-center text-[13px] text-slate-400 font-medium mt-2 mb-6 opacity-80 flex items-center justify-center gap-1.5 w-full clear-both";
          caption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg> 사진을 클릭하면 확대가 가능합니다`;
          
          if (blockContainer === container) {
            blockContainer.appendChild(caption);
          } else if (blockContainer.parentNode) {
            blockContainer.parentNode.insertBefore(caption, blockContainer.nextSibling);
          }
        }

        return () => {
          img.removeEventListener("mouseenter", handleMouseEnter);
          img.removeEventListener("mouseleave", handleMouseLeave);
          img.removeEventListener("click", handleClick);
        };
      }
    });
  }, [children]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, images.length, currentIndex]);

  const prev = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  // Mouse drag for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double click to zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  // Touch events for pinch-to-zoom
  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setInitialPinchDistance(getTouchDistance(e.touches));
      setInitialScale(scale);
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      const currentDistance = getTouchDistance(e.touches);
      const ratio = currentDistance / initialPinchDistance;
      const newScale = Math.min(Math.max(initialScale * ratio, 1), 5);
      setScale(newScale);
      if (newScale <= 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setInitialPinchDistance(null);
    setIsDragging(false);
  };

  // Swipe detection for navigation
  const touchStartX = useRef(0);
  const handleSwipeStart = (e: React.TouchEvent) => {
    if (scale > 1) return;
    touchStartX.current = e.touches[0].clientX;
  };
  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (scale > 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) next();
      else prev();
    }
  };

  if (!isOpen) {
    return <div ref={containerRef}>{children}</div>;
  }

  return (
    <>
      <div ref={containerRef}>{children}</div>

      {/* Lightbox Overlay */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ animation: "lightbox-in 0.25s ease" }}
      >
        {/* Blurred Background */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={() => { setIsOpen(false); setScale(1); setPosition({ x: 0, y: 0 }); }}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
          <div className="bg-black/40 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
          <button
            onClick={() => { setIsOpen(false); setScale(1); setPosition({ x: 0, y: 0 }); }}
            className="bg-black/40 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black/60 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/60 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/60 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image */}
        <div
          className="relative z-[1] max-w-[90vw] max-h-[85vh] select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onTouchStart={(e) => { handleTouchStart(e); handleSwipeStart(e); }}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => { handleTouchEnd(); handleSwipeEnd(e); }}
          style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
        >
          <img
            ref={imageRef}
            key={currentIndex}
            src={images[currentIndex]}
            alt={`이미지 ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? "none" : "transform 0.25s ease",
            }}
            draggable={false}
          />
        </div>

        {/* Bottom dots */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); setScale(1); setPosition({ x: 0, y: 0 }); }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex
                    ? "bg-white scale-125 shadow-lg"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Zoom hint */}
        {scale <= 1 && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-md text-white/70 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ZoomIn size={12} /> 더블클릭 또는 핀치로 확대
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes lightbox-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
