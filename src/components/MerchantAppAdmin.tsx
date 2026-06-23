import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  MapPin, 
  DollarSign, 
  Truck, 
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  Info,
  RefreshCw,
  Sliders,
  Settings,
  AlertTriangle
} from "lucide-react";
import { PricingRule } from "../types";

interface MerchantAppAdminProps {
  rules: PricingRule[];
  onRulesUpdated: () => void;
  triggerApiLog: (log: any) => void;
}

export default function MerchantAppAdmin({ rules, onRulesUpdated, triggerApiLog }: MerchantAppAdminProps) {
  const [newZip, setNewZip] = useState("");
  const [newSurcharge, setNewSurcharge] = useState(150);
  const [newEstimate, setNewEstimate] = useState("3-5 business days");
  const [newNotes, setNewNotes] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    const zipStr = newZip.trim();
    if (!zipStr || zipStr.length !== 5 || !/^\d{5}$/.test(zipStr)) {
      setErrorText("Please specify a valid 5-digit ZIP code.");
      return;
    }

    setIsLoading(true);

    const payload = {
      zipCode: zipStr,
      surcharge: Number(newSurcharge),
      shippingEstimate: newEstimate || "2-5 business days",
      notes: newNotes || "Created manually via Shopify Merchant App portal."
    };

    const startTime = Date.now();
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      const endTime = Date.now();

      triggerApiLog({
        timestamp: new Date().toLocaleTimeString(),
        method: "POST",
        url: "/api/rules",
        requestBody: payload,
        responseStatus: response.status,
        responseBody: data,
        latency: `${endTime - startTime}ms`
      });

      if (response.ok) {
        setSuccessText(`Success! Rule for ZIP ${zipStr} is now live.`);
        setNewZip("");
        setNewNotes("");
        onRulesUpdated();
      } else {
        setErrorText(data.error || "Failed to create rule.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Communication mismatch with rules microservice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (zip: string) => {
    setErrorText("");
    setSuccessText("");
    
    if (!confirm(`Are you sure you want to delete the pricing rule for ZIP code ${zip}?`)) {
      return;
    }

    const startTime = Date.now();
    try {
      const response = await fetch(`/api/rules/${zip}`, {
        method: "DELETE"
      });
      const data = await response.json();
      const endTime = Date.now();

      triggerApiLog({
        timestamp: new Date().toLocaleTimeString(),
        method: "DELETE",
        url: `/api/rules/${zip}`,
        responseStatus: response.status,
        responseBody: data,
        latency: `${endTime - startTime}ms`
      });

      if (response.ok) {
        setSuccessText(`Removed rule for ZIP ${zip}.`);
        onRulesUpdated();
      } else {
        setErrorText(data.error || "Failed to remove pricing rule.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Could not sync rule deletion cleanly with backing App database.");
    }
  };

  // Restore Default Seeds in 1-Click
  const restoreDefaultSeeds = async () => {
    const seeds = [
      { zipCode: "75028", surcharge: 200, shippingEstimate: "3-5 business days (Standard Ground)", notes: "Flower Mound Warehouse Hub" },
      { zipCode: "10001", surcharge: 400, shippingEstimate: "1-2 business days (Priority Urban Express)", notes: "NYC High Density Surcharge" },
      { zipCode: "90210", surcharge: 500, shippingEstimate: "2-4 business days (White Glove Delivery)", notes: "Beverly Hills West Coast Dispatch" }
    ];

    setErrorText("");
    setSuccessText("");
    setIsLoading(true);

    try {
      for (const rule of seeds) {
        await fetch("/api/rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rule)
        });
      }
      setSuccessText("Successfully restored default required assignment values!");
      onRulesUpdated();
    } catch (err) {
      console.error(err);
      setErrorText("Failed to populate standard seeds cleanly.");
    } finally {
      setIsLoading(false);
    }
  };

  // Stats calculation
  const totalRegions = rules.length;
  const avgSurcharge = totalRegions > 0 
    ? Math.round(rules.reduce((sum, r) => sum + r.surcharge, 0) / totalRegions)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 leading-normal font-sans text-gray-800">
      
      {/* Dynamic Summary Cards section */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Active Mapped Regions</span>
            <span className="text-2xl font-black text-gray-900 font-mono mt-1 block">{totalRegions}</span>
          </div>
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Average Location Surcharge</span>
            <span className="text-2xl font-black text-gray-900 font-mono mt-1 block">${avgSurcharge}</span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Microservice Status</span>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1 block">
              <span className="inline-block h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              Live: 200 OK
            </span>
          </div>
          <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* LEFT: Rules table */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="text-slate-800 w-5 h-5" />
              <h3 className="font-bold text-lg text-gray-900">Custom ZIP Code Pricing Rules</h3>
            </div>
            
            <button
              onClick={restoreDefaultSeeds}
              disabled={isLoading}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset To Assignment Defaults
            </button>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Map specific premium target regions to localized surcharges. When a client enters one of these ZIP codes on the storefront, the backend applies the corresponding pricing card on the fly.
          </p>

          {rules.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl space-y-3">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <div>
                <p className="text-sm font-bold text-gray-800">No ZIP rules defined</p>
                <p className="text-xs text-gray-400">Click &apos;Reset To Assignment Defaults&apos; above or fill out the right sidebar to add some.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-gray-100">
                    <th className="py-3.5 px-4 font-bold">Zip Code</th>
                    <th className="py-3.5 px-4 font-bold">Extra Surcharge</th>
                    <th className="py-3.5 px-4 font-bold">Shipping Estimate Option</th>
                    <th className="py-3.5 px-4 font-bold">Internal Admin Notes</th>
                    <th className="py-3.5 px-4 font-bold text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {rules.map((rule) => (
                    <tr key={rule.zipCode} className="hover:bg-slate-50/50">
                      <td className="py-4 px-4 font-black text-slate-950 font-mono flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        {rule.zipCode}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 font-mono text-emerald-600">
                        +${rule.surcharge.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600 truncate max-w-[150px]">
                        {rule.shippingEstimate}
                      </td>
                      <td className="py-4 px-4 text-gray-400 max-w-[200px] truncate" title={rule.notes}>
                        {rule.notes || "—"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteRule(rule.zipCode)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Add Rule Form */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <PlusCircle className="text-indigo-600 w-5 h-5" />
            <h3 className="font-bold text-base text-gray-950">Add Dynamic Rule</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                ZIP Code Mapped Area
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  maxLength={5}
                  value={newZip}
                  onChange={(e) => setNewZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="e.g. 75028"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-xs font-bold font-mono tracking-widest text-slate-850 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Must be a valid 5-character numeric sequence.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Regional Surcharge Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="number"
                  min={0}
                  value={newSurcharge}
                  onChange={(e) => setNewSurcharge(Number(e.target.value))}
                  placeholder="e.g. 200"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-xs font-bold font-mono tracking-wide text-slate-850 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Surcharge is dynamically added to base product variants.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Estimated Shipping Delivery Phrase
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={newEstimate}
                  onChange={(e) => setNewEstimate(e.target.value)}
                  placeholder="e.g. 3-5 business days"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-xs font-medium text-slate-850 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-gray-600">
                Merchant Internal Notes (Optional)
              </label>
              <textarea 
                rows={3}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Describe logistics, warehouse routing, or special freight instructions here."
                className="w-full bg-slate-50 border border-gray-200 rounded-lg p-3 text-xs font-medium text-slate-850 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white"
              />
            </div>

            {successText && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {successText}
              </div>
            )}

            {errorText && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-lg animate-fadeIn">
                ⚠️ {errorText}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || newZip.length < 5}
              className="w-full bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg text-center transition cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving changes..." : "Synchronize & Publish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
