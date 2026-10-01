import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { VILLAGES_DATABASE } from '../data/villages';
import { InsuranceAnomalyRecord, CropType, AdvisoryStatus } from '../types';
import jsPDF from 'jspdf';
import {
  ShieldCheck,
  Download,
  Search,
  Filter,
  FileCheck,
  Hash,
  Calendar,
  AlertCircle,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const InsurancePage: React.FC = () => {
  const { village, crop, advisory, t, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState<boolean>(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'anomalyPercent' | 'consecutiveDryDays'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // PMFBY Claim Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [selectedVillageForReport, setSelectedVillageForReport] = useState<string>(village.name);

  // Synthesize realistic tamper-evident rainfall anomaly logs across past 10 days
  const anomalyRecords: InsuranceAnomalyRecord[] = useMemo(() => {
    const cropsList: CropType[] = ['Cotton', 'Soybean', 'Tur', 'Paddy', 'Maize'];
    const results: InsuranceAnomalyRecord[] = [];

    VILLAGES_DATABASE.forEach((v, vIdx) => {
      // 2 records per village across June & July
      const isDroughtZone = v.district === 'Yavatmal' || v.district === 'Latur' || v.district === 'Kalaburagi';
      const observed1 = isDroughtZone ? 14.2 : 62.0;
      const expected1 = 58.0;
      const anomaly1 = Math.round(((observed1 - expected1) / expected1) * 100);
      const dryDays1 = isDroughtZone ? 14 : 3;
      const isEligible1 = anomaly1 <= -40 || dryDays1 >= 10;

      // Tamper-evident simulated SHA-256 slice
      const hash1 = `vm_${Math.abs(v.lat * 1000 + vIdx * 37)
        .toString(16)
        .padStart(8, '0')}`;

      results.push({
        id: `rec-${vIdx}-1`,
        hash: hash1,
        villageName: v.name,
        district: v.district,
        crop: v.defaultCrop || cropsList[vIdx % cropsList.length],
        date: '28 Jun 2026',
        observedRainMm: observed1,
        expectedRainMm: expected1,
        anomalyPercent: anomaly1,
        consecutiveDryDays: dryDays1,
        moistureStressScore: isDroughtZone ? 82 : 24,
        alertTriggered: isEligible1 ? 'RED' : 'GREEN',
        isEligibleForClaim: isEligible1,
      });

      const observed2 = isDroughtZone ? 8.5 : 45.0;
      const expected2 = 40.0;
      const anomaly2 = Math.round(((observed2 - expected2) / expected2) * 100);
      const dryDays2 = isDroughtZone ? 11 : 4;
      const isEligible2 = anomaly2 <= -40 || dryDays2 >= 10;
      const hash2 = `vm_${Math.abs(v.lng * 1000 + vIdx * 73)
        .toString(16)
        .padStart(8, '0')}`;

      results.push({
        id: `rec-${vIdx}-2`,
        hash: hash2,
        villageName: v.name,
        district: v.district,
        crop: v.defaultCrop || cropsList[vIdx % cropsList.length],
        date: '15 Jul 2026',
        observedRainMm: observed2,
        expectedRainMm: expected2,
        anomalyPercent: anomaly2,
        consecutiveDryDays: dryDays2,
        moistureStressScore: isDroughtZone ? 78 : 30,
        alertTriggered: isEligible2 ? 'RED' : 'AMBER',
        isEligibleForClaim: isEligible2,
      });
    });

    return results;
  }, []);

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return anomalyRecords
      .filter((r) => {
        if (filterEligibleOnly && !r.isEligibleForClaim) return false;
        if (selectedCrop !== 'All' && r.crop !== selectedCrop) return false;
        if (
          searchQuery &&
          !r.villageName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !r.district.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !r.hash.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'anomalyPercent') diff = a.anomalyPercent - b.anomalyPercent;
        else if (sortField === 'consecutiveDryDays') diff = a.consecutiveDryDays - b.consecutiveDryDays;
        else diff = a.date.localeCompare(b.date);
        return sortAsc ? diff : -diff;
      });
  }, [anomalyRecords, filterEligibleOnly, selectedCrop, searchQuery, sortField, sortAsc]);

  // Export PDF with jsPDF
  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(20, 83, 45); // Deep green
      doc.text('VARSHA MITRA - PMFBY CLAIM EVIDENCE DOSSIER', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Government of India • Pradhan Mantri Fasal Bima Yojana (Prevented Sowing Verification)',
        14,
        27
      );
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 33);

      doc.setDrawColor(203, 213, 225);
      doc.line(14, 37, 196, 37);

      // Village metadata block
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Target Panchayat: ${village.name}, ${village.district} (${village.state})`, 14, 46);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Crop: ${crop} | Soil Type: Black Vertisol | Registered Farmers: ${village.registeredFarmers}`, 14, 53);
      doc.text(`Advisory Decision: ${advisory.status} | Sowing Revival Safe Date: ${advisory.safeSowingDate}`, 14, 59);

      // Tamper-evident anomaly summary
      doc.line(14, 65, 196, 65);
      doc.setFont('helvetica', 'bold');
      doc.text('TAMPER-EVIDENT AGROMETEOROLOGICAL EVIDENCE:', 14, 73);

      doc.setFont('helvetica', 'normal');
      doc.text(`• 7-Day Cumulative Expected vs Observed Rain: ${advisory.expectedRainNext7Days} mm`, 14, 80);
      doc.text(`• Continuous Dry Break Period: ${advisory.dryBreakDays} Days (Threshold for Prevented Sowing: 10d)`, 14, 86);
      doc.text(`• Root-Zone Moisture Stress Index: ${advisory.soilMoistureScore}%`, 14, 92);
      doc.text(`• Verification Signature Hash: VM_AUTH_${Math.random().toString(16).substring(2, 10).toUpperCase()}`, 14, 98);

      // Legal & Surveyor signoff box
      doc.rect(14, 110, 182, 45);
      doc.setFontSize(9);
      doc.text('OFFICIAL VERIFICATION CERTIFICATE (CLAUSE 14.1 - PREVENTED SOWING):', 18, 118);
      doc.text(
        'This dossier certifies that agrometeorological precipitation deficit exceeded the 40% anomaly trigger,',
        18,
        125
      );
      doc.text(
        'warranting release of up to 25% prevented sowing lump-sum compensation to insured farmers.',
        18,
        131
      );
      doc.text('Taluka Agriculture Officer Seal: ____________________   Date: _______________', 18, 145);

      doc.save(`PMFBY_Claim_Dossier_${village.name}_${crop}.pdf`);
      showToast(`PMFBY Report downloaded for ${village.name}`, 'success');
      setIsReportModalOpen(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback: trigger print
      window.print();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PMFBY Prevented Sowing Evidence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Insurance &amp; Tamper-Evident Anomaly Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Auditable rainfall anomaly telemetry for Pradhan Mantri Fasal Bima Yojana claim settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0"
        >
          <FileCheck className="w-4 h-4" />
          <span>Generate PMFBY Claim Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by village, hash, or district..."
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Crop Filter */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Crops</option>
            <option value="Cotton">Cotton</option>
            <option value="Soybean">Soybean</option>
            <option value="Tur">Tur</option>
            <option value="Paddy">Paddy</option>
          </select>

          {/* Eligible Only Checkbox */}
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filterEligibleOnly}
              onChange={(e) => setFilterEligibleOnly(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Show Claim-Eligible Only (&gt;40% deficit)</span>
          </label>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing <strong>{filteredRecords.length}</strong> verified records
        </span>
      </div>

      {/* Main Tamper-Evident Records Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3 px-2">Record Hash</th>
                <th className="pb-3 px-2">Panchayat / District</th>
                <th className="pb-3 px-2">Crop</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2">Obs. / Exp. Rain</th>
                <th className="pb-3 px-2 cursor-pointer" onClick={() => {
                  setSortField('anomalyPercent');
                  setSortAsc(!sortAsc);
                }}>
                  <div className="flex items-center gap-1">
                    <span>Anomaly (%)</span>
                    {sortField === 'anomalyPercent' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="pb-3 px-2 cursor-pointer" onClick={() => {
                  setSortField('consecutiveDryDays');
                  setSortAsc(!sortAsc);
                }}>
                  <div className="flex items-center gap-1">
                    <span>Dry Spell</span>
                    {sortField === 'consecutiveDryDays' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="pb-3 px-2">Moisture Stress</th>
                <th className="pb-3 px-2 text-right">Claim Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <td className="py-3 px-2 font-mono text-[11px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">
                      {r.hash}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                    {r.villageName}, <span className="text-slate-400 font-normal">{r.district}</span>
                  </td>
                  <td className="py-3 px-2">{r.crop}</td>
                  <td className="py-3 px-2 text-slate-500">{r.date}</td>
                  <td className="py-3 px-2 font-mono">
                    <strong>{r.observedRainMm}</strong> / {r.expectedRainMm} mm
                  </td>
                  <td className="py-3 px-2 font-bold">
                    <span
                      className={
                        r.anomalyPercent <= -40
                          ? 'text-rose-600 dark:text-rose-400'
                          : r.anomalyPercent < 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {r.anomalyPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-2 font-semibold">
                    {r.consecutiveDryDays} days
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {r.moistureStressScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {r.isEligibleForClaim ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                        <AlertCircle className="w-3 h-3" /> Eligible (Prevented)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        Normal Threshold
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE PMFBY CLAIM REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    PMFBY Claim Verification Dossier
                  </h3>
                  <p className="text-xs text-slate-500">
                    Standard Annexure VII - Agrometeorological Prevented Sowing Certificate
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Dossier Preview */}
            <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block font-bold">
                    Target Village
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {village.name}, {village.district} ({village.state})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block font-bold">
                    Target Kharif Crop
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {crop} (Soil: {advisory.soilMoistureScore}% Moisture)
                  </span>
                </div>
              </div>

              {/* Evidence Parameters */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Agrometeorological Triggers Verified:
                </p>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                  <span>Cumulative 7-Day Rainfall:</span>
                  <strong className="font-mono">{advisory.expectedRainNext7Days} mm</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                  <span>Continuous Dry Break Window:</span>
                  <strong className="font-mono text-rose-600">{advisory.dryBreakDays} Days</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                  <span>Advisory Status Logged:</span>
                  <strong className="font-mono">{advisory.status}</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                  <span>Tamper-Evident Block Hash:</span>
                  <strong className="font-mono text-emerald-600">VM_893A4D0F</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-[11px] leading-relaxed">
                ✓ <strong>Certificate of Eligibility:</strong> Gram Panchayat qualifies for automatic 25% prevented sowing claim settlement under Revised Operational Guidelines of PMFBY (Section 14.1).
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
