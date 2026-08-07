import Link from "next/link";
import { Map } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070A] border-t border-white/5 mt-auto flex justify-center">
      <div className="w-full max-w-7xl px-5 py-12">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <div className="bg-cyan-500/20 p-1.5 rounded-lg text-cyan-400 border border-cyan-500/30">
              <Map size={16} />
            </div>
            <h2 className="font-extrabold text-white text-xl tracking-tight">TokyoTrip</h2>
          </Link>
          <p className="text-sm text-white/50 leading-relaxed max-w-sm">
            도쿄 13개 지하철 노선과 JR, 공항철도 데이터를 기반으로 한 가장 직관적인 도쿄 여행 가이드입니다. 
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-white/60 mb-10">
          <div className="flex flex-col gap-3">
            <h3 className="text-white/80 font-bold mb-1">About</h3>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">개인정보처리방침</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-white/80 font-bold mb-1">Contact</h3>
            <a href="#" className="hover:text-cyan-400 transition-colors">제휴/광고 문의</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">고객센터</a>
          </div>
        </div>
        
        <div className="pt-6 border-t border-white/5 text-xs text-white/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} TokyoTrip. All rights reserved.</p>
          <p>본 사이트는 광고 및 어필리에이트 파트너로부터 수익을 창출할 수 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}
