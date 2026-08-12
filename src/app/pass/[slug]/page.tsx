import { createPublicClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Ticket, Eye } from "lucide-react";
import { Metadata } from "next";
import CommentSection from "@/components/CommentSection";
import ImageLightbox from "@/components/ImageLightbox";
import ViewTracker from "@/components/ViewTracker";
import TrackClick from "@/components/TrackClick";
import { ensureImgAlt } from "@/lib/simpleMarkdown";

export const revalidate = 2592000; // 30일 캐시 (무료 티어 ISR Writes 절약)

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data: passes } = await supabase.from("passes").select("slug");
  return (passes || []).map((pass) => ({ slug: pass.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: pass } = await supabase.from("passes").select("name_ko, description, thumbnail_url, meta_title, meta_description, content, affiliate_links, affiliate_url").eq("slug", slug).single();

  if (!pass) return { title: "Not Found" };

  // 이미지 추출
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  const contentImages: string[] = [];
  while ((match = imgRegex.exec(pass.content || '')) !== null) {
    if (contentImages.length < 3) contentImages.push(match[1]);
  }
  
  const firstContentImage = contentImages[0];
  const mainThumbnail = pass.thumbnail_url || firstContentImage || 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80';
  const allImages = [mainThumbnail, ...contentImages.filter(img => img !== mainThumbnail)].filter(Boolean);

  return {
    title: pass.meta_title || `${pass.name_ko} 완벽 가이드 및 최저가 구매 | 도쿄 트립 플래너`,
    description: pass.meta_description || `${pass.name_ko}의 이용 방법, 적용 노선, 그리고 가장 저렴하게 구매할 수 있는 할인 링크 정보를 제공합니다.`,
    alternates: {
      canonical: `https://tokyotrip.kr/pass/${slug}`
    },
    openGraph: {
      title: pass.meta_title || `${pass.name_ko} 완벽 가이드`,
      description: pass.meta_description || pass.description,
      images: allImages,
    }
  };
}

export default async function PassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: pass } = await supabase
    .from("passes")
    .select(`*`)
    .eq("slug", slug)
    .single();

  if (!pass) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_type", "PASS")
    .eq("post_slug", slug)
    .eq("is_approved", true)
    .order("published_at", { ascending: true });

  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  const contentImages: string[] = [];
  while ((match = imgRegex.exec(pass.content || '')) !== null) {
    if (contentImages.length < 5) contentImages.push(match[1]);
  }
  
  const firstContentImage = contentImages[0];
  const mainThumbnail = pass.thumbnail_url || firstContentImage || 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80';
  const allImages = [mainThumbnail, ...contentImages.filter(img => img !== mainThumbnail)].filter(Boolean);

  // Parse affiliate_links
  let affiliateLinks: {platform: string, url: string}[] = [];
  if (pass.affiliate_links && Array.isArray(pass.affiliate_links) && pass.affiliate_links.length > 0) {
    affiliateLinks = pass.affiliate_links;
  } else if (pass.affiliate_url) {
    affiliateLinks = [{ platform: "공식 예매처", url: pass.affiliate_url }];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pass.name_ko,
    "description": pass.description,
    "image": allImages
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "도쿄 트립 플래너",
        "item": "https://tokyotrip.kr"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "교통 패스",
        "item": "https://tokyotrip.kr"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": pass.name_ko,
        "item": `https://tokyotrip.kr/pass/${pass.slug}`
      }
    ]
  };

  return (
    <div className="flex flex-col items-center pb-24 relative overflow-hidden">
      {/* Background Cyberpunk Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px]"></div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbList]) }}
      />
      <ViewTracker targetId={pass.id} actionType="VIEW_PASS" />
      <div className="w-full max-w-5xl px-5 pt-12 relative z-10">
        <p className="text-xs text-white/40 font-bold bg-[#1A2235]/40 backdrop-blur-md border border-white/5 rounded-lg px-4 py-2.5 mb-8 text-left w-full shadow-sm">
          ※ 이 포스팅은 파트너스 활동의 일환으로, 구매 시 이에 따른 일정액의 수수료를 제공받습니다.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            <Ticket size={14} /> 교통 패스
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{pass.name_ko}</h1>
        <p className="text-white/60 mb-8 text-lg">{pass.description}</p>

        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 mb-10">
          <Image 
            src={mainThumbnail} 
            alt={`${pass.name_ko} 썸네일 이미지`}
            fill
            className="object-contain bg-[#0A0E17]"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">패스 이용 안내 및 상세 정보</h2>
            <div className="w-full bg-[#1A2235]/40 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-lg leading-relaxed prose prose-invert prose-cyan max-w-none">
              {pass.content ? (
                <ImageLightbox>
                  <div dangerouslySetInnerHTML={{ __html: ensureImgAlt(pass.content) }} />
                </ImageLightbox>
              ) : (
                <p className="text-white/40 m-0 text-center py-10 font-bold">아직 등록된 상세 설명이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="md:col-span-1 relative">
            <div className="bg-[#1A2235]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-xl sticky top-6">
              <h3 className="text-lg font-bold text-white mb-6 text-center">온라인 최저가 구매하기</h3>
              
              <div className="flex flex-col gap-3">
                {affiliateLinks.map((link, idx) => {
                  const getPlatformColor = (platform: string) => {
                    const p = platform.toLowerCase();
                    if (p.includes('클룩') || p.includes('klook') || p.includes('기본링크')) return 'bg-[#FF5A00] hover:bg-[#E65100]';
                    if (p.includes('kkday') || p.includes('케이케이데이')) return 'bg-[#00A2D3] hover:bg-[#0089B3]';
                    if (p.includes('마이리얼트립') || p.includes('myrealtrip')) return 'bg-[#2B96ED] hover:bg-[#1E82D6]';
                    if (p.includes('투어비스')) return 'bg-[#1E2B4D] hover:bg-[#151E36]';
                    if (p.includes('트리플')) return 'bg-[#1FD0A2] hover:bg-[#1AA682]';
                    if (p.includes('아고다')) return 'bg-[#5392F9] hover:bg-[#3D78D8]';
                    if (p.includes('트립닷컴')) return 'bg-[#3264FF] hover:bg-[#254CCC]';
                    return 'bg-blue-600 hover:bg-blue-700';
                  };
                  return (
                  <TrackClick 
                    key={idx}
                    href={link.url} 
                    target="_blank" 
                    rel="sponsored nofollow"
                    className={`flex items-center gap-3 w-full ${getPlatformColor(link.platform)} active:scale-95 transition-all text-white px-5 py-4 rounded-xl shadow-md group`}
                    actionType="CLICK_PASS"
                    targetId={pass.id}
                  >
                    <Ticket size={24} className="shrink-0" />
                    <span className="font-bold text-[15px] sm:text-base leading-snug text-left flex-1 break-keep">
                      {link.platform === "기본링크" ? "클룩(Klook)" : link.platform} {pass.name_ko} {link.platform === "기본링크" ? "특가 확인" : "구매"}
                    </span>
                  </TrackClick>
                )})}
              </div>
              
              <div className="mt-6 p-5 bg-[#0A0E17]/60 rounded-xl border border-cyan-500/20">
                <p className="text-sm text-cyan-400 font-bold mb-3 flex items-center gap-2">💡 온라인 구매의 장점</p>
                <ul className="text-xs text-white/60 space-y-2 font-medium list-disc pl-4">
                  <li>현장 매표소 대기 시간 절약</li>
                  <li>온라인 전용 추가 할인 혜택</li>
                  <li>QR 코드로 간편한 교환</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <CommentSection postType="PASS" postSlug={slug} comments={comments || []} />
      </div>

      {/* 모바일 하단 고정 바 (Sticky Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A2235]/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 z-50 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] text-white/50 font-bold mb-0.5">온라인 특별 할인가</span>
          <span className="block text-sm text-white font-black truncate">{pass.name_ko}</span>
        </div>
        <div className="flex gap-2 ml-auto">
          {affiliateLinks.map((link, idx) => {
            const getPlatformColor = (platform: string) => {
              const p = platform.toLowerCase();
              if (p.includes('클룩') || p.includes('klook') || p.includes('기본링크')) return 'bg-[#FF5A00] hover:bg-[#E65100]';
              if (p.includes('kkday') || p.includes('케이케이데이')) return 'bg-[#00A2D3] hover:bg-[#0089B3]';
              if (p.includes('마이리얼트립') || p.includes('myrealtrip')) return 'bg-[#2B96ED] hover:bg-[#1E82D6]';
              return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';
            };
            return (
            <TrackClick
              key={idx}
              href={link.url}
              target="_blank"
              rel="sponsored nofollow"
              className={`shrink-0 ${getPlatformColor(link.platform)} text-white text-xs font-extrabold px-3 sm:px-5 py-3 rounded-xl shadow-md active:scale-95 transition-all`}
              actionType="CLICK_PASS"
              targetId={pass.id}
            >
              {link.platform === "기본링크" ? "클룩(Klook) 특가 확인" : `${link.platform} 구매`}
            </TrackClick>
          )})}
        </div>
      </div>
    </div>
  );
}
