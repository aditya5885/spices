import React from "react";
import Link from "next/link";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="bg-surface-container-highest dark:bg-charcoal text-on-surface">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 pt-16 pb-8">
        {/* Contact CTA Banner */}
        <div className="bg-primary rounded-2xl p-8 md:p-12 mb-16 flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          </div>
          <div className="relative z-10 text-center lg:text-left">
            <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-white mb-2">
              Have Questions or Special Orders?
            </h3>
            <p className="text-white/80 text-sm font-medium">
              Reach out to our customer care team for custom spice packages, corporate gifts, or restaurant supply queries.
            </p>
          </div>
          <div className="relative z-10 w-full lg:w-auto flex justify-center lg:justify-end">
            <Link href="/contact">
              <button className="bg-secondary text-white hover:bg-secondary-container px-10 py-4 rounded-full font-headline font-bold text-xs tracking-wider uppercase hover:scale-[1.03] transition-transform duration-300 shadow-md">
                Contact Us Now
              </button>
            </Link>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="block mb-3">
              <Image
                src="/images/headlogo_trimmed.png"
                alt="Vintage Global Ventures"
                width={220}
                height={70}
              />
            </Link>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              The premium standard for authentic Indian spices. Sourcing directly from regional farms to bring pure flavors to your kitchen.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Social Link"
              >
                <span className="material-symbols-outlined text-md">social_leaderboard</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Social Share Link"
              >
                <span className="material-symbols-outlined text-md">share</span>
              </a>
              <a
                href="mailto:hello@vintageglobalventures.com"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Email Link"
              >
                <span className="material-symbols-outlined text-md">alternate_email</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-headline text-xs font-bold text-primary uppercase mb-6 tracking-widest">
              Our Products
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link href="/#products" className="text-on-surface-variant hover:text-primary transition-colors">
                  Turmeric Powder
                </Link>
              </li>
              <li>
                <Link href="/#products" className="text-on-surface-variant hover:text-primary transition-colors">
                  Whole Black Pepper
                </Link>
              </li>
              <li>
                <Link href="/#products" className="text-on-surface-variant hover:text-primary transition-colors">
                  Green Cardamom
                </Link>
              </li>
              <li>
                <Link href="/#products" className="text-on-surface-variant hover:text-primary transition-colors">
                  Ceylon Cinnamon
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-xs font-bold text-primary uppercase mb-6 tracking-widest">
              Customer Care
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors">
                  Quality Standards
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors">
                  Certifications
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-on-surface-variant hover:text-primary transition-colors">
                  Bulk & Gift Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-xs font-bold text-primary uppercase mb-6 tracking-widest">
              Information
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors">
                  Our Heritage
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-on-surface-variant hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-on-surface-variant">
          <p>© {new Date().getFullYear()} Vintage Global Ventures. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-headline font-bold text-[10px] tracking-widest uppercase">
              Systems Status: Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
