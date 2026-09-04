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

  return (
    <div className="w-full px-2 sm:px-2 lg:px-2 relative">
      {showNotification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#059669] text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2.5 transition-all duration-400 ease-out ${
          isLeaving ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-6 duration-400'
        }`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {notificationMessage}
        </div>
      )}

      <div className="mb-8 border-b border-black/30 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black/80">Keuangan Toko {"(Simulasi)"}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-black/60 mb-1">Saldo Dapat Ditarik</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#059669] mb-4">
              Rp {balance.toLocaleString('id-ID')}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1">Pilih Bank</label>
                <div className="relative">
                  <select
                    value={selectedBank}
                    onChange={handleBankChange}
                    className="w-full pl-3 pr-10 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#059669] appearance-none"
                  >
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-black/70">Nomor Rekening</label>
                  <span className="text-[10px] font-medium text-black/50">Ketentuan: {currentRules.label}</span>
                </div>
                <input
                  type="text"
                  placeholder={`Masukkan nomor rekening ${selectedBank}`}
                  value={accountNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAccountNumber(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  maxLength={currentRules.max}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#059669]"
                />
                {errorMessage && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errorMessage}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleWithdraw}
              disabled={balance <= 0}
              className={`px-5 py-2.5 font-semibold rounded-xl text-sm shadow transition-all duration-200 ${
                balance > 0
                  ? 'bg-[#059669] hover:bg-[#047857] text-white hover:scale-105 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Tarik Saldo
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-black/60">Total Penjualan {"(Simulasi)"}</p>
              <span className="p-2 bg-[#059669]/10 text-[#059669] rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black/90 mb-4">
              Rp 2.550.000
            </h2>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/60">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-black/50 mb-0.5">Total Pesanan</p>
                <p className="text-sm font-bold text-black/80">14 Pesanan</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-black/50 mb-0.5">Pesanan Selesai</p>
                <p className="text-sm font-bold text-[#059669]">14 Selesai</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60">
            <p className="text-xs text-black/60 font-medium">
              Pendapatan bersih setelah dikurangi biaya layanan.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-black/90 mb-4">Riwayat Transaksi</h3>
        
        <div className="space-y-4">
          {transactions.map((trx) => (
            <div key={trx.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-white rounded-xl border border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black/90 text-sm">{trx.description}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    trx.type === 'income' ? 'bg-[#059669]/10 text-[#059669]' : 'bg-[#059969]/10 text-[#059969]'
                  }`}>
                    {trx.status}
                  </span>
                </div>
                <p className="text-xs text-black/60 mt-0.5">{trx.date} • {trx.id}</p>
              </div>
              <div className={`font-bold text-sm ${trx.amount > 0 ? 'text-[#059669]' : 'text-black/80'}`}>
                {trx.amount > 0 ? `+ Rp ${trx.amount.toLocaleString('id-ID')}` : `- Rp ${Math.abs(trx.amount).toLocaleString('id-ID')}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}