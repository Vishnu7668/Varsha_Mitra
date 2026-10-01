/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#fafaf5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
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
  );
}
