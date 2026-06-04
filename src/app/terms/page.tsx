import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms & Conditions for Vintage Global Trading, operated by Vintage Global Ventures Private Limited. Read our policies on orders, payments, liability, and governing law.",
};

export default function TermsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="text-white/75 text-sm font-medium max-w-xl mx-auto">
            Effective Date: June 2026 &nbsp;|&nbsp; Vintage Global Ventures Private Limited
          </p>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-[860px] mx-auto px-4 md:px-8 py-16 text-on-surface">

        {/* Intro */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 mb-10">
          <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
            Welcome to <strong>Vintage Global Trading</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), operated by{" "}
            <strong>Vintage Global Ventures Private Limited</strong>. By accessing or using our website, Vintage Global Trading, you agree to comply with these Terms &amp; Conditions.
          </p>
        </div>

        <div className="space-y-10">
          <PolicySection number="1" title="Business Nature">
            <p>
              Vintage Global Trading is engaged in the trading, sourcing, supply, export, import, wholesale, and distribution of spices, spice products, agricultural commodities, and related products.
            </p>
          </PolicySection>

          <PolicySection number="2" title="Product Information">
            <p>
              We strive to ensure that all product descriptions, specifications, and pricing are accurate. However, typographical errors, pricing inaccuracies, or product availability issues may occur.
            </p>
            <p className="mt-3">We reserve the right to:</p>
            <BulletList items={[
              "Modify product information without notice.",
              "Refuse or cancel orders due to pricing or stock errors.",
              "Limit quantities purchased by customers.",
            ]} />
          </PolicySection>

          <PolicySection number="3" title="Orders & Acceptance">
            <p>
              All orders placed through our website are subject to acceptance and verification. An order confirmation does not constitute acceptance of an order. We reserve the right to refuse or cancel any order at our sole discretion.
            </p>
          </PolicySection>

          <PolicySection number="4" title="Pricing & Payments">
            <p>
              All prices are displayed in Indian Rupees (INR) unless otherwise stated.
            </p>
            <p className="mt-3">
              Payments are securely processed through authorised payment gateways including <strong>PayU</strong> and other approved payment service providers. Payment gateway providers process transactions independently and are subject to their respective policies.
            </p>
          </PolicySection>

          <PolicySection number="5" title="Export & Regulatory Compliance">
            <p>
              Customers purchasing products for export shall comply with applicable import/export regulations, customs requirements, and local laws. The Company shall not be responsible for delays caused by customs authorities or regulatory agencies.
            </p>
          </PolicySection>

          <PolicySection number="6" title="Intellectual Property">
            <p>
              All content on this website, including text, images, logos, graphics, and product information, is the property of <strong>Vintage Global Ventures Private Limited</strong> and may not be copied, reproduced, or distributed without written permission.
            </p>
          </PolicySection>

          <PolicySection number="7" title="Limitation of Liability">
            <p>The Company shall not be liable for:</p>
            <BulletList items={[
              "Indirect or consequential damages.",
              "Loss of profits or business interruption.",
              "Delays caused by logistics providers, customs authorities, force majeure events, or third parties.",
            ]} />
          </PolicySection>

          <PolicySection number="8" title="Governing Law">
            <p>
              These Terms shall be governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of courts located in <strong>Ernakulam, Kerala, India</strong>.
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
          { href: "/privacy", label: "Privacy Policy" },
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
