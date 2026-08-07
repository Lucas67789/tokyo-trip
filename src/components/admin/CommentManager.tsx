"use client";

import { useState } from "react";
import { approveComment, deleteComment, addAdminComment } from "@/app/actions/commentActions";
import { CheckCircle2, Trash2, Clock, Send, ShieldAlert, Sparkles } from "lucide-react";

interface Comment {
  id: string;
  post_type: string;
  post_slug: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  is_admin: boolean;
  published_at: string;
  created_at: string;
}

interface Target {
  type: string;
  slug: string;
  name: string;
}

export default function CommentManager({ comments, targetList }: { comments: Comment[], targetList: Target[] }) {
  const [selectedTarget, setSelectedTarget] = useState("");
  const [customName, setCustomName] = useState("");
  const [content, setContent] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingComments = comments.filter(c => !c.is_approved);
  const approvedComments = comments.filter(c => c.is_approved);

  const getTargetName = (type: string, slug: string) => {
    return targetList.find(t => t.type === type && t.slug === slug)?.name || slug;
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return alert("댓글을 달 포스팅을 선택해주세요.");
    
    setIsSubmitting(true);
    try {
      const [type, slug] = selectedTarget.split("::");
      const formData = new FormData();
      formData.append("post_type", type);
      formData.append("post_slug", slug);
      formData.append("content", content);
      
      if (customName) formData.append("custom_name", customName);
      
      if (publishDate && publishTime) {
        // YYYY-MM-DDTHH:mm 형식
        formData.append("published_at", `${publishDate}T${publishTime}`);
      }

      await addAdminComment(formData);
      alert("SEO용 댓글이 성공적으로 등록(또는 예약)되었습니다!");
      
      setContent("");
      setCustomName("");
      setPublishDate("");
      setPublishTime("");
      
    } catch (error: any) {
      alert("등록 실패: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* 1. 미승인 댓글 대기열 */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldAlert className="text-amber-500" />
          승인 대기 중인 댓글 ({pendingComments.length})
        </h2>
        {pendingComments.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-bold">
            새로 들어온 미승인 댓글이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingComments.map(comment => (
              <div key={comment.id} className="bg-white border-2 border-amber-100 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-slate-800">{comment.author_name}</div>
                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                      {comment.post_type === "HOTEL" ? "호텔" : "패스"} : {getTargetName(comment.post_type, comment.post_slug)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {new Date(comment.created_at).toLocaleString('ko-KR')}
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-5 leading-relaxed bg-slate-50 p-3 rounded-xl">{comment.content}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => approveComment(comment.id, comment.post_type, comment.post_slug)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2 rounded-xl transition-colors"
                  >
                    <CheckCircle2 size={16} /> 승인하기 (노출)
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("정말 이 댓글을 스팸으로 삭제하시겠습니까?")) {
                        deleteComment(comment.id, comment.post_type, comment.post_slug);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 font-bold py-2 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} /> 삭제 (스팸)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. 관리자(SEO) 전용 댓글 작성 폼 */}
      <section className="bg-blue-50 border border-blue-100 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Sparkles className="text-blue-500" />
          SEO 트래픽용 댓글 직접 작성 (랜덤 닉네임 & 예약 발행)
        </h2>
        <p className="text-sm text-blue-700 mb-6 font-medium">
          원하는 포스팅에 가짜 방문자 댓글을 추가합니다. 닉네임을 비워두면 한국인/영어 닉네임 중 하나가 랜덤으로 들어갑니다.
        </p>

        <form onSubmit={handleAdminSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">어디에 댓글을 달까요?</label>
              <select 
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                required
              >
                <option value="">글을 선택해주세요...</option>
                {targetList.map(t => (
                  <option key={`${t.type}::${t.slug}`} value={`${t.type}::${t.slug}`}>
                    [{t.type === 'HOTEL' ? '호텔' : '패스'}] {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">닉네임 직접 지정 (선택사항)</label>
              <input 
                type="text" 
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="비워두면 시스템이 알아서 랜덤 생성합니다!"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">댓글 내용 (최소 2줄 이상 자연스럽게!)</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="예: 이번에 아기랑 오사카 가는데 라피트 덕분에 역까지 편하게 갔어요! 꿀팁 감사합니다 ㅎㅎ"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px] resize-y"
                required
              />
            </div>
            
            <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-slate-500" /> 발행 시간 예약 (선택사항)
              </label>
              <div className="flex flex-wrap gap-3">
                <input 
                  type="date" 
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="time" 
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                * 비워두시면 <b>지금 즉시</b> 발행(노출)됩니다. 미래 날짜를 지정하시면 그 시간이 되어야 사용자 화면에 나타납니다.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Send size={18} /> {isSubmitting ? "등록 중..." : "댓글 달기 / 예약하기"}
            </button>
          </div>
        </form>
      </section>

      {/* 3. 기등록된 댓글 목록 (간단히 표시) */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4">전체 승인 완료 / 예약 댓글 내역 ({approvedComments.length})</h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
              <tr>
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">내용</th>
                <th className="px-4 py-3">대상 포스팅</th>
                <th className="px-4 py-3">발행 상태</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {approvedComments.map(c => {
                const isFuture = new Date(c.published_at) > new Date();
                return (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                      {c.author_name} {c.is_admin && "🌟"}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={c.content}>{c.content}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold">
                      {getTargetName(c.post_type, c.post_slug)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isFuture ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold border border-amber-200">
                          ⏳ {new Date(c.published_at).toLocaleString('ko-KR')} 예약됨
                        </span>
                      ) : (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                          ✅ 노출 중
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => {
                          if (confirm("이 댓글을 완전히 삭제하시겠습니까?")) {
                            deleteComment(c.id, c.post_type, c.post_slug);
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {approvedComments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">아직 승인된 댓글이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
