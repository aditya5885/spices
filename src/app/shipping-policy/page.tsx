import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description: "Shipping and Delivery Policy of Vintage Global Ventures Private Limited — coverage, timelines, charges, and customs information.",
};

export default function ShippingPolicyPage() {
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
            Shipping &amp; Delivery Policy
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
            This Shipping &amp; Delivery Policy describes how <strong>Vintage Global Ventures Private Limited</strong> handles order processing, dispatch timelines, shipping coverage, and customs responsibilities for all orders placed through our website.
          </p>
        </div>

        {/* Delivery timeline cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider mb-1">Domestic Deliveries</h3>
              <p className="text-xs text-on-surface-variant font-semibold">3–10 Business Days across India</p>
            </div>
          </div>
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-2xl">flight</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-secondary uppercase tracking-wider mb-1">International Deliveries</h3>
              <p className="text-xs text-on-surface-variant font-semibold">7–30 Business Days depending on destination</p>
            </div>
          </div>
        </div>

        <div className="space-y-10">

          <PolicySection number="1" title="Shipping Coverage">
            <p>
              We ship across <strong>India</strong> and selected international destinations. Please contact us to confirm availability for your specific country before placing an international order.
            </p>
          </PolicySection>

          <PolicySection number="2" title="Processing Time">
            <p>
              Orders are generally processed within <strong>2–5 business days</strong> after payment confirmation. You will receive a dispatch notification once your order has been handed over to the courier partner.
            </p>
          </PolicySection>

          <PolicySection number="3" title="Delivery Timelines">
            <p>Delivery timelines may vary depending on:</p>
            <BulletList items={[
              "Destination country or region",
              "Customs procedures and clearance",
              "Logistics partner schedules",
              "Weather conditions and force majeure events",
            ]} />
          </PolicySection>

          <PolicySection number="4" title="Shipping Charges">
            <p>
              Shipping charges, if applicable, will be displayed clearly during checkout before order confirmation. Free standard shipping may apply on orders above a qualifying threshold.
            </p>
          </PolicySection>

          <PolicySection number="5" title="Customs & Duties">
            <p>
              For international shipments, <strong>customs duties, taxes, and import charges shall be borne by the buyer</strong> unless otherwise agreed in writing. We are not responsible for delays caused by customs inspections or regulatory clearances in the destination country.
            </p>
          </PolicySection>

          <PolicySection number="6" title="Shipment Tracking">
            <p>
              Tracking information will be shared via email and/or SMS/WhatsApp once the order is dispatched. For queries regarding your shipment status, please contact our support team.
            </p>
          </PolicySection>

          <PolicySection number="7" title="Failed Deliveries">
            <p>
              Additional charges arising from failed delivery attempts due to an incorrect address, non-availability of the recipient, or refusal to accept the parcel may be recovered from the customer. Please ensure your shipping address and contact details are accurate at the time of placing the order.
            </p>
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
          { href: "/refund-policy", label: "Refund & Cancellation" },
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
