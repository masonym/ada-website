import React from 'react';
import { EventMetricsData, MetricsBreakdownItem } from '@/lib/event-metrics';

interface EventMetricsSectionProps {
  metrics: EventMetricsData;
}

function BreakdownList({ items }: { items: MetricsBreakdownItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2">
          <span className="text-slate-700 pr-4">{item.label}</span>
          <span className="font-semibold text-navy-500 min-w-[25%] text-right">{item.count} ({item.percentage}%)</span>
        </li>
      ))}
    </ul>
  );
}

export default function EventMetricsSection({ metrics }: EventMetricsSectionProps) {
  const topIndustryCount = 10;
  const topIndustries = metrics.industryBreakdown.slice(0, topIndustryCount);
  const remainingIndustries = metrics.industryBreakdown.slice(topIndustryCount);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 sm:p-8 shadow-sm">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-700 text-center mb-2 font-gotham">
          {metrics.title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl bg-white border border-gray-200 p-5 text-center">
            <p className="text-sm text-slate-500 uppercase tracking-wide">Total Registrations</p>
            <p className="text-3xl font-bold text-navy-500 mt-1">{metrics.totalRegistrations}</p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-5 text-center">
            <p className="text-sm text-slate-500 uppercase tracking-wide">Unique Organizations</p>
            <p className="text-3xl font-bold text-navy-500 mt-1">{metrics.uniqueOrganizations}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Top Industry Breakdown</h3>
            <BreakdownList items={topIndustries} />

            {remainingIndustries.length > 0 && (
              <details className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-navy-500">
                  View all remaining industries ({remainingIndustries.length})
                </summary>
                <div className="mt-3">
                  <BreakdownList items={remainingIndustries} />
                </div>
              </details>
            )}
          </div>

          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Organization Type Breakdown</h3>
            <BreakdownList items={metrics.organizationTypeBreakdown} />
          </div>
        </div>
      </div>
    </section>
  );
}
