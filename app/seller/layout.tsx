import React from 'react';
import SellerSideBar from '../components/SellerSideBar';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      <SellerSideBar />
      <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}