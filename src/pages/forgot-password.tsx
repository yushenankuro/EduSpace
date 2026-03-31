import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { FiMail, FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setIsSubmitted(false);

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (supabaseError) {
      setError("Gagal mengirim email. Pastikan email terdaftar.");
      setLoading(false);
      return;
    }

    setMessage("Email reset password telah dikirim! Silakan cek inbox Anda.");
    setIsSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />

      <motion.div 
        className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white/90 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-white/30"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.005 }}
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg"
              animate={isSubmitted ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <FiMail className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Lupa Password
            </h2>
            
            <p className="text-slate-600 text-sm sm:text-base">
              Masukkan email Anda untuk mendapatkan link reset password
            </p>
          </motion.div>

          {/* Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message && (
              <motion.div
                initial={{ y: -20, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.9 }}
                className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl flex items-center gap-3 shadow-md"
              >
                <motion.div 
                  className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5 }}
                >
                  <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                </motion.div>
                <div>
                  <p className="font-semibold">Email Terkirim!</p>
                  <p className="text-sm mt-1">{message}</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-800 rounded-xl flex items-center gap-3 shadow-md"
              >
                <motion.div 
                  className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </motion.div>
                <div>
                  <p className="font-semibold">Gagal Mengirim</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">
                Alamat Email
              </label>
              <div className="relative">
                <motion.div 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                  animate={email ? { scale: 1.1 } : {}}
                >
                  <FiMail className="w-5 h-5" />
                </motion.div>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400 transition-all duration-300 hover:border-blue-300"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                Link reset akan dikirim ke email ini
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg relative overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              animate={loading ? {
                scale: [1, 1.02, 1],
                transition: {
                  duration: 1,
                  repeat: Infinity
                }
              } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Kirim Reset Password
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Back Link */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.a
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors duration-300"
              whileHover={{ x: 5 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke halaman login
            </motion.a>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-xl -z-10"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-sky-200 to-blue-200 rounded-full opacity-20 blur-xl -z-10"></div>
        </motion.div>
      </motion.div>

      {/* Floating Animation Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ForgotPassword;