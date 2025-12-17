import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // CEK USER SUDAH LOGIN MENGGUNAKAN SUPABASE AUTH
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkUser();

    // Listener bila user logout/login
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // LOGOUT PAKAI SUPABASE AUTH
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push('/login');
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="p-4 from-sky-300 to-sky-400">
      <div className="max-w-5xl mx-auto">
        <div className="bg-slate-600 rounded-full px-8 py-4 shadow-lg">
          <div className="flex justify-center items-center">
            {/* Menu items */}
            <div className="flex gap-8 items-center">
              <Link 
                href="/" 
                className={`text-lg font-medium hover:text-white transition-colors ${
                  isActive('/') ? 'text-white' : 'text-gray-300'
                }`}
              >
                Home
              </Link>

              <Link 
                href="/about" 
                className={`text-lg font-medium hover:text-white transition-colors ${
                  isActive('/about') ? 'text-white' : 'text-gray-300'
                }`}
              >
                About
              </Link>

              <Link 
                href="/students" 
                className={`text-lg font-medium hover:text-white transition-colors ${
                  isActive('/students') ? 'text-white' : 'text-gray-300'
                }`}
              >
                Siswa
              </Link>
              <Link 
                href="/subject" 
                className={`text-lg font-medium hover:text-white transition-colors ${
                  isActive('/subject') ? 'text-white' : 'text-gray-300'
                }`}
              >
                Mapel
              </Link>

              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`text-lg font-medium hover:text-white transition-colors ${
                      isActive('/dashboard') ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-teal-500 text-white px-5 py-2 rounded-full hover:bg-teal-600 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
