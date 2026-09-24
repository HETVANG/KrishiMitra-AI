import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Calendar,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplets,
  ShieldAlert,
  DollarSign,
  Plus,
  RefreshCw,
  FileText,
  Layers,
  ChevronRight,
  BarChart3,
  Archive,
  Info,
  Check,
  Activity,
  X,
  Sparkles
} from 'lucide-react';
import { FarmLifecycleGrowthWidget } from '../animations';

interface CropCycle {
  _id: string;
  cropName: string;
  variety?: string;
  fieldName: string;
  areaAcres?: number;
  plantingDate: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  currentStage: string;
  status: 'PLANNED' | 'ACTIVE' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED';
  targetYieldKg?: number;
  actualYieldKg?: number;
  notes?: string;
  createdAt: string;
}

interface FarmActivityItem {
  _id: string;
  activityType: 'PLANTING' | 'IRRIGATION' | 'FERTILIZER' | 'DISEASE_SCAN' | 'SOIL_TEST' | 'WEATHER_EVENT' | 'INSPECTION' | 'HARVEST' | 'OTHER';
  date: string;
  title: string;
  description?: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  performedBy?: string;
}

const GROWTH_STAGES = [
  'GERMINATION',
  'SEEDLING',
  'VEGETATIVE',
  'FLOWERING',
  'FRUIT_DEVELOPMENT',
  'MATURITY',
  'HARVEST',
  'POST_HARVEST'
];

export const FarmLifecycle: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [cycleIntelligence, setCycleIntelligence] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [intelLoading, setIntelLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    cropName: 'Wheat',
    variety: '',
    fieldName: 'Main Field',
    areaAcres: 2.5,
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    targetYieldKg: 2000,
    currentStage: 'VEGETATIVE',
    notes: ''
  });

  const [activityForm, setActivityForm] = useState({
    activityType: 'INSPECTION' as FarmActivityItem['activityType'],
    title: '',
    description: '',
    quantity: '',
    unit: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [harvestForm, setHarvestForm] = useState({
    actualYieldKg: '',
    qualityGrade: 'Grade A',
    totalRevenue: '',
    buyerName: '',
    notes: ''
  });

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/crop-cycles');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCropCycles(res.data.data);
        // Select first active cycle by default
        const activeCycles = res.data.data.filter((c: CropCycle) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED');
        if (activeCycles.length > 0 && !selectedCycleId) {
          setSelectedCycleId(activeCycles[0]._id);
        } else if (res.data.data.length > 0 && !selectedCycleId) {
          setSelectedCycleId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('[FarmLifecycle] Failed to fetch crop cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntelligence = async (cycleId: string) => {
    try {
      setIntelLoading(true);
      const res = await api.get(`/crop-cycles/${cycleId}/intelligence`);
      if (res.data?.success) {
        setCycleIntelligence(res.data.data);
      }
    } catch (err) {
      console.error('[FarmLifecycle] Failed to fetch crop intelligence:', err);
    } finally {
      setIntelLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      fetchIntelligence(selectedCycleId);
    }
  }, [selectedCycleId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCycles();
    if (selectedCycleId) {
      await fetchIntelligence(selectedCycleId);
    }
    setRefreshing(false);
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/crop-cycles', {
        ...createForm,
        areaAcres: Number(createForm.areaAcres) || 1,
        targetYieldKg: createForm.targetYieldKg ? Number(createForm.targetYieldKg) : undefined
      });
      if (res.data?.success) {
        setShowCreateModal(false);
        setCreateForm({
          cropName: 'Wheat',
          variety: '',
          fieldName: 'Main Field',
          areaAcres: 2.5,
          plantingDate: new Date().toISOString().split('T')[0],
          expectedHarvestDate: '',
          targetYieldKg: 2000,
          currentStage: 'VEGETATIVE',
          notes: ''
        });
        await fetchCycles();
        if (res.data.data?._id) {
          setSelectedCycleId(res.data.data._id);
        }
      }
    } catch (err) {
      console.error('[FarmLifecycle] Failed to create crop cycle:', err);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycleId) return;
    try {
      const res = await api.post(`/crop-cycles/${selectedCycleId}/activities`, {
        ...activityForm,
        quantity: activityForm.quantity ? Number(activityForm.quantity) : undefined,
        cost: activityForm.cost ? Number(activityForm.cost) : undefined
      });
      if (res.data?.success) {
        setShowActivityModal(false);
        setActivityForm({
          activityType: 'INSPECTION',
          title: '',
          description: '',
          quantity: '',
          unit: '',
          cost: '',
          date: new Date().toISOString().split('T')[0]
        });
        await fetchIntelligence(selectedCycleId);
      }
    } catch (err) {
      console.error('[FarmLifecycle] Failed to log activity:', err);
    }
  };

  const handleRecordHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycleId) return;
    try {
      const res = await api.post(`/crop-cycles/${selectedCycleId}/harvest`, {
        actualYieldKg: Number(harvestForm.actualYieldKg) || 0,
        qualityGrade: harvestForm.qualityGrade,
        totalRevenue: harvestForm.totalRevenue ? Number(harvestForm.totalRevenue) : undefined,
        buyerName: harvestForm.buyerName,
        notes: harvestForm.notes
      });
      if (res.data?.success) {
        setShowHarvestModal(false);
        setHarvestForm({
          actualYieldKg: '',
          qualityGrade: 'Grade A',
          totalRevenue: '',
          buyerName: '',
          notes: ''
        });
        await fetchCycles();
        await fetchIntelligence(selectedCycleId);
      }
    } catch (err) {
      console.error('[FarmLifecycle] Failed to record harvest:', err);
    }
  };

  const handleCompleteCycle = async () => {
    if (!selectedCycleId || !window.confirm('Are you sure you want to complete this crop cycle and move it to history?')) return;
    try {
      const res = await api.post(`/crop-cycles/${selectedCycleId}/complete`, {});
      if (res.data?.success) {
        await fetchCycles();
      }
    } catch (err) {
      console.error('[FarmLifecycle] Failed to complete crop cycle:', err);
    }
  };

  const handleStageUpdate = async (newStage: string) => {
    if (!selectedCycleId) return;
    try {
      const res = await api.patch(`/crop-cycles/${selectedCycleId}`, {
        currentStage: newStage
      });
      if (res.data?.success) {
        await fetchCycles();
        await fetchIntelligence(selectedCycleId);
      }
    } catch (err) {
      console.error('[FarmLifecycle] Failed to update growth stage:', err);
    }
  };

  const activeCyclesList = cropCycles.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED');
  const completedCyclesList = cropCycles.filter(c => c.status === 'COMPLETED');

  const currentSelectedCycle = cropCycles.find(c => c._id === selectedCycleId);
  const intelData = cycleIntelligence?.intelligence;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 md:p-6 transition-colors">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Farm Lifecycle Management</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track, optimize, and record end-to-end crop growth cycles with AI Predictive & Market Intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Crop Cycle</span>
          </button>
        </div>
      </div>

      {/* 3D Biological Crop Growth & Underground Potato Visualization */}
      <FarmLifecycleGrowthWidget farmerCrop={currentSelectedCycle?.cropName} verifiedStage={currentSelectedCycle?.currentStage} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'active'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Active Cycles ({activeCyclesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Completed History ({completedCyclesList.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : activeTab === 'completed' ? (
        /* COMPLETED HISTORY TAB */
        <div className="space-y-4">
          {completedCyclesList.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-8 shadow-sm">
              <Archive className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Completed Cycles Yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Completed crop cycles will be stored here with full harvest records, historical activity logs, and performance data for AI optimization.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedCyclesList.map(cycle => (
                <div key={cycle._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{cycle.fieldName}</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{cycle.cropName} {cycle.variety ? `(${cycle.variety})` : ''}</h3>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      COMPLETED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <div>
                      <span className="block text-slate-400 font-medium">Planted</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(cycle.plantingDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">Harvested</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{cycle.actualHarvestDate ? new Date(cycle.actualHarvestDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">Total Yield</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cycle.actualYieldKg ? `${cycle.actualYieldKg} kg` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">Area</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{cycle.areaAcres ? `${cycle.areaAcres} Acres` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeCyclesList.length === 0 ? (
        /* NO ACTIVE CYCLES STATE */
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-8 shadow-sm">
          <Sprout className="w-14 h-14 text-emerald-500 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Active Crop Cycles</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
            Start tracking a new crop cycle to unlock Growth Stage prediction, Smart Irrigation, Disease Tracking, and Market Yield Intelligence.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Crop Cycle</span>
          </button>
        </div>
      ) : (
        /* ACTIVE CYCLES DASHBOARD */
        <div className="space-y-6">
          {/* Cycle Selector Cards */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {activeCyclesList.map(cycle => {
              const isSelected = cycle._id === selectedCycleId;
              return (
                <button
                  key={cycle._id}
                  onClick={() => setSelectedCycleId(cycle._id)}
                  className={`flex-shrink-0 min-w-[260px] max-w-[320px] p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                      {cycle.fieldName}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {cycle.areaAcres ? `${cycle.areaAcres} Acres` : ''}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{cycle.cropName}</h3>
                  {cycle.variety && <p className="text-xs text-slate-500 dark:text-slate-400">{cycle.variety}</p>}

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/50 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Stage: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{cycle.currentStage}</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {intelLoading ? (
            <div className="flex items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
            </div>
          ) : intelData ? (
            <>
              {/* Selected Cycle Overview Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-emerald-100 text-xs font-semibold uppercase tracking-wider">
                      <MapPin className="w-4 h-4" />
                      <span>{intelData.cropCycle?.fieldName || 'Main Field'} &bull; {intelData.cropCycle?.areaAcres || 1} Acres</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-1">
                      {intelData.cropCycle?.cropName} {intelData.cropCycle?.variety ? `(${intelData.cropCycle.variety})` : ''}
                    </h2>
                    <p className="text-emerald-100 text-sm">
                      Planted on {new Date(intelData.cropCycle?.plantingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; Days Active: <span className="font-bold text-white">{intelData.growthStage?.daysSincePlanting || 0} days</span>
                    </p>
                  </div>

                  {/* High level metrics pill */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
                      <span className="block text-xs text-emerald-100">Expected Harvest</span>
                      <span className="text-sm font-bold">
                        {intelData.growthStage?.expectedHarvestDate ? new Date(intelData.growthStage.expectedHarvestDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'}
                      </span>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
                      <span className="block text-xs text-emerald-100">Days to Harvest</span>
                      <span className="text-sm font-bold">
                        {intelData.growthStage?.daysRemainingToHarvest || 0} days
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowActivityModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-white text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-md flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Log Activity</span>
                      </button>

                      <button
                        onClick={() => setShowHarvestModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-900/80 border border-emerald-400/40 text-white font-semibold text-sm transition-colors flex items-center gap-1.5"
                      >
                        <Wheat className="w-4 h-4" />
                        <span>Harvest</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Growth Stage Tracker */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-emerald-600" />
                      <span>Growth Stage Progression</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Estimated Stage: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{intelData.growthStage?.estimatedStage}</strong> ({intelData.growthStage?.progressPercentage || 0}% Progress)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Manual Override:</span>
                    <select
                      value={currentSelectedCycle?.currentStage || 'VEGETATIVE'}
                      onChange={e => handleStageUpdate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                    >
                      {GROWTH_STAGES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Growth Stage Horizontal Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
                  {GROWTH_STAGES.map((st, idx) => {
                    const isCurrent = currentSelectedCycle?.currentStage === st;
                    const stageIndex = GROWTH_STAGES.indexOf(currentSelectedCycle?.currentStage || 'VEGETATIVE');
                    const isPassed = idx < stageIndex;

                    return (
                      <div
                        key={st}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                            : isPassed
                            ? 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/40 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <div className="flex justify-center mb-1.5">
                          {isCurrent ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs animate-pulse">
                              {idx + 1}
                            </div>
                          ) : isPassed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <span className={`block text-[11px] font-bold uppercase tracking-tight ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {st.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Integrated 4-Intelligence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Weather Intelligence */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weather Context</span>
                    <CloudSun className="w-5 h-5 text-sky-500" />
                  </div>
                  {intelData.weather ? (
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                        {intelData.weather.tempCelsius ?? '--'}°C
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {intelData.weather.condition || 'Clear Sky'} &bull; Humidity: {intelData.weather.humidity ?? '--'}%
                      </p>
                      <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        Rain Prob: <strong className="text-slate-900 dark:text-slate-100">{intelData.weather.rainProbability ?? 0}%</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Weather data unavailable</p>
                  )}
                </div>

                {/* 2. Predictive Risk Intelligence */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Predictive Risks</span>
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                  </div>
                  {intelData.predictiveRisks ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                          intelData.predictiveRisks.overallRiskLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : intelData.predictiveRisks.overallRiskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}>
                          {intelData.predictiveRisks.overallRiskLevel || 'LOW'} RISK
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {intelData.predictiveRisks.summary || 'No major active crop risks detected.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No risk assessment available</p>
                  )}
                </div>

                {/* 3. Smart Irrigation Intelligence */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Irrigation Need</span>
                    <Droplets className="w-5 h-5 text-blue-500" />
                  </div>
                  {intelData.irrigationStatus ? (
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {intelData.irrigationStatus.status?.replace('_', ' ') || 'MONITOR'}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {intelData.irrigationStatus.summary || 'Soil moisture is currently stable.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Irrigation status unmonitored</p>
                  )}
                </div>

                {/* 4. Market Intelligence */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Market Rate</span>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  {intelData.marketPrices?.available ? (
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                        ₹{intelData.marketPrices.avgPrice || '--'}
                        <span className="text-xs font-normal text-slate-400">/{intelData.marketPrices.unit || 'Qtl'}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {intelData.marketPrices.marketName || 'Local Mandi'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Price Not Available</p>
                  )}
                </div>
              </div>

              {/* Activity Timeline Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span>Farm Activity Log</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Chronological history of planting, irrigation, soil treatments, inspections, and harvesting
                    </p>
                  </div>

                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Activity</span>
                  </button>
                </div>

                {intelData.recentActivities && intelData.recentActivities.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
                    {intelData.recentActivities.map((act: FarmActivityItem) => (
                      <div key={act._id} className="relative group">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-800" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              {act.activityType}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{act.title}</h4>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(act.date).toLocaleDateString()}
                          </span>
                        </div>

                        {act.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            {act.description}
                          </p>
                        )}

                        {(act.quantity || act.cost) && (
                          <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {act.quantity && <span>Qty: <strong className="text-slate-800 dark:text-slate-200">{act.quantity} {act.unit || ''}</strong></span>}
                            {act.cost && <span>Cost: <strong className="text-slate-800 dark:text-slate-200">₹{act.cost}</strong></span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No activity recorded yet for this crop cycle. Click "Log Activity" to start logging!
                  </p>
                )}
              </div>

              {/* Complete Cycle Action Footer */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCompleteCycle}
                  className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Cycle as Completed</span>
                </button>
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-slate-500">Select a crop cycle to view full intelligence.</p>
          )}
        </div>
      )}

      {/* CREATE CROP CYCLE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>Create New Crop Cycle</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.cropName}
                    onChange={e => setCreateForm({ ...createForm, cropName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                    placeholder="e.g. Wheat, Rice, Tomato"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Variety</label>
                  <input
                    type="text"
                    value={createForm.variety}
                    onChange={e => setCreateForm({ ...createForm, variety: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                    placeholder="e.g. HD 2967"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Field Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.fieldName}
                    onChange={e => setCreateForm({ ...createForm, fieldName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                    placeholder="e.g. North Plot"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={createForm.areaAcres}
                    onChange={e => setCreateForm({ ...createForm, areaAcres: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Planting Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.plantingDate}
                    onChange={e => setCreateForm({ ...createForm, plantingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Yield (kg)</label>
                  <input
                    type="number"
                    value={createForm.targetYieldKg}
                    onChange={e => setCreateForm({ ...createForm, targetYieldKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md shadow-emerald-600/20"
                >
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG ACTIVITY MODAL */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span>Log Farm Activity</span>
              </h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Activity Type *</label>
                <select
                  value={activityForm.activityType}
                  onChange={e => setActivityForm({ ...activityForm, activityType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                >
                  <option value="PLANTING">Planting</option>
                  <option value="IRRIGATION">Irrigation</option>
                  <option value="FERTILIZER">Fertilizer / Soil Application</option>
                  <option value="DISEASE_SCAN">Disease Scan / Spray</option>
                  <option value="SOIL_TEST">Soil Testing</option>
                  <option value="INSPECTION">Field Inspection</option>
                  <option value="HARVEST">Harvesting</option>
                  <option value="OTHER">Other Activity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={activityForm.title}
                  onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                  placeholder="e.g. Applied Urea Fertilizer 50kg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={activityForm.quantity}
                    onChange={e => setActivityForm({ ...activityForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={activityForm.unit}
                    onChange={e => setActivityForm({ ...activityForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                    placeholder="e.g. kg, liters, hours"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost (₹)</label>
                <input
                  type="number"
                  value={activityForm.cost}
                  onChange={e => setActivityForm({ ...activityForm, cost: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                  placeholder="e.g. 1200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={activityForm.description}
                  onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                  placeholder="Additional field observation or notes"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md shadow-emerald-600/20"
                >
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD HARVEST MODAL */}
      {showHarvestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wheat className="w-5 h-5 text-amber-500" />
                <span>Record Crop Harvest</span>
              </h3>
              <button
                onClick={() => setShowHarvestModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordHarvest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Actual Yield (kg) *</label>
                  <input
                    type="number"
                    required
                    value={harvestForm.actualYieldKg}
                    onChange={e => setHarvestForm({ ...harvestForm, actualYieldKg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                    placeholder="e.g. 2400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quality Grade</label>
                  <select
                    value={harvestForm.qualityGrade}
                    onChange={e => setHarvestForm({ ...harvestForm, qualityGrade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Grade C">Grade C (Fair)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Revenue (₹)</label>
                  <input
                    type="number"
                    value={harvestForm.totalRevenue}
                    onChange={e => setHarvestForm({ ...harvestForm, totalRevenue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                    placeholder="e.g. 52000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Buyer / Mandi Name</label>
                  <input
                    type="text"
                    value={harvestForm.buyerName}
                    onChange={e => setHarvestForm({ ...harvestForm, buyerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                    placeholder="e.g. APMC Mandi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Harvest Notes</label>
                <textarea
                  rows={2}
                  value={harvestForm.notes}
                  onChange={e => setHarvestForm({ ...harvestForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                  placeholder="Notes on crop quality, weather during harvest, etc."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowHarvestModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors shadow-md shadow-amber-600/20"
                >
                  Record Harvest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmLifecycle;
