import Link from 'next/link';

interface Line {
  id: string;
  name: string;
  color: string;
}

interface StationProps {
  slug: string;
  name_ko: string;
  name_en: string;
  name_jp: string;
  lines: Line[];
  description: string;
}

export default function StationCard({ slug, name_ko, name_en, name_jp, lines, description }: StationProps) {
  return (
    <Link href={`/station/${slug}`} className="block w-full group">
      <div className="bg-[#1A2235]/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 group-hover:border-cyan-500/30 group-hover:bg-[#1A2235] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] relative overflow-hidden">
        {/* Neon accent line on top */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{name_ko}</h3>
            <span className="text-sm text-white/50">{name_jp} · {name_en}</span>
          </div>
          <div className="flex gap-1.5">
            {lines.map(line => (
              <span 
                key={line.id} 
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm" 
                style={{ backgroundColor: line.color, boxShadow: `0 0 8px ${line.color}80` }}
                title={line.name}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
