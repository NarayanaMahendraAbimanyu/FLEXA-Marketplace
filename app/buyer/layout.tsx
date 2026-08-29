'use client';

import React from 'react';
import BuyerSidebar from '../components/BuyerSideBar';

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <BuyerSidebar />
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}