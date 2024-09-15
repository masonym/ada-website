import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const LatestNews = () => {
  const newsItems = [
    { title: "ADA Announces 2025 Defense Industry Forecast Event", date: "August 15, 2024" },
    { title: "New Partnerships Formed at Recent Networking Event", date: "July 22, 2024" },
    { title: "Small Business Success Story: Contract Award Announced", date: "July 5, 2024" },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((news, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{news.title}</h3>
                <p className="text-gray-600 mb-4">{news.date}</p>
                <Link href="#" className="text-blue-600 hover:underline flex items-center">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;