import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // Check if any dashboard route is active
  const isDashboardActive = () => {
    return router.pathname === '/dashboard' || 
           router.pathname === '/dashboard/daftar' || 
           router.pathname === '/dashboard/nilai-rapor' || 
           router.pathname === '/dashboard/presensi';
  };

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
                  {/* Dashboard Dropdown */}
                  <div 
                    className="relative group"
                  >
                    <div
                      className={`text-lg font-medium hover:text-white transition-colors flex items-center gap-1 cursor-default ${
                        isDashboardActive() ? 'text-white' : 'text-gray-300'
                      }`}
                      onMouseEnter={() => setIsDropdownOpen(true)}
                    >
                      Dashboard
                      <svg 
                        className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div 
                        className="absolute top-full mt-2 bg-slate-700 rounded-lg shadow-xl py-2 min-w-[180px] z-50"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <Link 
                          href="/dashboard"
                          className={`block px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                            isActive('/dashboard') ? 'text-white bg-slate-600' : 'text-gray-300'
                          }`}
                        >
                          Daftar
                        </Link>
                        <Link 
                          href="/dashboard/grades"
                          className={`block px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                            isActive('/dashboard/grades') ? 'text-white bg-slate-600' : 'text-gray-300'
                          }`}
                        >
                          Nilai & Rapor
                        </Link>
                      </div>
                    )}
                  </div>

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