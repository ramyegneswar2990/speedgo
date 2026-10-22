import React, { useState } from 'react';
import { ShipmentProvider, useShipments } from './context/ShipmentContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { CreateShipmentPage } from './pages/CreateShipmentPage';
import { TrackShipmentPage } from './pages/TrackShipmentPage';
import { WarehouseOpsPage } from './pages/WarehouseOpsPage';
import { ShipmentDetailsPage } from './pages/ShipmentDetailsPage';
import { PublishGuideModal } from './components/PublishGuideModal';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView } = useShipments();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'create':
        return <CreateShipmentPage />;
      case 'track':
        return <TrackShipmentPage />;
      case 'warehouse':
        return <WarehouseOpsPage />;
      case 'details':
        return <ShipmentDetailsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen flex bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen flex-col shrink-0">
        <Sidebar onOpenPublishGuide={() => setIsPublishModalOpen(true)} />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full flex flex-col">
            <Sidebar onOpenPublishGuide={() => {
              setIsPublishModalOpen(true);
              setIsMobileMenuOpen(false);
            }} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden bg-cargo-navy text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-extrabold text-sm tracking-tight">Speed Logistics</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            DEMO
          </span>
        </div>

        {/* Global Desktop Header */}
        <Header onOpenPublishGuide={() => setIsPublishModalOpen(true)} />

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Publish & Presentation Guide Modal */}
      <PublishGuideModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ShipmentProvider>
      <AppContent />
    </ShipmentProvider>
  );
}

export default App;
