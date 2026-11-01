import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Heart, Target } from 'lucide-react';
import { BRAND } from '../config/brand';
import { BrandLogo } from '../components/BrandLogo';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-50 transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-850 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-extrabold text-xs hover:underline">
          <ArrowLeft size={16} /> Back to Home
        </NavLink>
        <BrandLogo variant="horizontal" size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">About {BRAND.name}</h1>
          <p className="text-slate-600 dark:text-dark-300 text-sm md:text-base font-medium max-w-xl mx-auto">
            {BRAND.name} is a professional agricultural technology platform designed to empower farmers across India through predictive data intelligence, computer vision agronomy diagnostics, and APMC market transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 rounded-xl flex items-center justify-center mx-auto">
              <Target size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-dark-100">Our Mission</h4>
            <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
              Equip smallholder and progressive farmers with high-accuracy agronomic data to maximize yield, prevent disease loss, and optimize farm input economics.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-xl flex items-center justify-center mx-auto">
              <Heart size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-dark-100">Farmer First</h4>
            <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
              Deliver services in 12 native Indian languages with mobile-first accessibility, ensuring digital agronomy is effortless in the field.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200/80 dark:border-dark-800/50 shadow-xs text-center space-y-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-955/30 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-dark-100">Actionable Science</h4>
            <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed font-medium">
              Transform sensor and weather data into immediate field actions: exact spray dosages, organic biocontrols, and timely harvesting advisories.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 p-8 rounded-2xl border border-slate-200/80 dark:border-dark-850 space-y-3 shadow-xs">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Our Technology Stack</h3>
          <p className="text-xs text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
            Our platform merges satellite telemetry, computer vision scanners, and open meteorological API gateways. By matching local crop categories and soil indices, {BRAND.name} helps prevent crop losses and tracks mandi prices across regional APMCs in real-time.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[10px] border-t border-slate-800">
        {BRAND.copyright} Designed for the Indian Agricultural Community.
      </footer>

    </div>
  );
};

export default About;
