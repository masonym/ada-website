"use client";

import React, { useState, useEffect, useRef } from 'react';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type TimerProps = {
  targetDate: string;
  initialTimeLeft?: TimeLeft;
  backgroundColor?: string;
};

const CountdownTimer = ({ targetDate, initialTimeLeft, backgroundColor = 'bg-navy-800' }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    initialTimeLeft || { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );
  const targetTimeRef = useRef(new Date(targetDate).getTime());

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetTimeRef.current - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second using setInterval instead of requestAnimationFrame
    const interval = setInterval(calculateTimeLeft, 1000);

    // Cleanup function
    return () => clearInterval(interval);
  }, []);

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  const getBoxWidth = (value: number) => {
    const digitCount = value.toString().length;
    if (digitCount <= 2) return 'w-12 sm:w-24';
    if (digitCount === 3) return 'w-20 sm:w-32';
    return 'w-24 sm:w-40'; // For 4 digits or more
  };

  return (
    <div 
      className={`grid grid-cols-4 sm:grid-cols-4 gap-4 p-4 sm:p-8 rounded-xl mb-8 ${backgroundColor.startsWith('bg-') ? backgroundColor : ''}`}
      style={backgroundColor.startsWith('bg-') ? {} : { backgroundColor }}
    >
      {(Object.keys(timeLeft) as Array<keyof TimeLeft>).map((key) => (
        <div key={key} className="flex flex-col items-center">
          <div className={`${getBoxWidth(timeLeft[key])} h-12 sm:h-24 bg-white rounded-lg p-4 shadow-lg mb-2 flex items-center justify-center transition-all duration-300`}>
            <h2 className="text-3xl sm:text-6xl font-bold text-gray-800">
              {key === 'days' ? timeLeft[key].toString() : padNumber(timeLeft[key])}
            </h2>
          </div>
          <p className="text-white text-base sm:text-lg capitalize">{key}</p>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;