'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface ServiceBookingCardProps {
  productId: number;
  triggerAlert: (msg: string) => void;
}

export default function ServiceBookingCard({ productId, triggerAlert }: ServiceBookingCardProps) {
  const router = useRouter();
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleConfirmBooking = async () => {
    if (!bookingDate || !bookingTime) {
      triggerAlert('Silakan pilih tanggal dan jam layanan terlebih dahulu.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      triggerAlert('Silakan login terlebih dahulu untuk booking jasa ini.');
      return;
    }

    setIsSubmitting(true);

    const formattedDate = new Date(bookingDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const bookingText = `Halo, saya ingin booking jasa ini pada ${formattedDate} pukul ${bookingTime}. Mohon konfirmasinya.`;

    const { error } = await supabase.from('messages').insert([
      {
        product_id: productId,
        user_id: user.id,
        sender: 'user',
        text: bookingText,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      triggerAlert('Gagal mengirim permintaan booking. Coba lagi.');
      return;
    }

    router.push(`/chat/${productId}`);
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
      <h3 className="text-xs sm:text-sm font-bold text-black/80">Booking Jadwal Layanan</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] sm:text-xs text-black/50 font-medium block">Tanggal</label>
          <input
            type="date"
            value={bookingDate}
            min={today}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-black/80 focus:outline-none focus:border-[#059669]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] sm:text-xs text-black/50 font-medium block">Jam</label>
          <input
            type="time"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-black/80 focus:outline-none focus:border-[#059669]"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleConfirmBooking}
        disabled={isSubmitting}
        className="w-full py-2.5 bg-[#059669] text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.98] duration-200 transition-all shadow-sm disabled:opacity-60 disabled:hover:scale-100"
      >
        {isSubmitting ? 'Mengirim...' : 'Chat untuk Konfirmasi Jadwal'}
      </button>
    </div>
  );
}