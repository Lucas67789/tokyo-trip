"use client";

import { useState } from "react";
import { addUserComment } from "@/app/actions/commentActions";
import { MessageCircle, User } from "lucide-react";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  published_at: string;
  is_admin: boolean;
}

interface CommentSectionProps {
  postType: "HOTEL" | "PASS" | "POST";
  postSlug: string;
  comments: Comment[];
}

export default function CommentSection({ postType, postSlug, comments }: CommentSectionProps) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 현재 시간보다 이전에 발행된 댓글만 화면에 노출 (예약 발행 완벽 대응)
  const now = new Date();
  const visibleComments = comments.filter(c => new Date(c.published_at) <= now);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append("post_type", postType);
      formData.append("post_slug", postSlug);
      formData.append("author_name", authorName);
      formData.append("content", content);

      await addUserComment(formData);
      
      setIsSuccess(true);
      setAuthorName("");
      setContent("");
    } catch (error: any) {
      alert("댓글 등록에 실패했습니다: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle className="text-blue-600" size={24} />
        <h2 className="text-2xl font-extrabold text-slate-900">방문자 리뷰 및 질문 ({visibleComments.length})</h2>
      </div>

      {/* 댓글 리스트 */}
      <div className="space-y-6 mb-10">
        {visibleComments.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
            아직 작성된 댓글이 없습니다. 첫 번째로 질문이나 후기를 남겨주세요!
          </p>
        ) : (
          visibleComments.map((comment) => (
            <div key={comment.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">{comment.author_name}</span>
                  {comment.is_admin && (
                    <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">관리자</span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(comment.published_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 댓글 작성 폼 */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">댓글 작성하기</h3>
        
        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl font-bold text-center">
            🎉 댓글이 정상적으로 접수되었습니다! 관리자 승인 후 화면에 노출됩니다.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="닉네임 (원하시는 이름을 자유롭게 적어주세요)" 
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full md:w-1/3 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                required
                maxLength={20}
              />
            </div>
            <div>
              <textarea 
                placeholder="궁금한 점이나 이용 후기를 자유롭게 남겨주세요." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y text-sm leading-relaxed font-medium"
                required
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 disabled:bg-slate-400"
              >
                {isSubmitting ? "등록 중..." : "댓글 남기기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
