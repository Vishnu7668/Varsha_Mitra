import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, CheckSquare, Square, FileText, Phone, HelpCircle, AlertCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  step: string;
  desc: string;
  timeline: string;
}

export const PolicyHub: React.FC = () => {
  const { t, village, crop } = useApp();

  const initialItems: ChecklistItem[] = [
    {
      id: 'step-1',
      step: 'Notice of Prevented Sowing / Failed Germination',
      desc: 'Inform the insurance company or call toll-free helpline within 72 hours of rain cessation or sowing failure.',
      timeline: 'Within 72 Hours',
    },
    {
      id: 'step-2',
      step: 'Crop Insurance Application & Policy Receipt',
      desc: 'Gather your PMFBY enrollment acknowledgment number from CSC Center or bank passbook deduction.',
      timeline: 'Immediate',
    },
    {
      id: 'step-3',
      step: 'Aadhaar & 7/12 Land Record (Satbara)',
      desc: 'Ensure your Aadhaar is linked to the land parcel (Khatauni / 7-12) and bank account with DBT active.',
      timeline: 'Pre-requisite',
    },
    {
      id: 'step-4',
      step: 'Joint Field Survey (Panchanama)',
      desc: 'Local Agriculture Officer (Krishi Sahayak) and Insurance Surveyor inspect field for prevented sowing evidence.',
      timeline: 'Within 10 Days',
    },
    {
      id: 'step-5',
      step: 'Direct Benefit Transfer (DBT) Payout',
      desc: 'Up to 25% of sum insured is disbursed for prevented sowing directly to your bank account.',
      timeline: 'Within 30 Days',
    },
  ];

  // Persist checked items
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pmfby_checklist');
      return saved ? JSON.parse(saved) : ['step-1'];
    } catch {
      return ['step-1'];
    }
  });

  useEffect(() => {
    localStorage.setItem('pmfby_checklist', JSON.stringify(checkedIds));
  }, [checkedIds]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round((checkedIds.length / initialItems.length) * 100);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{t.policyHubTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step PMFBY claims procedure &amp; verified agricultural subsidies
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {progressPercent}% Complete
            </span>
            <div className="w-28 h-2 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist section */}
      <div className="mt-5">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span>{t.pmfbyChecklistTitle}</span>
          <span className="text-xs text-slate-400 font-normal">
            (Tick off each step as you complete it)
          </span>
        </h4>

        <div className="space-y-3">
          {initialItems.map((item, idx) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isChecked
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isChecked
                          ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-80'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      Step {idx + 1}: {item.step}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                      {item.timeline}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helplines and Subsidies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>National PMFBY &amp; Kisan Call Center Helplines</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <p>
              • PMFBY Farmer Toll-Free:{' '}
              <strong className="text-slate-900 dark:text-white">14447</strong> (24x7)
            </p>
            <p>
              • Kisan Call Centre:{' '}
              <strong className="text-slate-900 dark:text-white">1800-180-1551</strong> (Kisan Rath)
            </p>
            <p>• Mobile App: Crop Insurance App (Govt of India)</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Subsidies Available for {crop} Farmers</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <p>• National Food Security Mission: 50% seed subsidy on certified pulse varieties</p>
            <p>• PM Krishi Sinchayee Yojana: 55% subsidy on drip / micro-irrigation systems</p>
            <p>• Sub-Mission on Agricultural Mechanization: 40-50% subsidy on seed drill/BBF planters</p>
          </div>
        </div>
      </div>
    </div>
  );
};
