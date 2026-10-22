import React from 'react';
import { 
  Sparkles, 
  X, 
  Layers, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishGuideModal: React.FC<PublishGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Prototype Presentation & Publishing Guide</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                  Lovable Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Speed Logistics — Real-Time Cargo Tracking System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mt-4 text-xs">
          {/* Executive Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Manager Presentation Highlights (3 Core Demonstrable Workflows)</span>
            </h4>
            <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
              <li>
                <strong>Workflow 1 — Live Corridor Tracking:</strong> Preloaded Vijayawada to Hyderabad linehaul run (<code className="font-mono font-bold bg-white px-1 rounded border">SL-VJA-5021</code>) with animated milestone telemetry and reverse event audit log.
              </li>
              <li>
                <strong>Workflow 2 — Automated PIN Eligibility Engine:</strong> PIN 500081 guarantees direct doorstep delivery without prompting the user. PIN 522002 falls back to Guntur Regional Hub. PIN 506381 warns customer and disables booking for out-of-network zones.
              </li>
              <li>
                <strong>Workflow 3 — Hub Verification & Collection Handover:</strong> Hub staff inspects arrived cargo (<code className="font-mono bg-white px-1 rounded border">SL-GUN-3104</code>) before marking Ready for Pickup. Staff verifies Reference & OTP (<code className="font-mono bg-white px-1 rounded border">SL-HYD-7720</code>) before confirming collection.
              </li>
            </ul>
          </div>

          {/* Lovable Publishing Instructions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-cyan-600" />
              <span>How to Publish this Prototype to Lovable</span>
            </h4>

            <div className="space-y-2 text-slate-600 leading-relaxed">
              <p>
                This project is structured as a standard, self-contained Vite + React + TypeScript + Tailwind CSS application, making it 100% compatible with <strong>Lovable</strong>, <strong>GitHub</strong>, and <strong>Vercel/Netlify</strong>.
              </p>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2">
                <div className="text-slate-400 font-sans font-semibold">Option A: Import into Lovable via GitHub</div>
                <div className="text-cyan-300"># 1. Initialize git and commit code</div>
                <div>git init</div>
                <div>git add .</div>
                <div>git commit -m "feat: Speed Logistics Cargo Tracking prototype"</div>
                <div className="text-cyan-300"># 2. Push to your GitHub repository</div>
                <div>git remote add origin https://github.com/YOUR_USERNAME/speed-logistics-proto.git</div>
                <div>git push -u origin main</div>
                <div className="text-cyan-300"># 3. In Lovable.dev, select "Import from GitHub" and select this repo!</div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2">
                <div className="text-slate-400 font-sans font-semibold">Option B: Instant Local Preview for the Presentation</div>
                <div className="text-cyan-300"># Start dev server locally on port 5173</div>
                <div>npm run dev</div>
                <div className="text-slate-400 font-sans">Open http://localhost:5173 in browser for full presentation demo.</div>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Zero Backend Required:</strong> All state mutations and workflows persist in browser <code>localStorage</code>. Any updates (new shipments, status advancements, confirmed pickups) remain intact across page reloads. Click "Reset Demo" at any time to return to initial presentation state.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
