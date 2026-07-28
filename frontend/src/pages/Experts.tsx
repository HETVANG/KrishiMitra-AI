import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  UserCheck, 
  Star, 
  IndianRupee, 
  Clock, 
  Video, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Upload, 
  Play, 
  AlertCircle, 
  ExternalLink, 
  File, 
  User, 
  Languages, 
  Activity, 
  Image as ImageIcon 
} from 'lucide-react';

export const Experts: React.FC = () => {
  const { user } = useAuth();
  const isExpert = user?.role === 'expert';

  const [experts, setExperts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Unified Consultation Booking state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('10:00 AM - 10:30 AM');
  
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState('Disease');
  const [description, setDescription] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [consultationType, setConsultationType] = useState('Video');
  
  // Media attachments state
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  const [booking, setBooking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // ==========================================
  // VIDEO CONSULTATION STATES (General Video Request)
  // ==========================================
  const [videoRequests, setVideoRequests] = useState<any[]>([]);
  const [loadingVideoRequests, setLoadingVideoRequests] = useState(false);

  const loadExperts = async () => {
    setLoadingExperts(true);
    setError('');
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

  const loadVideoRequests = async () => {
    setLoadingVideoRequests(true);
    try {
      const endpoint = isExpert ? '/video-consultation/expert-requests' : '/video-consultation/farmer-requests';
      const res = await api.get(endpoint);
      if (res.data && res.data.success) {
        setVideoRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Failed to load video requests:', err);
    } finally {
      setLoadingVideoRequests(false);
    }
  };

  useEffect(() => {
    loadExperts();
    loadAppointments();
    loadVideoRequests();
  }, [isExpert]);

  // Handle Multi-media Selection Previews
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setVideos(prev => [...prev, ...filesArray]);

      const previews = filesArray.map(file => URL.createObjectURL(file));
      setVideoPreviews(prev => [...prev, ...previews]);
    }
  };

  const clearMediaSelection = () => {
    setImages([]);
    setImagePreviews([]);
    setVideos([]);
    setVideoPreviews([]);
  };

  // Submit Direct or General Consultation Request
  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingSlot) {
      setError('Date and Preferred slot are required.');
      return;
    }

    setError('');
    setInfo('');
    setBooking(true);
    setUploadProgress(0);

    const formData = new FormData();
    if (selectedExpert) {
      formData.append('expertId', selectedExpert._id);
    }
    formData.append('date', bookingDate);
    formData.append('timeSlot', bookingSlot);
    formData.append('notes', description);
    formData.append('cropName', cropName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('preferredLanguage', preferredLanguage);
    formData.append('consultationType', consultationType);

    images.forEach(img => formData.append('images', img));
    videos.forEach(vid => formData.append('videos', vid));

    try {
      const res = await api.post('/appointments/book', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEv) => {
          if (progressEv.total) {
            setUploadProgress(Math.round((progressEv.loaded * 100) / progressEv.total));
          }
        }
      });

      if (res.data && res.data.success) {
        setInfo(selectedExpert 
          ? `Appointment booked with ${selectedExpert.name} successfully! Awaiting approval.` 
          : 'General advisory consultation request submitted successfully! An expert agronomist will review shortly.'
        );
        // Reset states
        setCropName('');
        setDescription('');
        clearMediaSelection();
        setShowBookingForm(false);
        setSelectedExpert(null);
        loadAppointments();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit consultation request.');
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
        alert(`Request status updated to ${newStatus.toUpperCase()} successfully!`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-805 text-white p-6 rounded-3xl shadow-lg text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Agricultural Expert Advisory Consultation</h1>
        <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium">Connect directly with certified agronomists, soil pathologists, and veterinary advisors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Experts list or Consultation Request Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CONSULTATION REQUEST BOOKING FORM CONTAINER */}
          {showBookingForm || selectedExpert ? (
            <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/40 shadow-sm relative text-left">
              <button
                onClick={() => { setSelectedExpert(null); setShowBookingForm(false); setError(''); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-dark-100 font-extrabold text-xs"
              >
                ✕ Cancel
              </button>

              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-2 border-b pb-3">
                <Calendar size={18} className="text-brand-600" /> 
                {selectedExpert ? `Book slot with ${selectedExpert.name}` : 'Request Advisory Consultation'}
              </h3>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-955 border border-red-200/50 rounded-xl text-xs text-red-655 font-semibold">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleBookConsultation} className="space-y-4">
                {/* Crop & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Crop Name</label>
                    <input
                      type="text"
                      required
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      placeholder="e.g. Wheat, Paddy, Cotton"
                      className="custom-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Problem Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="custom-input text-xs"
                    >
                      <option value="Disease">Disease Diagnosis</option>
                      <option value="Pest">Pest Attack</option>
                      <option value="Soil">Soil Quality</option>
                      <option value="Irrigation">Irrigation/Water</option>
                      <option value="Fertilizer">Fertilizer/Nutrition</option>
                      <option value="Weather">Weather Damage</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Lang & Consultation Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Preferred Language</label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="custom-input text-xs"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi / हिन्दी</option>
                      <option value="Gujarati">Gujarati / ગુજરાતી</option>
                      <option value="Punjabi">Punjabi / ਪੰਜਾਬੀ</option>
                      <option value="Tamil">Tamil / தமிழ்</option>
                      <option value="Telugu">Telugu / తెలుగు</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Consultation Mode</label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="custom-input text-xs"
                    >
                      <option value="Video">Video Call</option>
                      <option value="Audio">Voice Call</option>
                      <option value="Chat">Text Chat</option>
                    </select>
                  </div>
                </div>

                {/* Date & Time slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="custom-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Preferred Slot</label>
                    <select
                      value={bookingSlot}
                      onChange={(e) => setBookingSlot(e.target.value)}
                      className="custom-input text-xs"
                    >
                      <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                      <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                      <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                      <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* Symptoms Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Problem Description (Required)</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe crop leaves appearance, damage percentage, soil watering cycle..."
                    className="custom-input h-20 resize-none py-2 text-xs"
                  />
                </div>

                {/* MEDIA ATTACHMENTS (Images & Videos) */}
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Upload Crop Images / Videos</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Image Upload */}
                    <div className="p-3 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 bg-gray-50/20">
                      <ImageIcon size={18} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-700">Attach Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-[9px] w-full max-w-[180px]"
                      />
                    </div>

                    {/* Video Upload */}
                    <div className="p-3 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 bg-gray-50/20">
                      <Video size={18} className="text-brand-650" />
                      <span className="text-[10px] font-bold text-gray-700">Attach Video Clips</span>
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="text-[9px] w-full max-w-[180px]"
                      />
                    </div>
                  </div>

                  {/* Previews grid */}
                  {(imagePreviews.length > 0 || videoPreviews.length > 0) && (
                    <div className="space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-150">
                      <span className="block text-[9px] uppercase tracking-wider text-gray-450 font-bold">Attachment Previews</span>
                      <div className="flex flex-wrap gap-2">
                        {imagePreviews.map((url, i) => (
                          <img key={i} src={url} className="w-14 h-14 object-cover rounded-lg border shadow-sm" alt="Preview" />
                        ))}
                        {videoPreviews.map((url, i) => (
                          <video key={i} src={url} className="w-14 h-14 object-cover rounded-lg border shadow-sm bg-black" />
                        ))}
                      </div>
                      <button 
                        type="button" 
                        onClick={clearMediaSelection} 
                        className="text-[9px] font-extrabold text-red-500 uppercase hover:underline"
                      >
                        Clear Attachments
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={booking}
                  className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-1.5"
                >
                  <Upload size={14} /> {booking ? `Uploading & Submitting (${uploadProgress}%)` : 'Submit Consultation Request'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              
              {/* Experts cards list wrapper */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 flex items-center gap-2">
                    <UserCheck className="text-brand-650" size={18} /> Active Consulting Experts
                  </h3>
                  
                  {/* General request submit trigger */}
                  <button
                    onClick={() => { setShowBookingForm(true); setSelectedExpert(null); }}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    📝 general request
                  </button>
                </div>

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

                          <div className="text-[9px] text-gray-450 mt-1 flex flex-wrap gap-1 font-bold">
                            <span className="bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Languages size={10} /> Languages: {item.expertProfile?.languages?.join(', ') || 'English, Hindi'}</span>
                          </div>

                          <p className="text-[11px] text-gray-500 dark:text-dark-400 mt-2.5 line-clamp-2 leading-relaxed font-semibold">
                            {item.expertProfile?.bio}
                          </p>
                        </div>

                        <div className="border-t border-gray-50 dark:border-dark-850 mt-4 pt-3 flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-700 dark:text-dark-305 flex items-center">
                            <IndianRupee size={13} className="text-brand-600" /> {item.expertProfile?.consultationFee || 0} / session
                          </span>
                          
                          <button
                            onClick={() => { setSelectedExpert(item); setError(''); setInfo(''); }}
                            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider shadow-sm transition-colors duration-150"
                          >
                            Book now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* FRIENDLY EMPTY STATE BOOKING TRIGGER */
                  <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/20 dark:from-dark-850 dark:to-dark-900 border border-amber-100/50 p-6 rounded-3xl text-center space-y-3">
                    <span className="text-3xl block">🧑‍🌾</span>
                    <h4 className="font-extrabold text-sm text-amber-800 dark:text-amber-400">No Experts Online Right Now</h4>
                    <p className="text-xs text-gray-500 leading-normal max-w-sm mx-auto font-medium">
                      All certified pathologists are currently offline. You can still submit an advisory consultation request immediately, and our next available agronomist will diagnosis your crop issues!
                    </p>
                    <button
                      onClick={() => { setShowBookingForm(true); setSelectedExpert(null); }}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                    >
                      <FileText size={14} /> Submit Advisory Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Appointment lists (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/30 shadow-sm min-h-[350px] text-left">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b flex items-center gap-2">
            <Clock className="text-brand-650" size={18} /> Consulting Slot Logs
          </h3>

          {info && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-brand-50 border border-brand-200 rounded-2xl text-xs text-brand-700 font-bold">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          {loadingAppointments ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-3 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[550px] pr-1">
              {appointments.length > 0 ? (
                appointments.map((item) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-955/20',
                    accepted: 'bg-blue-50 text-blue-600 border-blue-150 dark:bg-blue-955/20',
                    scheduled: 'bg-purple-50 text-purple-650 border-purple-150 dark:bg-purple-955/20',
                    in_progress: 'bg-sky-50 text-sky-600 border-sky-150 dark:bg-sky-955/20',
                    completed: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-dark-800',
                    cancelled: 'bg-red-50 text-red-500 border-red-150 dark:bg-red-955/20',
                  };

                  const partnerName = isExpert ? item.farmer?.name : (item.expert?.name || 'Assigned Agronomist');
                  const spec = isExpert ? 'Farmer' : (item.expert?.expertProfile?.specialization || 'General Consultation');

                  return (
                    <div 
                      key={item._id}
                      className="border border-gray-150 p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-850/10 text-left space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs md:text-sm text-gray-805 dark:text-dark-200">{partnerName}</h4>
                          <span className="block text-[9px] text-gray-400 uppercase font-semibold">{spec}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase ${statusColors[item.status]}`}>
                          {item.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-500 flex items-center gap-2">
                        <span>📅 {item.date}</span>
                        <span>•</span>
                        <span>⏰ {item.timeSlot}</span>
                      </div>

                      {item.cropName && (
                        <div className="text-[10px] font-semibold text-brand-700 bg-brand-50/50 px-2 py-1 rounded-lg w-fit">
                          🌾 Crop: {item.cropName} ({item.category})
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-[11px] text-gray-650 italic leading-normal">
                          "{item.notes}"
                        </p>
                      )}

                      {/* Photo / Video attachments previews */}
                      {((item.images && item.images.length > 0) || (item.videos && item.videos.length > 0)) && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-gray-100/50">
                          {item.images?.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} className="w-10 h-10 object-cover rounded-lg border" alt="Symptom" />
                            </a>
                          ))}
                          {item.videos?.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-black rounded-lg border flex items-center justify-center">
                              <Play size={10} className="text-white" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Video call button if approved / scheduled */}
                      {['accepted', 'scheduled', 'in_progress'].includes(item.status) && item.meetLink && (
                        <a
                          href={item.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <Video size={13} />
                          <span>Launch Video Consultation Room</span>
                        </a>
                      )}

                      {/* Expert Claim/Approval buttons */}
                      {isExpert && (
                        <div className="flex gap-1.5 pt-2 border-t border-gray-100/50">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'accepted')}
                              className="btn-primary flex-1 py-1.5 text-[9px] uppercase font-bold"
                            >
                              Claim Request
                            </button>
                          )}
                          {['accepted', 'scheduled'].includes(item.status) && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'completed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex-1 py-1.5 text-[9px] uppercase rounded-lg"
                            >
                              Mark Completed
                            </button>
                          )}
                          {item.status !== 'cancelled' && item.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'cancelled')}
                              className="bg-red-500 hover:bg-red-650 text-white font-bold flex-1 py-1.5 text-[9px] uppercase rounded-lg"
                            >
                              Decline
                            </button>
                          )}
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
export default Experts;
