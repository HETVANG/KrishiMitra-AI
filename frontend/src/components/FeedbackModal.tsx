import React, { useState } from 'react';
import { api } from '../services/api';
import { ThumbsUp, ThumbsDown, MessageSquare, Check, X, AlertTriangle } from 'lucide-react';

interface FeedbackModalProps {
  feature: string;
  farmId?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ feature, farmId, onClose, isOpen = true }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetailedForm, setShowDetailedForm] = useState(false);

  if (!isOpen) return null;

  const handleQuickRating = async (stars: number) => {
    setRating(stars);
    if (stars === 5) {
      // High rating - quick submit
      setLoading(true);
      try {
        await api.post('/product-intelligence/feedback', {
          feature,
          farmId,
          type: 'FEATURE_FEEDBACK',
          rating: 5,
          message: 'Helpful user response.'
        });
        setSubmitted(true);
        setTimeout(() => onClose && onClose(), 2000);
      } catch (err) {
        console.warn('[FeedbackModal] Quick feedback notice:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setShowDetailedForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await api.post('/product-intelligence/feedback', {
        feature,
        farmId,
        type: rating && rating <= 2 ? 'DATA_ERROR' : 'FEATURE_FEEDBACK',
        rating: rating || 3,
        message
      });
      setSubmitted(true);
      setTimeout(() => onClose && onClose(), 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-dark-800 rounded-3xl p-5 shadow-sm space-y-3 max-w-md w-full">
      {submitted ? (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold py-2">
          <Check className="w-4 h-4" /> Thank you for your feedback! It helps improve KrishiMitra.
        </div>
      ) : !showDetailedForm ? (
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-gray-700 dark:text-dark-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-brand-500" /> Was this helpful?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickRating(5)}
              disabled={loading}
              className="p-2 rounded-xl bg-gray-50 dark:bg-dark-800 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 transition-all flex items-center gap-1 text-xs font-bold"
            >
              <ThumbsUp className="w-3.5 h-3.5" /> Yes
            </button>
            <button
              onClick={() => handleQuickRating(2)}
              disabled={loading}
              className="p-2 rounded-xl bg-gray-50 dark:bg-dark-800 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-all flex items-center gap-1 text-xs font-bold"
            >
              <ThumbsDown className="w-3.5 h-3.5" /> No
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-900 dark:text-dark-100">Tell us what needs improvement</span>
            {onClose && (
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <textarea
            rows={2}
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Share details (e.g. incorrect price, unclear advisory)..."
            className="w-full p-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-xs font-medium"
          />

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
