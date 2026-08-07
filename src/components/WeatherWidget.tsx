import { TrendingUp } from "lucide-react";

async function getWeatherData() {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenWeatherMap API Key is missing");
  }

  // Current Weather
  const currentRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Tokyo,JP&appid=${apiKey}&units=metric&lang=kr`,
    { next: { revalidate: 1800 } } // 30분 캐시
  );
  
  if (!currentRes.ok) {
    throw new Error("Failed to fetch current weather");
  }
  const currentData = await currentRes.json();

  // Forecast (5 days / 3 hours)
  const forecastRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=Tokyo,JP&appid=${apiKey}&units=metric&lang=kr`,
    { next: { revalidate: 1800 } }
  );

  if (!forecastRes.ok) {
    throw new Error("Failed to fetch forecast");
  }
  const forecastData = await forecastRes.json();

  return { currentData, forecastData };
}

function getWeatherIcon(iconCode: string) {
  // OpenWeatherMap Icon Codes Mapping to Emoji
  const iconMap: Record<string, string> = {
    "01d": "☀️",
    "01n": "🌙",
    "02d": "⛅",
    "02n": "☁️",
    "03d": "☁️",
    "03n": "☁️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌦️",
    "10n": "🌧️",
    "11d": "⛈️",
    "11n": "⛈️",
    "13d": "❄️",
    "13n": "❄️",
    "50d": "🌫️",
    "50n": "🌫️",
  };
  return iconMap[iconCode] || "🌤️";
}

export default async function WeatherWidget() {
  let currentData = null;
  let forecastData = null;
  let isError = false;

  try {
    const data = await getWeatherData();
    currentData = data.currentData;
    forecastData = data.forecastData;
  } catch (error) {
    console.error("Weather fetching error:", error);
    isError = true;
  }

  if (isError || !currentData || !forecastData) {
    return (
      <div className="bg-[#1A2235]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-lg h-full flex flex-col justify-center items-center text-center relative overflow-hidden group">
        <p className="text-white/50 text-sm">날씨 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const currentTemp = Math.round(currentData.main.temp);
  const currentDesc = currentData.weather[0].description;
  const currentIcon = getWeatherIcon(currentData.weather[0].icon);

  // 현재 날짜 기준 자정부터의 타임스탬프
  const now = new Date();
  const todayStr = `${now.getMonth() + 1}/${now.getDate()}`;
  now.setHours(0, 0, 0, 0);

  // 내일, 모레, 글피 데이터 추출 (오후 12~3시 데이터 위주)
  const days: any[] = [];
  let dayOffset = 1;

  for (const item of forecastData.list) {
    if (days.length >= 3) break;
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // 날짜가 일치하고 시간이 낮 시간대인 예보 찾기 (오후 12:00 ~ 15:00)
    if (item.dt_txt.startsWith(targetDateStr) && item.dt_txt.includes("12:00:00")) {
      days.push({
        label: dayOffset === 1 ? "내일" : dayOffset === 2 ? "모레" : "글피",
        dateStr: `${targetDate.getMonth() + 1}/${targetDate.getDate()}`,
        temp: Math.round(item.main.temp),
        icon: getWeatherIcon(item.weather[0].icon),
      });
      dayOffset++;
    }
  }

  // 낮 데이터가 부족하면 아무거나 그 날짜의 첫 번째 데이터 사용 (새벽 시간대 방어 코드)
  if (days.length < 3) {
    dayOffset = 1;
    days.length = 0; // 초기화
    
    const dateGroups: Record<string, any> = {};
    for (const item of forecastData.list) {
      const dateStr = item.dt_txt.split(' ')[0];
      if (!dateGroups[dateStr]) {
        dateGroups[dateStr] = item;
      }
    }
    
    const sortedDates = Object.keys(dateGroups).sort();
    const todayStr = new Date().toISOString().split('T')[0];
    
    for (const date of sortedDates) {
      if (date <= todayStr) continue;
      if (days.length >= 3) break;
      
      const item = dateGroups[date];
      const tDate = new Date(date);
      days.push({
        label: days.length === 0 ? "내일" : days.length === 1 ? "모레" : "글피",
        dateStr: `${tDate.getMonth() + 1}/${tDate.getDate()}`,
        temp: Math.round(item.main.temp),
        icon: getWeatherIcon(item.weather[0].icon),
      });
    }
  }

  // 강수 확률 (0~1) -> 퍼센트
  const currentPop = forecastData.list[0] ? Math.round(forecastData.list[0].pop * 100) : 0;

  // 디테일 정보
  const humidity = currentData.main.humidity;
  const windSpeed = currentData.wind.speed.toFixed(1);
  const feelsLike = Math.round(currentData.main.feels_like);

  let clothingAdvice = "반팔과 가벼운 옷차림이 좋습니다.";
  if (currentTemp < 10) clothingAdvice = "두꺼운 외투와 방한용품을 챙기세요!";
  else if (currentTemp < 15) clothingAdvice = "따뜻한 자켓이나 코트를 챙기세요.";
  else if (currentTemp < 20) clothingAdvice = "가디건이나 얇은 겉옷이 필요합니다.";
  else if (currentTemp < 25) clothingAdvice = "긴팔이나 얇은 셔츠가 적당합니다.";
  else if (currentTemp >= 30) clothingAdvice = "매우 덥습니다. 시원한 옷과 양산을 챙기세요!";

  return (
    <div className="bg-[#1A2235]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-lg h-full flex flex-col justify-between relative overflow-hidden group">
      <div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            오늘의 날씨 <span className="text-xs font-normal text-white/50 bg-white/10 px-2 py-0.5 rounded-full">{todayStr}</span>
          </h2>
          <span className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{currentIcon}</span>
        </div>
        <div className="text-4xl font-black text-white mb-1 relative z-10">
          {currentTemp}°<span className="text-white/30 text-2xl">C</span>
        </div>
        <p className="text-white/50 text-sm relative z-10">도쿄, {currentDesc} (강수확률 {currentPop}%)</p>
      </div>

      <div className="my-4 py-4 border-y border-white/5 relative z-10 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">체감 온도</span>
          <span className="text-white font-bold">{feelsLike}°C</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">습도 / 풍속</span>
          <span className="text-white font-bold">{humidity}% / {windSpeed}m/s</span>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 mt-1">
          <p className="text-cyan-400 text-xs font-bold flex items-center gap-2">
            <span>👕</span> {clothingAdvice}
          </p>
        </div>
      </div>
      
      <div className="mt-auto grid grid-cols-3 gap-2 relative z-10">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center bg-[#0A0E17]/40 rounded-xl py-2 border border-white/5">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] text-white/50 font-bold">{day.label}</span>
              <span className="text-[9px] text-white/30">{day.dateStr}</span>
            </div>
            <span className="text-lg mb-1 drop-shadow-md">{day.icon}</span>
            <span className="text-xs font-bold text-white">{day.temp}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
