import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16 bg-gradient-to-b from-sky-800 to-sky-900 text-white overflow-hidden">
      {/* Wave - Tetap sama */}
      <svg
        className="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-sky-300"
        preserveAspectRatio="none"
        viewBox="0 0 1440 54"
      >
        <path
          fill="currentColor"
          d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
        />
      </svg>

      <div className="relative px-4 pt-20 pb-10 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="grid gap-10 row-gap-10 mb-12 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 group">
              {/* Icon asli yang kamu punya */}
              <div className="relative">
                <svg
                  className="w-12 h-12 text-teal-400 group-hover:scale-110 transition-transform duration-300"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  stroke="currentColor"
                  fill="none"
                >
                  <rect x="3" y="1" width="7" height="12" />
                  <rect x="3" y="17" width="7" height="6" />
                  <rect x="14" y="1" width="7" height="6" />
                  <rect x="14" y="11" width="7" height="12" />
                </svg>
              </div>
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center group/logo"
                  aria-label="SMKN 4 Kota Tangerang"
                >
                  <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent group-hover/logo:from-cyan-200 group-hover/logo:to-blue-200 transition-all duration-300">
                    SMKN 4 KOTA TANGERANG
                  </span>
                </Link>
                <p className="text-sm text-cyan-200 mt-1">
                  Sekolah Menengah Kejuruan Negeri 4 Kota Tangerang
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-cyan-100 leading-relaxed">
                Jl. Veteran No. 1A, Kota Tangerang, Banten 15111
                <br />
                Email: info@smkn4tangerang.sch.id
                <br />
                Telp: (021) 1234-5678
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              <span className="relative z-10 text-gray-100">Menu Cepat</span>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-expandWidth"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Beranda", href: "/" },
                { name: "Tentang", href: "/about" },
                { name: "Materi", href: "/subject" },
              ].map((link, index) => (
                <li key={link.name} className="group">
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-deep-purple-50 hover:text-white transition-colors duration-300 hover:translate-x-2"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              <span className="relative z-10 text-gray-100">Ikuti Kami</span>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-expandWidth"></div>
            </h3>
            <p className="text-sm text-deep-purple-50 mb-6">
              Tetap terhubung dengan kami di media sosial
            </p>
            
            <div className="flex gap-4">
              {[
                {
                  name: "Instagram",
                  href: "https://instagram.com",
                  color: "hover:bg-gradient-to-br from-purple-500 to-pink-500",
                  icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                },
                {
                  name: "YouTube",
                  href: "https://youtube.com",
                  color: "hover:bg-gradient-to-br from-red-500 to-red-600",
                  icon: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
                },
                {
                  name: "TikTok",
                  href: "https://tiktok.com",
                  color: "hover:bg-gradient-to-br from-gray-900 to-pink-500",
                  icon: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                },
              ].map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color} group`}
                  aria-label={social.name}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <svg 
                    className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" 
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={social.icon} />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-deep-purple-accent-200"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-100">
            © {currentYear} SMKN 4 Kota Tangerang • All rights reserved
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        
        .animate-expandWidth {
          animation: expandWidth 1s ease-out forwards;
        }
        
        /* Smooth hover effects */
        a, button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </footer>
  );
};

export default Footer;