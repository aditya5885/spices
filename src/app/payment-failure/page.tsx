"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentFailureContent() {
  const searchParams = useSearchParams();

  // Extract payment details
  const txnId = searchParams.get("txnid") || "N/A";
  const errorMessage = searchParams.get("message") || "The payment transaction was declined by the bank or cancelled by the user.";
  const amount = searchParams.get("amount") || "";

  return (
    <div className="min-h-screen bg-background-cream py-16 px-4 md:px-16 flex items-center justify-center font-body">
      <div className="max-w-2xl w-full bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Failure Header */}
        <div className="bg-secondary text-white text-center py-12 px-6 relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-30px] left-[-30px] w-28 h-28 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <span className="material-symbols-outlined text-white text-5xl">
              error
            </span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl tracking-wide uppercase">
            Payment Failed
          </h1>
          <p className="text-sm opacity-90 mt-2 font-medium">
            We couldn&apos;t complete your transaction.
          </p>
        </div>

        {/* Details & Information */}
        <div className="p-8 space-y-8">
          <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/20 space-y-4">
            <h3 className="font-headline font-bold text-xs text-secondary uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-lg leading-none">warning</span>
              Failure Summary
            </h3>
            
            <div className="space-y-3 text-xs font-semibold text-on-surface-variant">
              <div className="flex justify-between border-b border-outline-variant/15 pb-2">
                <span>Transaction ID:</span>
                <span className="font-mono text-on-surface font-bold">{txnId}</span>
              </div>
              {amount && (
                <div className="flex justify-between border-b border-outline-variant/15 pb-2">
                  <span>Amount:</span>
                  <span className="text-on-surface font-bold">₹{parseFloat(amount).toLocaleString("en-IN")} INR</span>
                </div>
              )}
              <div className="flex flex-col gap-1 pt-1">
                <span>Reason:</span>
                <span className="text-secondary font-medium text-xs leading-relaxed bg-white border border-outline-variant/20 p-3 rounded-lg mt-1 font-mono">
                  {errorMessage}
                </span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-4 text-xs font-medium text-on-surface-variant">
            <h4 className="font-headline font-bold text-xs text-primary uppercase tracking-wider">
              Suggested Next Steps:
            </h4>
            <ul className="space-y-3 list-disc pl-5 leading-relaxed">
              <li>Check if your card information or UPI credentials were entered correctly on the PayU portal.</li>
              <li>Verify that your bank account has sufficient funds or that your card is enabled for online transactions.</li>
              <li>Try choosing a different payment method such as Unified Payments Interface (UPI) or Net Banking.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline-variant/20">
            <Link href="/order" className="flex-grow">
              <button className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-full font-headline font-bold text-xs tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">replay</span>
                Try Payment Again
              </button>
            </Link>
            <Link href="/" className="flex-grow">
              <button className="w-full bg-white hover:bg-surface-container border border-outline-variant/60 text-primary py-3.5 rounded-full font-headline font-bold text-xs tracking-wider uppercase transition-colors">
                Return to Shop
              </button>
            </Link>
          </div>

          {/* Support Helpline link */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-on-surface-variant font-semibold">
              Need assistance? Contact our helpline at{" "}
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
                WhatsApp Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-cream flex items-center justify-center font-body">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-on-surface-variant font-headline font-semibold">
              Loading error details...
            </p>
          </div>
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
