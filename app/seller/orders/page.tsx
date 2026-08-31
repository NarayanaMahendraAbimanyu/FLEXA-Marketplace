'use client';

import React, { useState } from 'react';

export default function SellerOrdersPage() {
  const [orders] = useState([
    {
      id: '934362',
      userName: 'Ahmad Fadillah',
      userAddress: 'Jl. Melati No. 45, RT 03/RW 05, Kel. Sukajadi, Bandung',
      productName: 'Kemeja Flanel Casual Pria (Dummy)',
      shortName: 'KEMEJA',
      qty: 2,
      price: 135000,
      paymentType: 'Via Bank (BCA)',
      status: 'BARU'
    },
    {
      id: '482190',
      userName: 'Siti Rahma',
      userAddress: 'Perum Griya Asri Blok B2 No. 12, Depok',
      productName: 'Wireless Earbuds Bluetooth 5.3 (Dummy)',
      shortName: 'EARBUDS',
      qty: 1,
      price: 249000,
      paymentType: 'Qris',
      status: 'BARU'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleOpenPopup = (order: any) => {
    setSelectedOrder(order);
  };

  const handleClosePopup = () => {
    setSelectedOrder(null);
  };

  const handleConfirmShipping = () => {
    setSelectedOrder(null);
    setShowNotification(true);
    setIsLeaving(false);
    
    setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setShowNotification(false);
        setIsLeaving(false);
      }, 400); 
    }, 2600);
  };

  return (
    <div className="w-full px-2 sm:px-2 lg:px-2 relative">
      {showNotification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#059669] text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2.5 transition-all duration-400 ease-out ${
          isLeaving ? '-translate-y-20 opacity-0 shadow-2xl' : 'translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-6 duration-400'
        }`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Pesanan siap dikirim.
        </div>
      )}

      <div className="mb-8 border-b border-black/30 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black/80">Pesanan Baru {"(Simulasi)"}</h1>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const totalPrice = order.qty * order.price;

          return (
            <div key={order.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center font-bold text-black/60">
                    {order.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-black/90 text-base">{order.userName}</h3>
                    <p className="text-xs sm:text-sm font-semibold text-black/60">Order #{order.id}</p>
                  </div>
                </div>
                <div className="self-start sm:self-auto">
                    <span className='py-2 px-4 bg-[#059669]/10 rounded-4xl text-xs font-bold text-[#059669]'>
                        {order.status}
                    </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-200 flex-shrink-0 flex items-center justify-center text-black/80 font-bold text-xs tracking-wider">
                    {order.shortName}
                  </div>
                  <div>
                    <h4 className="font-bold text-black/90 text-base sm:text-lg mt-0.5">{order.productName}</h4>
                    <p className="text-sm text-black/60 font-medium mt-1">{order.qty} x Rp {order.price.toLocaleString('id-ID')}</p>
                    <p className="text-sm font-bold text-black/70 mt-1">
                      Total : <span className="text-[#059669]">Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </p>
                    <p className="text-xs text-black/70 font-medium mt-1">Pembayaran: <span className='text-[#059669] font-semibold'>{order.paymentType}</span></p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                  <button
                    onClick={() => handleOpenPopup(order)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#059669] hover:bg-[#047857] hover:scale-105 active:scale-95 text-white font-semibold rounded-xl shadow transition-all duration-200 text-sm"
                  >
                    Atur Pengiriman
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-black/90 mb-4">Detail Pesanan Pembeli</h3>
            
            <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-black/10">
              <div className="flex justify-between">
                <span className="font-medium text-black/80">Nama Pembeli:</span>
                <span className="font-bold text-black/90">{selectedOrder.userName}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-medium text-black/80 flex-shrink-0">Alamat:</span>
                <span className="font-bold text-black/90 text-right">{selectedOrder.userAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-black/80">ID Order:</span>
                <span className="font-bold text-black/90">#{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-black/80">Produk:</span>
                <span className="font-bold text-black/90 text-right max-w-[200px]">{selectedOrder.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-black/80">Jumlah:</span>
                <span className="font-bold text-black/90">{selectedOrder.qty} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-black/80">Metode Pembayaran:</span>
                <span className="font-bold text-[#059669]">{selectedOrder.paymentType}</span>
              </div>
              <div className="border-t border-black/20 pt-2 flex justify-between">
                <span className="font-bold text-black/70 text-lg">Total Harga:</span>
                <span className="font-bold text-[#059669] text-lg">Rp {(selectedOrder.qty * selectedOrder.price).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 border border-black/20 hover:border-black/80 hover:scale-105 active:scale-95 duration-200 text-black/80 font-semibold rounded-xl text-sm transition-all"
              >
                Kembali
              </button>
              <button
                onClick={handleConfirmShipping}
                className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white hover:scale-105 active:scale-95 duration-200 font-semibold rounded-xl text-sm shadow transition-all"
              >
                Siap Dikirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}