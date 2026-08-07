"use client";

import { useState, useEffect, useTransition } from "react";
import StationSearchSelect from "./StationSearchSelect";
import BlockEditor from "./BlockEditor";
import { addHotel } from "@/app/actions/hotelActions";
import { useRouter } from "next/navigation";
import { romanizeHangul } from "@/utils/slugify";
import UnsavedChangesWarning from "./UnsavedChangesWarning";

interface Station {
  id: string;
  name_ko: string;
}

interface HotelRegisterFormProps {
  stations: Station[];
}

export default function HotelRegisterForm({ stations }: HotelRegisterFormProps) {
  const [nameKo, setNameKo] = useState("");
  const [slug, setSlug] = useState("");
  const [agodaLink, setAgodaLink] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedStationId, setSelectedStationId] = useState("");
  const router = useRouter();

  // 1. 아고다 풀 링크가 들어왔을 때 자동으로 영문 슬러그(Slug) 파싱 및 추출
  useEffect(() => {
    if (!agodaLink.trim()) return;

    // 예: https://www.agoda.com/ko-kr/onyado-nono-namba-natural-hot-spring/hotel/osaka-jp.html
    const agodaRegex = /agoda\.com\/(?:[a-z]{2}-[a-z]{2}\/)?([^\/]+)\/hotel\//i;
    const match = agodaLink.match(agodaRegex);

    if (match && match[1]) {
      setSlug(match[1].toLowerCase());
      setIsSlugManuallyEdited(true); // 자동 파싱된 경우 자동 생성 대상에서 잠금
    }
  }, [agodaLink]);

  // 2. 아고다 링크에서 추출이 안 되었고 사용자가 직접 슬러그를 수정하지 않았다면 한글 호텔명 기반 자동 로마자 변환 적용
  useEffect(() => {
    if (isSlugManuallyEdited) return;

    if (!nameKo.trim()) {
      setSlug("");
      return;
    }

    const autoSlug = romanizeHangul(nameKo);
    setSlug(autoSlug);
  }, [nameKo, isSlugManuallyEdited]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addHotel(formData);
        localStorage.removeItem("hotel_register");
        alert("호텔이 성공적으로 등록되었습니다.");
        router.push("/admin");
      } catch (err: any) {
        alert("등록 실패: " + err.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <UnsavedChangesWarning isDirty={nameKo !== "" || slug !== ""} />
      <input type="hidden" name="station_id" value={selectedStationId || ""} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"소속 역 선택"}</label>
          <StationSearchSelect stations={stations} onChange={(station) => setSelectedStationId(station.id)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"호텔명 (한글)"}</label>
          <input 
            type="text" 
            name="name_ko" 
            value={nameKo}
            onChange={(e) => setNameKo(e.target.value)}
            placeholder="예: 온야도 노노 난바 내추럴 핫 스프링"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 font-bold" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
            {"URL 식별자 (Slug)"} 
            <span className="text-xs text-blue-500 font-semibold ml-2">*(호텔명 입력 시 자동 완성)*</span>
          </label>
          <input 
            type="text" 
            name="slug" 
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugManuallyEdited(true); // 직접 타이핑한 경우 더 이상 자동완성하지 않음
            }}
            placeholder="예: onyado-nono-namba"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold" 
            required 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
            {"아고다 어필리에이트 제휴 링크 (URL)"} 
            <span className="text-xs text-emerald-500 font-semibold ml-2">*(풀 링크 붙여넣기 시 식별자 자동 추출)*</span>
          </label>
          <input 
            type="url" 
            name="agoda_link" 
            value={agodaLink}
            onChange={(e) => setAgodaLink(e.target.value)}
            placeholder="http://app.ac/... 혹은 https://www.agoda.com/..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold" 
            required 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"블로그 포스팅 제목"}</label>
          <input type="text" name="post_title" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 font-bold text-blue-700" required />
        </div>
      </div>

      <BlockEditor />

      <div className="pt-6 border-t border-slate-100">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "저장 중..." : "등록 및 사이트 즉시 발행하기"}
        </button>
      </div>
    </form>
  );
}
