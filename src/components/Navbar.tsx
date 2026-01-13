import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useAuthStore from "@/store/authStore";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Get state from Zustand store
  const { isLoggedIn, email, role, photoUrl, fullName, logout } = useAuthStore();

  // Check screen size on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (path: string) => router.pathname === path;

  const isDashboardActive = () => {
    return (
      router.pathname === "/dashboard" ||
      router.pathname.startsWith("/dashboard") ||
      router.pathname === "/grades"
    );
  };

  const canAccessDashboard = () => {
    return role === 'admin' || role === 'guru';
  };

  // Generate avatar URL
  const getAvatarUrl = () => {
    if (photoUrl) return photoUrl;
    
    const name = fullName || email?.split("@")[0] || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128&bold=true`;
  };

  // Display name untuk profile dropdown
  const getDisplayName = () => {
    if (fullName) return fullName;
    return email || "User";
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsDropdownOpen(false);
    setIsProfileOpen(false);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-gradient-to-b from-sky-300 to-sky-400 p-4 relative z-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-600 rounded-full px-4 md:px-8 py-3 shadow-lg relative">
          <div className="flex justify-between items-center">
            {/* Hamburger Menu Button - Kiri (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden md:flex gap-6 items-center mx-auto">
              <Link
                href="/"
                className={`text-lg font-medium hover:text-white transition-colors ${
                  isActive("/") ? "text-white" : "text-gray-300"
                }`}
              >
                Home
              </Link>

              <Link
                href="/about"
                className={`text-lg font-medium hover:text-white transition-colors ${
                  isActive("/about") ? "text-white" : "text-gray-300"
                }`}
              >
                About
              </Link>

              <Link
                href="/students"
                className={`text-lg font-medium hover:text-white transition-colors ${
                  isActive("/students") ? "text-white" : "text-gray-300"
                }`}
              >
                Siswa
              </Link>

              <Link
                href="/subject"
                className={`text-lg font-medium hover:text-white transition-colors ${
                  isActive("/subject") ? "text-white" : "text-gray-300"
                }`}
              >
                Mapel
              </Link>

              {/* Dashboard Dropdown - Admin & Guru only */}
              {isLoggedIn && canAccessDashboard() && (
                <div
                  className="relative"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div
                    className={`text-lg font-medium hover:text-white transition-colors flex items-center gap-1 cursor-pointer ${
                      isDashboardActive() ? "text-white" : "text-gray-300"
                    }`}
                  >
                    Dashboard
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 z-50">
                      <div className="bg-slate-700 rounded-lg shadow-xl py-2 min-w-[200px] border border-slate-600">
                        <Link
                          href="/dashboard"
                          className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                            isActive("/dashboard")
                              ? "text-white bg-slate-600"
                              : "text-gray-300"
                          }`}
                        >
                          <span>Daftar Siswa & Guru</span>
                        </Link>
                        <Link
                          href="/dashboard/grades"
                          className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                            isActive("/dashboard/grades")
                              ? "text-white bg-slate-600"
                              : "text-gray-300"
                          }`}
                        >
                          <span>Nilai & Rapor</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Actions - Kanan */}
            <div className="flex items-center gap-3 ml-auto md:ml-0">
              {isLoggedIn ? (
                <>
                  {/* Profile Desktop - SEMUA ROLE BISA AKSES */}
                  <div 
                    className="hidden md:block relative"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <img
                          src={getAvatarUrl()}
                          alt={getDisplayName()}
                          className="w-9 h-9 rounded-full border-2 border-teal-400 hover:border-teal-300 transition-all object-cover"
                          onError={(e) => {
                            const name = fullName || email?.split("@")[0] || "User";
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128&bold=true`;
                          }}
                        />
                        {role && (
                          <div 
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-600 ${
                              role === 'admin' ? 'bg-teal-500' :
                              role === 'guru' ? 'bg-purple-500' :
                              'bg-blue-500'
                            }`}
                            title={role}
                          />
                        )}
                      </div>
                    </div>

                    {isProfileOpen && (
                      <div className="absolute top-full right-0 pt-2 z-50">
                        <div className="bg-slate-700 rounded-lg shadow-xl py-2 min-w-[260px] border border-slate-600">
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-slate-600">
                            <div className="flex items-center gap-3">
                              <img
                                src={getAvatarUrl()}
                                alt={getDisplayName()}
                                className="w-12 h-12 rounded-full object-cover border-2 border-teal-400"
                                onError={(e) => {
                                  const name = fullName || email?.split("@")[0] || "User";
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128&bold=true`;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {getDisplayName()}
                                </p>
                                {email && (
                                  <p className="text-xs text-gray-400 truncate mt-1">
                                    {email}
                                  </p>
                                )}
                                {role && (
                                  <span 
                                    className={`inline-block mt-1 text-white text-xs px-2 py-0.5 rounded-full font-medium ${
                                      role === 'admin' ? 'bg-teal-500' :
                                      role === 'guru' ? 'bg-purple-500' :
                                      'bg-blue-500'
                                    }`}
                                  >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-slate-600 transition-colors"
                              onClick={closeAllDropdowns}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profile Saya
                            </Link>
                          </div>

                          {/* Logout Button */}
                          <div className="border-t border-slate-600 py-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-600 hover:text-red-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Mobile - Simple Avatar */}
                  <div className="md:hidden">
                    <img
                      src={getAvatarUrl()}
                      alt={getDisplayName()}
                      className="w-9 h-9 rounded-full border-2 border-teal-400 object-cover"
                      onError={(e) => {
                        const name = fullName || email?.split("@")[0] || "User";
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128&bold=true`;
                      }}
                    />
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden md:inline">Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu - Sidebar Overlay dengan Animasi */}
          <div className={`md:hidden`}>
            {/* Overlay */}
            <div 
              className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${
                isMobileMenuOpen 
                  ? 'opacity-50 visible' 
                  : 'opacity-0 invisible'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar dengan Animasi */}
            <div 
              className={`fixed inset-y-0 left-0 w-64 bg-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="h-full flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-600">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg">Menu</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-gray-400 hover:text-white p-1 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    <Link
                      href="/"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors duration-200 ${
                        isActive("/") ? "bg-slate-600 text-white" : "text-gray-300"
                      }`}
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Home
                    </Link>

                    <Link
                      href="/about"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors duration-200 ${
                        isActive("/about") ? "bg-slate-600 text-white" : "text-gray-300"
                      }`}
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      About
                    </Link>

                    <Link
                      href="/students"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors duration-200 ${
                        isActive("/students") ? "bg-slate-600 text-white" : "text-gray-300"
                      }`}
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.966 0-1.75.79-1.75 1.764s.784 1.764 1.75 1.764 1.75-.79 1.75-1.764-.784-1.764-1.75-1.764z" />
                      </svg>
                      Siswa
                    </Link>

                    <Link
                      href="/subject"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors duration-200 ${
                        isActive("/subject") ? "bg-slate-600 text-white" : "text-gray-300"
                      }`}
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Mapel
                    </Link>

                    {/* Dashboard Links for Mobile */}
                    {isLoggedIn && canAccessDashboard() && (
                      <div className="pt-2">
                        <div className="px-4 py-2">
                          <p className="text-gray-400 text-sm font-medium mb-2">Dashboard</p>
                          <div className="ml-2 flex flex-col space-y-1">
                            <Link
                              href="/dashboard"
                              className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-600 transition-colors duration-200 ${
                                isActive("/dashboard") ? "bg-slate-600 text-white" : "text-gray-300"
                              }`}
                              onClick={closeAllDropdowns}
                            >
                              <span>📋</span>
                              <span>Daftar Siswa & Guru</span>
                            </Link>
                            <Link
                              href="/dashboard/grades"
                              className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-600 transition-colors duration-200 ${
                                isActive("/dashboard/grades") ? "bg-slate-600 text-white" : "text-gray-300"
                              }`}
                              onClick={closeAllDropdowns}
                            >
                              <span>📊</span>
                              <span>Nilai & Rapor</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Footer - User Info - SEMUA ROLE BISA AKSES */}
                {isLoggedIn && (
                  <div className="p-4 border-t border-slate-600">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={getAvatarUrl()}
                        alt={getDisplayName()}
                        className="w-10 h-10 rounded-full border-2 border-teal-400 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {getDisplayName()}
                        </p>
                        {role && (
                          <span 
                            className={`inline-block mt-1 text-white text-xs px-2 py-0.5 rounded-full font-medium ${
                              role === 'admin' ? 'bg-teal-500' :
                              role === 'guru' ? 'bg-purple-500' :
                              'bg-blue-500'
                            }`}
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-slate-600 transition-colors duration-200 rounded"
                        onClick={closeAllDropdowns}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      
                      <button
                        onClick={() => {
                          closeAllDropdowns();
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-slate-600 hover:text-red-300 transition-colors duration-200 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}

                {/* Login Button in Sidebar */}
                {!isLoggedIn && (
                  <div className="p-4 border-t border-slate-600">
                    <Link
                      href="/login"
                      className="bg-teal-500 text-white px-4 py-3 rounded-lg hover:bg-teal-600 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;