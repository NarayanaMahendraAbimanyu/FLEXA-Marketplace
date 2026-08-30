'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; day: string; sales: number; visitors: number; x: number; y: number } | null>(null);

  const weekData = [
    { day: 'Sen', sales: 420, visitors: 350 },
    { day: 'Sel', sales: 580, visitors: 480 },
    { day: 'Rab', sales: 500, visitors: 420 },
    { day: 'Kam', sales: 750, visitors: 680 },
    { day: 'Jum', sales: 680, visitors: 610 },
    { day: 'Sab', sales: 950, visitors: 890 },
    { day: 'Min', sales: 880, visitors: 820 }
  ];

  const monthData = [
    { day: 'Minggu 1', sales: 3200, visitors: 2900 },
    { day: 'Minggu 2', sales: 4100, visitors: 3800 },
    { day: 'Minggu 3', sales: 3900, visitors: 3500 },
    { day: 'Minggu 4', sales: 4800, visitors: 4400 }
  ];

  const currentData = timeFilter === 'week' ? weekData : monthData;

  return (
    <div className="w-full">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      <section className="mb-10">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Ringkasan Performa Toko</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => router.push('/seller/product')}
            className="cursor-pointer relative overflow-hidden bg-[#059669] text-white p-6 rounded-2xl shadow-md hover:scale-101 transition-transform flex flex-col justify-between h-36"
          >
            <div className="absolute right-[-10px] bottom-[-10px] opacity-20 pointer-events-none">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-100">Total Katalog</p>
              <p className="text-3xl font-bold mt-2">18</p>
            </div>
          </div>

          <div
            onClick={() => router.push('/seller/income')}
            className="cursor-pointer relative overflow-hidden bg-[#059669] text-white p-6 rounded-2xl shadow-md hover:scale-101 transition-transform flex flex-col justify-between h-36"
          >
            <div className="absolute right-[-10px] bottom-[-10px] opacity-20 pointer-events-none">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-100">Total Penjualan</p>
              <p className="text-3xl font-bold mt-2">Rp. 550.000</p>
            </div>
          </div>

          <div
            onClick={() => router.push('/seller/income')}
            className="cursor-pointer relative overflow-hidden bg-[#059669] text-white p-6 rounded-2xl shadow-md hover:scale-101 transition-transform flex flex-col justify-between h-36"
          >
            <div className="absolute right-[-10px] bottom-[-10px] opacity-20 pointer-events-none">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-100">Rating Toko</p>
              <p className="text-3xl font-bold mt-2">4.9</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Analisis Grafik Toko</h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="relative">
                <button
                  onClick={() => setTimeFilter(timeFilter === 'week' ? 'month' : 'week')}
                  className="px-4 py-2 bg-[#059669] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-2 hover:bg-[#047857] transition-colors"
                >
                  <span>{timeFilter === 'week' ? 'Minggu ini' : 'Bulan ini'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
              <span className="w-3 h-3 rounded-full bg-[#006143]"></span>
              <span>Penjualan</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
              <span className="w-3 h-3 rounded-full bg-[#059669]"></span>
              <span>Pengunjung Toko</span>
            </div>
          </div>
        </div>

        <div className="relative h-64 w-full pt-8 pb-4">
          {hoveredPoint && (
            <div
              className="absolute z-20 transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none mb-2"
              style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%` }}
            >
              <p className="font-bold">{hoveredPoint.day}</p>
              <p>Penjualan: {hoveredPoint.sales}</p>
              <p>Pengunjung: {hoveredPoint.visitors}</p>
            </div>
          )}

          <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 pointer-events-none pl-8">
            <div className="border-b border-slate-100 flex justify-between"><span>1,000</span></div>
            <div className="border-b border-slate-100 flex justify-between"><span>750</span></div>
            <div className="border-b border-slate-100 flex justify-between"><span>500</span></div>
            <div className="border-b border-slate-100 flex justify-between"><span>250</span></div>
            <div className="border-b border-slate-100 flex justify-between"><span>0</span></div>
          </div>

          <div className="absolute inset-0 pl-12 pr-4 pt-8 pb-6 flex items-end justify-between">
            {currentData.map((item, idx) => {
              const maxVal = 1000;
              const salesHeight = (item.sales / maxVal) * 100;
              const visitorsHeight = (item.visitors / maxVal) * 100;
              const xPercent = (idx / (currentData.length - 1)) * 100;

              return (
                <div key={idx} className="relative flex-1 flex flex-col items-center h-full group">
                  <div
                    className="absolute w-4 h-4 rounded-full bg-[#006143] border-2 border-white shadow cursor-pointer transition-transform hover:scale-125 z-10"
                    style={{ bottom: `${salesHeight}%`, transform: 'translateY(50%)' }}
                    onMouseEnter={() => setHoveredPoint({ index: idx, day: item.day, sales: item.sales, visitors: item.visitors, x: xPercent, y: 100 - salesHeight })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  ></div>
                  <div
                    className="absolute w-4 h-4 rounded-full bg-[#059669] border-2 border-white shadow cursor-pointer transition-transform hover:scale-125 z-10"
                    style={{ bottom: `${visitorsHeight}%`, transform: 'translateY(50%)' }}
                    onMouseEnter={() => setHoveredPoint({ index: idx, day: item.day, sales: item.sales, visitors: item.visitors, x: xPercent, y: 100 - visitorsHeight })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  ></div>

                  <div className="absolute bottom-[-24px] text-xs font-medium text-slate-500">
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