import { createPublicClient, createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Clock, Eye, Tag } from "lucide-react";
import { Metadata } from "next";
import CommentSection from "@/components/CommentSection";
import ImageLightbox from "@/components/ImageLightbox";
import Link from "next/link";
import { cookies } from "next/headers";
import ViewTracker from "@/components/ViewTracker";

export const revalidate = 2592000; // 30일 캐시 (무료 티어 ISR Writes 절약)

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data: posts } = await supabase.from("posts").select("slug");
  return (posts || []).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: post } = await supabase.from("posts").select("title, description, thumbnail_url, content").eq("slug", slug).single();

  if (!post) return { title: "Not Found" };

  // 이미지 추출
  const imgRegex = /<img[^>]+src="([^">]+)"/g;

  let match;
  const contentImages: string[] = [];
  while ((match = imgRegex.exec(post.content || '')) !== null) {
    if (contentImages.length < 3) contentImages.push(match[1]);
  }
  
  const mainThumbnail = post.thumbnail_url || contentImages[0] || 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80';

  return {
    title: `${post.title} | 도쿄 트립 플래너`,
    description: post.description,
    alternates: { canonical: `/post/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      images: [mainThumbnail],
    }
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    notFound();
  }

  // 조회수 증가: 관리자(로그인 유저)는 제외
  const authSupabase = await createClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user) {
    await supabase.from("posts").update({ view_count: (post.view_count || 0) + 1 }).eq("id", post.id);
  }

  // 연관 패스 가져오기 (컬럼이 없거나 에러 시 빈 배열)
  let linkedPasses: any[] = [];
  try {
    if (post.linked_pass_ids && post.linked_pass_ids.length > 0) {
      const { data } = await supabase.from("passes").select("*").in("id", post.linked_pass_ids);
      linkedPasses = data || [];
    }
  } catch (e) {
    console.error("연관 패스 로딩 실패:", e);
  }

  // 연관 명소/액티비티 가져오기
  let linkedAttractions: any[] = [];
  try {
    if (post.linked_attraction_ids && post.linked_attraction_ids.length > 0) {
      const { data } = await supabase.from("station_attractions").select("*").in("id", post.linked_attraction_ids);
      linkedAttractions = data || [];
    }
  } catch (e) {
    console.error("연관 명소 로딩 실패:", e);
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_type", "POST")
    .eq("post_slug", slug)
    .eq("is_approved", true)
    .order("published_at", { ascending: true });

  // 관련 포스팅 (같은 카테고리, 현재 제외)
  const { data: relatedPosts } = await supabase
    .from("posts")
    .select("id, title, slug, thumbnail_url, category, description")
    .eq("category", post.category)
    .eq("is_published", true)
    .neq("id", post.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  const contentImages: string[] = [];
  while ((match = imgRegex.exec(post.content || '')) !== null) {
    if (contentImages.length < 5) contentImages.push(match[1]);
  }
  
  const mainThumbnail = post.thumbnail_url || contentImages[0] || 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80';

  const createdDate = new Date(post.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "image": mainThumbnail,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Organization",
      "name": "도쿄 트립 플래너"
    },
    "publisher": {
      "@type": "Organization",
      "name": "도쿄 트립 플래너",
      "url": "https://tokyotrip.kr",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tokyotrip.kr/images/logo.png",
        "width": 200,
        "height": 60
      }
    },
    "mainEntityOfPage": `https://tokyotrip.kr/post/${post.slug}`
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
        "name": post.category || "여행팁",
        "item": `https://tokyotrip.kr/#${encodeURIComponent(post.category || "여행팁")}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://tokyotrip.kr/post/${post.slug}`
      }
    ]
  };

  return (
    <div className="flex justify-center pb-12 px-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbList]) }}
      />
      
      <div className="w-full max-w-[1100px] flex flex-col lg:flex-row gap-10 pt-8">
        <ViewTracker targetId={post.id} actionType="VIEW_POST" />
        
        {/* 메인 본문 영역 */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {/* 카테고리 + 메타 정보 */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-black flex items-center gap-1">
            <Tag size={12} />
            {post.category}
          </span>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Clock size={12} />
            {createdDate}
          </span>
          {/* SEO 및 사용자 심리를 위해 당분간 조회수 노출 숨김 (추후 원할 때 주석 해제)
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Eye size={12} />
            {post.view_count || 0}
          </span>
          */}
        </div>

        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{post.title}</h1>
        {post.description && (
          <p className="text-white/60 mb-8 text-lg">{post.description}</p>
        )}

        {/* 썸네일 */}
        <div className="relative w-full rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 mb-10 bg-[#0A0E17] flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={mainThumbnail} 
            alt={`${post.title} 썸네일`}
            className="w-full h-auto object-contain"
            style={{ maxHeight: '80vh' }}
            fetchPriority="high"
          />
        </div>

        {/* 어필리에이트 공지 */}
        <p className="text-xs text-white/40 font-bold bg-[#1A2235]/40 backdrop-blur-md border border-white/5 rounded-lg px-4 py-2.5 mb-10 text-left w-full shadow-sm">
          ※ 이 포스팅은 파트너스 활동의 일환으로, 구매 시 이에 따른 일정액의 수수료를 제공받습니다.
        </p>

        {/* [제안 2] 본문 스마트 상품 카드 */}
        {linkedPasses.length > 0 && (
          <div className="mb-8 flex flex-col gap-3">
            {linkedPasses.map((pass) => {
              let links = pass.affiliate_links && Array.isArray(pass.affiliate_links) && pass.affiliate_links.length > 0
                      ? pass.affiliate_links
                      : pass.affiliate_url ? [{ platform: "자세히 알아보기", url: pass.affiliate_url }] : [{ platform: "자세히 알아보기", url: `/pass/${pass.slug}` }];
                      
              return (
              <div
                key={`smart-${pass.id}`}
                className="group flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 hover:shadow-md transition-all"
              >
                {pass.thumbnail_url && (
                  <Link href={`/pass/${pass.slug}`} className="relative w-full sm:w-28 h-28 sm:h-24 rounded-xl overflow-hidden shadow-sm shrink-0 block">
                    <Image src={pass.thumbnail_url} alt={pass.name_ko} fill className="object-contain bg-slate-50 group-hover:scale-110 transition-transform duration-300" sizes="112px" />
                  </Link>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">추천 패스</span>
                    <Link href={`/pass/${pass.slug}`}>
                      <h3 className="text-sm font-extrabold text-white line-clamp-1 hover:text-blue-600 transition-colors">{pass.name_ko}</h3>
                    </Link>
                  </div>
                  <p className="text-xs text-white/60 font-medium mb-3 line-clamp-2">{pass.description || "간사이 지역 여행 필수 교통패스"}</p>
                </div>
                <div className="w-full sm:w-auto flex flex-col gap-2 shrink-0">
                  {links.map((link: any, idx: number) => {
                    const getPlatformColor = (platform: string) => {
                      const p = platform.toLowerCase();
                      if (p.includes('클룩') || p.includes('klook') || p.includes('기본링크')) return 'bg-[#FF5A00] hover:bg-[#E65100] text-white';
                      if (p.includes('kkday') || p.includes('케이케이데이')) return 'bg-[#00A2D3] hover:bg-[#0089B3] text-white';
                      if (p.includes('마이리얼트립') || p.includes('myrealtrip')) return 'bg-[#2B96ED] hover:bg-[#1E82D6] text-white';
                      return 'bg-blue-600 hover:bg-blue-700 text-white';
                    };
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full sm:w-auto ${getPlatformColor(link.platform)} text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm text-center transition-colors active:scale-95 break-keep`}
                      >
                        {link.platform === "자세히 알아보기" ? "최저가 확인" : link.platform === "기본링크" ? "클룩(Klook) 특가 확인" : `${link.platform} 구매`}
                      </a>
                  )})}
                </div>
              </div>
            )})}
          </div>
        )}

        {/* [연관 명소/액티비티 스마트 카드] */}
        {linkedAttractions.length > 0 && (
          <div className="mb-8 flex flex-col gap-3">
            {linkedAttractions.map((attr) => (
              <div
                key={`smart-attr-${attr.id}`}
                className="group flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 hover:shadow-md transition-all"
              >
                {attr.image_url && (
                  <div className="relative w-full sm:w-28 h-28 sm:h-24 rounded-xl overflow-hidden shadow-sm shrink-0">
                    <Image src={attr.image_url} alt={attr.name} fill className="object-contain bg-slate-50 group-hover:scale-110 transition-transform duration-300" sizes="112px" />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">추천 {attr.category || '명소'}</span>
                    <h3 className="text-sm font-extrabold text-white line-clamp-1">{attr.name}</h3>
                  </div>
                  <p className="text-xs text-white/60 font-medium mb-3 line-clamp-2">{attr.description || "인기 명소 및 액티비티"}</p>
                </div>
                <div className="w-full sm:w-auto flex flex-col gap-2 shrink-0">
                  {attr.affiliate_url ? (
                    <a
                      href={attr.affiliate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm text-center transition-colors active:scale-95 break-keep"
                    >
                      특가 확인하기
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold text-center">상세 정보 준비 중</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 본문 */}
        <article className="bg-[#1A2235]/40 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-lg leading-relaxed prose prose-invert prose-cyan max-w-none">
          {post.content ? (
            <ImageLightbox>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </ImageLightbox>
          ) : (
            <p className="text-white/40 m-0 text-center py-10 font-bold">아직 등록된 내용이 없습니다.</p>
          )}
        </article>

        {/* 관련 포스팅 */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold text-white mb-4">관련 여행 팁</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((related: any) => (
                <Link 
                  key={related.id} 
                  href={`/post/${related.slug}`}
                  className="group bg-[#1A2235]/40 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden hover:shadow-md transition-all hover:border-cyan-500/50"
                >
                  <div className="relative aspect-[16/9] bg-[#0A0E17]">
                    {related.thumbnail_url && (
                      <Image
                        src={related.thumbnail_url}
                        alt={related.title}
                        fill
                        className="object-contain bg-[#0A0E17] group-hover:scale-105 transition-transform duration-300"
                        sizes="300px"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-bold text-cyan-400">{related.category}</span>
                    <h3 className="text-sm font-bold text-white mt-1 line-clamp-2">{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 댓글 영역 */}
        <CommentSection postType="POST" postSlug={slug} comments={comments || []} />
        </div>

        {/* [제안 1] PC 우측 플로팅 배너 */}
        {linkedPasses.length > 0 && (
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-[#1A2235]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl text-center">
                <span className="inline-block text-2xl mb-2">🎁</span>
                <h3 className="text-white font-black text-sm mb-1">이 글과 관련된 혜택</h3>
                <p className="text-slate-400 text-xs font-medium mb-4">가장 저렴하게 예약하고 여행을 떠나보세요!</p>
                <div className="flex flex-col gap-3">
                  {linkedPasses.map((pass) => {
                    let links = pass.affiliate_links && Array.isArray(pass.affiliate_links) && pass.affiliate_links.length > 0
                      ? pass.affiliate_links
                      : pass.affiliate_url ? [{ platform: "자세히 알아보기", url: pass.affiliate_url }] : [{ platform: "자세히 알아보기", url: `/pass/${pass.slug}` }];
                    
                    return links.map((link: any, idx: number) => {
                      const getPlatformColor = (platform: string) => {
                        const p = platform.toLowerCase();
                        if (p.includes('클룩') || p.includes('klook') || p.includes('기본링크')) return 'text-[#FF5A00] group-hover:text-[#FF5A00]';
                        if (p.includes('kkday') || p.includes('케이케이데이')) return 'text-[#00A2D3] group-hover:text-[#00A2D3]';
                        if (p.includes('마이리얼트립') || p.includes('myrealtrip')) return 'text-[#2B96ED] group-hover:text-[#2B96ED]';
                        return 'text-amber-400 group-hover:text-amber-300';
                      };
                      return (
                      <a
                        key={`side-${pass.id}-${idx}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-3 text-left transition-all group"
                      >
                        <h4 className={`font-bold text-sm truncate transition-colors ${getPlatformColor(link.platform)}`}>
                          {link.platform === "자세히 알아보기" ? pass.name_ko : link.platform === "기본링크" ? `클룩(Klook) ${pass.name_ko} 특가 확인` : `${link.platform} ${pass.name_ko}`}
                        </h4>
                        <p className="text-slate-400 text-[10px] truncate mt-0.5">{pass.description || "할인 적용받고 예약하기"}</p>
                      </a>
                    )});
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* [제안 1] 모바일 하단 고정 바 (Sticky Bottom Bar) */}
      {linkedPasses.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1A2235]/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 z-50 flex items-center gap-3 overflow-x-auto">
          <div className="flex-1 min-w-0 hidden sm:block">
            <span className="block text-[10px] text-white/50 font-bold mb-0.5">이 글과 관련된 추천 패스</span>
            <span className="block text-sm text-white font-black truncate">{linkedPasses[0].name_ko}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {linkedPasses.map(pass => {
              let links = pass.affiliate_links && Array.isArray(pass.affiliate_links) && pass.affiliate_links.length > 0
                      ? pass.affiliate_links
                      : pass.affiliate_url ? [{ platform: "자세히 알아보기", url: pass.affiliate_url }] : [{ platform: "자세히 알아보기", url: `/pass/${pass.slug}` }];
              
              return links.map((link: any, idx: number) => {
                const getPlatformColor = (platform: string) => {
                  const p = platform.toLowerCase();
                  if (p.includes('클룩') || p.includes('klook') || p.includes('기본링크')) return 'bg-[#FF5A00] hover:bg-[#E65100]';
                  if (p.includes('kkday') || p.includes('케이케이데이')) return 'bg-[#00A2D3] hover:bg-[#0089B3]';
                  if (p.includes('마이리얼트립') || p.includes('myrealtrip')) return 'bg-[#2B96ED] hover:bg-[#1E82D6]';
                  return 'bg-gradient-to-r from-blue-600 to-indigo-600';
                };
                return (
                <a
                  key={`mob-${pass.id}-${idx}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`shrink-0 flex-1 sm:flex-none text-center ${getPlatformColor(link.platform)} text-white text-xs font-extrabold px-3 sm:px-5 py-3 rounded-xl shadow-md active:scale-95 transition-all break-keep`}
                >
                  {link.platform === "자세히 알아보기" ? "최저가 확인" : link.platform === "기본링크" ? "클룩(Klook) 특가 확인" : `${link.platform} 구매`}
                </a>
              )});
            })}
          </div>
        </div>
      )}
    </div>
  );
}
