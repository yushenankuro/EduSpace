import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // CEK USER DAN ROLE
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // User logged in
          setIsLoggedIn(true);
          setUserEmail(session.user.email || "");

          // Fetch user role dari table user_roles
          const { data: roleData, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching role:", error);
            setUserRole(null);
          } else {
            setUserRole(roleData?.role || null);
          }
        } else {
          // User not logged in
          setIsLoggedIn(false);
          setUserEmail("");
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setIsLoggedIn(false);
        setUserEmail("");
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listener untuk perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          setIsLoggedIn(true);
          setUserEmail(session.user.email || "");
          
          // Fetch role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          setUserRole(roleData?.role || null);
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserEmail("");
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        throw error;
      }

      // Clear state
      setIsLoggedIn(false);
      setUserEmail("");
      setUserRole(null);

      // Redirect ke login
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect meskipun error
      setIsLoggedIn(false);
      setUserEmail("");
      setUserRole(null);
      router.push("/login");
    }
  };

  const isActive = (path: string) => router.pathname === path;

  // Check if any dashboard route is active
  const isDashboardActive = () => {
    return (
      router.pathname === "/dashboard" ||
      router.pathname.startsWith("/dashboard/") ||
      router.pathname === "/grades" ||
      router.pathname.startsWith("/grades/")
    );
  };

  // Cek apakah user boleh akses dashboard
  const canAccessDashboard = () => {
    return userRole === 'admin' || userRole === 'guru';
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

              {/* Show login/logout based on actual login state */}
              {loading ? (
                // Loading state
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : isLoggedIn ? (
                <>
                  {/* Dashboard Dropdown - Hanya untuk Admin & Guru */}
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

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 pt-2 z-50">
                          <div className="bg-slate-700 rounded-lg shadow-xl py-2 min-w-[200px]">
                            {userRole === 'admin' && (
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
                            )}
                            {canAccessDashboard() && (
                              <Link
                                href="/grades"
                                className={`block px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                                  isActive("/grades")
                                    ? "text-white bg-slate-600"
                                    : "text-gray-300"
                                }`}
                              >
                                📊 Nilai & Rapor
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User Info & Logout */}
                  <div className="flex items-center gap-3">
                    {/* User Email Badge */}
                    <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-full">
                      <svg
                        className="w-4 h-4 text-teal-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-sm text-gray-300 max-w-[150px] truncate">
                        {userEmail}
                      </span>
                      {userRole && (
                        <span 
                          className={`text-white text-xs px-2 py-0.5 rounded-full font-medium ${
                            userRole === 'admin' ? 'bg-teal-500' :
                            userRole === 'guru' ? 'bg-purple-500' :
                            'bg-blue-500'
                          }`}
                        >
                          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
                      title="Logout"
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                // Login button - hanya muncul kalau BELUM login
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