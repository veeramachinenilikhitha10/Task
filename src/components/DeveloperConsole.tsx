import React, { useState } from "react";
import { Terminal, Database, ShieldAlert, Cpu, ArrowRight, Share2, Clipboard, Check } from "lucide-react";
import { ApiCallLog } from "../types";

interface DeveloperConsoleProps {
  logs: ApiCallLog[];
  onClearLogs: () => void;
}

export default function DeveloperConsole({ logs, onClearLogs }: DeveloperConsoleProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const curlExample = `curl -X GET "https://shopify-zip-pricing-engine.app/api/pricing?productId=prod_verdant_table&zipCode=90210" \\
  -H "Accept: application/json"`;

  const liquidExample = `<!-- Shopify Liquid Integration Snippet: sections/product-zip-pricing.liquid -->
<div class="zip-pricing-widget my-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
  <label for="zip-code-input" class="block font-medium text-sm text-gray-700">Enter delivery ZIP code:</label>
  <div class="flex mt-1 gap-2">
    <input type="text" id="zip-code-input" placeholder="e.g. 10001" class="border px-3 py-2 rounded text-sm w-full" />
    <button id="check-price-btn" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-indigo-700">Check Price</button>
  </div>
  <div id="zip-pricing-result" class="mt-3 hidden">
    <p class="text-xs text-gray-500">Estimated Dynamic Area Price:</p>
    <p id="estimated-price" class="text-2xl font-bold text-emerald-600 mt-1"></p>
    <p id="shipping-time" class="text-xs text-gray-600 mt-1"></p>
  </div>
</div>

<script>
  document.getElementById('check-price-btn').addEventListener('click', async () => {
    const zip = document.getElementById('zip-code-input').value;
    const variantId = "{{ product.selected_or_first_available_variant.id }}";
    
    // Shopify App Proxies automatically forward /apps/zip-pricing requests to your secure backend
    const response = await fetch(\`/apps/zip-pricing?productId=prod_verdant_table&zipCode=\${zip}\`);
    const data = await response.json();
    
    if (data.calculatedPrice) {
      document.getElementById('estimated-price').innerText = '$' + Number(data.calculatedPrice).toLocaleString();
      document.getElementById('shipping-time').innerText = 'Est. Shipping: ' + data.shippingEstimate;
      document.getElementById('zip-pricing-result').classList.remove('hidden');
      
      // Optionally update Shopify default product selectors or price DOM elements
      const mainPriceContainer = document.querySelector('.price-item--regular');
      if (mainPriceContainer) {
        mainPriceContainer.innerHTML = '<b>' + '$' + Number(data.calculatedPrice).toLocaleString() + '</b> <span class="text-xs font-normal text-indigo-600">(Dynamic Zip-Code Price)</span>';
      }
    }
  });
</script>`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Architecture & Technical Specs */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="text-indigo-600 w-5 h-5 animate-pulse" />
            <h3 className="font-semibold text-lg text-gray-900">Developer Architecture & Spec</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            In a production Shopify setup, the frontend storefront cannot query third-party APIs directly without triggering CORS issues or exposing sensitive credentials. This application utilizes a standard, production-ready **Shopify App Proxy** architecture.
          </p>

          {/* Graphical Pipeline Map */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 mb-6 font-sans">
            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-4">Interactive System Flow</h4>
            
            <div className="flex flex-col gap-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">Storefront Client</h5>
                  <p className="text-[11px] text-slate-500">Theme extension captures customer ZIP and triggers ajax fetch to Shopify's local endpoint.</p>
                  <code className="inline-block mt-1 text-[11px] bg-slate-200/60 text-indigo-800 px-1 py-0.5 rounded font-mono">fetch("/apps/zip-pricing?zipCode=10001")</code>
                </div>
              </div>

              <div className="w-[1px] h-3 bg-indigo-200 ml-3"></div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">Shopify Proxy Router</h5>
                  <p className="text-[11px] text-slate-500">Shopify proxies the request securely. It dynamically generates a cryptographic signature headers (<code className="font-mono text-[10px]">x-shopify-hmac-sha256</code>) to prevent tampering.</p>
                </div>
              </div>

              <div className="w-[1px] h-3 bg-indigo-200 ml-3"></div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">App Rules Engine (Express Microservice)</h5>
                  <p className="text-[11px] text-slate-500">Your custom Node app processes the input, checks regional databases/mapping rules, and returns standard JSON payload.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                Integration Proxy Endpoint Rule
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                App Proxies are configured in the Shopify Partners dashboard. They route clean URLs on the client's store domain like <code className="font-mono text-purple-700 font-bold bg-purple-50 px-1 rounded">yourstore.myshopify.com/apps/zip-pricing</code> back to your remote Server URL <code className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded">/api/pricing</code> securely with full CORS bypass capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Instructions & Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="text-slate-800 w-5 h-5" />
              <h3 className="font-semibold text-lg text-gray-900">Liquid Code Implementation</h3>
            </div>
            <button 
              onClick={() => copyText(liquidExample, 99)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              {copiedIndex === 99 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-scale" />
                  Copied!
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  Copy Liquid File
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3">Copy this Shopify Theme Liquid snippet to add the dynamic widget directly under the price placeholder in your product templates.</p>
          <pre className="text-[11px] overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg font-mono leading-relaxed max-h-72">
            {liquidExample}
          </pre>
        </div>
      </div>

      {/* RIGHT COLUMN: Live HTTP logs & Test Curl */}
      <div className="lg:col-span-5 space-y-6">
        {/* Terminal Live logs */}
        <div className="bg-slate-900 text-slate-100 rounded-xl shadow-md border border-slate-800 flex flex-col h-[520px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">HTTP REST API TRAFFIC INSPECTOR</span>
            </div>
            {logs.length > 0 && (
              <button 
                onClick={onClearLogs}
                className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 transition"
              >
                Clear Stream
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <Terminal className="w-8 h-8 text-slate-700" />
                <p className="text-xs italic">No incoming request traffic logged yet.</p>
                <p className="text-[10px] max-w-[200px] text-slate-600">Enter a ZIP code on the product page or modify rules to see live API request/response logs.</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-b border-slate-800/80 pb-3 last:border-b-0 space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{log.timestamp}</span>
                    <span className="text-emerald-400 font-bold">200 OK</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.method === "GET" ? "bg-emerald-950 text-emerald-400" : log.method === "POST" ? "bg-blue-950 text-blue-400" : "bg-red-950 text-red-400"}`}>{log.method}</span>
                    <span className="text-amber-300 selection:bg-slate-700 truncate">{log.url}</span>
                  </div>
                  {log.requestBody && (
                    <div className="bg-slate-950 p-2 rounded text-[11px] text-slate-400 border border-slate-800/40">
                      <div className="text-[9px] text-slate-500 mb-1">Payload Body:</div>
                      <pre className="overflow-x-auto">{JSON.stringify(log.requestBody, null, 2)}</pre>
                    </div>
                  )}
                  <div className="bg-slate-950 p-2 rounded text-[11px] text-slate-300 border border-slate-800/40">
                    <div className="text-[9px] text-slate-500 mb-1">JSON Response:</div>
                    <pre className="overflow-x-auto text-emerald-300">{JSON.stringify(log.responseBody, null, 2)}</pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* cURL Playground */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              API Shell Sandbox
            </h4>
            <button 
              onClick={() => copyText(curlExample, 77)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {copiedIndex === 77 ? "Copied!" : "Copy Curl"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">External developers can test the product ZIP code pricing microservice endpoint via curl:</p>
          <pre className="text-[11px] bg-slate-950 text-slate-300 p-3 rounded-md font-mono overflow-x-auto leading-relaxed">
            {curlExample}
          </pre>
        </div>
      </div>
    </div>
  );
}
