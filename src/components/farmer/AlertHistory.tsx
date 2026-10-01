import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, MessageSquare, PhoneCall, CheckCircle, Clock } from 'lucide-react';

export const AlertHistory: React.FC = () => {
  const { t, village, advisory, crop } = useApp();

  // Synthetic realistic alerts history for this village
  const alerts = [
    {
      id: 'a1',
      date: 'Today, 06:30 AM',
      channel: 'SMS',
      status: advisory.status,
      message: `VARSHA MITRA: ${advisory.status === 'RED' ? 'DO NOT SOW' : 'SAFE TO SOW'} ${crop} in ${village.name}. Safe date: ${advisory.safeSowingDate}. Dry break: ${advisory.dryBreakDays}d.`,
      recipients: village.registeredFarmers,
    },
    {
      id: 'a2',
      date: '3 Days Ago, 07:15 AM',
      channel: 'Voice IVR',
      status: 'AMBER',
      message: `Automated voice bulletin broadcast to ${village.registeredFarmers} farmers regarding marginal pre-monsoon precipitation.`,
      recipients: Math.round(village.registeredFarmers * 0.88),
    },
    {
      id: 'a3',
      date: '7 Days Ago, 08:00 AM',
      channel: 'WhatsApp',
      status: 'GREEN',
      message: `Weekly agrometeorological outlook infographic sent to Gram Panchayat Farmers Group.`,
      recipients: Math.round(village.registeredFarmers * 0.94),
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span>{t.alertHistoryTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit log of official bulletins dispatched to {village.name} farmers
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {alerts.length} Recent Bulletins
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {alerts.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700"
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                item.channel === 'SMS'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  : item.channel === 'Voice IVR'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {item.channel === 'SMS' ? (
                <MessageSquare className="w-4 h-4" />
              ) : (
                <PhoneCall className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.channel} Broadcast
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                      item.status === 'RED'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : item.status === 'GREEN'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">{item.date}</span>
              </div>

              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                {item.message}
              </p>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Dispatched to {item.recipients} mobile subscribers</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Delivered
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
