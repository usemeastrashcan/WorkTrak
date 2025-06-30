'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';

interface CommitDay {
  date: string;
  count: number;
  hours: number;
}

export function WorkCommitChart() {
  const [commitData, setCommitData] = useState<Record<string, CommitDay>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkData = async () => {
      const { data, error } = await supabase
        .from('work_entries')
        .select('start_time, duration')
        .gte('start_time', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching work entries:', error);
        return;
      }

      // Process into commit-style data
      const commits: Record<string, CommitDay> = {};
      data?.forEach(entry => {
        const date = new Date(entry.start_time).toISOString().split('T')[0];
        if (!commits[date]) {
          commits[date] = { date, count: 0, hours: 0 };
        }
        commits[date].count += 1;
        commits[date].hours += entry.duration || 0;
      });

      setCommitData(commits);
      setLoading(false);
    };

    fetchWorkData();
  }, []);

  // Generate last 90 days
  const days = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  // Color intensity based on hours worked
  const getColor = (hours: number) => {
    if (hours === 0) return 'bg-gray-800';
    if (hours < 2) return 'bg-green-600';
    if (hours < 4) return 'bg-green-500';
    if (hours < 6) return 'bg-green-400';
    return 'bg-green-300';
  };

  if (loading) return <div className="text-white">Loading work patterns...</div>;

  return (
    <div>
      <h2 className="text-white font-mono text-xl font-bold mb-4">Work Pattern</h2>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {days.map(date => {
            const dayData = commitData[date] || { hours: 0 };
            return (
              <div
                key={date}
                className={`h-4 w-4 rounded-sm ${getColor(dayData.hours)}`}
                title={`${date}: ${dayData.hours.toFixed(1)} hours`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Less</span>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}