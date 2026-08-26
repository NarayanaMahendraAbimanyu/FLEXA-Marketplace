import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper untuk mendeteksi apakah kita berada di browser
const isBrowser = typeof window !== 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: isBrowser ? {
      getItem: (key) => {
        // Cek di localStorage dulu, kalau tidak ada cek di sessionStorage
        if (localStorage.getItem(key) !== null) {
          return localStorage.getItem(key);
        }
        return sessionStorage.getItem(key);
      },
      setItem: (key, value) => {
        // Tentukan simpan ke mana berdasarkan flag atau default ke localStorage
        const remember = localStorage.getItem('supabase_remember_me') !== 'false';
        if (remember) {
          localStorage.setItem(key, value);
        } else {
          sessionStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      },
    } : undefined,
  },
});