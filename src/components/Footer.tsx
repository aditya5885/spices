"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {

  const handleProductLinkClick = (href: string) => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        window.location.href = href;
      }
    }
  };

  return (
    <footer className="bg-[#0b1a0e] text-white border-t border-white/10 relative overflow-hidden">
      {/* Premium Background Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#fe932c_1px,transparent_1px),linear-gradient(to_bottom,#fe932c_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#904d00]/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-16 pt-16 pb-8 relative z-10">

        {/* Contact CTA Banner */}
        <div className="relative bg-gradient-to-br from-[#12311b] to-[#0c1f12] rounded-2xl p-8 md:p-12 mb-16 border border-white/10 shadow-2xl overflow-hidden group">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#fe932c]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#fe932c]/15 transition-all duration-700"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="text-center lg:text-left max-w-2xl">
              <span className="text-[#fe932c] font-headline font-bold text-xs uppercase tracking-widest block mb-2">Partner with Us</span>
              <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-white mb-3">
                Have Questions or Special Bulk Orders?
              </h3>
              <p className="text-white/70 text-sm leading-relaxed font-body font-normal">
                Reach out to our customer care team for custom spice packages, corporate gifting, or wholesale restaurant supply queries.
              </p>
            </div>
            <div className="w-full lg:w-auto flex justify-center flex-shrink-0">
              <Link href="/contact">
                <button className="bg-[#fe932c] hover:bg-[#e07e22] text-[#0b1a0e] px-10 py-4 rounded-full font-headline font-extrabold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg hover:shadow-[#fe932c]/20 hover:scale-[1.03] active:scale-[0.98] cursor-pointer">
                  Contact Us Now
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-16">

          {/* Brand & Address Column */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <Image
                src="/images/headlogo_trimmed.webp"
                alt="Vintage Global Ventures"
                width={240}
                height={60}
                className="h-10 w-auto brightness-0 invert"
                priority
              />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed font-body">
              The premium standard for authentic, origin-verified Indian spices. Sourcing directly from regional farms to bring pure flavors to your kitchen.
            </p>

            <div className="space-y-3.5 text-white/50 text-xs font-body">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[18px] text-[#fe932c] mt-0.5">location_on</span>
                <span className="leading-relaxed">
                  55/1668, Suraj Buildings, Club Road,<br />
                  Giri Nagar, Kadavanthara,<br />
                  Ernakulam – 682020, Kerala, India
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              {[
                { href: "mailto:info@vintageglobaltrading.com", icon: "alternate_email", label: "Email" },
                { href: "https://wa.me/919999999999", icon: "chat", label: "WhatsApp", target: "_blank" },
                { href: "tel:+919999999999", icon: "call", label: "Call Us" }
              ].map(({ href, icon, label, target }) => (
                <a
                  key={label}
                  href={href}
                  target={target}
                  rel={target ? "noopener noreferrer" : undefined}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-[#fe932c] hover:text-[#0b1a0e] hover:border-[#fe932c] transition-all duration-300"
                  aria-label={label}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="hidden lg:block md:col-span-1"></div>

          {/* Our Products */}
          <div className="md:col-span-2">
            <h4 className="font-headline text-xs font-bold text-white uppercase mb-6 tracking-widest border-l-2 border-[#fe932c] pl-3">
              Our Products
            </h4>
            <ul className="space-y-3.5 text-sm font-body">
              {[
                { href: "/?search=Premium%20Turmeric#products", label: "Premium Turmeric" },
                { href: "/?search=Black%20Pepper#products", label: "Black Pepper" },
                { href: "/?search=Green%20Cardamom#products", label: "Green Cardamom" },
                { href: "/?search=Ceylon%20Cinnamon#products", label: "Ceylon Cinnamon" },
                { href: "/?search=Dry%20Ginger%20Powder#products", label: "Dry Ginger Powder" },
                { href: "/?search=Clove%20Buds#products", label: "Clove Buds" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={() => handleProductLinkClick(href)}
                    className="text-white/60 hover:text-[#fe932c] hover:pl-1 transition-all duration-200 block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-2">
            <h4 className="font-headline text-xs font-bold text-white uppercase mb-6 tracking-widest border-l-2 border-[#fe932c] pl-3">
              Customer Care
            </h4>
            <ul className="space-y-3.5 text-sm font-body">
              {[
                { href: "/shipping-policy", label: "Shipping & Delivery" },
                { href: "/refund-policy", label: "Refund & Cancellation" },
                { href: "/about", label: "Quality Standards" },
                { href: "/contact", label: "Bulk & Gift Orders" },
                { href: "/contact", label: "Contact Support" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-white/60 hover:text-[#fe932c] hover:pl-1 transition-all duration-200 block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="md:col-span-3">
            <h4 className="font-headline text-xs font-bold text-white uppercase mb-6 tracking-widest border-l-2 border-[#fe932c] pl-3">
              Legal & Policies
            </h4>
            <ul className="space-y-3.5 text-sm font-body">
              {[
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/refund-policy", label: "Refund Policy" },
                { href: "/shipping-policy", label: "Shipping Policy" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact Us" }
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-white/60 hover:text-[#fe932c] hover:pl-1 transition-all duration-200 block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-8"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-xs text-white/50 font-body">
          <div className="text-center lg:text-left space-y-2">
            <p className="font-medium text-white/70">
              © {new Date().getFullYear()} Vintage Global Ventures Private Limited. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-1 text-[10px] opacity-75">
              <span>CIN: U01403KL2024PTC093XXX</span>
              <span className="hidden sm:inline">•</span>
              <span>FSSAI License No: 11324007000XXX</span>
              <span className="hidden sm:inline">•</span>
              <span>GSTIN: 32AAGCV1850M1ZX</span>
            </div>


          </div>

          {/* Trust badges and status */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-3.5 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[14px] text-[#fe932c]">lock</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Payments Secured by PayU</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
