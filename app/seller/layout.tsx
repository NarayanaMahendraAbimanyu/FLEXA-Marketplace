import React from 'react';
import SellerSideBar from '../components/SellerSideBar';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-slate-800">
      <div className="flex flex-1 w-full">
        <SellerSideBar />
        <main className="flex-1 bg-white p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}