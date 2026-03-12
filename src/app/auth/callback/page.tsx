'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { insforge } from '@/lib/insforge';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await insforge.auth.getCurrentSession();

        if (error) {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        if (data?.session) {
          setStatus('success');
          setMessage('Account verified successfully!');
          setTimeout(() => router.push('/'), 1500);
        } else {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
          setTimeout(() => router.push('/'), 3000);
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred. Redirecting...');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-8"
      >
        <motion.div
          animate={{ scale: status === 'loading' ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: status === 'loading' ? Infinity : 0, duration: 1.5 }}
          className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            status === 'success' 
              ? 'bg-green-500/20 border-2 border-green-500' 
              : status === 'error'
              ? 'bg-red-500/20 border-2 border-red-500'
              : 'bg-cyan-500/20 border-2 border-cyan-500'
          }`}
        >
          {status === 'loading' && (
            <svg className="w-10 h-10 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {status === 'success' && (
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'error' && (
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient">
            {status === 'loading' ? 'Verifying' : status === 'success' ? 'Success!' : 'Error'}
          </span>
        </h2>
        <p className="text-gray-400">{message}</p>
      </motion.div>
    </div>
  );
}
