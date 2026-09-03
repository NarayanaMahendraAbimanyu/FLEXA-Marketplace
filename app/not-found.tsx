import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 py-10">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl flex flex-col items-center text-center space-y-6 sm:space-y-8">
        <div className="flex items-center gap-2">
          <Image
            src="/flexa-logo-green.png"
            alt="Flexa Logo"
            width={140}
            height={40}
            priority
            className="h-8 sm:h-9 md:h-13 w-auto object-contain"
          />
        </div>

        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <span className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-[#059669]">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black/80">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-black/50 max-w-sm mx-auto">
            Maaf, halaman yang kamu cari tidak tersedia atau alamatnya salah. Yuk kembali ke halaman utama dan lanjutkan belanja.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#059669] text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all text-center shadow-sm"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      <footer className="mt-10 sm:mt-14 text-[10px] sm:text-xs text-black/40 text-center">
        Flexa &copy; {new Date().getFullYear()} — Sewa Barang & Jasa Digital
      </footer>
    </div>
  );
}