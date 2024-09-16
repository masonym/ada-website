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
  initialTimeLeft: TimeLeft;
};

const CountdownTimer = ({ targetDate, initialTimeLeft }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(initialTimeLeft);
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

    const animationFrameId = requestAnimationFrame(function update() {
      calculateTimeLeft();
      requestAnimationFrame(update);
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 bg-navy-800 p-4 sm:p-8 rounded-xl mb-8">
      {(Object.keys(timeLeft) as Array<keyof TimeLeft>).map((key) => (
        <div key={key} className="flex flex-col items-center">
          <div className="bg-white rounded-lg p-4 shadow-lg mb-2 w-12 h-12 sm:w-24 sm:h-24 flex items-center justify-center">
            <h2 className="text-3xl sm:text-6xl font-bold text-gray-800">
              {padNumber(timeLeft[key])}
            </h2>
          </div>
          <p className="text-white text-base sm:text-lg capitalize">{key}</p>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;