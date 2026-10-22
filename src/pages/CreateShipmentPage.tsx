import React, { useState, useEffect } from 'react';
import { useShipments } from '../context/ShipmentContext';
import { evaluatePinEligibility, INTERNATIONAL_COUNTRIES } from '../data/serviceAreas';
import type { CargoCategory, DeliveryType, ServiceEligibilityResult } from '../types/logistics';
import { 
  Building2, 
  Home, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Package, 
  User, 
  ArrowRight,
  ShieldAlert,
  Info,
  Globe
} from 'lucide-react';

export const CreateShipmentPage: React.FC = () => {
  const { createShipment, setCurrentView, setSelectedTrackingId } = useShipments();

  // Clean form states for manual user data entry
  const [senderName, setSenderName] = useState('');
  const [senderCompany, setSenderCompany] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderCity, setSenderCity] = useState('');
  const [senderCountry, setSenderCountry] = useState('India');
  const [senderPin, setSenderPin] = useState('');

  const [receiverName, setReceiverName] = useState('');
  const [receiverCompany, setReceiverCompany] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverCity, setReceiverCity] = useState('Dubai');
  const [receiverCountry, setReceiverCountry] = useState('United Arab Emirates');
  const [receiverPin, setReceiverPin] = useState('00000');

  const [category, setCategory] = useState<CargoCategory>('Industrial Machinery');
  const [weightKg, setWeightKg] = useState<string>('');
  const [pieces, setPieces] = useState<string>('1');
  const [dimensions, setDimensions] = useState('');
  const [declaredValue, setDeclaredValue] = useState<string>('');
  const [description, setDescription] = useState('');

  // Live service eligibility evaluation
  const [eligibility, setEligibility] = useState<ServiceEligibilityResult | null>(null);

  // Success modal
  const [createdTrackingId, setCreatedTrackingId] = useState<string | null>(null);

  // Recalculate eligibility whenever receiver PIN or Country changes
  useEffect(() => {
    if (receiverCountry !== 'India') {
      const result = evaluatePinEligibility(receiverPin.trim() || 'INTL-PORT', receiverCountry);
      setEligibility(result);
      if (result.city && !receiverCity) {
        setReceiverCity(result.city);
      }
    } else if (receiverPin.trim().length === 6) {
      const result = evaluatePinEligibility(receiverPin.trim(), 'India');
      setEligibility(result);
      if (result.city && result.city !== 'Unregistered Territory' && !receiverCity) {
        setReceiverCity(result.city);
      }
    } else {
      setEligibility(null);
    }
  }, [receiverPin, receiverCity, receiverCountry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eligibility) {
      alert('Please enter a valid destination city/PIN code.');
      return;
    }

    // Check delivery business rule
    if (eligibility.status === 'UNSUPPORTED_AREA' && !eligibility.eligibleHub) {
      alert('Cannot create booking: This postal PIN code is currently outside automated delivery and hub network.');
      return;
    }

    const isLocationUnavail = !eligibility.homeDeliveryAvailable || eligibility.status === 'COVERED_HUB_ONLY';
    const deliveryType: DeliveryType = isLocationUnavail ? 'HUB_PICKUP' : 'HOME_DELIVERY';

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (receiverCountry === 'India' ? 2 : 5));

    const newShipment = createShipment({
      estimatedArrival: estimatedDate.toISOString(),
      deliveryType,
      category,
      weightKg: parseFloat(weightKg) || 15.0,
      pieces: parseInt(pieces, 10) || 1,
      dimensions: dimensions || 'Standard Freight Box',
      declaredValueInr: parseFloat(declaredValue) || 25000,
      contentsDescription: description || `${category} Consignment`,
      isLocationUnavailable: isLocationUnavail,
      locationUnavailableReason: isLocationUnavail
        ? 'Delivery location unavailable / out of doorstep courier zone. Customer must collect at nearby warehouse.'
        : undefined,
      sender: {
        name: senderName,
        company: senderCompany,
        phone: senderPhone,
        email: senderEmail,
        address: senderAddress,
        city: senderCity,
        state: senderCountry === 'India' ? 'Telangana / Andhra Pradesh' : 'Origin Export Region',
        country: senderCountry,
        pinCode: senderPin,
      },
      receiver: {
        name: receiverName,
        company: receiverCompany,
        phone: receiverPhone,
        email: receiverEmail,
        address: receiverAddress,
        city: receiverCity,
        state: receiverCountry === 'India' ? 'Telangana / Andhra Pradesh' : `${receiverCountry} Destination Port`,
        country: receiverCountry,
        pinCode: receiverPin,
      },
      route: {
        originCity: senderCity,
        originHub: `${senderCity || 'Origin'} Central Freight Hub`,
        transitCorridor: `${senderCity} (${senderCountry}) to ${receiverCity} (${receiverCountry}) Cross-Border Corridor`,
        destinationHub: eligibility.eligibleHub ? eligibility.eligibleHub.name : `${receiverCity} Regional Gateway`,
        destinationCity: receiverCity,
        currentMilestone: `${senderCity} Commercial Booking Desk`,
        distanceKm: receiverCountry === 'India' ? 275 : 2450,
      },
      assignedHub: eligibility.eligibleHub || undefined,
    });

    setCreatedTrackingId(newShipment.id);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
            Manual Consignment Registration
          </span>
          <span className="text-slate-400 text-xs">• Intelligent PIN Routing</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Create Shipment
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter cargo details manually. As you enter the destination PIN code, Speed Logistics automatically verifies coverage against doorstep delivery fleets and authorized regional hubs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* International Shipping Rule Banner */}
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 border border-purple-200/80 rounded-2xl p-4 text-xs text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <strong className="font-bold text-slate-900 block text-xs">Cross-Border International Cargo Pipeline:</strong>
              <p className="text-slate-600 mt-0.5">
                Shipments travel across countries. Origin warehouse staff physically inspects cargo, clears customs, and fixes the outbound transit mode: <strong>✈️ Air Freight Flight</strong>, <strong>🚢 Ocean Cargo Ship</strong>, <strong>🚆 Freight Train</strong>, or <strong>🚛 Cross-Border Road Hauler</strong>.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 font-semibold text-[11px] text-purple-700 bg-white/80 px-3 py-1.5 rounded-lg border border-purple-200">
            <span>✈️ Air</span>
            <span>•</span>
            <span>🚢 Ocean</span>
            <span>•</span>
            <span>🚆 Rail</span>
            <span>•</span>
            <span>🚛 Road</span>
          </div>
        </div>

        {/* Step 1: Sender & Receiver Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Consignor / Sender Details</h3>
                <p className="text-[11px] text-slate-500">Origin pickup facility & contact person</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Origin Country *</label>
                  <select
                    value={senderCountry}
                    onChange={(e) => setSenderCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {INTERNATIONAL_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Origin City *</label>
                  <input
                    type="text"
                    required
                    value={senderCity}
                    onChange={(e) => setSenderCity(e.target.value)}
                    placeholder="e.g. Vijayawada / Hyderabad"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sender Name *</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Ram Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={senderCompany}
                    onChange={(e) => setSenderCompany(e.target.value)}
                    placeholder="e.g. AP Precision Tools"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="e.g. +91 98490 12345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Origin Postal / PIN *</label>
                  <input
                    type="text"
                    required
                    value={senderPin}
                    onChange={(e) => setSenderPin(e.target.value)}
                    placeholder="e.g. 520010"
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. sender@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pickup Facility Address *</label>
                <input
                  type="text"
                  required
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="e.g. Plot 18, Industrial Estate, Autonagar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Receiver Card with Live PIN Evaluation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Consignee / Destination Details</h3>
                <p className="text-[11px] text-slate-500">Destination address & automatic routing check</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Quick Country Destination Presets */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Popular International Trade Corridors:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setReceiverCountry('United Arab Emirates');
                      setReceiverCity('Dubai');
                      setReceiverPin('00000');
                      setReceiverAddress('Jebel Ali Free Zone Authority (JAFZA) Dock 8');
                      setReceiverName('Emirates Global Imports LLC');
                    }}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    🇦🇪 Dubai, UAE (Al Maktoum / Jebel Ali)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiverCountry('Singapore');
                      setReceiverCity('Singapore');
                      setReceiverPin('819830');
                      setReceiverAddress('Megacard Logistics Hub, Changi South Ave 2');
                      setReceiverName('Pacific Ocean Trade Pte Ltd');
                    }}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    🇸🇬 Singapore (Changi Airfreight)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiverCountry('Germany');
                      setReceiverCity('Frankfurt');
                      setReceiverPin('60549');
                      setReceiverAddress('CargoCity Sued, Gebaeude 543');
                      setReceiverName('Bavaria Tech Distribution GmbH');
                    }}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    🇩🇪 Frankfurt, Germany (CargoCity)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiverCountry('India');
                      setReceiverCity('Hyderabad');
                      setReceiverPin('500081');
                      setReceiverAddress('Mindspace IT Park, Hitec City');
                      setReceiverName('CyberTech Labs');
                    }}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    🇮🇳 India (Hyderabad Hitec City)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Country *</label>
                  <select
                    value={receiverCountry}
                    onChange={(e) => {
                      const c = e.target.value;
                      setReceiverCountry(c);
                      if (c === 'United Arab Emirates') {
                        setReceiverCity('Dubai');
                        setReceiverPin('00000');
                        setReceiverAddress('Jebel Ali Free Zone, Warehouse 14');
                      } else if (c === 'Singapore') {
                        setReceiverCity('Singapore');
                        setReceiverPin('819830');
                        setReceiverAddress('Changi South Ave 2, Megacard Logistics Hub');
                      } else if (c === 'Germany') {
                        setReceiverCity('Frankfurt');
                        setReceiverPin('60549');
                        setReceiverAddress('CargoCity Sued, Gebaeude 543');
                      } else if (c === 'United States') {
                        setReceiverCity('New York');
                        setReceiverPin('11430');
                        setReceiverAddress('JFK Cargo Terminal 7, Rockaway Blvd');
                      } else if (c === 'India') {
                        setReceiverCity('Hyderabad');
                        setReceiverPin('500081');
                        setReceiverAddress('Hitec City, Cyber Gateway Phase 2');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {INTERNATIONAL_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination City *</label>
                  <input
                    type="text"
                    required
                    value={receiverCity}
                    onChange={(e) => setReceiverCity(e.target.value)}
                    placeholder="e.g. Dubai / Frankfurt / Singapore"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="e.g. CyberTech Labs"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={receiverCompany}
                    onChange={(e) => setReceiverCompany(e.target.value)}
                    placeholder="e.g. CyberTech Systems"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Phone *</label>
                  <input
                    type="tel"
                    required
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="e.g. +971 4 881 2222"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal PIN / Port Code *</label>
                  <input
                    type="text"
                    required
                    value={receiverPin}
                    onChange={(e) => setReceiverPin(e.target.value)}
                    placeholder="e.g. 00000 or 500081"
                    className="w-full px-3 py-2 font-mono text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Email (Optional)</label>
                <input
                  type="email"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  placeholder="e.g. import@consignee.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street / Port Terminal Address *</label>
                <input
                  type="text"
                  required
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  placeholder="e.g. Jebel Ali Port Dock 8 / Mindspace IT Park"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Automatic Eligibility Callout Card */}
        {eligibility && (
          <div
            className={`p-5 rounded-2xl border transition-all ${
              eligibility.status === 'COVERED_HOME'
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : eligibility.status === 'COVERED_HUB_ONLY'
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : 'bg-rose-50/70 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {eligibility.status === 'COVERED_HOME' ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : eligibility.status === 'COVERED_HUB_ONLY' ? (
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    {eligibility.status === 'COVERED_HOME' && (
                      <span>Direct Doorstep Delivery Guaranteed</span>
                    )}
                    {eligibility.status === 'COVERED_HUB_ONLY' && (
                      <span>Home Delivery Unavailable — Regional Hub Fallback Applied</span>
                    )}
                    {eligibility.status === 'UNSUPPORTED_AREA' && (
                      <span>Out of Service Coverage — Booking Blocked</span>
                    )}
                  </h4>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      eligibility.status === 'COVERED_HOME'
                        ? 'bg-emerald-200/60 text-emerald-900'
                        : eligibility.status === 'COVERED_HUB_ONLY'
                        ? 'bg-amber-200/60 text-amber-900'
                        : 'bg-rose-200/60 text-rose-900'
                    }`}
                  >
                    {eligibility.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs mt-1.5 leading-relaxed">{eligibility.message}</p>

                {eligibility.status === 'COVERED_HOME' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-200 text-xs flex items-center gap-2 text-emerald-900 font-medium">
                    <Home className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Rule Compliance: Customer will receive doorstep delivery directly. System does not ask customer to choose.
                    </span>
                  </div>
                )}

                {eligibility.status === 'COVERED_HUB_ONLY' && eligibility.eligibleHub && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-100/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Building2 className="w-4 h-4 text-amber-700" />
                      <span>Allocated Holding Hub: {eligibility.eligibleHub.name}</span>
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Address: {eligibility.eligibleHub.address} • Operating: {eligibility.eligibleHub.operatingHours}
                    </div>
                  </div>
                )}

                {eligibility.status === 'UNSUPPORTED_AREA' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-100/70 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>
                      Rule Compliance: Prevents false bookings for unserviced zones. Please contact Enterprise Freight Desk at 1800-SPEED-GO.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Cargo Specifications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cargo & Consignment Specifications</h3>
              <p className="text-[11px] text-slate-500">Weight, piece count, description, and value</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cargo Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CargoCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Industrial Machinery">Industrial Machinery</option>
                <option value="High-Tech Electronics">High-Tech Electronics</option>
                <option value="Commercial Documents">Commercial Documents</option>
                <option value="Automotive Spares">Automotive Spares</option>
                <option value="Pharmaceuticals & Health">Pharmaceuticals & Health</option>
                <option value="Retail & Apparel">Retail & Apparel</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gross Weight (kg) *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 45.0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package Pieces *</label>
              <input
                type="number"
                min="1"
                required
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                placeholder="e.g. 2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Declared Value (INR ₹) *</label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                placeholder="e.g. 120000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dimensions (L x W x H)</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 80 x 60 x 50 cm"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contents Description *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Precision CNC Motors and Sensors"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500">
            {eligibility?.status === 'UNSUPPORTED_AREA' ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Booking disabled: Destination PIN is outside service network
              </span>
            ) : !eligibility ? (
              <span className="text-slate-500">
                Enter a 6-digit destination PIN code above to activate waybill booking
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Ready to register consignment and generate waybill
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!eligibility || eligibility.status === 'UNSUPPORTED_AREA'}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all ${
              !eligibility || eligibility.status === 'UNSUPPORTED_AREA'
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-900/30 hover:scale-[1.02]'
            }`}
          >
            <span>Confirm & Issue Waybill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Booking Confirmation Dialog Modal */}
      {createdTrackingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Consignment Created & Registered
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Tracking ID: <span className="font-mono text-brand-600">{createdTrackingId}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your consignment is now saved in the system. The next step is for the courier to pick it up from sender and bring it to the origin warehouse for staff approval.
              </p>
            </div>

            <div className="my-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Route:</span>
                <span className="font-semibold text-slate-800">{senderCity || 'Origin'} → {receiverCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfillment Mode:</span>
                <span className="font-semibold text-slate-800">
                  {eligibility?.homeDeliveryAvailable ? 'Doorstep Home Delivery' : 'Regional Hub Pickup'}
                </span>
              </div>
              {eligibility?.eligibleHub && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocated Hub:</span>
                  <span className="font-semibold text-slate-800">{eligibility.eligibleHub.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-blue-700 font-mono">BOOKED (Awaiting Sender Pickup)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setSelectedTrackingId(createdTrackingId);
                  setCurrentView('warehouse');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors text-center"
              >
                Go to Warehouse Operations
              </button>
              <button
                onClick={() => {
                  setSelectedTrackingId(createdTrackingId);
                  setCurrentView('track');
                }}
                className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors text-center"
              >
                Track Shipment
              </button>
              <button
                onClick={() => {
                  setCreatedTrackingId(null);
                  setCurrentView('dashboard');
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors text-center"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
