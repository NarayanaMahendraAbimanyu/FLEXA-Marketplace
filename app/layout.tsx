import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import NavbarGuest from './components/NavbarGuest';
import Footer from './components/Footer';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Flexa - Solusi Berbagi Barang Sewa & Jasa Digital UMKM',
  description: 'Sewa peralatan berkualitas dan temukan talenta jasa digital lokal untuk kemajuan bisnis UMKM.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${poppins.className} bg-slate-50 min-h-screen text-slate-900 antialiased`}>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}