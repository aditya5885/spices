import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refund and Cancellation Policy for Vintage Global Ventures Private Limited — eligibility, timelines, and return procedures.",
};

export default function RefundPolicyPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <header className="bg-primary relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <span className="font-headline font-bold text-secondary-container text-xs uppercase tracking-[0.2em] mb-4 block">
            Legal Documentation
          </span>
          <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-white/75 text-sm font-medium max-w-xl mx-auto">
            Effective Date: June 2026 &nbsp;|&nbsp; Vintage Global Ventures Private Limited
          </p>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-[860px] mx-auto px-4 md:px-8 py-16 text-on-surface">

        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 mb-10">
          <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
            This Refund &amp; Cancellation Policy outlines the conditions under which orders may be cancelled and refunds processed by <strong>Vintage Global Ventures Private Limited</strong>. Please read carefully before placing your order.
          </p>
        </div>

        <div className="space-y-10">

          <PolicySection number="1" title="Order Cancellation">
            <BulletList items={[
              "Orders may be cancelled before dispatch by contacting our support team.",
              "Once products are shipped, cancellation requests may not be accepted.",
            ]} />
          </PolicySection>

          <PolicySection number="2" title="Refund Eligibility">
            <p>Refunds may be approved in the following cases:</p>
            <BulletList items={[
              "Product damaged during transit.",
              "Wrong product supplied.",
              "Product unavailable after payment.",
              "Duplicate payment received.",
            ]} />
          </PolicySection>

          <PolicySection number="3" title="Non-Refundable Situations">
            <p>Refunds shall <strong>not</strong> be provided for:</p>
            <BulletList items={[
              "Change of mind.",
              "Incorrect shipping details provided by the customer.",
              "Delay caused by customs clearance.",
              "Minor variations in colour, packaging, or natural agricultural product characteristics.",
            ]} />
          </PolicySection>

          <PolicySection number="4" title="Refund Processing">
            <p>
              Approved refunds will be processed through the original payment method within <strong>7–15 business days</strong>.
            </p>
            <p className="mt-3">
              Payment gateway settlement timelines may vary depending on the customer&apos;s bank and payment provider.
            </p>
          </PolicySection>

          <PolicySection number="5" title="Return Procedure">
            <p>Customers must notify us within <strong>48 hours of delivery</strong> with:</p>
            <BulletList items={[
              "Order Number",
              "Product Images",
              "Description of the issue",
            ]} />
            <div className="mt-4 bg-background-cream border border-outline-variant/20 rounded-xl p-5 space-y-1 text-sm">
              <p className="font-bold text-primary">Contact our support team:</p>
              <p>
                Email:{" "}
                <a href="mailto:info@vintageglobaltrading.com" className="text-primary hover:underline font-semibold">
                  info@vintageglobaltrading.com
                </a>
              </p>
              <p>
                WhatsApp:{" "}
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                  Chat with Us
                </a>
              </p>
            </div>
          </PolicySection>
        </div>

        <PolicyFooterNav />
      </main>
    </div>
  );
}

/* ─── Shared sub-components ─── */
function PolicySection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-start gap-4 mb-4">
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-white font-headline font-extrabold text-sm flex items-center justify-center">
          {number}
        </span>
        <h2 className="font-headline font-extrabold text-lg text-primary mt-1">{title}</h2>
      </div>
      <div className="pl-[52px] text-sm text-on-surface-variant leading-relaxed font-medium space-y-2">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-outside pl-5 space-y-1.5 mt-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function PolicyFooterNav() {
  return (
    <div className="mt-16 pt-8 border-t border-outline-variant/30">
      <p className="text-xs text-on-surface-variant font-semibold mb-4 uppercase tracking-widest">Related Policies</p>
      <div className="flex flex-wrap gap-3">
        {[
          { href: "/terms", label: "Terms & Conditions" },
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/shipping-policy", label: "Shipping & Delivery" },
          { href: "/contact", label: "Contact Us" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-xs font-bold text-primary border border-primary/20 rounded-full px-4 py-2 hover:bg-primary/5 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
