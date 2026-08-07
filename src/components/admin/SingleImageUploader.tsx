"use client";

import { useState, useRef } from "react";
import { ImagePlus, Loader2, Link2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface SingleImageUploaderProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export default function SingleImageUploader({ name, defaultValue = "", placeholder }: SingleImageUploaderProps) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const supabase = createClient();
      
      const fileExt = file.name.split(".").pop();
      const fileName = `promo_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `promos/${fileName}`;

      const { error } = await supabase.storage
        .from("hotel-images")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("hotel-images")
        .getPublicUrl(filePath);

      setUrl(publicUrl);
    } catch (err) {
      alert("이미지 업로드에 실패했습니다. " + err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute left-4 text-slate-400">
        <Link2 size={16} />
      </div>
      <input
        type="text"
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder || "https://..."}
        className="w-full border border-slate-200 rounded-xl pl-10 pr-28 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm transition-all"
      />
      <div className="absolute right-2 flex items-center">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleUpload}
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? "업로드 중" : "사진 첨부"}
        </button>
      </div>
    </div>
  );
}
