import { TrendingUp, TrendingDown, Minus } from "lucide-react";

async function getExchangeRate() {
  try {
    // 1. 오늘의 환율 가져오기
    const todayRes = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jpy.json",
      { next: { revalidate: 3600 } } // 1시간 캐시
    );
    if (!todayRes.ok) throw new Error("Failed to fetch today rate");
    const todayData = await todayRes.json();
    
    // 2. 어제 날짜 구하기 (YYYY-MM-DD 포맷)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];

    // 3. 어제의 환율 가져오기
    const yesterdayRes = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${yStr}/v1/currencies/jpy.json`,
      { next: { revalidate: 86400 } } // 어제 데이터는 하루 종일 캐시
    );
    if (!yesterdayRes.ok) throw new Error("Failed to fetch yesterday rate");
    const yesterdayData = await yesterdayRes.json();

    // 100엔 기준 원화 계산
    const currentRate = todayData.jpy.krw * 100;
    const pastRate = yesterdayData.jpy.krw * 100;

    return { currentRate, pastRate };
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    return null;
  }
}

export default async function ExchangeRateWidget() {
  const rateData = await getExchangeRate();

  if (!rateData) {
    return (
      <div className="bg-[#1A2235]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-lg h-full flex flex-col justify-center items-center text-center relative overflow-hidden group">
        <p className="text-white/50 text-sm">환율 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const { currentRate, pastRate } = rateData;
  const diff = currentRate - pastRate;
  const isUp = diff > 0;
  const isDown = diff < 0;
  const diffAbs = Math.abs(diff).toFixed(2);

  // 정수 부분과 소수 부분 분리
  const rateStr = currentRate.toFixed(2);
  const [integerPart, decimalPart] = rateStr.split(".");

  return (
    <div className="bg-[#1A2235]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-lg h-full flex flex-col justify-center items-center text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
      
      {isUp ? (
        <TrendingUp size={48} className="text-rose-400 mb-4 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse" />
      ) : isDown ? (
        <TrendingDown size={48} className="text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-pulse" />
      ) : (
        <Minus size={48} className="text-white/50 mb-4" />
      )}
      
      <h2 className="text-2xl font-black text-white mb-2 relative z-10">현재 환율</h2>
      <div className="flex items-end justify-center gap-1 relative z-10">
        <span className="text-3xl font-black text-white">{integerPart}.</span>
        <span className="text-xl font-bold text-white/70">{decimalPart}</span> 
        <span className="text-sm font-bold text-cyan-400 mb-1 ml-1">원</span>
      </div>
      <p className="text-white/50 text-xs mt-2 relative z-10">100엔 (JPY) 기준</p>
      
      {isUp && (
        <div className="mt-4 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(244,63,94,0.1)] relative z-10">
          어제보다 ▲ {diffAbs}원
        </div>
      )}
      {isDown && (
        <div className="mt-4 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(0,240,255,0.1)] relative z-10">
          어제보다 ▼ {diffAbs}원
        </div>
      )}
      {!isUp && !isDown && (
        <div className="mt-4 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/70 text-[10px] font-bold tracking-widest uppercase relative z-10">
          어제와 동일
        </div>
      )}
    </div>
  );
}
