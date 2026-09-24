import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Sun,
  CloudSun,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronRight,
  Award,
  Check,
  X
} from 'lucide-react';

interface DailyBriefWidgetProps {
  onOpenTimeline?: () => void;
}

export const DailyBriefWidget: React.FC<DailyBriefWidgetProps> = ({ onOpenTimeline }) => {
  const [brief, setBrief] = useState<any>(null);
  const [context, setContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchBriefAndContext();
  }, []);

  const fetchBriefAndContext = async () => {
    try {
      setLoading(true);
      const [briefRes, contextRes] = await Promise.all([
        api.get('/success/daily-brief'),
        api.get('/success/context')
      ]);

      if (briefRes.data && briefRes.data.success) {
        setBrief(briefRes.data.brief);
      }
      if (contextRes.data && contextRes.data.success) {
        setContext(contextRes.data.context);
      }
    } catch (err) {
      console.error('Failed to load Daily Brief & Context:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompletingTaskId(taskId);
      await api.post(`/success/tasks/${taskId}/complete`, {
        result: 'completed_successfully',
        feedbackRating: 'HELPFUL'
      });
      // Refresh context and brief
      await fetchBriefAndContext();
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompletingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 animate-pulse space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  if (!brief) return null;

  const sections = brief.sections || [];
  const pendingTasks = context?.pendingTasks || [];
  const milestones = context?.milestones || [];
  const score = context?.healthCompletenessScore || 50;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Daily Farm Brief</h2>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {brief.farmName}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Personalized agricultural conditions for {brief.date}
            </p>
          </div>
        </div>

        {/* Completeness Score Badge & Timeline button */}
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center"
            title="Farm Profile & Health Completeness Score"
          >
            <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium uppercase">Farm Completeness</div>
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{score}%</div>
          </div>

          {onOpenTimeline && (
            <button
              onClick={onOpenTimeline}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
            >
              Timeline <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Brief Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((sec: any, idx: number) => {
          const isWarning = sec.status === 'WARNING' || sec.status === 'ALERT';
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-xs transition-all ${
                isWarning
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                  : 'bg-gray-50/70 dark:bg-gray-800/50 border-gray-150 dark:border-gray-700/60 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-bold">
                <span className="truncate">{sec.title}</span>
                {isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">{sec.summary}</p>
            </div>
          );
        })}
      </div>

      {/* Due Tasks Quick Action Bar */}
      {pendingTasks.length > 0 && (
        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-800 dark:text-gray-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" /> Pending Farm Tasks ({pendingTasks.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {pendingTasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700 text-xs"
              >
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{task.title}</div>
                  <div className="text-[10px] text-gray-500">Priority: {task.priority} | Due: {task.dueDate}</div>
                </div>

                <button
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={completingTaskId === task.id}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition-all shadow-2xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {completingTaskId === task.id ? 'Saving...' : 'Mark Done'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Milestones Chips */}
      {milestones.length > 0 && (
        <div className="pt-2 flex flex-wrap gap-2 items-center text-xs">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Milestones Unlocked:
          </span>
          {milestones.map((m: any, idx: number) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full text-[10px] font-medium"
            >
              🏆 {m.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
