'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; day: string; visitors: number; x: number; y: number } | null>(null);

  const weekData = [
    { day: 'Senin', visitors: 120 },
    { day: 'Selasa', visitors: 180 },
    { day: 'Rabu', visitors: 150 },
    { day: 'Kamis', visitors: 260 },
    { day: 'Jumat', visitors: 220 },
    { day: 'Sabtu', visitors: 340 },
    { day: 'Minggu', visitors: 310 }
  ];

  const monthData = [
    { day: 'Minggu 1', visitors: 1200 },
    { day: 'Minggu 2', visitors: 1500 },
    { day: 'Minggu 3', visitors: 1400 },
    { day: 'Minggu 4', visitors: 1800 }
  ];

  const currentData = timeFilter === 'week' ? weekData : monthData;
  const maxVal = timeFilter === 'week' ? 400 : 2000;

  const totalVisitors = currentData.reduce((sum, item) => sum + item.visitors, 0);
  const avgVisitors = Math.round(totalVisitors / currentData.length);
  const peakDay = currentData.reduce((max, item) => (item.visitors > max.visitors ? item : max), currentData[0]);

  const getSmoothPath = (data: typeof weekData, valueKey: 'visitors') => {
    const points = data.map((item, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 100 - (item[valueKey] / maxVal) * 100;
      return { x, y };
    });

    if (points.length === 0) return '';

    return points.reduce((acc, point, idx, arr) => {
      if (idx === 0) return `M ${point.x} ${point.y}`;
      const prev = arr[idx - 1];
      const controlX = (prev.x + point.x) / 2;
      return `${acc} C ${controlX} ${prev.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
    }, '');
  };

  const visitorsPath = getSmoothPath(currentData, 'visitors');
  const areaPath = `${visitorsPath} L 100 100 L 0 100 Z`;

  return (
    <div className="w-full px-2 sm:px-2 lg:px-2">
      <div className="mb-6 sm:mb-8 border-b border-slate-200 pb-5 sm:pb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-black/85">Dashboard {"(Simulasi)"}</h1>
      </div>

      <section className="mb-8 sm:mb-10">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-black/80 mb-4">Ringkasan Performa Toko</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div
            onClick={() => router.push('/seller/product')}
            className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#047857] text-white p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-32 sm:h-36"
          >
            <div className="absolute right-[-10px] bottom-[-10px] opacity-15 pointer-events-none group-hover:scale-110 transition-transform duration-300">
              <svg className="w-28 h-28 sm:w-32 sm:h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM12 3.18l6 3.43-6 3.43-6-3.43 6-3.43zM5 9.77l6 3.43v6.86L5 16.63V9.77zm14 6.86l-6 3.43v-6.86l6-3.43v6.86z" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-100">Total Katalog</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1.5">18</p>
            </div>
            <span className="relative text-[10px] sm:text-xs font-medium text-emerald-100 flex items-center gap-1">
              Lihat katalog
              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <span className="absolute top-3 right-3 text-[9px] font-semibold bg-white/15 px-2 py-0.5 rounded-full">Simulasi</span>
          </div>

          <div
            onClick={() => router.push('/seller/income')}
            className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#047857] text-white p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-32 sm:h-36"
          >
            <div className="absolute right-[-10px] bottom-[-10px] opacity-15 pointer-events-none group-hover:scale-110 transition-transform duration-300">
              <svg className="w-28 h-28 sm:w-32 sm:h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-100">Total Penjualan</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1.5">Rp. 2.550.000</p>
            </div>
            <span className="relative text-[10px] sm:text-xs font-medium text-emerald-100 flex items-center gap-1">
              Lihat keuangan
              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <span className="absolute top-3 right-3 text-[9px] font-semibold bg-white/15 px-2 py-0.5 rounded-full">Simulasi</span>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#047857] text-white p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-32 sm:h-36 sm:col-span-2 lg:col-span-1">
            <div className="absolute right-[-10px] bottom-[-10px] opacity-15 pointer-events-none group-hover:scale-110 transition-transform duration-300">
              <svg className="w-28 h-28 sm:w-32 sm:h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-100">Rating Toko</p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-2xl sm:text-3xl font-bold">4.9</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <span className="relative text-[10px] sm:text-xs font-medium text-emerald-100">Berdasarkan ulasan pembeli</span>
            <span className="absolute top-3 right-3 text-[9px] font-semibold bg-white/15 px-2 py-0.5 rounded-full">Simulasi</span>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-black/80">Analisis Grafik Toko {"(Simulasi)"}</h2>
            <p className='text-sm font-medium text-[#059669]'>Simulasi Real Time Data</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  timeFilter === 'week' ? 'bg-white text-[#059669] shadow-sm' : 'text-black/50 hover:text-black/70'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  timeFilter === 'month' ? 'bg-white text-[#059669] shadow-sm' : 'text-black/50 hover:text-black/70'
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-emerald-50 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wide">Total Pengunjung</p>
            <p className="text-lg sm:text-2xl font-bold text-black/80 mt-1">{totalVisitors.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wide">Rata-rata</p>
            <p className="text-lg sm:text-2xl font-bold text-black/80 mt-1">{avgVisitors.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wide">Puncak</p>
            <p className="text-lg sm:text-2xl font-bold text-black/80 mt-1">{peakDay.day}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
            <span className="w-3 h-3 rounded-full bg-[#059669]"></span>
            <span>Pengunjung Toko</span>
          </div>
        </div>

        <div className="relative h-72 sm:h-80 w-full pt-8 pb-8">
          {hoveredPoint && (
            <div
              className="absolute z-30 transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none mb-3"
              style={{ left: `calc(${hoveredPoint.x}% * 0.88 + 6%)`, top: `${hoveredPoint.y}%` }}
            >
              <p className="font-bold">{hoveredPoint.day}</p>
              <p className="text-emerald-300">{hoveredPoint.visitors} pengunjung</p>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
            </div>
          )}

          <div className="absolute inset-0 flex flex-col justify-between text-[10px] sm:text-[11px] text-slate-400 pointer-events-none pl-10 sm:pl-12 pt-8 pb-8">
            <div className="border-b border-dashed border-slate-100 flex items-center"><span className="-translate-x-8 sm:-translate-x-10">{maxVal.toLocaleString('id-ID')}</span></div>
            <div className="border-b border-dashed border-slate-100 flex items-center"><span className="-translate-x-8 sm:-translate-x-10">{Math.round(maxVal * 0.75).toLocaleString('id-ID')}</span></div>
            <div className="border-b border-dashed border-slate-100 flex items-center"><span className="-translate-x-8 sm:-translate-x-10">{Math.round(maxVal * 0.5).toLocaleString('id-ID')}</span></div>
            <div className="border-b border-dashed border-slate-100 flex items-center"><span className="-translate-x-8 sm:-translate-x-10">{Math.round(maxVal * 0.25).toLocaleString('id-ID')}</span></div>
            <div className="border-b border-dashed border-slate-100 flex items-center"><span className="-translate-x-8 sm:-translate-x-10">0</span></div>
          </div>

          <div className="absolute inset-0 pl-10 sm:pl-12 pr-2 sm:pr-4 pt-8 pb-8 pointer-events-none z-10">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#areaFill)" stroke="none" />
              <path
                d={visitorsPath}
                fill="none"
                stroke="#059669"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className="absolute inset-0 pl-10 sm:pl-12 pr-2 sm:pr-4 pt-8 pb-8 flex items-end justify-between">
            {currentData.map((item, idx) => {
              const visitorsHeight = (item.visitors / maxVal) * 100;
              const xPercent = (idx / (currentData.length - 1)) * 100;

              return (
                <div key={idx} className="relative flex-1 flex flex-col items-center h-full group">
                  <div
                    className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#059669] border-2 border-white shadow cursor-pointer transition-transform hover:scale-125 z-20"
                    style={{ bottom: `${visitorsHeight}%`, transform: 'translateY(50%)' }}
                    onMouseEnter={() => setHoveredPoint({ index: idx, day: item.day, visitors: item.visitors, x: xPercent, y: 100 - visitorsHeight })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  ></div>

                  <div className="absolute bottom-[-26px] text-[10px] sm:text-xs font-medium text-black/50 whitespace-nowrap">
                    {item.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}