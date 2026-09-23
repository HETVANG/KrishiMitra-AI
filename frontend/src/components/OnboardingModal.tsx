import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Sprout,
  Globe,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Bell,
  Sparkles,
  ShieldCheck,
  Droplets,
  Building2
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onCompleted
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [language, setLanguage] = useState('en');
  const [stateName, setStateName] = useState('Gujarat');
  const [countryCode, setCountryCode] = useState('IN');
  const [farmName, setFarmName] = useState('My Main Farm');
  const [farmSize, setFarmSize] = useState('5');
  const [primaryCrop, setPrimaryCrop] = useState('Cotton');
  const [cropStage, setCropStage] = useState('Vegetative');
  const [irrigationType, setIrrigationType] = useState('Drip');
  const [enableProactiveAlerts, setEnableProactiveAlerts] = useState(true);
  const [alertChannels, setAlertChannels] = useState({
    sms: true,
    whatsapp: true,
    push: true
  });

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleNextStep = async () => {
    try {
      setLoading(true);

      // Save step data to backend
      let stepData = {};
      if (step === 1) {
        stepData = { language, stateName, countryCode };
      } else if (step === 2) {
        stepData = { farmName, farmSize: parseFloat(farmSize) || 5 };
      } else if (step === 3) {
        stepData = { primaryCrop, cropStage, irrigationType };
      } else if (step === 4) {
        stepData = { enableProactiveAlerts, alertChannels };
      }

      await api.patch('/onboarding/step', { step, data: stepData });

      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        await api.post('/onboarding/complete');
        onCompleted();
      }
    } catch (err: any) {
      console.error('Failed to update onboarding step:', err);
      // Even if API call has an issue, allow user to advance gracefully
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        onCompleted();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAll = async () => {
    try {
      setLoading(true);
      await api.post('/onboarding/skip');
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-6 text-white relative">
          <button
            onClick={handleSkipAll}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Skip onboarding"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
              <Sprout className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to KrishiMitra AI</h2>
              <p className="text-xs text-emerald-100">Set up your smart farm workspace in under 60 seconds</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-emerald-100 font-medium mb-1.5">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2 bg-emerald-950/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-300 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* STEP 1: Language & Region */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-lg">
                <Globe className="w-5 h-5 text-emerald-600" />
                Select Preferred Language & Region
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                KrishiMitra AI will customize voice advisories, market updates, and copilot responses in your chosen language.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Interface & Advisory Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिंदी (Hindi)' },
                    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
                    { code: 'mr', label: 'मराठी (Marathi)' },
                    { code: 'ta', label: 'தமிழ் (Tamil)' },
                    { code: 'te', label: 'తెలుగు (Telugu)' }
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLanguage(item.code)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        language === item.code
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Gujarat, Maharashtra"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="e.g. IN, US"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Farm Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-lg">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Tell Us About Your Primary Farm
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can add more farms and fields anytime from your multi-farm manager.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Farm Name
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Sunrise Organic Acres"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Total Farm Size (Acres)
                </label>
                <input
                  type="number"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Crop & Irrigation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-lg">
                <Droplets className="w-5 h-5 text-emerald-600" />
                Crop & Irrigation Profile
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This enables accurate growth stage advisories, weather risk alerts, and irrigation schedules.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Primary Crop
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Cotton', 'Wheat', 'Rice / Paddy', 'Groundnut', 'Sugarcane', 'Tomato', 'Maize', 'Soybean'].map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => setPrimaryCrop(crop)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                        primaryCrop === crop
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Current Stage
                  </label>
                  <select
                    value={cropStage}
                    onChange={(e) => setCropStage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Sowing">Sowing / Planting</option>
                    <option value="Vegetative">Vegetative Growth</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting / Maturation</option>
                    <option value="Harvesting">Harvesting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Irrigation Method
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Drip">Drip Irrigation</option>
                    <option value="Sprinkler">Sprinkler System</option>
                    <option value="Flood">Canal / Flood</option>
                    <option value="Rainfed">Rainfed / Dryland</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Proactive Intelligence */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-lg">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Proactive Intelligence & Notifications
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive proactive alerts before sudden pest outbreaks, frost warnings, or market price surges occur.
              </p>

              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Enable Proactive Advisories</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableProactiveAlerts}
                    onChange={(e) => setEnableProactiveAlerts(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </div>

                {enableProactiveAlerts && (
                  <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 grid grid-cols-3 gap-2">
                    {[
                      { key: 'sms', label: 'SMS Alerts' },
                      { key: 'whatsapp', label: 'WhatsApp' },
                      { key: 'push', label: 'Push Notify' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(alertChannels as any)[item.key]}
                          onChange={(e) =>
                            setAlertChannels({ ...alertChannels, [item.key]: e.target.checked })
                          }
                          className="w-3.5 h-3.5 text-emerald-600 rounded"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Your farm data is confidential and protected. You can adjust all preferences anytime in your settings.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gray-50 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSkipAll}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                'Saving...'
              ) : step === totalSteps ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next Step <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
