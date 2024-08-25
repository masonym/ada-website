"use client";

import React, { useState, useEffect } from 'react';

type TimerProps = {
    targetDate: string;
}

const CountdownTimer = ({ targetDate }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const interval = setInterval(() => {
            // Parse the targetDate as UTC
            const targetDateUTC = new Date(targetDate).getTime();
            // Get the current time in UTC
            const nowUTC = new Date().getTime(); // This gets the current time in milliseconds since the epoch, which is UTC

            const distance = targetDateUTC - nowUTC;

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    const padNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className="flex flex-wrap justify-center items-center gap-4 bg-navy-800 p-4 sm:p-8 rounded-xl">
            {Object.entries(timeLeft).map(([key, value]) => (
                <div key={key} className="flex flex-col items-center">
                    <div className="bg-white rounded-lg p-4 shadow-lg mb-2 w-24 h-24 flex items-center justify-center">
                        <h2 className="text-4xl sm:text-6xl font-bold text-gray-800">{padNumber(value)}</h2>
                    </div>
                    <p className="text-white text-base sm:text-lg capitalize">{key}</p>
                </div>
            ))}
        </div>
    );
};

export default CountdownTimer;