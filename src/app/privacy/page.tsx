import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy of Vintage Global Ventures Private Limited — how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
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
            Privacy Policy
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
            <strong>Vintage Global Ventures Private Limited</strong> respects your privacy and is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights regarding that data.
          </p>
        </div>

        <div className="space-y-10">

          <PolicySection number="1" title="Information We Collect">
            <p className="font-semibold text-on-surface mb-2">Personal Information</p>
            <BulletList items={[
              "Name",
              "Email Address",
              "Mobile Number",
              "Billing Address",
              "Shipping Address",
              "Company Details",
              "GST Information (if applicable)",
            ]} />
            <p className="font-semibold text-on-surface mt-4 mb-2">Technical Information</p>
            <BulletList items={[
              "IP Address",
              "Browser Information",
              "Device Information",
              "Website Usage Data",
            ]} />
          </PolicySection>

          <PolicySection number="2" title="How We Use Information">
            <p>We use collected information to:</p>
            <BulletList items={[
              "Process orders",
              "Deliver products",
              "Respond to enquiries",
              "Improve our services",
              "Comply with legal obligations",
              "Prevent fraud and unauthorised transactions",
            ]} />
          </PolicySection>

          <PolicySection number="3" title="Payment Information">
            <p>
              Payment transactions are processed through secure third-party payment gateways including <strong>PayU</strong>. We do not store complete credit card, debit card, UPI PIN, or banking credentials on our servers.
            </p>
          </PolicySection>

          <PolicySection number="4" title="Information Sharing">
            <p>We may share information with:</p>
            <BulletList items={[
              "Logistics partners",
              "Payment processors",
              "Government authorities when legally required",
              "Professional advisors and auditors",
            ]} />
            <p className="mt-3 font-semibold text-on-surface">We do not sell personal information to third parties.</p>
          </PolicySection>

          <PolicySection number="5" title="Data Security">
            <p>
              Reasonable security measures are implemented to safeguard customer information from unauthorised access, misuse, or disclosure. Our website uses HTTPS encryption for all data in transit.
            </p>
          </PolicySection>

          <PolicySection number="6" title="Contact">
            <div className="bg-background-cream border border-outline-variant/20 rounded-xl p-5 not-italic space-y-1">
              <p className="font-bold text-primary text-sm">Vintage Global Ventures Private Limited</p>
              <p>55/744A, Kuthukuzhy Road, Girinagar, Kadavanthra, Ernakulam, Kerala – India</p>
              <p>
                Email:{" "}
                <a href="mailto:info@vintageglobaltrading.com" className="text-primary hover:underline font-semibold">
                  info@vintageglobaltrading.com
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
          { href: "/refund-policy", label: "Refund & Cancellation" },
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
