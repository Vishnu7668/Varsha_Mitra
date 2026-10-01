import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sprout, Droplet, Shield, Sun, Filter } from 'lucide-react';

interface TipItem {
  id: string;
  category: 'moisture' | 'harvesting' | 'ipm';
  title: string;
  description: string;
  cropApplicability: string[];
}

export const FarmingTips: React.FC = () => {
  const { t, crop } = useApp();
  const [activeCategory, setActiveCategory] = useState<'all' | 'moisture' | 'harvesting' | 'ipm'>('all');

  const tips: TipItem[] = [
    {
      id: '1',
      category: 'moisture',
      title: 'Broad Bed and Furrow (BBF) Planting',
      description:
        'For Black soils, plant on broad beds (120 cm wide) separated by 30 cm furrows. Conserves moisture during breaks and drains excess runoff during heavy deluge.',
      cropApplicability: ['Soybean', 'Cotton', 'Tur'],
    },
    {
      id: '2',
      category: 'moisture',
      title: 'Straw & Dust Mulching',
      description:
        'Spread crop residue or hoe between rows to create a loose dust mulch (2 inches). Cuts capillary evaporation by 45% during dry pauses.',
      cropApplicability: ['Cotton', 'Maize', 'Soybean'],
    },
    {
      id: '3',
      category: 'harvesting',
      title: 'Farm Pond & In-Situ Trenches (Jalyukt Shivar)',
      description:
        'Excavate 10x10x3m plastic-lined farm ponds at field corners to store early run-off. One life-saving protective irrigation during a 15-day break boosts yield by 35%.',
      cropApplicability: ['Soybean', 'Cotton', 'Paddy', 'Tur'],
    },
    {
      id: '4',
      category: 'ipm',
      title: 'Trichoderma Bio-Seed Treatment',
      description:
        'Coat seeds with Trichoderma viride (4g/kg) and Rhizobium culture before drilling. Protects germinating roots from soil-borne damping-off when rains stall.',
      cropApplicability: ['Soybean', 'Tur', 'Urad'],
    },
    {
      id: '5',
      category: 'ipm',
      title: 'Yellow Sticky Traps & Sucking Pest Scout',
      description:
        'During prolonged dry pauses, whitefly and thrips populations spike. Install 15 yellow sticky traps per acre to arrest vectors before viral spread.',
      cropApplicability: ['Cotton', 'Soybean'],
    },
    {
      id: '6',
      category: 'harvesting',
      title: 'Direct Seeded Rice (DSR) with Drum Seeder',
      description:
        'Avoid nursery delay by direct dry sowing with pre-monsoon showers. Saves 25-30% irrigation water and matures 7-10 days earlier.',
      cropApplicability: ['Paddy'],
    },
  ];

  const filteredTips = tips.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>{t.farmingTipsTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Agro-climatic agronomy practices tailored for Kharif crops
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('moisture')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'moisture'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Moisture Retention
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('harvesting')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'harvesting'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Rainwater Harvest
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('ipm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'ipm'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            IPM / Seed Shield
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {filteredTips.map((tip) => {
          const isMatchingCurrentCrop = tip.cropApplicability.includes(crop);
          return (
            <div
              key={tip.id}
              className={`p-4 rounded-2xl border transition-all ${
                isMatchingCurrentCrop
                  ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/30 dark:bg-slate-800/90 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {tip.category}
                </span>
                {isMatchingCurrentCrop && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    Recommended for {crop}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {tip.title}
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {tip.description}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Crops: {tip.cropApplicability.join(', ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
