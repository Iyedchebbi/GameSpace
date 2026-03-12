'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 md:gap-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-xs md:text-sm text-gray-400 uppercase tracking-[0.2em] mb-2">
            DEALS END IN
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="relative">
              <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-lg" />
                <span className="text-2xl md:text-4xl font-black text-white tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-800/50" />
              </div>
            </div>
            <span className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-wider mt-2 font-medium">
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
