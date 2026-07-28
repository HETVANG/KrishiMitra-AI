import React, { useEffect, useRef, useState } from 'react';
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
  StopCircle, 
  AlertCircle, 
  ExternalLink, 
  File, 
  User 
} from 'lucide-react';

export const Experts: React.FC = () => {
  const { user } = useAuth();
  const isExpert = user?.role === 'expert';

  const [experts, setExperts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Booking slot form state
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('10:00 AM - 10:30 AM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [info, setInfo] = useState('');

  // ==========================================
  // VIDEO CONSULTATION STATES
  // ==========================================
  const [videoRequests, setVideoRequests] = useState<any[]>([]);
  const [loadingVideoRequests, setLoadingVideoRequests] = useState(false);

  // Farmer form submission states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState('Disease');
  const [description, setDescription] = useState('');
  const [farmName, setFarmName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [priority, setPriority] = useState('Normal');

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Web camera recording states
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recordTimerRef = useRef<any>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Expert response states
  const [selectedVideoRequest, setSelectedVideoRequest] = useState<any | null>(null);
  const [responseText, setResponseText] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [responseVideoFile, setResponseVideoFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [responding, setResponding] = useState(false);
  const [responseProgress, setResponseProgress] = useState(0);

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

  const hasPremium = user?.plan === 'premium' || (user?.subscriptionStatus === 'trialing' && new Date(user.trialEndDate || 0) > new Date());

  useEffect(() => {
    if (hasPremium) {
      loadExperts();
    }
    loadAppointments();
    loadVideoRequests();
  }, [hasPremium, isExpert]);

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

  // ==========================================
  // FARMER VIDEO RECORDING FLOW
  // ==========================================
  const startRecording = async () => {
    try {
      setSuccessMsg('');
      setErrorMsg('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
        videoPreviewRef.current.play();
      }

      const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
      setMediaRecorder(recorder);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        setVideoFile(new File([videoBlob], 'recorded_crop_problem.webm', { type: 'video/webm' }));
        mediaStream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setRecording(true);
      setRecordTime(0);

      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 119) {
            stopRecording(recorder, mediaStream);
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      alert('Could not open webcam/camera. Please choose a file instead.');
    }
  };

  const stopRecording = (recorder = mediaRecorder, mediaStream = stream) => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setRecording(false);
    setStream(null);
    setMediaRecorder(null);
  };

  const handleSubmitVideoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      alert('Please upload or record a video explaining your crop issue.');
      return;
    }
    if (!description.trim()) {
      alert('Description is required.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('cropName', cropName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('farmName', farmName);
    formData.append('village', village);
    formData.append('district', district);
    formData.append('state', state);
    formData.append('priority', priority);

    try {
      const res = await api.post('/video-consultation/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.total) {
            setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        }
      });

      if (res.data && res.data.success) {
        setSuccessMsg('Your consultation request has been submitted successfully.');
        setVideoFile(null);
        setCropName('');
        setDescription('');
        setFarmName('');
        setVillage('');
        setDistrict('');
        setState('');
        loadVideoRequests();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit video request.');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // EXPERT RESPONSE FLOW
  // ==========================================
  const handleAcceptRequest = async (reqId: string) => {
    try {
      const res = await api.put(`/video-consultation/accept/${reqId}`);
      if (res.data && res.data.success) {
        alert('You have accepted this video consultation request.');
        loadVideoRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) {
      alert('Response text is required.');
      return;
    }

    setResponding(true);
    setResponseProgress(0);

    const formData = new FormData();
    formData.append('text', responseText);
    formData.append('recommendations', recommendations);
    if (responseVideoFile) formData.append('responseVideo', responseVideoFile);
    if (attachmentFile) formData.append('attachment', attachmentFile);

    try {
      const res = await api.post(`/video-consultation/respond/${selectedVideoRequest._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.total) {
            setResponseProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        }
      });

      if (res.data && res.data.success) {
        alert('Response submitted successfully!');
        setResponseText('');
        setRecommendations('');
        setResponseVideoFile(null);
        setAttachmentFile(null);
        setSelectedVideoRequest(null);
        loadVideoRequests();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit response.');
    } finally {
      setResponding(false);
    }
  };

  const handleCompleteRequest = async (reqId: string) => {
    if (confirm('Mark this video consultation completed?')) {
      try {
        const res = await api.put(`/video-consultation/complete/${reqId}`);
        if (res.data && res.data.success) {
          loadVideoRequests();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Agricultural Expert Advisory Consultation</h1>
        <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium">Book audio/video appointments or upload crop pathology videos for expert review.</p>
      </div>

      {!hasPremium && !isExpert && (
        <div className="p-5 bg-amber-50 border border-amber-250 dark:bg-amber-955/20 dark:border-amber-900/35 rounded-3xl text-left space-y-3">
          <h4 className="text-xs md:text-sm font-bold text-amber-850 dark:text-amber-400 flex items-center gap-1.5">
            ⚠️ Premium feature – Coming Soon
          </h4>
          <p className="text-xs text-gray-500 dark:text-dark-400 leading-relaxed">
            Booking live slots with agricultural pathologists is a premium feature. Try uploading a crop video explanation instead or upgrade to unlock slot bookings!
          </p>
          <a href="/pricing" className="btn-primary inline-flex py-2.5 px-4 text-xs font-bold w-fit min-h-[38px] flex items-center justify-center">
            Upgrade to Premium
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Expert Profiles or Booking Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedExpert ? (
            <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/40 shadow-sm relative">
              <button
                onClick={() => { setSelectedExpert(null); setError(''); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-750 font-extrabold text-xs"
              >
                ✕ Cancel
              </button>

              <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 flex items-center gap-2 border-b pb-3">
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
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Select Date</label>
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
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Select Time Slot</label>
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Consultation Notes</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Describe crop symptoms, age, irrigation frequency..."
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
            <div className="space-y-6">
              
              {/* Active Experts List */}
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
                  <p className="text-left text-xs text-gray-400 p-4 bg-gray-50 rounded-2xl border">No active consulting experts online at the moment.</p>
                )}
              </div>

              {/* ==========================================
                  📹 UPLOAD CROP PROBLEM VIDEO CARD (Farmer only)
                  ========================================== */}
              {!isExpert && (
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/40 shadow-sm text-left space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-50 dark:border-dark-850 pb-3">
                    <span className="text-lg">📹</span>
                    <h3 className="font-extrabold text-base text-gray-805 dark:text-dark-100">Upload Crop Problem Video</h3>
                  </div>

                  {successMsg && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 rounded-2xl text-xs text-emerald-600 font-bold flex items-center gap-2">
                      <CheckCircle2 size={16} /> {successMsg}
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3.5 bg-red-50 dark:bg-red-955 border border-red-200/50 rounded-2xl text-xs text-red-655 font-bold flex items-center gap-2">
                      <AlertCircle size={16} /> {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmitVideoRequest} className="space-y-4">
                    {/* Video Source Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Upload Video File */}
                      <div className="p-4 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2 bg-gray-50/20">
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">Choose Video File</span>
                        <span className="text-[10px] text-gray-400">MP4, MOV, AVI, WebM up to 100MB</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setVideoFile(e.target.files[0]);
                            }
                          }}
                          className="text-[10px] text-gray-500 w-full max-w-[200px]"
                        />
                      </div>

                      {/* Direct Record Video */}
                      <div className="p-4 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2 bg-gray-50/20">
                        <Video size={24} className="text-brand-600" />
                        <span className="text-xs font-bold text-gray-700">Record from Webcam/Phone</span>
                        <span className="text-[10px] text-gray-400">Record brief 2-minute crop clips</span>
                        
                        <div className="flex gap-2">
                          {!recording ? (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="px-3 py-1.5 bg-brand-650 hover:bg-brand-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"
                            >
                              <Play size={10} /> Start Rec
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => stopRecording()}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"
                            >
                              <StopCircle size={10} /> Stop ({recordTime}s)
                            </button>
                          )}
                        </div>

                        {recording && (
                          <video
                            ref={videoPreviewRef}
                            muted
                            className="w-full max-w-[160px] h-20 rounded-lg mt-2 object-cover border"
                          />
                        )}
                      </div>
                    </div>

                    {videoFile && (
                      <div className="text-[11px] bg-brand-50 p-2.5 rounded-xl text-brand-700 font-semibold flex items-center gap-1.5">
                        🎥 Selected video: <b>{videoFile.name}</b> ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </div>
                    )}

                    {/* Problem fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Crop Name</label>
                        <input
                          type="text"
                          required
                          value={cropName}
                          onChange={(e) => setCropName(e.target.value)}
                          placeholder="e.g. Wheat, Rice, Cotton"
                          className="custom-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Problem Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="custom-input text-xs"
                        >
                          <option value="Disease">Disease</option>
                          <option value="Pest">Pest</option>
                          <option value="Soil">Soil</option>
                          <option value="Irrigation">Irrigation</option>
                          <option value="Fertilizer">Fertilizer</option>
                          <option value="Weather">Weather</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Farm Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Farm Name</label>
                        <input
                          type="text"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          placeholder="Main Field"
                          className="custom-input text-[11px] py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Village</label>
                        <input
                          type="text"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          placeholder="Village"
                          className="custom-input text-[11px] py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-555 uppercase mb-1">District</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="District"
                          className="custom-input text-[11px] py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-555 uppercase mb-1">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className="custom-input text-[11px] py-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="custom-input text-xs"
                        >
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-primary w-full py-3.5 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <Save size={14} /> {submitting ? `Uploading (${uploadProgress}%)` : 'Submit Request'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* EXPERT RESPONSE FORM (Modal style if selected) */}
              {isExpert && selectedVideoRequest && (
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-brand-200 shadow-lg text-left space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100">Respond to {selectedVideoRequest.requestId}</h3>
                    <button onClick={() => setSelectedVideoRequest(null)} className="text-gray-400">✕ Close</button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                    <p><b>Farmer:</b> {selectedVideoRequest.farmer?.name} ({selectedVideoRequest.farmer?.phone})</p>
                    <p><b>Crop:</b> {selectedVideoRequest.cropName}</p>
                    <p><b>Description:</b> "{selectedVideoRequest.description}"</p>
                  </div>

                  <form onSubmit={handleRespondRequest} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Expert Reply Text</label>
                      <textarea
                        required
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Type diagnosis, causes, and recommendation steps..."
                        className="custom-input h-24 resize-none py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Recommendations (Meds, Fertilisers)</label>
                      <input
                        type="text"
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        placeholder="e.g. Copper Oxychloride 2.5g/L water"
                        className="custom-input text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-550 uppercase mb-1">Upload Response Video (Optional)</label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) setResponseVideoFile(e.target.files[0]);
                          }}
                          className="text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-550 uppercase mb-1">Attach Doc/Image (Optional)</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) setAttachmentFile(e.target.files[0]);
                          }}
                          className="text-[10px]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={responding}
                      className="btn-primary w-full py-3 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> {responding ? `Submitting response (${responseProgress}%)` : 'Submit Diagnostic Response'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Consultation Lists & Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Consulting Slot Logs */}
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-800/30 shadow-sm min-h-[250px]">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b flex items-center gap-2">
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
              <div className="space-y-4 overflow-y-auto max-h-[350px] pr-1">
                {appointments.length > 0 ? (
                  appointments.map((item) => {
                    const statusColors: Record<string, string> = {
                      pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-955/20',
                      approved: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-955/20',
                      completed: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-dark-800',
                      cancelled: 'bg-red-50 text-red-500 border-red-150 dark:bg-red-955/20',
                    };

                    const partnerName = isExpert ? item.farmer?.name : item.expert?.name;
                    const spec = isExpert ? 'Farmer' : item.expert?.expertProfile?.specialization;

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
                            {item.status}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-500 flex items-center gap-2">
                          <span>📅 {item.date}</span>
                          <span>•</span>
                          <span>⏰ {item.timeSlot}</span>
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-gray-650 italic">
                            "{item.notes}"
                          </p>
                        )}

                        {item.status === 'approved' && item.meetLink && (
                          <a
                            href={item.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary w-full py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5"
                          >
                            <Video size={13} /> Launch Video Consultation Room
                          </a>
                        )}

                        {isExpert && item.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'approved')}
                              className="btn-primary flex-1 py-2 text-[10px] uppercase font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'cancelled')}
                              className="bg-red-500 hover:bg-red-650 text-white rounded-lg flex-1 py-2 text-[10px] uppercase font-bold"
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

          {/* ==========================================
              📋 VIDEO CONSULTATION STATUS TRACKER
              ========================================== */}
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-150 dark:border-dark-805/30 shadow-sm min-h-[300px] text-left">
            <h3 className="font-extrabold text-base text-gray-805 dark:text-dark-100 mb-4 pb-2 border-b flex items-center gap-2">
              <Video className="text-brand-650" size={18} /> Video Advisory Tracker
            </h3>

            {loadingVideoRequests ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-3 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                {videoRequests.length > 0 ? (
                  videoRequests.map((item) => {
                    const statusStyles: Record<string, string> = {
                      Pending: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-955/20',
                      Assigned: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-955/20',
                      'Under Review': 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-955/20',
                      'Expert Replied': 'bg-emerald-50 text-emerald-600 border-emerald-250 dark:bg-emerald-955/20',
                      Completed: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-dark-800'
                    };

                    return (
                      <div 
                        key={item._id}
                        className="border border-gray-150 p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-850/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.requestId}</span>
                            <h4 className="font-extrabold text-xs text-gray-800 dark:text-dark-100">{item.cropName} ({item.category})</h4>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase ${statusStyles[item.status]}`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="text-[9px] text-gray-500 flex flex-wrap gap-x-2 gap-y-0.5 font-semibold">
                          <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                          {item.farmDetails?.village && <span>• 🏡 {item.farmDetails.village}</span>}
                          {item.priority && <span>• 🚨 {item.priority}</span>}
                        </div>

                        <p className="text-[11px] text-gray-600 leading-normal">
                          "{item.description}"
                        </p>

                        {/* Video Player */}
                        <div className="relative rounded-xl overflow-hidden border bg-black h-28 flex items-center justify-center">
                          <video
                            src={item.videoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Expert Response Block */}
                        {item.response?.text && (
                          <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/50 text-[10px] space-y-2 text-left">
                            <span className="block font-bold text-emerald-700 dark:text-emerald-400">🎓 Expert Advisory Diagnosis:</span>
                            <p className="text-gray-700 leading-relaxed font-semibold">"{item.response.text}"</p>
                            
                            {item.response.recommendations && (
                              <div className="pt-1.5 border-t border-emerald-100/50">
                                <span className="font-bold text-emerald-800 dark:text-emerald-450">🛠️ Treatment/Medicine:</span>
                                <p className="text-emerald-650 font-bold mt-0.5">{item.response.recommendations}</p>
                              </div>
                            )}

                            {/* Response Video */}
                            {item.response.videoUrl && (
                              <div className="mt-2 pt-2 border-t">
                                <span className="block font-bold text-gray-600 mb-1">📹 Response Explanation Clip:</span>
                                <video
                                  src={item.response.videoUrl}
                                  controls
                                  className="w-full max-h-24 object-contain bg-black rounded"
                                />
                              </div>
                            )}

                            {/* Response attachments */}
                            {item.response.attachments && item.response.attachments.length > 0 && (
                              <div className="mt-2 pt-2 border-t flex flex-wrap gap-2">
                                {item.response.attachments.map((url: string, i: number) => (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-1 bg-white hover:bg-gray-50 border rounded text-[9px] font-extrabold text-gray-700 flex items-center gap-1"
                                  >
                                    <File size={10} /> Document {i + 1} <ExternalLink size={8} />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expert Actions */}
                        {isExpert && (
                          <div className="flex gap-2 pt-1 border-t border-gray-100/50">
                            {item.status === 'Pending' && (
                              <button
                                onClick={() => handleAcceptRequest(item._id)}
                                className="btn-primary flex-grow py-2 text-[10px] uppercase font-bold tracking-wider"
                              >
                                Accept Consultation
                              </button>
                            )}

                            {item.status === 'Assigned' && (
                              <button
                                onClick={() => setSelectedVideoRequest(item)}
                                className="bg-brand-600 hover:bg-brand-700 text-white font-bold flex-grow py-2 text-[10px] uppercase rounded-xl"
                              >
                                Submit Diagnosis
                              </button>
                            )}

                            {item.status === 'Expert Replied' && (
                              <button
                                onClick={() => handleCompleteRequest(item._id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex-grow py-2 text-[10px] uppercase rounded-xl"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-10 text-xs text-gray-405">No video consultation requests found.</p>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
export default Experts;
