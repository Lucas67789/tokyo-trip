import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users } from 'lucide-react';

interface HotelProps {
  slug: string;
  name_ko: string;
  thumbnail_url: string;
  tags: string[];
  view_count_24h?: number;
  distance_meters?: number;
  priority?: boolean;
}

export default function HotelCard({ slug, name_ko, thumbnail_url, tags, view_count_24h, distance_meters, priority = false }: HotelProps) {
  return (
    <Link href={`/hotel/${slug}`} className="block w-full group">
      <div className="bg-[#1A2235]/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border border-white/5 group-hover:bg-[#1A2235] group-hover:border-cyan-500/30 transition-all duration-300 relative group-hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={thumbnail_url}
            alt={`도쿄 지하철역 인근 가성비 추천 숙소, ${name_ko} 외관 전경 및 객실 썸네일`}
            fill
            priority={priority}
            className="object-cover bg-[#0A0E17] group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2235]/90 via-transparent to-transparent pointer-events-none"></div>
          {/* 
          {view_count_24h && (
            <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-red-400/50">
              <Users size={12} />
              최근 {view_count_24h}명 확인
            </div>
          )}
          */}
        </div>

        <div className="p-5 relative">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white leading-tight pr-2 group-hover:text-cyan-300 transition-colors">{name_ko}</h3>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/50 mb-3">
            {distance_meters ? (
              <div className="flex items-center gap-1 text-white/70 font-medium">
                <MapPin size={14} className="text-cyan-400" />
                <span>역까지 {distance_meters}m</span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag, idx) => (
              <span key={idx} className="bg-cyan-500/10 text-cyan-400 text-xs px-2 py-1 rounded-md border border-cyan-500/20 shadow-[0_0_10px_rgba(0,240,255,0.05)]">
                #{tag}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-xs text-white/40 font-medium tracking-wide">리뷰 및 예약 혜택</span>
            <span className="text-sm font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
              상세 보기 <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
