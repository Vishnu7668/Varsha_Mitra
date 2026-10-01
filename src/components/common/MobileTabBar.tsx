import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sprout, Layers, PhoneCall, ShieldCheck, Bot } from 'lucide-react';

export const MobileTabBar: React.FC = () => {
  const location = useLocation();
  const { t, setIsChatOpen } = useApp();

  const tabs = [
    { path: '/farmer', label: 'Farmer', icon: Sprout },
    { path: '/sms', label: 'SMS/IVR', icon: PhoneCall },
    { action: 'chat', label: 'Krishi AI', icon: Bot, isHighlight: true },
    { path: '/officer', label: 'Officer', icon: Layers },
    { path: '/insurance', label: 'Insurance', icon: ShieldCheck },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          if (tab.action === 'chat') {
            return (
              <button
                key="chat-tab"
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="flex flex-col items-center justify-center -mt-5"
                title={t.navChat}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-700 text-white shadow-lg flex items-center justify-center border-4 border-[#fafaf5] dark:border-slate-900">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          }

          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path!}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] truncate max-w-16.25">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
