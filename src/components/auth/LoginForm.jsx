import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { ArrowRight, Loader2, Eye, EyeOff, Network } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef(null);
  const containerRef = useRef(null);

  // ----------------------------------------
  // 📱 Mobile Viewport Optimization (React state-less, GPU friendly)
  // ----------------------------------------
  useEffect(() => {
    let ticking = false;

    const updateViewportHeight = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const height = window.visualViewport
              ? window.visualViewport.height
              : window.innerHeight;
            containerRef.current.style.height = `${height}px`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight, { passive: true });
      window.visualViewport.addEventListener('scroll', updateViewportHeight, { passive: true });
    } else {
      window.addEventListener('resize', updateViewportHeight, { passive: true });
    }

    updateViewportHeight();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
        window.visualViewport.removeEventListener('scroll', updateViewportHeight);
      } else {
        window.removeEventListener('resize', updateViewportHeight);
      }
    };
  }, []);

  const handleIdentifierKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  }, []);

  // ----------------------------------------
  // 🔑 Optimized Fast Login
  // ----------------------------------------
  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    const cleanInput = identifier.trim();
    if (!cleanInput || !password) return toast.error("Ma'lumotlarni to'ldiring");

    setLoading(true);

    try {
      let targetEmail = '';
      const isEmail = cleanInput.includes('@');

      if (isEmail) {
        targetEmail = cleanInput.toLowerCase();

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_blocked')
          .eq('email', targetEmail)
          .maybeSingle();

        if (profile?.is_blocked) {
          toast.error("Ushbu akkaunt administrator tomonidan bloklangan!");
          setLoading(false);
          return;
        }
      } else {
        const cleanUsername = cleanInput.toLowerCase();

        const { data: profile } = await supabase
          .from('profiles')
          .select('email, is_blocked')
          .ilike('username', cleanUsername)
          .maybeSingle();

        if (profile) {
          if (profile.is_blocked) {
            toast.error("Ushbu akkaunt administrator tomonidan bloklangan!");
            setLoading(false);
            return;
          }
          targetEmail = profile.email || `${cleanUsername}@jora.net`;
        } else {
          targetEmail = `${cleanUsername}@jora.net`;

          const { data: fallbackProfile } = await supabase
            .from('profiles')
            .select('is_blocked')
            .eq('email', targetEmail)
            .maybeSingle();

          if (fallbackProfile?.is_blocked) {
            toast.error("Ushbu akkaunt administrator tomonidan bloklangan!");
            setLoading(false);
            return;
          }
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error("Email/Username yoki parol noto'g'ri!");
        }
        throw authError;
      }

      if (authData?.user) {
        toast.success("Xush kelibsiz!");
      }
    } catch (err) {
      toast.error(err.message || "Login yoki parol noto'g'ri!", { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full flex flex-col md:flex-row bg-white dark:bg-black overflow-hidden select-none transition-colors duration-300 transform-gpu"
      style={{ height: '100dvh' }}
    >
      {/* Chap tomondagi desktop banner - Hardware Accelerated Blur */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-neutral-50 to-white dark:from-[#0a0a0c] dark:to-black items-center justify-center border-r border-neutral-100 dark:border-white/[0.04] relative transition-colors duration-300 transform-gpu overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50dvw] h-[50dvw] bg-[var(--accent)]/5 dark:bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none transform-gpu translate-z-0 will-change-transform" />
        <m.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="text-center z-10 transform-gpu"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-[var(--accent)] to-[#1d9ffe] rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[var(--accent)]/20 border border-black/5 dark:border-white/10 transform-gpu">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 14.84 3.19 17.4 5.09 19.22L4.05 22L7 21C8.5 21.6 10.2 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                fill="white"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-black dark:text-white tracking-tighter leading-none transition-colors duration-300">
            Xush<br />Kelibsiz
          </h1>
          <p className="text-neutral-400 dark:text-slate-500 text-[14px] font-bold mt-4 tracking-widest uppercase transition-colors duration-300">
            JORA Messenger
          </p>
        </m.div>
      </div>

      {/* O'ng tomondagi asosiy forma qismi */}
      <div className="flex-1 flex flex-col bg-white dark:bg-black relative h-full transition-colors duration-300 transform-gpu">
        <header className="h-14 flex items-center justify-between px-6 border-b border-neutral-100 dark:border-white/[0.04] bg-white/60 dark:bg-black/40 backdrop-blur-md shrink-0 z-30 transition-colors duration-300 transform-gpu">
          <span className="text-[15px] font-black text-black dark:text-white tracking-widest uppercase flex items-center gap-2 transition-colors duration-300">
            JORA ID <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </span>
        </header>

        <main className="flex-1 flex flex-col justify-center px-6 sm:px-16 md:px-20 relative overflow-y-auto custom-scrollbar transform-gpu">
          <div className="max-w-[360px] w-full mx-auto py-8 transform-gpu">
            <m.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-8 transform-gpu will-change-transform"
            >
              <header className="space-y-2 text-center md:text-left select-none">
                <h2 className="text-[32px] font-black text-black dark:text-white tracking-tight transition-colors duration-300">
                  Kirish
                </h2>
                <p className="text-neutral-400 dark:text-slate-500 text-[15px] font-semibold transition-colors duration-300">
                  Tizimga ulanish uchun hisobingiz
                </p>
              </header>

              <div className="space-y-5">
                <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.05] overflow-hidden bg-neutral-50 dark:bg-[#161618]/40 backdrop-blur-md shadow-inner transition-colors duration-300 transform-gpu">
                  {/* Email / Username Input row */}
                  <div className="relative border-b border-neutral-100 dark:border-white/[0.04] flex items-center group transition-colors duration-300">
                    <input
                      type="text"
                      autoCorrect="off"
                      autoCapitalize="none"
                      placeholder="Email yoki foydalanuvchi nomi"
                      className="w-full bg-transparent p-4 pr-24 text-[15px] font-semibold outline-none text-black dark:text-white focus:bg-black/[0.01] dark:focus:bg-white/[0.02] placeholder-neutral-400 dark:placeholder-neutral-500 transition-all"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value.replace(/\s/g, ''))}
                      onKeyDown={handleIdentifierKeyDown}
                    />

                    <span className="absolute right-4 text-[11px] font-black text-neutral-400 dark:text-slate-500 tracking-wider bg-neutral-200/50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.05] px-2.5 py-1 rounded-lg pointer-events-none group-focus-within:text-blue-500 group-focus-within:border-blue-500/20 transition-all">
                      {identifier.includes('@') ? 'Email' : 'Username'}
                    </span>
                  </div>

                  {/* Password Input row */}
                  <div className="relative flex items-center">
                    <input
                      ref={passwordRef}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Parol"
                      className="w-full bg-transparent p-4 pr-24 text-[15px] font-semibold outline-none text-black dark:text-white focus:bg-black/[0.01] dark:focus:bg-white/[0.02] placeholder-neutral-400 dark:placeholder-neutral-500 transition-all tracking-wide"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 text-blue-500 dark:text-[var(--accent)] font-bold text-[12px] uppercase tracking-wider active:opacity-50 select-none p-1 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                    </button>
                    
                  </div>
                </div>
               <button
                type="button"
                onClick={()=>navigate('/forgotpassword')}
                className='w-full text-right text-[13.5px] font-bold text-neutral-500 dark:text-slate-400 py-2'
                >
              <span className='text-[var(--accent)]'>Parolni unutdingizmi?</span>
                </button>
                {/* Submit Button */}
                <m.button
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  onClick={handleLogin}
                  className="w-full h-14 bg-black text-white hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-[15px] font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-neutral-200 dark:shadow-white/5 disabled:opacity-50 transition-all duration-300 transform-gpu translate-z-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Tekshirilmoqda...
                    </>
                  ) : (
                    <>
                      Kirish <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </m.button>
                <button
                type="button"
                onClick={()=>navigate('/signup')}
                className='w-full text-center text-[13.5px] font-bold text-neutral-500 dark:text-slate-400 py-2'
                >
                  Hisobingiz yo'qmi?<span className='text-[var(--accent)]'> Ro'yxatdan o'tish</span>
                </button>
              </div>
            </m.div>
          </div>
        </main>

        <footer className="pb-8 pt-4 px-6 shrink-0 flex flex-col items-center gap-4 select-none transform-gpu">
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 dark:text-slate-600 font-black uppercase tracking-widest bg-neutral-50 dark:bg-white/[0.01] px-4 py-1.5 rounded-full border border-neutral-200 dark:border-white/[0.03] transition-colors duration-300">
            <Network size={13} className="text-emerald-500" />
            <span>JORA NET</span>
          </div>
          <div className="h-1 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full transition-colors duration-300" />
        </footer>
      </div>
    </div>
  );
};

export default Login;
