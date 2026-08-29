'use client'

import React, { useState, useEffect } from 'react'

export default function PurchasePage() {
  const [purchasedProduct, setPurchasedProduct] = useState<{
    id: string;
    name: string;
    price: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem('last_purchase');
    if (savedOrder) {
      setPurchasedProduct(JSON.parse(savedOrder));
    } else {
      const mockRandomId = Math.floor(100000 + Math.random() * 900000).toString();
      setPurchasedProduct({
        id: mockRandomId,
        name: 'Kamera DSLR Canon EOS',
        price: 'Rp 3.500.000',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60'
      });
    }
  }, []);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm relative overflow-hidden">
      <h1 className="text-xl sm:text-2xl font-bold text-black/80">Pesanan Saya</h1>
      <div className="w-full h-[1px] bg-slate-200 mb-6" />

      <div className=" min-h-[495px]">
        {purchasedProduct ? (
          <div className="border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl relative">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {purchasedProduct.image ? (
                <img 
                  src={purchasedProduct.image} 
                  alt={purchasedProduct.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shrink-0" 
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-300 rounded-xl shrink-0" />
              )}
              <div>
                <span className="text-xs text-black/60 font-medium">#{purchasedProduct.id}</span>
                <h3 className="font-bold text-base sm:text-lg text-black/80">{purchasedProduct.name}</h3>
                <p className="text-sm font-semibold text-[#059669] mt-0.5">{purchasedProduct.price}</p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 self-end sm:self-center">
              <span className="text-xs font-medium bg-[#059669]/10 py-2 px-4 rounded-md text-[#059669]">
                Belum dikirim
              </span>
              <button 
                onClick={() => alert(`Melihat detail pesanan #${purchasedProduct.id}`)}
                className="text-xs bg-[#059669] py-2 px-3 rounded-md font-medium text-white hover:scale-103 active:scale-95 transition-all duration-200"
              >
                Detail Pesanan
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <p className="text-sm text-black/50 font-medium">Belum ada pesanan yang dilakukan.</p>
          </div>
        )}
      </div>
    </div>
  )
}