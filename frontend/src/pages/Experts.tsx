import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, UserCheck, Stethoscope, Star, IndianRupee, Clock, Video, FileText, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export const Experts: React.FC = () => {
  const { user } = useAuth();
  
  const [experts, setExperts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Booking form state
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('10:00 AM - 10:30 AM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [info, setInfo] = useState('');

  const loadExperts = async () => {
    setLoadingExperts(true);
    try {
      const res = await api.get('/appointments/experts');
      if (res.data && res.data.success) {
        setExperts(res.data.experts);
      }
    } catch (err) {
      console.error('Failed to load experts:', err);
    } finally {
      setLoadingExperts(false);
    }
  };

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await api.get('/appointments/list');
      if (res.data && res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const hasPremium = user?.plan === 'premium' || (user?.subscriptionStatus === 'trialing' && new Date(user.trialEndDate || 0) > new Date());

  useEffect(() => {
    if (hasPremium) {
      loadExperts();
    }
    loadAppointments();
  }, [hasPremium]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPremium) {
      setError('Premium feature – Coming Soon. Please upgrade to unlock booking.');
      return;
    }
    if (!bookingDate || !bookingSlot) {
      setError('Date and time slot are required.');
      return;
    }

    setError('');
    setInfo('');
    setBooking(true);

    try {
      const res = await api.post('/appointments/book', {
        expertId: selectedExpert._id,
        date: bookingDate,
        timeSlot: bookingSlot,
        notes: bookingNotes
      });

      if (res.data && res.data.success) {
        setInfo('Appointment booked successfully! Awaiting expert approval.');
        setBookingNotes('');
        setSelectedExpert(null);
        loadAppointments();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request consultation slot.');
    } finally {
      setBooking(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await api.put(`/appointments/status/${appId}`, {
        status: newStatus
      });

      if (res.data && res.data.success) {
        loadAppointments();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Agricultural Expert Advisory Consultation</h1>
        <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium">Book audio/video appointments with specialized agronomists, soil advisors, and crop pathologists.</p>
      </div>

      {!hasPremium && (
        <div className="p-5 bg-amber-50 border border-amber-250 dark:bg-amber-955/20 dark:border-amber-900/35 rounded-3xl text-left space-y-3">
          <h4 className="text-xs md:text-sm font-bold text-amber-850 dark:text-amber-400 flex items-center gap-1.5">
            ⚠️ Premium feature – Coming Soon
          </h4>
          <p className="text-xs text-gray-500 dark:text-dark-400 leading-relaxed">
            Booking video consultations with certified agricultural pathologists and expert agronomists is a premium-only feature. Please upgrade your account plan to unlock available schedules, ratings indexes, and consultation fees.
          </p>
          <a href="/pricing" className="btn-primary inline-flex py-2.5 px-4 text-xs font-bold w-fit min-h-[38px] flex items-center justify-center">
            Upgrade to Premium
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Expert Profiles or Booking Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Booking form widget overlay */}
          {selectedExpert ? (
            <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/40 shadow-sm relative">
              <button
                onClick={() => { setSelectedExpert(null); setError(''); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-dark-100 font-extrabold text-lg p-2"
              >
                ✕ Cancel
              </button>

              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-2 border-b border-gray-50 dark:border-dark-850 pb-3">
                <Calendar size={18} className="text-brand-600" /> Book slot with {selectedExpert.name}
              </h3>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-955 border border-red-200/50 rounded-xl text-xs text-red-655">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleBook} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Select Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="custom-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Select Time Slot</label>
                    <select
                      value={bookingSlot}
                      onChange={(e) => setBookingSlot(e.target.value)}
                      className="custom-input text-sm"
                    >
                      <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                      <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                      <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                      <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">Consultation Notes (Crop, Soil issues)</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Briefly state leaf spots details, crop age, soil type..."
                    className="custom-input h-24 resize-none py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={booking}
                  className="btn-primary w-full py-3.5 mt-2"
                >
                  {booking ? 'Requesting Appointment...' : 'Submit Booking Request'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
                <UserCheck className="text-brand-650" size={18} /> Active Consulting Experts
              </h3>

              {loadingExperts ? (
                <div className="flex items-center justify-center py-12 bg-white border rounded-3xl">
                  <div className="w-8 h-8 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
                </div>
              ) : experts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {experts.map((item) => (
                    <div 
                      key={item._id}
                      className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-xs uppercase shrink-0">
                            {item.name.slice(0, 2)}
                          </div>
                          <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                            <Star size={14} fill="currentColor" />
                            <span>{item.expertProfile?.rating || '5.0'}</span>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-sm md:text-base text-gray-850 dark:text-dark-100 tracking-tight mt-3">
                          {item.name}
                        </h4>
                        <span className="inline-block text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                          {item.expertProfile?.specialization}
                        </span>

                        <p className="text-[11px] text-gray-500 dark:text-dark-400 mt-2.5 line-clamp-2 leading-relaxed">
                          {item.expertProfile?.bio}
                        </p>
                      </div>

                      <div className="border-t border-gray-50 dark:border-dark-850 mt-4 pt-3 flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-700 dark:text-dark-300 flex items-center">
                          <IndianRupee size={13} className="text-brand-600" /> {item.expertProfile?.consultationFee || 0} / session
                        </span>
                        
                        <button
                          onClick={() => { setSelectedExpert(item); setError(''); setInfo(''); }}
                          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider shadow-sm transition-colors duration-150"
                        >
                          Book consultation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-xs text-gray-400">No active consulting experts online.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Appointment lists (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm min-h-[350px]">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center gap-2">
            <Clock className="text-brand-650" size={18} /> Consulting Slot Logs
          </h3>

          {info && (
            <div className="mb-4 flex items-start gap-2.5 p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-700">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          {loadingAppointments ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-3 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
              {appointments.length > 0 ? (
                appointments.map((item) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-405',
                    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-405',
                    completed: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-dark-800 dark:text-dark-400',
                    cancelled: 'bg-red-50 text-red-500 border-red-150 dark:bg-red-950/20 dark:text-red-405',
                  };

                  const isExpert = user?.role === 'expert';
                  const partnerName = isExpert ? item.farmer?.name : item.expert?.name;
                  const spec = isExpert ? 'Farmer' : item.expert?.expertProfile?.specialization;

                  return (
                    <div 
                      key={item._id}
                      className="border border-gray-150 dark:border-dark-800/60 p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-850/10 text-left space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-dark-200">{partnerName}</h4>
                          <span className="block text-[9px] text-gray-400 uppercase font-semibold">{spec}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-500 dark:text-dark-400 flex items-center gap-2">
                        <span>📅 {item.date}</span>
                        <span>•</span>
                        <span>⏰ {item.timeSlot}</span>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-gray-600 dark:text-dark-350 italic">
                          "{item.notes}"
                        </p>
                      )}

                      {/* Video call button if approved */}
                      {item.status === 'approved' && item.meetLink && (
                        <a
                          href={item.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <Video size={13} />
                          <span>Launch Video Consultation Room</span>
                        </a>
                      )}

                      {/* Expert Approval buttons */}
                      {isExpert && item.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateStatus(item._id, 'approved')}
                            className="btn-primary flex-1 py-2 text-[10px] uppercase font-bold"
                          >
                            Approve Slot
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item._id, 'cancelled')}
                            className="bg-red-500 hover:bg-red-650 text-white rounded-lg flex-1 py-2 text-[10px] uppercase font-bold transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-10 text-xs text-gray-405">No consultation requests logged yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
