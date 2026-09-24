import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface TaskCompletionAnimationProps {
  completed: boolean;
  label: string;
  reason?: string;
  priority?: 'high' | 'medium' | 'low';
  onToggle: () => void;
  className?: string;
}

export const TaskCompletionAnimation: React.FC<TaskCompletionAnimationProps> = ({
  completed,
  label,
  reason,
  priority = 'medium',
  onToggle,
  className = '',
}) => {
  const [justToggled, setJustToggled] = useState(false);

  const handleClick = () => {
    setJustToggled(true);
    onToggle();
    setTimeout(() => setJustToggled(false), 600);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-3 select-none ${
        completed
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 opacity-75'
          : 'bg-white dark:bg-dark-900 border-gray-150 dark:border-dark-800 hover:border-brand-500'
      } ${justToggled ? 'scale-[1.01]' : 'scale-100'} ${className}`}
    >
      {/* Checkbox Icon */}
      <div
        className={`w-5 h-5 rounded-lg border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${
          completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-300 dark:border-dark-700 bg-gray-50 dark:bg-dark-950'
        }`}
      >
        {completed && <Check size={13} className="stroke-[3]" />}
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h5 className={`font-bold text-xs md:text-sm transition-all ${
            completed ? 'line-through text-gray-500 dark:text-dark-400' : 'text-gray-800 dark:text-dark-100'
          }`}>
            {label}
          </h5>

          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase shrink-0 ${
            priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' :
            priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
            'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
          }`}>
            {priority}
          </span>
        </div>

        {reason && (
          <p className="text-[11px] text-gray-500 dark:text-dark-400 mt-1 leading-relaxed">
            {reason}
          </p>
        )}
      </div>
    </div>
  );
};
