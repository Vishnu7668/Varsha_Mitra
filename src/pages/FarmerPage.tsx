import React from 'react';
import { SetupCard } from '../components/farmer/SetupCard';
import { DistrictWeatherWidget } from '../components/farmer/DistrictWeatherWidget';
import { AdvisoryHeroCard } from '../components/farmer/AdvisoryHeroCard';
import { RainfallChart } from '../components/farmer/RainfallChart';
import { AgriIntelligenceHub } from '../components/farmer/AgriIntelligenceHub';
import { MetricsGauges } from '../components/farmer/MetricsGauges';
import { FarmingTips } from '../components/farmer/FarmingTips';
import { PolicyHub } from '../components/farmer/PolicyHub';
import { AlertHistory } from '../components/farmer/AlertHistory';

export const FarmerPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* 1. Setup Form with Cascading Selectors */}
      <SetupCard />

      {/* 2. Real-Time District Weather Widget (Rainfall & Humidity via External API) */}
      <DistrictWeatherWidget />

      {/* 3. Main Traffic-Light Advisory Hero Card */}
      <AdvisoryHeroCard />

      {/* 4. Metrics Gauges (Radial confidence, Continuous dry days, Soil moisture stress) */}
      <MetricsGauges />

      {/* 5. 30-Day Outlook Chart with Past 10 Days Observed Toggle */}
      <RainfallChart />

      {/* 6. Real-Time Agri Intelligence Hub (Google Maps & Google Search Grounding) */}
      <AgriIntelligenceHub />

      {/* 7. Farming Tips Filterable Cards */}
      <FarmingTips />

      {/* 8. PMFBY Crop Insurance & Policy Hub */}
      <PolicyHub />

      {/* 9. Alert History Timeline */}
      <AlertHistory />
    </div>
  );
};
