import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  Truck, 
  HelpCircle, 
  CheckCircle2, 
  Star, 
  ChevronRight, 
  ArrowLeft, 
  X, 
  ShoppingCart, 
  Sparkles,
  RefreshCw,
  Info
} from "lucide-react";
import { Product, PricingResponse } from "../types";

interface StorefrontSimulatorProps {
  products: Product[];
  selectedProduct: Product;
  onSelectProduct: (p: Product) => void;
  onPricingChecked: (response: PricingResponse) => void;
  latestPricing: PricingResponse | null;
  triggerApiLog: (log: any) => void;
}

interface CartItem {
  product: Product;
  zipCode: string;
  price: number;
  shipping: string;
  quantity: number;
}

export default function StorefrontSimulator({
  products,
  selectedProduct,
  onSelectProduct,
  onPricingChecked,
  latestPricing,
  triggerApiLog
}: StorefrontSimulatorProps) {
  const [zipInput, setZipInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  // Suggested values for quick testing
  const suggestions = [
    { zip: "75028", city: "Flower Mound, TX", desc: "Warehouse Sub-Hub" },
    { zip: "10001", city: "New York, NY", desc: "Urban High-density" },
    { zip: "90210", city: "Beverly Hills, CA", desc: "White-Glove Elite" },
    { zip: "60601", city: "Chicago, IL", desc: "Default Shipping Rate" },
  ];

  // Auto-fill and submit suggestions
  const handleQuickZip = (zip: string) => {
    setZipInput(zip);
    calculateZipPrice(zip);
  };

  const calculateZipPrice = async (overrideZip?: string) => {
    const targetZip = overrideZip || zipInput.trim();
    if (!targetZip) {
      setErrorMessage("Please enter a valid ZIP code.");
      return;
    }
    if (!/^\d{5}$/.test(targetZip)) {
      setErrorMessage("Enter a valid 5-digit ZIP code (e.g., 75028).");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    const startTime = Date.now();
    try {
      const response = await fetch(`/api/pricing?productId=${selectedProduct.id}&zipCode=${targetZip}`);
      const data = await response.json();
      
      const endTime = Date.now();
      const latency = endTime - startTime;

      // Log the HTTP Call
      triggerApiLog({
        timestamp: new Date().toLocaleTimeString(),
        method: "GET",
        url: `/api/pricing?productId=${selectedProduct.id}&zipCode=${targetZip}`,
        responseStatus: response.status,
        responseBody: data,
        latency: `${latency}ms`
      });

      if (response.ok) {
        onPricingChecked(data);
      } else {
        setErrorMessage(data.error || "Failed to fetch pricing information.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error communicating with shopify-pricing microservice server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    const currentPrice = latestPricing ? latestPricing.calculatedPrice : selectedProduct.basePrice + 99;
    const currentShipping = latestPricing ? latestPricing.shippingEstimate : "5-10 business days (Standard Flat Rate)";
    const zipUsed = latestPricing ? latestPricing.zipCode : "Default (No ZIP entered)";

    const existingIndex = cart.findIndex(item => item.product.id === selectedProduct.id && item.zipCode === zipUsed);
    
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product: selectedProduct,
          zipCode: zipUsed,
          price: currentPrice,
          shipping: currentShipping,
          quantity: 1
        }
      ]);
    }

    // Trigger feedback state
    setJustAddedToCart(true);
    setTimeout(() => setJustAddedToCart(false), 2000);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Trigger base pricing query whenever product changes or loads for the first time with whatever is in zipInput
  useEffect(() => {
    if (zipInput.length === 5) {
      calculateZipPrice();
    }
  }, [selectedProduct]);

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden relative">
      
      {/* Target Store Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold tracking-tight shadow-sm">
            H
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-gray-900">HEIRLOOM OAK & CO.</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">Shopify Premium</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">Storefront Simulator Mode</p>
          </div>
        </div>

        {/* Navigation Middle */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-600">
          <span className="text-teal-700 font-bold border-b-2 border-teal-600 pb-0.5 pointer-events-none">Catalog</span>
          <span className="hover:text-gray-900 cursor-pointer">Bespoke Fitting</span>
          <span className="hover:text-gray-900 cursor-pointer">Our Workshops</span>
        </div>

        {/* Right side cart indicator */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-scale font-mono">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* Product selector top ribbon */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-teal-50/50 p-4 border border-teal-100/60 rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-teal-600 w-4 h-4" />
            <span className="text-xs font-medium text-teal-800">Choose a different Shopify Product variant to dynamically test base prices:</span>
          </div>
          <div className="flex gap-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  // pricing automatically clears or recalculates
                  onPricingChecked(null as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer ${
                  selectedProduct.id === p.id 
                    ? "bg-teal-700 text-white shadow-sm" 
                    : "bg-white hover:bg-slate-100 text-gray-700 border border-gray-200"
                }`}
              >
                {p.name.split(" ")[0]} ({p.id === "prod_verdant_table" ? "$1,299 Base" : "$699 Base"})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT: Product Image & Gallery */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-xl overflow-hidden aspect-[4/3] relative border border-gray-100 shadow-sm">
              <img 
                src={selectedProduct.imageUrl} 
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur shadow px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                4.9 (48 Reviews)
              </div>
            </div>

            {/* Micro Gallery items */}
            <div className="grid grid-cols-4 gap-2">
              <div className="aspect-square rounded-lg border-2 border-teal-600 overflow-hidden cursor-pointer bg-white">
                <img src={selectedProduct.imageUrl} alt="thumbnail" className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
              </div>
              <div className="aspect-square rounded-lg border border-gray-100 overflow-hidden opacity-50 hover:opacity-100 transition cursor-pointer bg-slate-200"></div>
              <div className="aspect-square rounded-lg border border-gray-100 overflow-hidden opacity-50 hover:opacity-100 transition cursor-pointer bg-slate-200"></div>
              <div className="aspect-square rounded-lg border border-gray-100 overflow-hidden opacity-50 hover:opacity-100 transition cursor-pointer bg-slate-200"></div>
            </div>
            
            {/* Guarantee Statement */}
            <div className="p-3.5 bg-white rounded-lg border border-gray-200/60 space-y-1 text-xs">
              <div className="flex gap-2 text-slate-800 font-semibold">
                <Truck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                White-Glove In-Home Assembly
              </div>
              <p className="text-[11px] text-gray-500 leading-normal pl-6">
                Premium dispatch offers unboxing, room-of-choice positioning and full debris cleanup in supported ZIP areas.
              </p>
            </div>
          </div>

          {/* RIGHT: Product specs & Pricing Check interface widget */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <span>Breadcrumbs</span>
                <ChevronRight className="w-3 h-3" />
                <span>Heirloom Catalog</span>
                <ChevronRight className="w-3 h-3" />
                <span>Selected Woodcraft</span>
              </nav>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
                {selectedProduct.name}
              </h1>
            </div>

            {/* Real-time Dynamic Pricing Board */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                      ${latestPricing ? latestPricing.calculatedPrice.toLocaleString() : selectedProduct.basePrice.toLocaleString()}
                    </span>
                    {latestPricing ? (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-md tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Location Adjusted
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 line-through">
                        ${(selectedProduct.basePrice + 199).toLocaleString()} MSRP
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Excludes sales tax. Calculated in real-time according to transport terminal hubs.</p>
                </div>
                
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Base Factory Cost</span>
                  <span className="text-sm font-bold text-slate-500">${selectedProduct.basePrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Dynamic Shipping Line */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-4 h-4 text-emerald-500" />
                  Estimated Transport:
                </span>
                <span className="font-bold text-slate-800">
                  {latestPricing ? latestPricing.shippingEstimate : "Calculate shipping ZIP below"}
                </span>
              </div>
            </div>

            {/* Interactive ZIP Cost Calculator (Simulated Merchant Widget) */}
            <div className="bg-slate-100/80 border-2 border-dashed border-teal-300 rounded-xl p-5 relative">
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-teal-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                <Info className="w-2.5 h-2.5" /> Widget Active
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <MapPin className="text-teal-700 w-4 h-4" />
                    Bespoke Pricing & Transit Estimator
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Designed for high-end heavy goods. Enter a shipping ZIP code to estimate final routing surcharges and precise assembly timelines.
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={zipInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                        setZipInput(val);
                      }}
                      placeholder="Enter 5-digit ZIP"
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-3 pr-10 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-mono tracking-widest"
                    />
                    {zipInput && (
                      <button 
                        onClick={() => setZipInput("")} 
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => calculateZipPrice()}
                    disabled={isLoading || zipInput.length < 5}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer shadow"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Check Cost"
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                    ⚠️ {errorMessage}
                  </p>
                )}

                {/* Micro ZIP selectors for evaluation ease */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Click below to instant-test required Shopify assessment locations:</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {suggestions.map((sug) => (
                      <button
                        key={sug.zip}
                        onClick={() => handleQuickZip(sug.zip)}
                        className={`text-left p-2 rounded-lg bg-white border text-xs transition cursor-pointer select-none ${
                          latestPricing?.zipCode === sug.zip 
                            ? "border-teal-600 bg-teal-50 ring-1 ring-teal-500" 
                            : "border-gray-200 hover:border-gray-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-bold text-gray-800 font-mono flex items-center justify-between">
                          <span>{sug.zip}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">{sug.city}</div>
                        <div className="text-[9px] text-teal-700 font-medium truncate mt-0.5">{sug.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Surcharge breakdown detail */}
                {latestPricing && (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3.5 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">API Calculation Returned Successfully!</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center bg-white/85 p-2 rounded border border-emerald-100">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold block">Base</span>
                        <span className="text-xs font-extrabold text-gray-700">${latestPricing.basePrice}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold block">Surcharge</span>
                        <span className={`text-xs font-extrabold ${latestPricing.surcharge > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                          +${latestPricing.surcharge}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold block">Total Estimate</span>
                        <span className="text-xs font-extrabold text-teal-800">${latestPricing.calculatedPrice}</span>
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-slate-600 leading-normal font-sans">
                      <span className="font-bold text-slate-700">Audit Notes: </span>
                      {latestPricing.notes || "No extra merchant routing details defined."}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Standard Checkout Area with Local Price */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-lg transition-all transform hover:-translate-y-0.5 shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                {justAddedToCart ? "Added to Cart!" : latestPricing ? `Add to Cart — $${latestPricing.calculatedPrice.toLocaleString()}` : "Input Shipping Destination"}
              </button>
              <p className="text-center text-[11px] text-gray-400">
                Secure checkout guaranteed by Shopify. 30-Day Hassle-Free returns on sustainable oak items.
              </p>
            </div>

            <div className="border-t border-gray-200/60 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">{selectedProduct.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Slider Overlay */}
      {isCartOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
            
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-teal-700" />
                Your Shopify Shopping Cart
              </h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full hover:bg-slate-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <ShoppingBag className="w-12 h-12 stroke-1 text-gray-300 mb-2" />
                  <p className="text-xs">Your cart is currently empty.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs text-teal-600 font-bold mt-2"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex gap-3 bg-slate-50 p-3 rounded-lg border border-gray-100 relative">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{item.product.name}</h4>
                      <div className="flex flex-col text-[10px] text-gray-500 space-y-0.5">
                        <span>ZIP Mapped Cost: <b className="text-teal-700">${item.price.toLocaleString()}</b></span>
                        <span className="font-mono text-[9px] bg-teal-100 text-teal-800 px-1 py-0.2 rounded w-fit">ZIP: {item.zipCode}</span>
                        <span>Est: {item.shipping}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(index)}
                      className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-slate-50 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-gray-600">Subtotal:</span>
                  <span className="text-xl font-bold text-slate-900">${calculateTotal().toLocaleString()}</span>
                </div>
                
                <p className="text-[10px] text-slate-400">All dynamic geographic region transport fees and warehouse assembly costs are included.</p>

                <button 
                  onClick={() => alert("Simulated Shopify Checkout sequence triggered with dynamic zip prices successfully passed!")}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg text-center shadow cursor-pointer transition"
                >
                  Proceed to Checkout ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
