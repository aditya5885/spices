"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { products as fallbackProducts } from "@/data/products";
import { getApiUrl } from "@/lib/api";

function ReorderFormContent() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [packSize, setPackSize] = useState<string>("500kg");
  const [quantity, setQuantity] = useState<number>(1);
  const [frequency, setFrequency] = useState<string>("monthly");
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch products catalogue
  useEffect(() => {
    fetch(getApiUrl("/api/products.php"))
      .then((res) => {
        if (!res.ok) throw new Error("API not responsive");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProductsList(data);
          const firstProd = data[0];
          setSelectedProduct(firstProd || null);
          if (firstProd && firstProd.isFixedPrice === 1) {
            setPackSize("1pkt");
          }
        } else {
          throw new Error("Invalid format");
        }
      })
      .catch((err) => {
        console.warn("API not available, falling back to static catalogue:", err);
        setProductsList(fallbackProducts);
        const firstProd = fallbackProducts[0];
        setSelectedProduct(firstProd || null);
        if (firstProd && firstProd.isFixedPrice === 1) {
          setPackSize("1pkt");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prod = productsList.find((p) => p.slug === e.target.value);
    if (prod) {
      setSelectedProduct(prod);
      if (prod.isFixedPrice === 1) {
        setPackSize("1pkt");
      } else {
        setPackSize("500kg");
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(getApiUrl("/api/api_repeat_orders.php?action=create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          product_slug: selectedProduct.slug,
          pack_size: packSize,
          quantity: quantity,
          frequency: frequency,
          shipping_address: formData.address,
          city: formData.city,
          state: formData.state,
          pin_code: formData.postalCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up standing order.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !selectedProduct) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-24 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-on-surface-variant font-headline font-semibold">Retrieving spice catalogue...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden bg-background-cream text-on-surface">
      {/* Hero Banner */}
      <header className="relative pt-32 pb-20 bg-surface-container-low overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_spices_banner.webp"
            alt="Spices bags background"
            fill
            priority
            className="object-cover opacity-15 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-cream via-transparent to-background-cream"></div>
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <span className="font-headline font-bold text-primary text-xs uppercase tracking-[0.2em] mb-4 block">
            Standing Orders
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-6 leading-tight">
            Schedule Repeat Spice Dispatches
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-lg leading-relaxed text-on-surface-variant font-medium">
            Automate your kitchen or B2B spice supply chain. Set up your regular delivery cycle below and get worry-free dispatches.
          </p>
        </div>
      </header>

      {/* Main Section */}
      <section className="py-16 max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: How it works */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="font-headline text-xl md:text-2xl font-extrabold text-primary">
              Subscription Cycles
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Exportia Spices repeat purchase facility enables wholesale accounts and recurring retail customers to schedule auto-delivery of premium spices.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0 font-headline font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-primary">Select Product &amp; Cycle</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                    Choose your favorite spice, package size, and frequency (weekly, fortnightly, monthly, or bimonthly).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0 font-headline font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-primary">Zero Upfront Charges</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                    Setting up a standing order profile is completely free. We do not store or auto-charge cards without permission.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0 font-headline font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-primary">One-Click Reminders</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                    When your cycle is due, our system sends you an email/SMS reminder with a pre-filled checkout link to pay via PayU/Razorpay or choose COD.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <h4 className="font-headline font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-lg leading-none">lock_open</span>
                Pause or Cancel Anytime
              </h4>
              <p className="text-[11px] text-on-surface-variant font-medium mt-2 leading-relaxed">
                Contact our Kochi support office or email support@vintageglobaltrading.com to modify, temporarily pause, or cancel your scheduled deliveries.
              </p>
            </div>
          </div>

          {/* Right: The Subscription Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-10 shadow-sm">
            <h2 className="font-headline text-xl md:text-2xl font-extrabold text-primary mb-2">
              Standing Order Details
            </h2>
            <p className="text-xs text-on-surface-variant font-semibold mb-8">
              Complete the subscription form to register your repeat purchase schedule in our system.
            </p>

            {isSubmitted ? (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <span className="material-symbols-outlined text-4xl font-bold">task_alt</span>
                </div>
                <h3 className="font-headline font-bold text-md text-primary">
                  Standing Order Registered!
                </h3>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed max-w-md mx-auto">
                  Thank you! Your recurring delivery schedule has been successfully saved. We will contact you or send a pre-filled checkout invoice link when your first delivery is due.
                </p>
                <Link href="/" className="inline-block mt-4">
                  <button className="bg-primary text-white hover:bg-primary-container px-6 py-2.5 rounded-lg font-headline font-bold text-xs tracking-wider uppercase transition-colors">
                    Back to Storefront
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-error">error</span>
                    <p className="text-error font-semibold text-xs">{errorMessage}</p>
                  </div>
                )}

                {/* Product Sizing, Quantity, and Frequency Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background-cream p-5 rounded-xl border border-outline-variant/20">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Select Spice Product
                    </label>
                    <select
                      value={selectedProduct.slug}
                      onChange={handleProductChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm font-semibold outline-none"
                    >
                      {productsList.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Delivery Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm font-semibold outline-none"
                    >
                      <option value="weekly">Every Week</option>
                      <option value="fortnightly">Every Fortnight (2 weeks)</option>
                      <option value="monthly">Every Month</option>
                      <option value="bimonthly">Every 2 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Pack Size
                    </label>
                    {selectedProduct.isFixedPrice === 1 ? (
                      <div className="py-3 px-4 text-xs font-bold bg-primary/10 border border-primary/20 text-primary rounded-lg text-center font-headline uppercase tracking-wider">
                        1 Packet
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {(["200kg", "500kg", "1000kg", "2000kg"] as const).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setPackSize(size)}
                            className={`flex-1 py-3 text-xs font-bold rounded-lg border text-center transition-all ${
                              packSize === size
                                ? "bg-primary border-primary text-white"
                                : "bg-white border-outline-variant/60 text-on-surface hover:bg-surface-container"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-background-cream text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. rajesh@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-background-cream text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-background-cream text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Flat No, Building, Street, Area"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-background-cream text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-background-cream text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-background-cream text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Pin Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 400001"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-background-cream text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-lg font-headline font-bold text-xs tracking-wider uppercase transition-colors duration-300 shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Registering Schedule...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm leading-none">autorenew</span>
                        Set Up Standing Order
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="bg-surface-container py-12 border-t border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 flex flex-wrap justify-around items-center gap-6 text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl select-none">verified</span>
            <span className="font-headline font-bold text-[10px] tracking-wider uppercase">ISO 22000</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl select-none">eco</span>
            <span className="font-headline font-bold text-[10px] tracking-wider uppercase">Organic Cert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl select-none">health_and_safety</span>
            <span className="font-headline font-bold text-[10px] tracking-wider uppercase">HACCP Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl select-none">domain_verification</span>
            <span className="font-headline font-bold text-[10px] tracking-wider uppercase">GMP Certified</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ReorderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-24 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-on-surface-variant font-headline font-semibold">Loading standing order desk...</p>
      </div>
    }>
      <ReorderFormContent />
    </Suspense>
  );
}
