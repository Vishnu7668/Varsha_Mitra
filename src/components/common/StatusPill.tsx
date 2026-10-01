import React from 'react';
import { AdvisoryStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface StatusPillProps {
  status: AdvisoryStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const configs = {
    GREEN: {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
      icon: CheckCircle2,
      label: 'SAFE TO SOW',
      labelHi: 'सुरक्षित (बुवाई करें)',
      labelMr: 'सुरक्षित (पेरणी करा)',
      dotColor: 'bg-emerald-500',
    },
    AMBER: {
      bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
      icon: AlertTriangle,
      label: 'WAIT / RECHECK',
      labelHi: 'प्रतीक्षा करें (संशयित)',
      labelMr: 'प्रतीक्षा करा (अनिश्चित)',
      dotColor: 'bg-amber-500',
    },
    RED: {
      bg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700',
      icon: AlertOctagon,
      label: 'DO NOT SOW',
      labelHi: 'बुवाई न करें (धोखा)',
      labelMr: 'पेरणी करू नका (धोका)',
      dotColor: 'bg-rose-500',
    },
  };

  const current = configs[status];
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
    lg: 'text-base px-4 py-2 gap-2.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-wide uppercase transition-all ${current.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dotColor} animate-pulse`} />
      {showIcon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      <span>{current.label}</span>
    </span>
  );
};
