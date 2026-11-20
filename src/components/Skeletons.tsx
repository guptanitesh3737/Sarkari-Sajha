import React from 'react';

/**
 * Reusable accessible loading skeletons for high-performance lazy loading
 */

export const VacancyCardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div
      role="status"
      aria-label="Loading government vacancies..."
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <span className="sr-only">Loading vacancy notices...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs animate-pulse space-y-4 relative overflow-hidden"
        >
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-2" />
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5" />
            <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-md w-3/5" />
          </div>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-14" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-18" />
          </div>
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      ))}
    </div>
  );
};

export const VacancyDetailSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading vacancy details..."
      className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-pulse"
    >
      <span className="sr-only">Loading detailed vacancy notice...</span>
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
};

export const QuizCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div
      role="status"
      aria-label="Loading quizzes..."
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <span className="sr-only">Loading quiz sets...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 animate-pulse"
        >
          <div className="flex justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
          </div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
          <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      ))}
    </div>
  );
};

export const TabLoadingFallback: React.FC<{ label?: string }> = ({ label = 'Loading section...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="py-16 text-center space-y-4 animate-pulse max-w-xl mx-auto"
    >
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-xs text-slate-400 font-mono">Optimizing resources & rendering...</p>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};
