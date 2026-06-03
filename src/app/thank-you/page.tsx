"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || `EXP-${Math.floor(100000 + Math.random() * 899999)}`;
  const paymentId = searchParams.get("paymentId") || "pay_invoice_pending";
  const productSlug = searchParams.get("product") || "premium-turmeric";
  const packSize = searchParams.get("size") || "500g";
  const qty = searchParams.get("qty") || "1";
  const name = searchParams.get("name") || "Valued Customer";
  const total = searchParams.get("total") || "0";
  const method = searchParams.get("method") || "Razorpay";

  const getProductName = (slug: string) => {
    switch (slug) {
      case "premium-turmeric":
        return "Premium Turmeric Powder";
      case "black-pepper":
        return "Whole Black Pepper";
      case "green-cardamom":
        return "Green Cardamom Bold";
      case "ceylon-cinnamon":
        return "Ceylon Cinnamon Alba";
      default:
        return "Premium Spice Pack";
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-4 py-20 text-on-surface">
      <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 md:p-12 shadow-lg text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
          <span className="material-symbols-outlined text-5xl leading-none select-none">
            check_circle
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-secondary font-headline font-bold text-xs uppercase tracking-widest block">
            Order Confirmed
          </span>
          <h1 className="font-headline text-3xl font-extrabold text-primary">
            Thank You For Your Order!
          </h1>
          <p className="text-xs text-on-surface-variant font-semibold">
            Your spice order has been successfully placed. A confirmation email has been sent.
          </p>
        </div>

        {/* Order Details box */}
        <div className="bg-background-cream rounded-2xl border border-outline-variant/20 p-6 text-left space-y-4 font-semibold text-xs text-on-surface-variant">
          <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wide border-b border-outline-variant/10 pb-3">
            Transaction Details
          </h3>
          <div className="grid grid-cols-2 gap-y-3">
            <span>Order Reference</span>
            <span className="text-primary text-right font-headline font-bold">{orderId}</span>

            <span>Payment Reference</span>
            <span className="text-on-surface text-right break-all">{paymentId}</span>

            <span>Customer Contact</span>
            <span className="text-on-surface text-right">
              {name}
            </span>

            <span>Spice Product</span>
            <span className="text-on-surface text-right">{getProductName(productSlug)}</span>

            <span>Order Quantity</span>
            <span className="text-on-surface text-right">{qty} x {packSize} pack{Number(qty) > 1 ? "s" : ""}</span>

            <span>Payment Method</span>
            <span className="text-on-surface text-right font-headline uppercase text-[10px] tracking-wider">
              {method}
            </span>

            <span>Paid Total (INR)</span>
            <span className="text-secondary text-right font-headline text-sm font-bold">
              ₹{Number(total).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Delivery / Logistics Information */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-left flex gap-4 items-start">
          <span className="material-symbols-outlined text-primary text-2xl mt-0.5 select-none">
            local_shipping
          </span>
          <div>
            <h4 className="font-headline font-bold text-[11px] text-primary uppercase">
              Shipping & Courier Dispatch Timeline
            </h4>
            <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed mt-1">
              Your order will be carefully packed in our moisture-proof pouches and dispatched via our express courier partner within 24 hours. A tracking link will be sent to your phone number and email as soon as it leaves our Kochi facility.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3.5 rounded-lg border border-outline-variant/50 text-on-surface hover:bg-background-cream font-headline font-bold text-xs tracking-wider uppercase transition-colors"
          >
            Print Confirmation
          </button>
          <Link href="/">
            <button className="px-8 py-3.5 rounded-lg bg-primary hover:bg-primary-container text-white font-headline font-bold text-xs tracking-wider uppercase transition-colors shadow-md">
              Return to Homepage
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[720px] mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-on-surface-variant font-headline font-semibold">Loading confirmation details...</p>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
