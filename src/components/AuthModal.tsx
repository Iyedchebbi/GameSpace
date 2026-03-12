'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onClose: () => void;
}

type AuthStep = 'form' | 'verify';

export default function AuthModal({ mode, onModeChange, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, verifyEmail, resendVerificationEmail } = useAuth();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<AuthStep>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const result = await signUp(email, password, name);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      if (result.needsVerification) {
        setStep('verify');
        setCountdown(60);
        showToast('Verification code sent to your email!', 'success');
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        showToast('Welcome back!', 'success');
        onClose();
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);

    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      setLoading(false);
      return;
    }

    const result = await verifyEmail(email, code);
    if (result.error) {
      setError(result.error);
    } else {
      showToast('Email verified successfully!', 'success');
      onClose();
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    const result = await resendVerificationEmail(email);
    if (!result.error) {
      setCountdown(60);
      showToast('New code sent!', 'success');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...verificationCode];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setVerificationCode(newCode);
    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const resetForm = () => {
    setStep('form');
    setEmail('');
    setPassword('');
    setName('');
    setVerificationCode(['', '', '', '', '', '']);
    setError('');
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    resetForm();
    onModeChange(newMode);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-md sm:p-8 p-5 rounded-3xl bg-gray-900/90 border border-cyan-500/30 glow-border shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center sm:mb-8 mb-6">
                <motion.div
                  className="inline-flex items-center justify-center sm:w-16 sm:h-16 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border border-cyan-500/30 sm:mb-4 mb-3"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="sm:w-8 sm:h-8 w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.div>
                <h2 className="sm:text-3xl text-2xl font-bold">
                  <span className="text-gradient">
                    {mode === 'signin' ? 'Welcome Back' : 'Join GAMEZONE'}
                  </span>
                </h2>
                <p className="text-gray-400 sm:mt-2 mt-1.5 sm:text-base text-sm">
                  {mode === 'signin' 
                    ? 'Sign in to access your account' 
                    : 'Create your account to get started'}
                </p>
              </div>

              <motion.button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 sm:py-3 py-2.5 sm:px-4 px-3 bg-white/10 hover:bg-white/20 border border-gray-700 rounded-xl transition-all sm:mb-6 mb-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">Continue with Google</span>
              </motion.button>

              <div className="relative sm:mb-6 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900 text-gray-500">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="sm:space-y-4 space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 sm:mb-2 mb-1.5">Full Name</label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 sm:w-5 sm:h-5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full sm:pl-12 pl-10 sm:pr-4 pr-3 sm:py-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500 transition-all sm:text-base text-sm"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 sm:mb-2 mb-1.5">Email Address</label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 sm:w-5 sm:h-5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full sm:pl-12 pl-10 sm:pr-4 pr-3 sm:py-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500 transition-all sm:text-base text-sm"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 sm:mb-2 mb-1.5">Password</label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 sm:w-5 sm:h-5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full sm:pl-12 pl-10 sm:pr-4 pr-3 sm:py-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500 transition-all sm:text-base text-sm"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:py-4 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg sm:text-lg text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </motion.button>
              </form>

              <p className="sm:mt-6 mt-4 text-center text-gray-400 sm:text-base text-sm">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => handleModeChange(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center sm:mb-8 mb-6">
                <motion.div
                  className="inline-flex items-center justify-center sm:w-16 sm:h-16 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/30 sm:mb-4 mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <svg className="sm:w-8 sm:h-8 w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h2 className="sm:text-3xl text-2xl font-bold">
                  <span className="text-gradient">Verify Email</span>
                </h2>
                <p className="text-gray-400 sm:mt-2 mt-1.5 sm:text-base text-sm">
                  We sent a 6-digit code to<br />
                  <span className="text-cyan-400">{email}</span>
                </p>
              </div>

              <div className="sm:mb-6 mb-4">
                <label className="block text-sm font-medium text-gray-300 sm:mb-4 mb-3 text-center">Enter verification code</label>
                <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="sm:w-12 w-10 sm:h-14 h-12 text-center sm:text-xl text-lg font-bold bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-all"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}

              <motion.button
                onClick={handleVerify}
                disabled={loading || verificationCode.join('').length !== 6}
                className="w-full sm:py-4 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg sm:mb-4 mb-3 sm:text-lg text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </motion.button>

              <div className="text-center">
                <p className="text-gray-400 text-sm sm:mb-2 mb-1.5">Didn't receive the code?</p>
                <button
                  onClick={handleResendCode}
                  disabled={countdown > 0}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                onClick={() => setStep('form')}
                className="w-full sm:mt-6 mt-4 sm:py-2 py-1.5 text-gray-400 hover:text-white transition-colors sm:text-base text-sm"
              >
                &larr; Back to sign up
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
