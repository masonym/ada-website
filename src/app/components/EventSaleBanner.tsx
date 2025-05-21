'use client';

import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sale } from '@/types/events';

export function EventSaleBanner({ sales }: { sales: Sale[] }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Filter active sales that haven't expired
  const activeSales = sales.filter(sale => {
    const validUntil = new Date(sale.validUntil);
    return sale.isActive && validUntil > currentTime;
  });

  if (activeSales.length === 0) {
    return null;
  }

  return (
    <div className="w-fit max-w-4xl mx-auto mt-6 mb-8 px-8">
      {activeSales.map((sale) => (
        <div 
          key={sale.id}
          className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-md shadow-sm animate-fade-in"
        >
          <div className="flex justify-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-10 w-10 text-blue-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-2xl font-medium text-blue-800">
                {sale.title}
              </h3>
              <div className="mt-2 text-lg text-blue-700">
                <p>{sale.description}</p>
                {sale.promoCode && (
                  <p className="mt-1 font-semibold">
                    Use Promo Code: <span className="text-blue-800">{sale.promoCode}</span>
                  </p>
                )}
                <p className="mt-1 text-lg text-blue-600">
                  Valid thru: {format(new Date(sale.validUntil), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
