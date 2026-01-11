import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useAuthStore from "@/store/authStore";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Get state from Zustand store - FIX PROPERTY NAMES
  const { isLoggedIn, email, role, photoUrl, fullName, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
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

  // Get initials from email or fullName
  const getInitials = () => {
    if (fullName) {
      const parts = fullName.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    
    if (email) {
      const parts = email.split("@")[0].split(".");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return email.substring(0, 2).toUpperCase();
    }
    
    return "?";
  };

  // Generate avatar URL - pakai photoUrl dari store jika ada
  const getAvatarUrl = () => {
    if (photoUrl) return photoUrl; // Pakai foto dari database kalau ada
    
    const name = fullName || email?.split("@")[0] || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128&bold=true`;
  };

  // Display name untuk profile dropdown
  const getDisplayName = () => {
    if (fullName) return fullName;
    return email || "User";
  };

  return (
    <nav className="p-4 from-sky-300 to-sky-400">
      <div className="max-w-5xl mx-auto">
        <div className="bg-slate-600 rounded-full px-8 py-4 shadow-lg">
          <div className="flex justify-center items-center">
            <div className="flex gap-8 items-center">
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

              {/* Conditional rendering */}
              {isLoggedIn ? (
                <>
                  {/* Dashboard Dropdown - Admin & Guru only */}
                  {canAccessDashboard() && (
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
                        <div className="absolute top-full left-0 pt-2 z-50">
                          <div className="bg-slate-700 rounded-lg shadow-xl py-2 min-w-[200px]">
                            <Link
                              href="/dashboard"
                              className={`block px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                                isActive("/dashboard")
                                  ? "text-white bg-slate-600"
                                  : "text-gray-300"
                              }`}
                            >
                              📋 Daftar Siswa & Guru
                            </Link>
                            <Link
                              href="/dashboard/grades"
                              className={`block px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                                isActive("/dashboard/grades")
                                  ? "text-white bg-slate-600"
                                  : "text-gray-300"
                              }`}
                            >
                              📊 Nilai & Rapor
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile Dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    {/* Profile Picture */}
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <img
                          src={getAvatarUrl()}
                          alt={getDisplayName()}
                          className="w-10 h-10 rounded-full border-2 border-teal-400 hover:border-teal-300 transition-all object-cover"
                          onError={(e) => {
                            // Fallback ke UI Avatars jika foto gagal dimuat
                            const name = fullName || email?.split("@")[0] || "User";
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128&bold=true`;
                          }}
                        />
                        {/* Role indicator badge */}
                        {role && (
                          <div 
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-600 ${
                              role === 'admin' ? 'bg-teal-500' :
                              role === 'guru' ? 'bg-purple-500' :
                              'bg-blue-500'
                            }`}
                            title={role}
                          />
                        )}
                      </div>
                    </div>

                    {/* Profile Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute top-full right-0 pt-2 z-50">
                        <div className="bg-slate-700 rounded-lg shadow-xl py-2 min-w-[240px]">
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-slate-600">
                            <div className="flex items-center gap-3">
                              <img
                                src={getAvatarUrl()}
                                alt={getDisplayName()}
                                className="w-12 h-12 rounded-full object-cover"
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
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-teal-500 text-white px-5 py-2 rounded-full hover:bg-teal-600 transition-colors text-sm font-medium flex items-center gap-2"
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