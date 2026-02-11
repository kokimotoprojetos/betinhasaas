import React from 'react';
import { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  return (
    <div className="bg-white dark:bg-[#152e2e] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-lavender-light dark:bg-primary/10 rounded-xl">
          <span className="material-symbols-outlined text-primary">{metric.icon}</span>
        </div>
        {metric.trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${metric.trendUp ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-slate-500 bg-gray-50 dark:bg-white/5'}`}>
            {metric.trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">{metric.label}</h3>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</span>
        {metric.label === "Customer Satisfaction" && (
           <div className="flex text-yellow-400 text-sm mb-1.5">
             {[1,2,3,4].map(i => <span key={i} className="material-symbols-outlined text-[16px] icon-filled">star</span>)}
             <span className="material-symbols-outlined text-[16px] icon-filled">star_half</span>
           </div>
        )}
        {metric.subtext && <span className="text-xs text-slate-400 mb-1">{metric.subtext}</span>}
      </div>
      {metric.progress !== undefined && (
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${metric.progress}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;