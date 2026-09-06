'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.push('/signin');
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email;
      const selectedRole =
        (typeof window !== 'undefined' && localStorage.getItem('selected_role')) || 'pembeli';

      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Gagal mengecek profil:', fetchError.message);
        router.push('/');
        return;
      }

      if (existingUser) {
        localStorage.removeItem('selected_role');
        
        if (existingUser.role && existingUser.role !== selectedRole) {
          await supabase.auth.signOut();
          sessionStorage.setItem('role_conflict', existingUser.role);
          router.push('/signin');
          return;
        }

        const destination = existingUser.role === 'penjual' ? '/seller' : '/';
        router.push(destination);
      } else {
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: userId,
          email: userEmail,
          role: selectedRole,
          updated_at: new Date().toISOString(),
        });

        if (upsertError) {
          console.error('Gagal membuat profil:', upsertError.message);
        }

        localStorage.removeItem('selected_role');
        const destination = selectedRole === 'penjual' ? '/seller' : '/';
        router.push(destination);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <p className="text-slate-500 text-sm">Menyelesaikan proses masuk...</p>
    </div>
  );
}