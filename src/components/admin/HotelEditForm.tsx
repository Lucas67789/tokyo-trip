"use client";

import { useState } from "react";
import StationSearchSelect from "./StationSearchSelect";
import { updateHotel } from "@/app/actions/hotelActions";
import TiptapEditor from "./TiptapEditor";
import UnsavedChangesWarning from "./UnsavedChangesWarning";

interface Station {
  id: string;
  name_ko: string;
}

interface HotelEditFormProps {
  stations: Station[];
  initialData: {
    id: string;
    station_id: string;
    name_ko: string;
    slug: string;
    agoda_link: string;
    content: string;
  };
}

export default function HotelEditForm({ stations, initialData }: HotelEditFormProps) {
  const [nameKo, setNameKo] = useState(initialData.name_ko);
  const [slug, setSlug] = useState(initialData.slug);
  const [agodaLink, setAgodaLink] = useState(initialData.agoda_link || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form action={async (formData) => {
      setIsSubmitting(true);
      try {
        await updateHotel(formData);
        alert("호텔 정보가 성공적으로 수정되었습니다.");
        window.location.href = "/admin";
      } catch (error: any) {
        alert("수정 실패: " + error.message);
        setIsSubmitting(false);
      }
    }} className="space-y-6">
      <UnsavedChangesWarning isDirty={true} />
      <input type="hidden" name="id" value={initialData.id} />
      <input type="hidden" name="station_id" value={initialData.station_id} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{"호텔명 (한글)"}</label>
          <input 
            type="text" 
            name="name_ko" 
            value={nameKo}
            onChange={(e) => setNameKo(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-400 font-bold" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
            {"URL 식별자 (Slug)"}
          </label>
          <input 
            type="text" 
            name="slug" 
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold" 
            required 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
            {"아고다 어필리에이트 제휴 링크 (URL)"}
          </label>
          <input 
            type="url" 
            name="agoda_link" 
            value={agodaLink}
            onChange={(e) => setAgodaLink(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-400 text-sm font-bold" 
            required 
          />
        </div>
      </div>

      <div className="mt-8">
        <TiptapEditor initialContent={initialData.content} draftKey={`hotel_edit_${initialData.id}`} />
      </div>

      <div className="pt-6 border-t border-slate-100 flex gap-4">
        <button 
          type="button" 
          onClick={() => window.history.back()}
          className="flex-1 bg-slate-100 text-slate-700 font-extrabold py-4 rounded-xl hover:bg-slate-200 transition-all shadow-sm active:scale-95 text-lg cursor-pointer"
        >
          {"취소 및 돌아가기"}
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-emerald-600 text-white font-extrabold py-4 rounded-xl hover:bg-emerald-700 disabled:bg-emerald-400 transition-all shadow-md active:scale-95 text-lg cursor-pointer"
        >
          {isSubmitting ? "수정 중..." : "변경 사항 저장하기"}
        </button>
      </div>
    </form>
  );
}
