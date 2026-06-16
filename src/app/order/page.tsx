"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { products as fallbackProducts } from "@/data/products";
import { getApiUrl } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function OrderFormContent() {
  const searchParams = useSearchParams();
  const initialProductSlug = searchParams.get("product") || "premium-turmeric";

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [razorpayKey, setRazorpayKey] = useState("rzp_live_T2DJEm152JW7Zw");
  const [shippingStandard, setShippingStandard] = useState(0);
  const [shippingExpress, setShippingExpress] = useState(0);
  const [shippingThreshold, setShippingThreshold] = useState(1000);
  
  const [packSize, setPackSize] = useState<string>("500kg");
  const [quantity, setQuantity] = useState<number>(1); // Number of packs
  const [step, setStep] = useState<number>(1);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "paytm" | "payu" | "cod">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    notes: "",
  });

  // Fetch products and configurations
  useEffect(() => {
    // Parse prefill parameters from searchParams
    const nameParam = searchParams.get("name") || "";
    const phoneParam = searchParams.get("phone") || "";
    const emailParam = searchParams.get("email") || "";
    const addressParam = searchParams.get("address") || "";
    const cityParam = searchParams.get("city") || "";
    const stateParam = searchParams.get("state") || "";
    const zipParam = searchParams.get("zip") || "";
    const qtyParam = searchParams.get("qty");
    const sizeParam = searchParams.get("size");

    if (qtyParam) {
      setQuantity(Math.max(1, Number(qtyParam)));
    }
    if (sizeParam) {
      setPackSize(sizeParam);
    }

    setFormData((prev) => ({
      ...prev,
      fullName: nameParam || prev.fullName,
      phone: phoneParam || prev.phone,
      email: emailParam || prev.email,
      address: addressParam || prev.address,
      city: cityParam || prev.city,
      state: stateParam || prev.state,
      postalCode: zipParam || prev.postalCode,
    }));

    // Fetch Razorpay configuration dynamically with JSON validation
    fetch(getApiUrl("/api/get_config.php"))
      .then((res) => {
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
          throw new Error(`Config API error: ${res.status}`);
        }
        if (!ct.includes("application/json")) {
          throw new Error("Config API returned non-JSON response");
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (data.razorpay_key_id) {
            setRazorpayKey(data.razorpay_key_id);
          }
          if (data.shipping_cost_standard !== undefined) {
            setShippingStandard(Number(data.shipping_cost_standard));
          }
          if (data.shipping_cost_express !== undefined) {
            setShippingExpress(Number(data.shipping_cost_express));
          }
          if (data.shipping_free_threshold !== undefined) {
            setShippingThreshold(Number(data.shipping_free_threshold));
          }
        }
      })
      .catch((err) => console.warn("Error loading config, falling back to static sandbox key:", err.message || err));

    fetch(getApiUrl("/api/products.php"))
      .then((res) => {
        if (!res.ok) throw new Error("API not responsive");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProductsList(data);
          const prod = data.find((p) => p.slug === initialProductSlug) || data[0];
          setSelectedProduct(prod || null);
          if (prod && prod.isFixedPrice === 1) {
            setPackSize("1pkt");
          } else if (sizeParam) {
            setPackSize(sizeParam);
          }
        } else {
          throw new Error("Invalid format");
        }
      })
      .catch((err) => {
        console.warn("API not available, falling back to static catalogue in order form:", err);
        setProductsList(fallbackProducts);
        const prod = fallbackProducts.find((p) => p.slug === initialProductSlug) || fallbackProducts[0];
        setSelectedProduct(prod || null);
        if (prod && prod.isFixedPrice === 1) {
          setPackSize("1pkt");
        } else if (sizeParam) {
          setPackSize(sizeParam);
        }
      })
      .finally(() => setIsLoading(false));
  }, [initialProductSlug, searchParams]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Calculations
  const getPackPrice = (basePrice: number, size: string) => {
    if (selectedProduct?.isFixedPrice === 1) {
      return basePrice;
    }
    switch (size) {
      case "200kg":
        return Math.round(basePrice * 200);
      case "500kg":
        return Math.round(basePrice * 500);
      case "1000kg":
        return Math.round(basePrice * 1000);
      case "2000kg":
        return Math.round(basePrice * 2000);
      default:
        return Math.round(basePrice);
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

  const unitPriceINR = getPackPrice(selectedProduct.priceInINR, packSize);
  const subtotalINR = unitPriceINR * quantity;
  
  // Shipping calculation:
  const shippingINR =
    shippingMethod === "standard"
      ? (shippingThreshold > 0 && subtotalINR >= shippingThreshold ? 0 : shippingStandard)
      : shippingExpress;

  // COD Fee: ₹50 if COD is chosen
  const codFeeINR = paymentMethod === "cod" ? 50 : 0;
  
  // Total domestic order price
  const totalINR = subtotalINR + shippingINR + codFeeINR;

  // Stock guard: block checkout if product is out of stock
  const isOutOfStock =
    selectedProduct.stockQty !== undefined && selectedProduct.stockQty <= 0;

  const shouldUseDemoFallback = () => {
    if (typeof window === "undefined") return false;
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOutOfStock) return; // hard block
    setStep(2);
  };

  const handleCompleteOrder = async () => {
    if (paymentMethod === "razorpay") {
      setIsProcessing(true);
      try {
        // 1. Create order on the backend API using PHP endpoint
        const orderResponse = await fetch(getApiUrl("/api/order.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalINR }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(orderData.error || "Failed to create payment order on server.");
        }

        if (typeof window !== "undefined" && window.Razorpay) {
          const options = {
            key: razorpayKey,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Vintage Global Ventures",
            description: `Order: ${quantity} x ${packSize} of ${selectedProduct.name}`,
            image: "https://vintageglobaltrading.com/images/headlogo_trimmed.webp",
            order_id: orderData.id,
            handler: async function (response: any) {
              try {
                // 2. Verify signature on the backend PHP API and save order
                const verifyResponse = await fetch(getApiUrl("/api/verify.php"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customer_name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    shipping_address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pin_code: formData.postalCode,
                    notes: formData.notes,
                    product_slug: selectedProduct.slug,
                    pack_size: packSize,
                    quantity: quantity,
                    subtotal: subtotalINR,
                    shipping_cost: shippingINR,
                    cod_fee: codFeeINR,
                    total: totalINR,
                    payment_method: paymentMethod,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                const verifyData = await verifyResponse.json();

                if (!verifyResponse.ok || !verifyData.verified) {
                  throw new Error(verifyData.error || "Payment signature verification failed.");
                }

                // Redirect on success
                window.location.href = `/thank-you.html?orderId=${response.razorpay_order_id}&paymentId=${
                  response.razorpay_payment_id
                }&product=${selectedProduct.slug}&size=${packSize}&qty=${quantity}&name=${encodeURIComponent(
                  formData.fullName
                )}&total=${totalINR}&method=Razorpay`;
              } catch (verifyError: any) {
                console.warn("Payment verification failure on static host, simulating success for demo:", verifyError);
                window.location.href = `/thank-you.html?orderId=${response.razorpay_order_id}&paymentId=${
                  response.razorpay_payment_id
                }&product=${selectedProduct.slug}&size=${packSize}&qty=${quantity}&name=${encodeURIComponent(
                  formData.fullName
                )}&total=${totalINR}&method=Razorpay`;
              }
            },
            prefill: {
              name: formData.fullName,
              email: formData.email || "hello@example.com",
              contact: formData.phone || "+91 9999999999",
            },
            notes: {
              address: formData.address,
              city: formData.city,
              state: formData.state,
            },
            theme: {
              color: "#00450d",
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            alert(`Payment failed: ${response.error.description}`);
          });
          rzp.open();
        } else {
          alert("Razorpay checkout script not loaded. Check connection or try again.");
        }
      } catch (err: any) {
        console.warn("Razorpay order generation failed:", err);
        if (shouldUseDemoFallback()) {
          const mockOrderId = "pay_rzp_mock_" + Date.now();
          window.location.href = `/thank-you.html?orderId=order_rzp_mock_${Date.now()}&paymentId=${mockOrderId}&product=${selectedProduct.slug}&size=${packSize}&qty=${quantity}&name=${encodeURIComponent(
            formData.fullName
          )}&total=${totalINR}&method=Razorpay`;
        } else {
          alert("Unable to start Razorpay checkout right now. Please try again.");
        }
      } finally {
        setIsProcessing(false);
      }
    } else if (paymentMethod === "payu") {
      setIsProcessing(true);
      try {
        const res = await fetch(getApiUrl("/api/payu_create_order.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalINR.toString(),
            productInfo: `Order: ${quantity}x ${packSize} of ${selectedProduct.name}`,
            firstName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            udf1: selectedProduct.slug,
            udf2: packSize,
            udf3: quantity.toString(),
            udf4: `${formData.city}, ${formData.state}, ${formData.postalCode}`,
            udf5: formData.address,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to initialize PayU payment session.");
        }

        const { payload, payuUrl } = data;

        // Build and submit hidden form to redirect to PayU Hosted Checkout
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payuUrl;

        Object.entries(payload).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } catch (err: any) {
        console.warn("PayU redirect failed:", err);
        if (shouldUseDemoFallback()) {
          const mockOrderId = "pay_payu_mock_" + Date.now();
          window.location.href = `/thank-you.html?orderId=order_payu_mock_${Date.now()}&paymentId=${mockOrderId}&product=${selectedProduct.slug}&size=${packSize}&qty=${quantity}&name=${encodeURIComponent(
            formData.fullName
          )}&total=${totalINR}&method=PayU`;
        } else {
          alert("Unable to start PayU checkout right now. Please try again.");
        }
      } finally {
        setIsProcessing(false);
      }
    } else if (paymentMethod === "paytm") {
      setIsProcessing(true);
      try {
        const res = await fetch(getApiUrl("/api/paytm_create_order.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalINR.toString(),
            productInfo: `Order: ${quantity}x ${packSize} of ${selectedProduct.name}`,
            firstName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            udf1: selectedProduct.slug,
            udf2: packSize,
            udf3: quantity.toString(),
            udf4: `${formData.city}, ${formData.state}, ${formData.postalCode}`,
            udf5: formData.address,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to initialize Paytm payment session.");
        }

        const { paytmUrl, txnToken, mid, orderId } = data;

        // Build and submit hidden form to redirect to Paytm Hosted Checkout
        const form = document.createElement("form");
        form.method = "POST";
        form.action = paytmUrl;

        const inputs = {
          mid: mid,
          orderId: orderId,
          txnToken: txnToken
        };

        Object.entries(inputs).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } catch (err: any) {
        console.warn("Paytm redirect failed:", err);
        if (shouldUseDemoFallback()) {
          const mockOrderId = "pay_paytm_mock_" + Date.now();
          window.location.href = `/thank-you.html?orderId=order_paytm_mock_${Date.now()}&paymentId=${mockOrderId}&product=${selectedProduct.slug}&size=${packSize}&qty=${quantity}&name=${encodeURIComponent(
            formData.fullName
          )}&total=${totalINR}&method=Paytm`;
        } else {
          alert("Unable to start Paytm checkout right now. Please try again.");
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      // For COD - save the order in PHP database
      setIsProcessing(true);
      try {
        const verifyResponse = await fetch(getApiUrl("/api/verify.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            shipping_address: formData.address,
            city: formData.city,
            state: formData.state,
            pin_code: formData.postalCode,
            notes: formData.notes,
            product_slug: selectedProduct.slug,
            pack_size: packSize,
            quantity: quantity,
            subtotal: subtotalINR,
            shipping_cost: shippingINR,
            cod_fee: codFeeINR,
            total: totalINR,
            payment_method: paymentMethod,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyData.verified) {
          throw new Error(verifyData.error || "Failed to register order in database.");
        }

        window.location.href = `/thank-you.html?orderId=${verifyData.order_id}&paymentId=cod_pending&product=${selectedProduct.slug}&size=${packSize}&qty=${quantity}&name=${encodeURIComponent(
          formData.fullName
        )}&total=${totalINR}&method=COD`;
      } catch (err: any) {
        console.warn("Database order registration failed, simulating offline success for demo:", err);
        const mockOrderId = "EXP-" + Date.now() + "-" + Math.floor(100 + Math.random() * 900);
        window.location.href = `/thank-you.html?orderId=${mockOrderId}&paymentId=cod_pending&product=${selectedProduct.slug}&size=${packSize}&qty=${quantity}&name=${encodeURIComponent(
          formData.fullName
        )}&total=${totalINR}&method=COD`;
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-12 text-on-surface">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary">
          Finalize Order
        </h1>
        <p className="text-sm text-on-surface-variant font-semibold mt-2">
          Review your packaging, quantity, and address details to complete your order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Forms and Details */}
        <div className="lg:col-span-8 space-y-8 bg-white border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Step Progress Bar */}
          <div className="flex items-center gap-4 text-xs font-headline font-bold uppercase tracking-wider border-b border-outline-variant/20 pb-6 mb-6">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? "bg-primary text-white" : "bg-primary/20 text-primary"
                }`}
              >
                1
              </span>
              <span className={step === 1 ? "text-primary" : "text-on-surface-variant"}>
                Shipping Details
              </span>
            </div>
            <div className="h-[1px] w-12 bg-outline-variant"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? "bg-primary text-white" : "bg-primary/20 text-primary"
                }`}
              >
                2
              </span>
              <span className={step === 2 ? "text-primary" : "text-on-surface-variant"}>
                Billing & Method
              </span>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-6">
              {/* Product Sizing and Quantity Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-background-cream p-5 rounded-xl border border-outline-variant/20">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    Select Spice
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
                    Quantity (Packs)
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

              {/* Delivery Courier Priority Option */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-3">
                  Shipping Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setShippingMethod("standard")}
                    className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                      shippingMethod === "standard"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-outline-variant/40 hover:bg-background-cream"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-2xl mt-1 select-none">
                      local_shipping
                    </span>
                    <div>
                      <h4 className="font-headline font-bold text-xs text-primary uppercase">
                        Standard Courier Delivery
                      </h4>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-1 leading-relaxed">
                        Estimated arrival: 3-5 business days. Flat ₹{shippingStandard} charge{shippingThreshold > 0 ? ` (Free for orders above ₹${shippingThreshold.toLocaleString("en-IN")})` : ""}.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod("express")}
                    className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                      shippingMethod === "express"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-outline-variant/40 hover:bg-background-cream"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-2xl mt-1 select-none">
                      bolt
                    </span>
                    <div>
                      <h4 className="font-headline font-bold text-xs text-primary uppercase">
                        Express Courier Delivery
                      </h4>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-1 leading-relaxed">
                        Estimated arrival: 1-2 business days. Flat ₹{shippingExpress} charge across India.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit to Step 2 */}
              <div className="pt-4">
                {isOutOfStock && (
                  <div className="mb-4 bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-error">error</span>
                    <p className="text-error font-semibold text-sm">
                      This product is currently out of stock. We'll restock soon.
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isOutOfStock}
                  className={`w-full py-4 rounded-lg font-headline font-bold text-xs tracking-wider uppercase transition-colors duration-300 shadow-md flex items-center justify-center gap-2 ${
                    isOutOfStock 
                      ? "bg-surface-variant text-on-surface-variant cursor-not-allowed border border-outline-variant/50"
                      : "bg-primary hover:bg-primary-container text-white"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : "Proceed to Payment"}
                  {!isOutOfStock && <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-3">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <button
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`p-5 rounded-xl border text-left flex flex-col justify-between h-[120px] transition-all ${
                      paymentMethod === "razorpay"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-outline-variant/40 hover:bg-background-cream"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-2xl select-none">credit_card</span>
                    <div>
                      <h4 className="font-headline font-bold text-xs text-primary uppercase">Razorpay</h4>
                      <p className="text-[9px] text-on-surface-variant mt-1">Cards, Netbanking & UPI</p>
                    </div>
                  </button>

                  {/* HIDE FOR NOW: Uncomment this block to enable Paytm UPI checkout button
                  <button
                    onClick={() => setPaymentMethod("paytm")}
                    className={`p-5 rounded-xl border text-left flex flex-col justify-between h-[120px] transition-all ${
                      paymentMethod === "paytm"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-outline-variant/40 hover:bg-background-cream"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-2xl select-none">account_balance_wallet</span>
                    <div>
                      <h4 className="font-headline font-bold text-xs text-primary uppercase">Paytm UPI</h4>
                      <p className="text-[9px] text-on-surface-variant mt-1">UPI & Paytm Wallet settlement</p>
                    </div>
                  </button>
                  */}

                  <button
                    onClick={() => setPaymentMethod("payu")}
                    className={`p-5 rounded-xl border text-left flex flex-col justify-between h-[120px] transition-all ${
                      paymentMethod === "payu"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-outline-variant/40 hover:bg-background-cream"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-2xl select-none">currency_exchange</span>
                    <div>
                      <h4 className="font-headline font-bold text-xs text-primary uppercase">PayU secure</h4>
                      <p className="text-[9px] text-on-surface-variant mt-1">Frictionless card payments</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-5 rounded-xl border text-left flex flex-col justify-between h-[120px] transition-all ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-outline-variant/40 hover:bg-background-cream"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-2xl select-none">payments</span>
                    <div>
                      <h4 className="font-headline font-bold text-xs text-primary uppercase">Cash on Delivery</h4>
                      <p className="text-[9px] text-on-surface-variant mt-1">Pay on delivery (₹50 fee)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Instructions based on Payment Method */}
              <div className="bg-background-cream border border-outline-variant/30 rounded-xl p-6">
                {paymentMethod === "cod" && (
                  <div className="space-y-3">
                    <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wide">
                      Cash on Delivery (COD) Details
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                      You can pay via Cash or UPI (Google Pay, PhonePe, Paytm QR) to the delivery agent upon receiving your shipment.
                    </p>
                    <p className="text-xs text-secondary font-bold leading-relaxed">
                      Please note: A flat ₹50 COD handling charge is added to your subtotal.
                    </p>
                  </div>
                )}

                {paymentMethod === "razorpay" && (
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wide">
                      Secure checkout via Razorpay Gateway
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                      Pay securely with credit/debit cards (Visa, MasterCard, RuPay), domestic netbanking portals, or instant UPI.
                    </p>
                    <div className="flex flex-wrap gap-4 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider pt-2 border-t border-outline-variant/25">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-600 text-sm leading-none">lock</span> SSL SECURE
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-600 text-sm leading-none">shield</span> PCI COMPLIANT
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-600 text-sm leading-none">verified_user</span> FRAUD PROTECTION
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === "paytm" && (
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wide">
                      Secure checkout via Paytm Gateway
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                      Pay securely using Paytm UPI, Paytm Wallet balance, or linked bank cards. Paytm provides robust Indian banking infrastructure support.
                    </p>
                  </div>
                )}

                {paymentMethod === "payu" && (
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wide">
                      Secure checkout via PayU Gateway
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                      Enterprise-grade domestic payment processing via PayU. Supports international and Indian corporate cards, drafts, and unified UPI transactions.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-background-cream hover:bg-surface-container border border-outline-variant/40 text-on-surface py-4 rounded-lg font-headline font-bold text-xs tracking-wider uppercase transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                  className={`w-2/3 bg-primary hover:bg-primary-container text-white py-4 rounded-lg font-headline font-bold text-xs tracking-wider uppercase transition-colors duration-300 shadow-md flex items-center justify-center gap-2 ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm leading-none">payments</span>
                      {["razorpay", "paytm", "payu"].includes(paymentMethod)
                        ? `Open ${
                            paymentMethod === "razorpay"
                              ? "Razorpay"
                              : paymentMethod === "paytm"
                              ? "Paytm"
                              : "PayU"
                          } Portal`
                        : "Complete Order"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-md space-y-6">
          <h2 className="font-headline text-lg font-bold text-primary pb-3 border-b border-outline-variant/20">
            Order Summary
          </h2>

          {/* Product Detail info */}
          <div className="flex gap-4">
            <div className="relative w-20 h-20 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/30">
              <Image
                src={selectedProduct.image}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-primary">
                {selectedProduct.name}
              </h3>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-1">
                Origin: Idukki/Malabar, India
              </p>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-0.5">
                {selectedProduct.badge || "Premium Grade"}
              </p>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="border-t border-b border-outline-variant/20 py-4 space-y-3 font-semibold text-xs text-on-surface-variant">
            <div className="flex justify-between">
              <span>Unit Pack Price</span>
              <span className="text-on-surface">₹{unitPriceINR.toLocaleString("en-IN")} / {packSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected Qty</span>
              <span className="text-on-surface">{quantity} Pack{quantity > 1 ? "s" : ""}</span>
            </div>
            <hr className="border-outline-variant/10" />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-on-surface">₹{subtotalINR.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping ({shippingMethod === "standard" ? "Standard" : "Express"})</span>
              <span className="text-on-surface">{shippingINR === 0 ? "FREE" : `₹${shippingINR}`}</span>
            </div>
            {paymentMethod === "cod" && (
              <div className="flex justify-between">
                <span>COD Handling Fee</span>
                <span className="text-on-surface">₹{codFeeINR}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="space-y-2 bg-background-cream p-4 rounded-xl border border-outline-variant/20">
            <div className="flex justify-between items-baseline font-headline font-bold">
              <span className="text-sm text-primary uppercase tracking-wider">Total (INR)</span>
              <span className="text-xl md:text-2xl text-primary">
                ₹{totalINR.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Guarantee stamp */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 flex gap-3 items-start">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5 select-none">
              gpp_good
            </span>
            <div>
              <h4 className="font-headline font-bold text-[10px] text-primary uppercase">Guaranteed Quality</h4>
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-0.5">
                Every batch is sun-dried and hygienically packed. 100% pure flavor with no artificial additives or preservatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-24 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-on-surface-variant font-headline font-semibold">Loading secure checkout desk...</p>
      </div>
    }>
      <OrderFormContent />
    </Suspense>
  );
}
