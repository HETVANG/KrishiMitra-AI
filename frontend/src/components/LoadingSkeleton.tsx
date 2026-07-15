import React from 'react';

export const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-dark-800 rounded-xl ${className}`}></div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 shadow-sm space-y-4">
    <div className="flex items-center gap-3">
      <Shimmer className="w-12 h-12 rounded-2xl" />
      <div className="space-y-1.5 flex-1">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-2.5 w-1/4" />
      </div>
    </div>
    <Shimmer className="h-16 w-full" />
    <div className="flex gap-2">
      <Shimmer className="h-10 flex-1" />
      <Shimmer className="h-10 flex-1" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Shimmer className="h-28 w-full rounded-3xl" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white dark:bg-dark-900 p-6 border rounded-3xl space-y-4 h-[300px]">
        <div className="flex justify-between">
          <Shimmer className="h-5 w-1/4" />
          <Shimmer className="h-5 w-1/3" />
        </div>
        <Shimmer className="h-12 w-1/2" />
        <Shimmer className="h-24 w-full" />
      </div>
      <div className="lg:col-span-5 bg-white dark:bg-dark-900 p-6 border rounded-3xl space-y-4 h-[300px]">
        <Shimmer className="h-5 w-1/3" />
        <Shimmer className="h-10 w-full" />
        <Shimmer className="h-28 w-full" />
      </div>
    </div>
  </div>
);

export const MandiPricesSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex justify-between items-center py-2.5">
        <div className="space-y-1.5">
          <Shimmer className="h-3.5 w-24" />
          <Shimmer className="h-2.5 w-32" />
        </div>
        <div className="text-right space-y-1">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-2.5 w-12" />
        </div>
      </div>
    ))}
  </div>
);

export const ExpertBookingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white dark:bg-dark-900 border rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
          <Shimmer className="w-10 h-10 rounded-full" />
          <Shimmer className="w-8 h-4" />
        </div>
        <div className="space-y-2">
          <Shimmer className="h-4 w-1/2" />
          <Shimmer className="h-2.5 w-1/3" />
          <Shimmer className="h-10 w-full" />
        </div>
        <hr className="border-gray-50 dark:border-dark-850" />
        <div className="flex justify-between items-center">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);
