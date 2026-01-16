import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during authentication:', error);
        router.push('/login?error=auth_failed');
      } else {
        router.push('/dashboard'); // Redirect ke halaman setelah login
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Menyelesaikan autentikasi...</p>
      </div>
    </div>
  );
};

export default AuthCallback;