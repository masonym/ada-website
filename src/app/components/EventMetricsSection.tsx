import React from 'react';
import { EventMetricsData, MetricsBreakdownItem } from '@/lib/event-metrics';

interface EventMetricsSectionProps {
  metrics: EventMetricsData;
}

function BreakdownList({ items }: { items: MetricsBreakdownItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="rounded-md border border-gray-200 bg-white px-3 py-2 list-none">
          <div className="mb-2 flex items-start justify-between gap-3">
            <span className="text-slate-700 leading-snug max-w-[80%] break-words hyphens-auto">
              {item.label}
            </span>
            <span className="font-semibold text-navy-500 max-w-[20%] text-right">{item.percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-sb-100"
              style={{ width: `${Math.max(0, Math.min(item.percentage, 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5 text-center h-full flex flex-col justify-between">
      <p className="text-sm text-slate-500 uppercase tracking-wide min-h-[3rem] flex items-center justify-center leading-tight">
        {label}
      </p>
      <p className="text-3xl font-bold text-navy-500 mt-2">{value}</p>
    </div>
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

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Attendees" value={metrics.totalAttendees} />
          <StatCard label="Speakers" value={metrics.speakerCount} />
          <StatCard label="Matchmaking Hosts" value={metrics.matchmakingHosts} />
          <StatCard label="One-on-One Appointments" value={metrics.oneOnOneAppointments} />
          <StatCard label="Unique Organizations" value={metrics.uniqueOrganizations} />
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

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-lg font-semibold text-slate-700 mb-4">Role Breakdown</h4>
              <BreakdownList items={metrics.roleBreakdown} />

              {metrics.roleBreakdownDebug && (
                <details className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-navy-500">
                    Debug: grouped source titles by role category
                  </summary>
                  <div className="mt-3 space-y-3">
                    {metrics.roleBreakdownDebug.map((group) => (
                    <div key={group.category} className="rounded-md border border-gray-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-700">
                        {group.category} ({group.total} • {group.percentage}%)
                      </p>
                      <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
                        {group.titles.map((item) => (
                          <li key={`${group.category}-${item.title}`} className="text-xs text-slate-600 flex justify-between gap-3">
                            <span className="break-words">{item.title}</span>
                            <span className="font-semibold text-navy-500">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
