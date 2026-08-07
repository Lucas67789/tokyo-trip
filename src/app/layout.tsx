import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CopyProtection from "@/components/CopyProtection";
import GlobalAnalytics from "@/components/GlobalAnalytics";
import Script from "next/script";
import "./globals.css";

const BASE_URL = "https://tokyotrip.kr";
const SITE_NAME = "도쿄 메트로 투어";

export const viewport: Viewport = {
  themeColor: "#0A0E17",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | 도쿄 메트로 투어",
    default: "도쿄 지하철 노선도",
  },
  description:
    "도쿄 지하철 노선도(도쿄 메트로, 도에이, JR 야마노테선 등) 완전 정복 가이드! 나리타공항, 하네다공항, 시부야, 신주쿠역 등 필수 여행지 가는법 및 소요시간 검색. 도쿄 서브웨이 티켓 추천 및 고화질 노선도 다운로드까지 한 번에 해결하세요.",
  keywords: [
    "도쿄 지하철",
    "도쿄 여행",
    "도쿄 할인코드",
    "아고다 할인코드",
    "호텔스닷컴 할인코드",
    "클룩 할인코드",
    "나리타 공항 시부야",
    "도쿄 경로 안내",
    "나리타 익스프레스",
    "스카이라이너 예약",
    "도쿄 자유여행",
    "도쿄 가성비 호텔",
    "도쿄 노선도",
    "도쿄 교통패스",
  ],
  authors: [{ name: SITE_NAME, url: BASE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  verification: {
    // @ts-ignore
    naver: "883b2500bc7486ef4650490c72b8606a2a4fa565",
    google: "l8nGoIceTa635TzWCyT9DvNvV6w6lhznc5qWkDg_lfo",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "도쿄 지하철 노선도",
    description:
      "최적의 도쿄 여행을 위한 필수 안내! 공항에서 시부야·신주쿠까지 경로 비교부터, 역세권 가성비 도쿄 호텔 추천 및 숙소 추천 정보까지 한눈에 확인하세요. 아고다 할인코드, 트립닷컴 할인코드 혜택으로 최저가 예약도 가능합니다.",
    siteName: SITE_NAME,
    images: [
      {
        url: "/images/og-main.png",
        width: 1200,
        height: 630,
        alt: "도쿄 메트로 투어 - 지하철 경로 및 최신 할인코드 총정리",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "도쿄 지하철 노선도",
    description: "공항→시부야·신주쿠 최적 교통편 비교 분석 및 최신 12% 할인코드 꿀팁 제공!",
    images: ["/images/og-main.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: SITE_NAME,
      description: "도쿄 지하철 경로 안내 및 여행 가이드",
      inLanguage: "ko-KR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/images/logo.png`,
        width: 200,
        height: 60,
      },
      sameAs: [
        BASE_URL,
      ],
    },
    {
      "@type": "TouristDestination",
      "@id": `${BASE_URL}/#destination`,
      name: "도쿄",
      alternateName: ["Tokyo", "東京"],
      description:
        "일본의 수도이자 최대 도시. 시부야, 신주쿠, 아사쿠사 등 다양한 매력을 가진 세계적인 여행 허브.",
      touristType: ["가족 여행", "커플 여행", "자유여행", "배낭여행"],
      geo: {
        "@type": "GeoCoordinates",
        latitude: 35.6762,
        longitude: 139.6503,
      },
      url: BASE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <meta name="naver-site-verification" content="ead1faf7a75aa079fc6a81be56c9c3a441a8c331" />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7645247760396581"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <GlobalAnalytics />
        <CopyProtection />
        <Header />
        <main className="flex-1 flex flex-col w-full overflow-x-hidden relative min-h-screen">
          {children}
        </main>
        <Footer />
        
        {/* Google Analytics 4 (GA4) */}
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-VP5GBXZ4Y4`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VP5GBXZ4Y4');
            `}
          </Script>
        </>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x2276pr7n1");
          `}
        </Script>
      </body>
    </html>
  );
}
