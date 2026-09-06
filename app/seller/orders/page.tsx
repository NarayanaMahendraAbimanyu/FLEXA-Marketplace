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
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#059669] text-black/80 px-5 py-3 rounded-2xl shadow-lg font-medium text-sm flex items-center gap-3 transition-all duration-400 ease-out ${
          isLeaving ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-6 duration-400'
        }`}>
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          Pesanan siap dikirim.
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black/80">Pesanan Baru</h1>
          <span className="text-[10px] sm:text-xs font-semibold text-black/40 bg-slate-200 px-2.5 py-1 rounded-full">Simulasi</span>
        </div>
        <p className="text-xs sm:text-sm text-black/40 font-normal">Kelola dan proses pesanan yang masuk dari pembeli.</p>
        <div className="w-full h-[1px] bg-slate-200 mt-5" />
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const totalPrice = order.qty * order.price;

          return (
            <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-black/60 text-sm shrink-0">
                    {order.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-black/85 text-sm sm:text-base leading-tight">{order.userName}</h3>
                    <p className="text-[11px] sm:text-xs font-medium text-black/45">Order #{order.id}</p>
                  </div>
                </div>
                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 rounded-full text-[11px] font-bold text-[#059669]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                  {order.status}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-black/50 font-bold text-[10px] sm:text-xs tracking-wider text-center p-1">
                    {order.shortName}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-black/85 text-sm sm:text-base leading-snug truncate">{order.productName}</h4>
                    <p className="text-xs sm:text-sm text-black/50 font-medium mt-1">{order.qty} x Rp {order.price.toLocaleString('id-ID')}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-[#059669]">Rp {totalPrice.toLocaleString('id-ID')}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] sm:text-xs font-semibold text-black/50 bg-slate-100 px-2 py-0.5 rounded-md">{order.paymentType}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPopup(order)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#059669] hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 text-white font-semibold rounded-xl shadow-sm shadow-emerald-600/10 transition-all duration-200 text-xs sm:text-sm shrink-0"
                >
                  Atur Pengiriman
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-br from-[#059669] to-emerald-700 px-5 py-5 sm:px-6 sm:py-6 shrink-0">
              <span className="text-[10px] sm:text-xs text-emerald-100 font-semibold uppercase tracking-wider">Detail Pesanan</span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">#{selectedOrder.id}</h3>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-black/60 text-sm shrink-0">
                  {selectedOrder.userName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-black/85 block truncate">{selectedOrder.userName}</span>
                  <span className="text-xs text-black/45 font-medium">Pembeli</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs text-black/40 font-bold uppercase tracking-wider">Alamat Pengiriman</span>
                <p className="text-xs sm:text-sm text-black/70 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedOrder.userAddress}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs text-black/40 font-bold uppercase tracking-wider">Produk Dipesan</span>
                <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
                    <span className="text-black/50 font-medium">Nama Produk</span>
                    <span className="font-bold text-black/80 text-right max-w-[180px] truncate">{selectedOrder.productName}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
                    <span className="text-black/50 font-medium">Jumlah</span>
                    <span className="font-bold text-black/80">{selectedOrder.qty} pcs</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
                    <span className="text-black/50 font-medium">Metode Pembayaran</span>
                    <span className="font-bold text-[#059669]">{selectedOrder.paymentType}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm bg-emerald-50/40">
                    <span className="text-black/60 font-semibold">Total Harga</span>
                    <span className="font-bold text-[#059669] text-sm sm:text-base">Rp {(selectedOrder.qty * selectedOrder.price).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 sm:px-6 sm:py-5 border-t border-slate-100 shrink-0 flex items-center gap-3">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.02] active:scale-95 duration-200 text-black/70 font-semibold rounded-xl text-xs sm:text-sm transition-all"
              >
                Kembali
              </button>
              <button
                onClick={handleConfirmShipping}
                className="flex-1 py-3 bg-[#059669] hover:bg-emerald-700 text-white hover:scale-[1.02] active:scale-95 duration-200 font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all"
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