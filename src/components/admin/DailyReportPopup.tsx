'use client';

import React, { useEffect, useState } from 'react';
import { getYesterdayReport } from '@/app/actions/reportActions';
import { X, TrendingUp, Users, MousePointerClick, Map, Download } from 'lucide-react';

type ReportData = {
  dateStr: string;
  uniqueVisits: number;
  agodaClicks: number;
  pdfDownloads: number;
  topSearchPaths: { start: string; end: string; count: number }[];
  totalSearches: number;
  hasData: boolean;
};

export default function DailyReportPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndFetchReport = async () => {
      // 1. Calculate today's date string in KST for localStorage key
      const now = new Date();
      const kstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      const todayKey = `${kstNow.getFullYear()}-${kstNow.getMonth() + 1}-${kstNow.getDate()}`;

      const lastSeen = localStorage.getItem('daily_report_seen');
      
      // If already seen today, do nothing
      if (lastSeen === todayKey) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await getYesterdayReport();
        if (res.success && res.data.hasData) {
          setReportData(res.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch daily report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndFetchReport();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    
    // Set local storage so it doesn't show again today
    const now = new Date();
    const kstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const todayKey = `${kstNow.getFullYear()}-${kstNow.getMonth() + 1}-${kstNow.getDate()}`;
    localStorage.setItem('daily_report_seen', todayKey);
  };

  if (!isOpen || !reportData || isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Daily Briefing</h2>
          </div>
          <p className="text-indigo-100 font-medium text-sm">
            {reportData.dateStr} 어제 하루 동안의 핵심 성과입니다.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Main KPI */}
          <div className="flex items-center p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="bg-purple-100 p-3 rounded-xl mr-4">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-600 mb-0.5">총 방문자 (고유 세션)</p>
              <div className="text-3xl font-black text-slate-900">{reportData.uniqueVisits.toLocaleString()}<span className="text-lg font-bold text-slate-400 ml-1">명</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Agoda Clicks */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick size={16} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-600">아고다 클릭</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{reportData.agodaClicks.toLocaleString()}<span className="text-sm font-bold text-slate-400 ml-1">건</span></div>
            </div>

            {/* PDF Downloads */}
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <Download size={16} className="text-rose-500" />
                <span className="text-xs font-bold text-rose-600">노선도 PDF 다운</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{reportData.pdfDownloads.toLocaleString()}<span className="text-sm font-bold text-slate-400 ml-1">건</span></div>
            </div>
          </div>

          {/* Top Searches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Map size={16} className="text-blue-500" /> 
                가장 많이 찾은 노선 (총 {reportData.totalSearches}건)
              </h3>
            </div>
            <div className="space-y-2">
              {reportData.topSearchPaths.length > 0 ? (
                reportData.topSearchPaths.map((path, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{path.start} <span className="text-slate-400 mx-1">→</span> {path.end}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{path.count}건</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-slate-50 rounded-xl text-sm text-slate-400 font-medium border border-dashed border-slate-200">
                  어제 기록된 경로 검색이 없습니다.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={handleClose}
            className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            확인 (오늘 하루 보지 않기)
          </button>
        </div>
      </div>
    </div>
  );
}
