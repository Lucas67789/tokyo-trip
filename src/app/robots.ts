import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      // 네이버봇 명시적 허용
      {
        userAgent: 'Yeti',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://tokyotrip.kr/sitemap.xml',
    host: 'https://tokyotrip.kr',
  };
}
