"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  // Extract parameters passed from the callback redirect
  const txnId = searchParams.get("txnid") || "N/A";
  const paymentId = searchParams.get("paymentId") || "N/A";
  const productSlug = searchParams.get("product") || "";
  const packSize = searchParams.get("size") || "N/A";
  const quantity = searchParams.get("qty") || "1";
  const customerName = searchParams.get("name") || "Valued Customer";
  const totalAmount = searchParams.get("total") || "0";
  const paymentMethod = searchParams.get("method") || "PayU Hosted Checkout";

  // Resolve matching product info
  const matchedProduct = products.find((p) => p.slug === productSlug) || null;

  return (
    <div className="min-h-screen bg-background-cream py-16 px-4 md:px-16 flex items-center justify-center font-body">
      <div className="max-w-2xl w-full bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Success Header banner */}
        <div className="bg-primary text-white text-center py-12 px-6 relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-30px] left-[-30px] w-28 h-28 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <span className="material-symbols-outlined text-white text-5xl animate-bounce">
              check_circle
            </span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl tracking-wide uppercase">
            Order Confirmed!
          </h1>
          <p className="text-sm opacity-90 mt-2 font-medium">
            Thank you, {customerName}. Your payment was processed successfully.
          </p>
        </div>

        {/* Transaction Summary Grid */}
        <div className="p-8 space-y-8">
          <div>
            <h2 className="font-headline font-bold text-xs text-primary uppercase tracking-widest mb-4 border-b border-outline-variant/20 pb-2">
              Transaction Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                <span className="text-on-surface-variant font-semibold block mb-1">Transaction ID</span>
                <span className="font-mono text-primary font-bold">{txnId}</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                <span className="text-on-surface-variant font-semibold block mb-1">PayU Reference ID</span>
                <span className="font-mono text-primary font-bold">{paymentId}</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                <span className="text-on-surface-variant font-semibold block mb-1">Payment Method</span>
                <span className="text-primary font-bold">{paymentMethod}</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                <span className="text-on-surface-variant font-semibold block mb-1">Amount Paid</span>
                <span className="text-secondary font-bold text-sm">₹{parseFloat(totalAmount).toLocaleString("en-IN")} INR</span>
              </div>
            </div>
          </div>

          {/* Purchased Product Info */}
          {matchedProduct && (
            <div>
              <h2 className="font-headline font-bold text-xs text-primary uppercase tracking-widest mb-4 border-b border-outline-variant/20 pb-2">
                Order Summary
              </h2>
              <div className="flex gap-4 p-4 rounded-2xl border border-outline-variant/20 bg-background-cream">
                <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  <Image
                    src={matchedProduct.image}
                    alt={matchedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-headline font-bold text-sm text-primary">
                      {matchedProduct.name}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant font-semibold mt-1">
                      Pack Size: {packSize} | Quantity: {quantity}
                    </p>
                  </div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                    {matchedProduct.badge || "Premium Grade"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sourcing/Delivery Timeline info */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4">
            <h4 className="font-headline font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-lg leading-none">local_shipping</span>
              What Happens Next?
            </h4>
            <ul className="space-y-3 text-xs text-on-surface-variant font-medium">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check</span>
                <span>An order confirmation receipt has been sent to your email address.</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check</span>
                <span>Our South Indian estate plantation partner will handpick and pack your batch.</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check</span>
                <span>A shipment tracking link will be sent to your phone number via SMS/WhatsApp within 24 hours.</span>
              </li>
            </ul>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline-variant/20">
            <Link href="/" className="flex-1">
              <button className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-full font-headline font-bold text-xs tracking-wider uppercase transition-colors shadow-md">
                Back to Storefront
              </button>
            </Link>
            <Link href="/order" className="flex-1">
              <button className="w-full bg-white hover:bg-surface-container border border-outline-variant/60 text-primary py-3.5 rounded-full font-headline font-bold text-xs tracking-wider uppercase transition-colors">
                Order More Spices
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-cream flex items-center justify-center font-body">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-on-surface-variant font-headline font-semibold">
              Loading confirmation dashboard...
            </p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
