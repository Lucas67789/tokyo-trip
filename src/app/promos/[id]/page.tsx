import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { simpleMarkdown } from "@/lib/simpleMarkdown";
import ImageLightbox from "@/components/ImageLightbox";
import type { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const supabase = await createClient();

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("id", decodedId)
    .single();

  if (!promo) return { title: "할인코드 상세" };

  const title = promo.meta_title || `${promo.partner_name} ${promo.discount_rate} 할인코드`;
  const description = promo.meta_description || `${promo.partner_name}의 특별 할인 쿠폰! ${promo.discount_rate}. 할인코드를 확인하고 바로 적용해보세요.`;

  return {
    title,
    description,
    alternates: { canonical: `https://tokyotrip.kr/promos/${decodedId}` },
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export default async function PromoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const supabase = await createClient();

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("id", decodedId)
    .single();

  if (!promo) {
    notFound();
  }

  let commonGuide = null;
  if (promo.partner_name) {
    const { data: partner } = await supabase
      .from("partners")
      .select("common_guide")
      .eq("name", promo.partner_name)
      .single();
    
    if (partner) {
      commonGuide = partner.common_guide;
    }
  }

  return (
    <div className="bg-[#0A0E17] min-h-screen py-10 px-5">
      <div className="max-w-3xl mx-auto bg-[#1A2235]/40 backdrop-blur-2xl rounded-[2rem] shadow-lg border border-white/5 overflow-hidden">
        {/* 상단 네비게이션 */}
        <div className="px-6 md:px-10 py-5 border-b border-white/5 flex items-center justify-between">
          <Link 
            href={`/store/${promo.partner_slug || 'agoda'}`} 
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-cyan-400 font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            {promo.partner_name} 전체 보기
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
            {promo.is_active ? '사용 가능' : '종료됨'}
          </span>
        </div>

        {/* 메인 헤더 영역 */}
        <div className="px-6 md:px-10 py-10 bg-gradient-to-b from-cyan-500/5 to-transparent relative">
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            {promo.meta_title || `${promo.partner_name} ${promo.discount_rate}`}
          </h1>
          <p className="text-white/60 font-medium leading-relaxed mb-8">
            {promo.description || promo.meta_description || "특별한 할인 혜택을 놓치지 마세요."}
          </p>

          <div className="bg-[#1A2235]/80 border border-cyan-500/30 rounded-2xl p-6 text-white text-center shadow-[0_0_20px_rgba(0,240,255,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent pointer-events-none"></div>
            <p className="text-cyan-400 font-semibold mb-2 relative z-10">할인코드</p>
            <div className="text-3xl md:text-4xl font-black font-mono tracking-wider mb-6 relative z-10 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              {promo.promo_code}
            </div>
            {promo.target_url && (
              <a 
                href={promo.target_url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="inline-block bg-cyan-500 text-[#0A0E17] font-extrabold px-8 py-3 rounded-xl hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:-translate-y-0.5 transition-all w-full md:w-auto relative z-10"
              >
                할인코드 적용하고 예약하기
              </a>
            )}
          </div>
        </div>

        {/* SEO 상세 콘텐츠 & 공통 가이드 영역 */}
        {(commonGuide || promo.seo_content) && (
          <div className="px-6 md:px-10 py-10 border-t border-white/5">
            <h2 className="text-xl font-extrabold mb-6 text-white flex items-center gap-2">📖 상세 가이드 및 꿀팁</h2>
            <ImageLightbox>
              <div className="flex flex-col gap-8">
                {commonGuide && (
                  <div 
                    className="prose prose-invert prose-cyan max-w-none text-white/70 space-y-4"
                    dangerouslySetInnerHTML={{ __html: simpleMarkdown(commonGuide) }}
                  />
                )}
                {promo.seo_content && (
                  <div 
                    className="prose prose-invert prose-cyan max-w-none text-white/70 space-y-4"
                    dangerouslySetInnerHTML={{ __html: simpleMarkdown(promo.seo_content) }}
                  />
                )}
              </div>
            </ImageLightbox>
          </div>
        )}
      </div>
    </div>
  );
}
