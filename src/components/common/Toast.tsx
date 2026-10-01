import React from 'react';
import { useApp } from '../../context/AppContext';
import { WifiOff, AlertCircle } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOffline, t } = useApp();

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{t.offlineBanner}</span>
    </div>
  );
};

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useApp();

  if (!toastMessage) return null;

  const bgMap = {
    info: 'bg-slate-900 text-white border-slate-700 dark:bg-slate-100 dark:text-slate-900',
    success: 'bg-emerald-800 text-white border-emerald-600',
    warning: 'bg-amber-700 text-white border-amber-500',
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce duration-300">
      <div
        className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium flex items-center gap-2.5 ${bgMap[toastType]}`}
      >
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
