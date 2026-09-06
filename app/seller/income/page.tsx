'use client';

import React, { useState } from 'react';

export default function SellerIncomePage() {
  const [balance, setBalance] = useState(2550000);
  const [showNotification, setShowNotification] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const [selectedBank, setSelectedBank] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [transactions, setTransactions] = useState([
    {
      id: 'TRX-9820',
      date: '28 Agustus 2026',
      description: 'Pendapatan Pesanan #934362',
      amount: 270000,
      type: 'income',
      status: 'Selesai'
    },
    {
      id: 'TRX-9819',
      date: '25 Agustus 2026',
      description: 'Pendapatan Pesanan #482190',
      amount: 249000,
      type: 'income',
      status: 'Selesai'
    }
  ]);

  const getBankDigitRules = (bank: string) => {
    switch (bank) {
      case 'BCA':
        return { min: 9, max: 11, label: '9 - 11 digit' };
      case 'Mandiri':
        return { min: 12, max: 14, label: '12 - 14 digit' };
      case 'BNI':
        return { min: 9, max: 11, label: '9 - 11 digit' };
      case 'BRI':
        return { min: 14, max: 16, label: '14 - 16 digit' };
      default:
        return { min: 1, max: 20, label: 'digit valid' };
    }
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBank(e.target.value);
    setAccountNumber('');
    setErrorMessage('');
  };

  const handleWithdraw = () => {
    if (balance <= 0) return;

    const rules = getBankDigitRules(selectedBank);
    const cleanAccount = accountNumber.trim();

    if (cleanAccount.length < rules.min || cleanAccount.length > rules.max) {
      setErrorMessage(`Nomor rekening ${selectedBank} harus antara ${rules.min} sampai ${rules.max} digit.`);
      return;
    }

    setErrorMessage('');
    const currentBalance = balance;
    setBalance(0);

    const newTrx = {
      id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: '31 Agustus 2026',
      description: `Pencairan Dana ke Rekening ${selectedBank} (***${cleanAccount.slice(-4)})`,
      amount: -currentBalance,
      type: 'withdraw',
      status: 'Berhasil'
    };

    setTransactions((prev) => [newTrx, ...prev]);

    setNotificationMessage(`Pencairan dana ke rekening ${selectedBank} berhasil diajukan.`);
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

  const currentRules = getBankDigitRules(selectedBank);
  const completedOrders = transactions.filter(t => t.type === 'income').length;

  return (
    <div className="w-full px-2 sm:px-2 lg:px-2 relative">
      {showNotification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#059669]/30 text-black/80 px-5 py-3 rounded-2xl shadow-lg font-medium text-sm flex items-center gap-3 transition-all duration-400 ease-out ${
          isLeaving ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-6 duration-400'
        }`}>
          <span className="w-6 h-6 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-sm font-normal">{notificationMessage}</span>
        </div>
      )}

      <div className="mb-8 pb-6 border-b border-black/10">
        <div className="flex items-center gap-2 mb-1.5">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-black/85">Keuangan Toko</h1>
          <span className="text-[10px] sm:text-xs font-medium text-black/40 bg-slate-100 px-2.5 py-1 rounded-full">Simulasi</span>
        </div>
        <p className="text-xs sm:text-sm text-black/45 font-normal">Lihat rincian pemasukan dan riwayat transaksi toko Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        <div className="lg:col-span-3 relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#047857] rounded-3xl p-6 sm:p-7 shadow-md shadow-emerald-900/10 flex flex-col justify-between">
          <div className="absolute right-[-30px] top-[-30px] opacity-10 pointer-events-none">
            <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
            </svg>
          </div>

          <div className="relative">
            <p className="text-[11px] sm:text-xs font-medium tracking-wide uppercase text-emerald-100/90 mt-5">Saldo Dapat Ditarik</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mt-1 mb-4">
              Rp {balance.toLocaleString('id-ID')}
            </h2>
          </div>

          <div className="relative space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-emerald-100/80 mb-1.5">Bank Tujuan</label>
                <div className="relative">
                  <select
                    value={selectedBank}
                    onChange={handleBankChange}
                    className="w-full pl-3 pr-9 py-2.5 text-sm font-medium bg-white/95 text-black/80 rounded-xl focus:outline-none appearance-none"
                  >
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-black/50">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-emerald-100/80 mb-1.5">Nomor Rekening</label>
                <input
                  type="text"
                  placeholder="Nomor rekening"
                  value={accountNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAccountNumber(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  maxLength={currentRules.max}
                  className="w-full px-3 py-2.5 text-sm font-medium bg-white/95 text-black/80 rounded-xl focus:outline-none placeholder:text-black/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-sm text-emerald-100/70 font-normal">
                {errorMessage ? (
                  <span className="text-amber-200 font-medium">{errorMessage}</span>
                ) : (
                  `Ketentuan ${selectedBank} : ${currentRules.label}`
                )}
              </p>
              <button
                onClick={handleWithdraw}
                disabled={balance <= 0}
                className={`shrink-0 px-5 py-2.5 font-medium rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                  balance > 0
                    ? 'bg-white text-[#059669] hover:scale-[1.02] active:scale-95 shadow-sm'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                }`}
              >
                Tarik Saldo
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs sm:text-sm font-medium text-black/50">Total Penjualan</p>
              <span className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-[#059669] rounded-xl shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-black/85 mb-5">
              Rp 2.550.000
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <p className="text-[10px] sm:text-[11px] font-medium text-black/45 mb-1">Total Pesanan</p>
                <p className="text-sm sm:text-base font-semibold text-black/80">14</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <p className="text-[10px] sm:text-[11px] font-medium text-black/45 mb-1">Selesai</p>
                <p className="text-sm sm:text-base font-semibold text-[#059669]">{completedOrders * 7}</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-black/40 font-normal mt-5 pt-4 border-t border-slate-100">
            Pendapatan bersih setelah dikurangi biaya layanan.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base sm:text-lg font-semibold text-black/80">Riwayat Transaksi</h3>
          <span className="text-[11px] sm:text-sm font-semibold text-black/40">{transactions.length} transaksi</span>
        </div>

        <div className="space-y-2.5">
          {transactions.map((trx) => (
            <div key={trx.id} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-colors duration-150">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  trx.type === 'income' ? 'bg-emerald-50 text-[#059669]' : 'bg-slate-100 text-slate-500'
                }`}>
                  {trx.type === 'income' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6" />
                    </svg>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-black/80 truncate">{trx.description}</p>
                  <p className="text-[11px] text-black/40 font-normal mt-0.5">{trx.date} · {trx.id}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-xs sm:text-sm font-semibold ${trx.amount > 0 ? 'text-[#059669]' : 'text-black/70'}`}>
                  {trx.amount > 0 ? `+Rp ${trx.amount.toLocaleString('id-ID')}` : `-Rp ${Math.abs(trx.amount).toLocaleString('id-ID')}`}
                </p>
                <span className="text-[10px] font-normal text-black/40">{trx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}