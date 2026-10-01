/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { MobileTabBar } from './components/common/MobileTabBar';
import { Toast } from './components/common/Toast';
import { OfflineBanner } from './components/common/OfflineBanner';
import { KrishiMitraModal } from './components/chat/KrishiMitraModal';

import { LandingPage } from './pages/LandingPage';
import { FarmerPage } from './pages/FarmerPage';
import { OfficerDashboardPage } from './pages/OfficerDashboardPage';
import { SmsSimulatorPage } from './pages/SmsSimulatorPage';
import { InsurancePage } from './pages/InsurancePage';
import { AboutPage } from './pages/AboutPage';
import { ChatPage } from './pages/ChatPage';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAAoNTNBsb_JVxs9YCm9STK3YkcqI4ymz4';

export default function App() {
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} solutionChannel="gmp_mcp_codeassist_v1_aistudio">
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#fafaf5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            {/* Google Maps Quota Warning Banner */}
            {gmpQuotaExceeded && (
              <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
                <span>
                  Google Maps Platform quota reached. If you are the app owner, visit{' '}
                  <a
                    href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold text-amber-950 hover:text-amber-800"
                  >
                    maps developer site
                  </a>{' '}
                  for instructions to update your account.
                </span>
              </div>
            )}

            {/* Offline warning bar */}
            <OfflineBanner />

            {/* Desktop & Mobile Navbar */}
            <Navbar />

            {/* Main Route Content */}
            <main className="flex-1 pb-20 lg:pb-10">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/farmer" element={<FarmerPage />} />
                <Route path="/officer" element={<OfficerDashboardPage />} />
                <Route path="/sms" element={<SmsSimulatorPage />} />
                <Route path="/insurance" element={<InsurancePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Sticky Bottom Tab Bar on Mobile */}
            <MobileTabBar />

            {/* Global Floating AI Chatbot Modal */}
            <KrishiMitraModal />

            {/* Global Toast Notifications */}
            <Toast />
          </div>
        </BrowserRouter>
      </AppProvider>
    </APIProvider>
  );
}
