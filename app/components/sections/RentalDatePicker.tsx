'use client';

import React from 'react';

interface RentalDatePickerProps {
  price: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export default function RentalDatePicker({
  price,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: RentalDatePickerProps) {
  const today = new Date().toISOString().split('T')[0];

  const rawPrice = Number(price.toString().replace(/[^0-9]/g, '')) || 0;

  let durationDays = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  }

  const totalPrice = rawPrice * durationDays;

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
      <h3 className="text-xs sm:text-sm font-bold text-black/80">Pilih Tanggal Sewa</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] sm:text-xs text-black/50 font-medium block">Tanggal Mulai</label>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => {
              onStartDateChange(e.target.value);
              if (endDate && e.target.value > endDate) onEndDateChange('');
            }}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-black/80 focus:outline-none focus:border-[#059669]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] sm:text-xs text-black/50 font-medium block">Tanggal Selesai</label>
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            disabled={!startDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-black/80 focus:outline-none focus:border-[#059669] disabled:bg-slate-50 disabled:text-black/30"
          />
        </div>
      </div>

      {durationDays > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs sm:text-sm">
          <span className="text-black/50 font-medium">
            Durasi: <span className="text-black/80 font-bold">{durationDays} Hari</span>
          </span>
          <span className="text-[#059669] font-bold text-sm sm:text-base lg:text-lg">
            Rp. {totalPrice.toLocaleString('id-ID')}
          </span>
        </div>
      )}
    </div>
  );
}