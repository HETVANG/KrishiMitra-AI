import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Calendar,
  X,
  CheckCircle2,
  ScanEye,
  Droplets,
  Sprout,
  Activity,
  Sparkles
} from 'lucide-react';

interface FarmerTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerTimelineModal: React.FC<FarmerTimelineModalProps> = ({ isOpen, onClose }) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTimeline();
    }
  }, [isOpen]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await api.get('/success/timeline');
      if (res.data && res.data.success) {
        setTimeline(res.data.timeline || []);
      }
    } catch (err) {
      console.error('Failed to load farm timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">Chronological Farm Timeline</h2>
              <p className="text-xs text-emerald-100">Historical activities, disease scans & completed tasks</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500 dark:text-gray-400">
              No recorded farm activities yet. Start by logging an irrigation or disease scan!
            </div>
          ) : (
            <div className="relative border-l-2 border-emerald-200 dark:border-emerald-900/60 ml-3 pl-4 space-y-4">
              {timeline.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-gray-900"></div>

                  <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-800 dark:text-gray-100">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {new Date(item.date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-300">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
