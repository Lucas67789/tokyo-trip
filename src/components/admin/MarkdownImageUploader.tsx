"use client";

import { useState, useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface MarkdownImageUploaderProps {
  name: string;
  placeholder?: string;
  defaultValue?: string;
}

export default function MarkdownImageUploader({ name, placeholder, defaultValue = "" }: MarkdownImageUploaderProps) {
  const [content, setContent] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const supabase = createClient();
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `promos/${fileName}`;

      const { error } = await supabase.storage
        .from("hotel-images")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("hotel-images")
        .getPublicUrl(filePath);

      const markdownImage = `\n![업로드된 이미지](${publicUrl})\n`;
      
      // 커서 위치에 삽입
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = content.substring(0, start) + markdownImage + content.substring(end);
        setContent(newText);
        
        // 포커스 유지
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + markdownImage.length;
          textarea.focus();
        }, 0);
      } else {
        setContent(prev => prev + markdownImage);
      }
    } catch (err) {
      alert("이미지 업로드에 실패했습니다. " + err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
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
          className="bg-white text-slate-700 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? "업로드 중..." : "사진 추가"}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        rows={10}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 pt-12 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300 font-mono text-sm resize-y"
      />
    </div>
  );
}
