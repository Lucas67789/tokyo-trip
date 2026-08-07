import { createClient } from "@/utils/supabase/server";
import { Map } from "lucide-react";

export const revalidate = 0;

export default async function SearchesAdminPage() {
  const supabase = await createClient();

  const [
    { data: searchLogs },
    { data: stations },
  ] = await Promise.all([
    supabase.from("search_logs").select("start_slug, end_slug, created_at"),
    supabase.from("stations").select("slug, name_ko"),
  ]);

  const stationMap: Record<string, string> = {};
  (stations || []).forEach((s: any) => {
    stationMap[s.slug] = s.name_ko;
  });

  const searchPathCounts: Record<string, { start: string, end: string, count: number }> = {};
  (searchLogs || []).forEach((log: any) => {
    const startName = stationMap[log.start_slug] || log.start_slug;
    const endName = stationMap[log.end_slug] || log.end_slug;
    const key = `${startName} → ${endName}`;
    if (!searchPathCounts[key]) {
      searchPathCounts[key] = { start: startName, end: endName, count: 0 };
    }
    searchPathCounts[key].count += 1;
  });

  const allSearchPaths = Object.values(searchPathCounts)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">노선도 인기 검색 경로</h1>
        <p className="text-slate-500 font-medium">사용자들이 지하철 노선도에서 검색한 모든 경로 데이터를 분석합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <Map size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">검색 경로 전체 목록</h2>
          <span className="text-sm font-bold text-slate-400 ml-auto">총 {allSearchPaths.length}개 경로</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="py-3 px-4 font-bold">순위</th>
                <th className="py-3 px-4 font-bold">출발역</th>
                <th className="py-3 px-4 font-bold">도착역</th>
                <th className="py-3 px-4 font-bold text-right">총 검색 횟수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSearchPaths.map((path, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{i + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{path.start}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{path.end}</td>
                  <td className="py-3 px-4 font-black text-blue-600 text-right">{path.count.toLocaleString()}건</td>
                </tr>
              ))}
              {allSearchPaths.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-slate-400 font-medium">
                    아직 등록된 검색 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
