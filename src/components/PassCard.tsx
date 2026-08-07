import Image from 'next/image';
import Link from 'next/link';
import { Ticket, ChevronRight } from 'lucide-react';

interface PassProps {
  slug: string;
  name_ko: string;
  thumbnail_url: string;
  description: string;
  price_jpy?: number;
}

export default function PassCard({ slug, name_ko, thumbnail_url, description, price_jpy }: PassProps) {
  // If no thumbnail is provided, use a default subway-related image
  const defaultImage = 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80';
  const imageUrl = thumbnail_url || defaultImage;

  return (
    <Link href={`/pass/${slug}`} className="block w-full group">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 flex flex-col h-full relative overflow-hidden">
        
        {/* Pass Header */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-xl">
              <Ticket className="text-blue-500" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{name_ko}</h3>
          </div>
        </div>

        {/* Pass Description */}
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-grow relative z-10">
          {description}
        </p>
        
        {/* Footer Area */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center relative z-10 mt-auto">
          {price_jpy ? (
            <span className="text-sm font-black text-slate-800">
              {price_jpy.toLocaleString()}엔~
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium tracking-wide">상세 정보 확인</span>
          )}
          <span className="text-sm font-bold text-blue-600 group-hover:text-blue-800 transition-colors flex items-center gap-1">
            자세히 보기 <ChevronRight size={16} />
          </span>
        </div>

      </div>
    </Link>
  );
}
