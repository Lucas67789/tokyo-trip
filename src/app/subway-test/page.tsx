'use client';

import React from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import Link from 'next/link';

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
      <button 
        className="w-12 h-12 bg-white text-black rounded-full shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-gray-100 transition"
        onClick={() => zoomIn()}
        title="확대"
      >
        +
      </button>
      <button 
        className="w-12 h-12 bg-white text-black rounded-full shadow-lg flex items-center justify-center text-3xl font-bold hover:bg-gray-100 transition"
        onClick={() => zoomOut()}
        title="축소"
      >
        -
      </button>
      <button 
        className="w-12 h-12 bg-white text-black rounded-full shadow-lg flex items-center justify-center text-xs font-bold hover:bg-gray-100 transition"
        onClick={() => resetTransform()}
        title="초기화"
      >
        Reset
      </button>
    </div>
  );
};

export default function SubwayTestPage() {
  return (
    <div className="relative w-full h-screen bg-white overflow-hidden text-black font-sans">
      {/* Top Navigation & Info */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex flex-col gap-2 items-start pointer-events-none">
        <Link href="/" className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg shadow-md pointer-events-auto hover:bg-gray-800 transition font-medium">
          ← 메인으로
        </Link>
        <div className="text-sm text-gray-800 bg-white/90 p-3 rounded-lg shadow-md backdrop-blur-md pointer-events-auto border border-gray-100">
          <p className="font-bold mb-1">🚇 오사카 노선도 SVG 테스트</p>
          <ul className="list-disc pl-4 text-xs text-gray-600">
            <li>마우스 휠이나 터치로 확대/축소 가능</li>
            <li>드래그하여 지도 이동 가능</li>
            <li>벡터 방식(SVG)이므로 깨지지 않음</li>
          </ul>
        </div>
      </div>

      {/* Zoom / Pan Wrapper */}
      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={15}
        centerOnInit={true}

        doubleClick={{ mode: "zoomIn" }}
      >
        <Controls />
        <TransformComponent 
          wrapperStyle={{ width: "100%", height: "100%" }} 
          contentStyle={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-start" }}
        >
          <img 
            src="/osaka-subway-test.svg" 
            alt="Osaka Subway Map (Wikimedia Commons)" 
            className="max-w-none"
            style={{ width: "2000px", height: "auto" }} // Set a large base width to allow high-res panning
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
