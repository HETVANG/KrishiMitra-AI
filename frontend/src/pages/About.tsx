import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, ArrowLeft, ShieldCheck, Heart, Target } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-850 px-4 md:px-8 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-600 font-extrabold text-xs">
          <ArrowLeft size={16} /> Back to Home
        </NavLink>
        <div className="flex items-center gap-2">
          <Sprout size={18} className="text-brand-500" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">KrishiMitra AI</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">About KrishiMitra AI</h1>
          <p className="text-slate-500 dark:text-dark-350 text-sm md:text-base font-medium max-w-xl mx-auto">
            KrishiMitra AI is a digital agricultural portal designed to empower farmers across India through predictive technology and agronomy diagnostics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-100 dark:border-dark-800/50 shadow-sm text-center space-y-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
              <Target size={20} />
            </div>
            <h4 className="font-extrabold text-sm">Our Mission</h4>
            <p className="text-xs text-slate-400 dark:text-dark-400 leading-relaxed">
              Equip smallholder and marginal farmers with data tools to maximize crop yield, reduce waste, and protect land resources.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-100 dark:border-dark-800/50 shadow-sm text-center space-y-3">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950/20 text-brand-605 rounded-xl flex items-center justify-center mx-auto">
              <Heart size={20} />
            </div>
            <h4 className="font-extrabold text-sm">Farmer First</h4>
            <p className="text-xs text-slate-400 dark:text-dark-400 leading-relaxed">
              Deliver services in native regional languages, ensuring digital agronomy remains accessible to everyone.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-100 dark:border-dark-800/50 shadow-sm text-center space-y-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/20 text-indigo-500 rounded-xl flex items-center justify-center mx-auto">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-extrabold text-sm">Actionable Advisory</h4>
            <p className="text-xs text-slate-400 dark:text-dark-400 leading-relaxed">
              Turn data into actions, supplying clear organic remedies, pesticide measurements, and local mandi indices.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 p-8 rounded-3xl border border-slate-100 dark:border-dark-850 space-y-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Our Technology Stack</h3>
          <p className="text-xs text-slate-500 dark:text-dark-350 leading-relaxed">
            Our platform merges satellite telemetry, computer vision scanners, and open meteorological API gateways. By matching local crop categories and soil indices, KrishiMitra AI helps prevent crop losses and tracks mandi prices across regional APMCs.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 text-center text-[10px] border-t border-slate-800">
        &copy; 2026 KrishiMitra AI. Empowering the Indian Farming Community.
      </footer>

    </div>
  );
};
export default About;
