import React, { useState } from 'react';
import { useShipments } from '../context/ShipmentContext';
import { Search, HelpCircle, X, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenPublishGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPublishGuide }) => {
  const { 
    setSelectedTrackingId, 
    setCurrentView,
    isCloudSyncing,
    cloudSyncStatus,
    syncWithCloud
  } = useShipments();

  const [inputVal, setInputVal] = useState('');
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSelectedTrackingId(inputVal.trim());
    setCurrentView('track');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Prototype Telemetry Warning Ribbon */}
      {showDemoBanner && (
        <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-indigo-950 text-white text-[11px] px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-cyan-300">DEMO PROTOTYPE NOTICE:</span>
            <span className="text-slate-300 hidden sm:inline">
              Simulated telemetry & synthetic GPS checkpoints. All tracking data, ETAs, and service eligibility are local demo records.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPublishGuide}
              className="text-cyan-300 hover:text-white underline underline-offset-2 font-medium flex items-center gap-1"
            >
              <span>Publishing Guide</span>
            </button>
            <button
              onClick={() => setShowDemoBanner(false)}
              className="text-slate-400 hover:text-white"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Global Tracking Quick Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Quick track consignment (e.g. SL-HYD-1234)..."
              className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Track
            </button>
          </div>
        </form>

        {/* Quick Operations Shortcuts */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <button
            onClick={() => setCurrentView('create')}
            className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-md font-bold border border-brand-200 transition-colors"
          >
            + New Shipment
          </button>
          <button
            onClick={() => setCurrentView('warehouse')}
            className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md font-semibold border border-purple-200 transition-colors"
          >
            Warehouse Inward & Approvals
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Cloud Multi-Device Live Sync Status */}
          <button
            onClick={() => syncWithCloud()}
            title="Real-time Multi-Device Cloud Sync: All shipments are synchronized live across users and devices. Click to force instant refresh."
            className="flex items-center gap-2 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-900 rounded-lg px-2.5 py-1.5 transition-colors text-xs shadow-sm"
          >
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${cloudSyncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' : cloudSyncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : 'bg-rose-500'}`} />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 block leading-tight">Multi-Device Sync</span>
              <span className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
                {cloudSyncStatus === 'synced' && 'Cloud Active (Shared)'}
                {cloudSyncStatus === 'syncing' && 'Syncing updates...'}
                {cloudSyncStatus === 'error' && 'Reconnecting...'}
                {cloudSyncStatus === 'offline' && 'Local Offline'}
              </span>
            </div>
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ml-1 ${isCloudSyncing ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-left text-xs">
              <span className="text-slate-500 text-[10px] block leading-none">Console Role</span>
              <span className="font-semibold text-slate-800 text-xs">Dispatch Officer</span>
            </div>
          </div>

          <button
            onClick={onOpenPublishGuide}
            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Publishing Instructions & Demo Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
