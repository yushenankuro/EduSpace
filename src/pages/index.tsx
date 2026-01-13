import React, { useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins jika belum
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Home: React.FC = () => {
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Animasi Hero Section
    const heroTitle = heroTitleRef.current;
    const heroSubtitle = heroSubtitleRef.current;

    if (heroTitle && heroSubtitle) {
      gsap.fromTo(
        heroTitle,
        { 
          opacity: 0, 
          y: 50,
          scale: 0.8
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.3
        }
      );

      gsap.fromTo(
        heroSubtitle,
        { 
          opacity: 0, 
          y: 30 
        },
        { 
          opacity: 1, 
          y: 0,
          duration: 1,
          ease: "power2.out",
          delay: 0.8
        }
      );

      // Wave animation
      gsap.fromTo(
        ".wave-path",
        { 
          y: 10,
          scaleY: 0.8
        },
        { 
          y: 0,
          scaleY: 1,
          duration: 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        }
      );
    }

    // Animasi untuk cards dengan ScrollTrigger
    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 80,
            scale: 0.9,
            rotationX: 15
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: 1,
            ease: "back.out(1.7)",
            delay: index * 0.2,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Hover animation
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -15,
            scale: 1.03,
            duration: 0.4,
            ease: "power2.out"
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out"
          });
        });
      }
    });

    // Background particles animation
    const particles = () => {
      const particlesContainer = document.querySelector('.particles');
      if (!particlesContainer) return;

      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
          position: absolute;
          width: ${Math.random() * 5 + 2}px;
          height: ${Math.random() * 5 + 2}px;
          background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          pointer-events: none;
        `;
        particlesContainer.appendChild(particle);

        // Animate particle
        gsap.to(particle, {
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50,
          duration: Math.random() * 3 + 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
      }
    };

    particles();

    // Floating icons animation
    gsap.to(".floating-icon", {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.5
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400 overflow-hidden">
      <Navbar />

      {/* Particles Background */}
      <div className="particles fixed inset-0 pointer-events-none z-0"></div>

      {/* Hero Section with Background Image */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-building.jpg"
            alt="School Building"
            fill
            className="object-cover"
            priority
          />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-sky-400/90">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <h1 
              ref={heroTitleRef}
              className="text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight"
            >
              <span className="inline-block bg-gradient-to-r from-blue-300 via-white to-cyan-300 bg-clip-text text-transparent animate-gradient bg-300%">
                Welcome to Our Class!
              </span>
            </h1>
            <p 
              ref={heroSubtitleRef}
              className="text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
            >
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consequatur, eveniet!
            </p>

            {/* CTA Button dengan animasi */}
            <div className="mt-12">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30">
                <span className="relative z-10 flex items-center gap-2">
                  Explore Now
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Wave Shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path 
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" 
              fill="rgb(125 211 252)" 
              className="wave-path text-sky-300"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-20 relative z-10">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div 
            ref={el => cardsRef.current[0] = el!}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-2xl transition-all duration-300 border border-white/20 group relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-10 blur transition-opacity duration-500"></div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/50 transition-shadow duration-300 floating-icon">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
              Materi Lengkap
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Akses semua materi pembelajaran dengan mudah dan terstruktur
            </p>
          </div>

          {/* Card 2 */}
          <div 
            ref={el => cardsRef.current[1] = el!}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-2xl transition-all duration-300 border border-white/20 group relative overflow-hidden"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-10 blur transition-opacity duration-500"></div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-teal-500/50 transition-shadow duration-300 floating-icon">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-teal-600 transition-colors duration-300">
              Kolaborasi
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Berkolaborasi dengan teman sekelas dan guru secara real-time
            </p>
          </div>

          {/* Card 3 */}
          <div 
            ref={el => cardsRef.current[2] = el!}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-2xl transition-all duration-300 border border-white/20 group relative overflow-hidden"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-10 blur transition-opacity duration-500"></div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-purple-500/50 transition-shadow duration-300 floating-icon">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">
              Progres Tracking
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Monitor perkembangan belajar dengan sistem tracking yang akurat
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <Footer />

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;