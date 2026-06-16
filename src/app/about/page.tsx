import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the heritage, mission, and direct-sourcing ethics of Vintage Global Ventures, from small-scale Indian plantations directly to your kitchen.",
};

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative pt-32 pb-24 md:pt-48 md:pb-36 bg-surface-container-low overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/spice_plantation.webp"
            alt="Spice Plantation Sourcing"
            fill
            priority
            className="object-cover opacity-15 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-cream via-transparent to-background-cream"></div>
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <span className="font-headline font-bold text-primary text-xs uppercase tracking-[0.2em] mb-4 block">
            Our Legacy
          </span>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-6 leading-tight">
            Cultivating Trust <br />
            From Farm to Kitchen
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-lg leading-relaxed text-on-surface-variant font-medium">
            From a local family trading post to a premium domestic spice provider, our journey is defined by an uncompromising commitment to quality and ethical sourcing.
          </p>
        </div>
      </header>

      {/* Heritage & Mission: Bento Style */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Story Card */}
          <div className="lg:col-span-7 bg-surface-container-low rounded-2xl p-8 md:p-12 flex flex-col justify-center border border-outline-variant/20 shadow-sm hover:scale-[1.01] transition-transform duration-300">
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-primary mb-6">
              A Family-Owned Vision
            </h2>
            <div className="space-y-6 text-sm md:text-md text-on-surface-variant leading-relaxed font-medium">
              <p>
                Founded three generations ago, Vintage Global Ventures began with a simple belief: that Indian homes deserve spices in their purest, most authentic form. What started as a modest storefront catering to local culinary markets has evolved into a premium supply network dedicated to freshness.
              </p>
              <p>
                Today, we bridge the gap between small-scale Indian farming communities and culinary enthusiasts. We don&apos;t just sell products; we share the rich agricultural heritage of the land and the integrity of the people who cultivate it.
              </p>
            </div>
            <div className="mt-10 flex gap-8 border-t border-outline-variant/30 pt-8">
              <div>
                <div className="font-headline text-3xl font-extrabold text-primary">10k+</div>
                <div className="font-headline font-bold text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
                  Happy Households
                </div>
              </div>
              <div>
                <div className="font-headline text-3xl font-extrabold text-primary">350+</div>
                <div className="font-headline font-bold text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
                  Local Partnerships
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing Image Frame */}
          <div className="lg:col-span-5 relative h-[300px] lg:h-auto rounded-2xl overflow-hidden group border border-outline-variant/30">
            <Image
              src="/images/cinnamon_sorting.webp"
              alt="Hands sorting high quality cinnamon quills"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-300"></div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-surface-container">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl font-extrabold text-primary mb-4">
              Driven by Values
            </h2>
            <div className="h-1 w-20 bg-secondary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Value 1 */}
            <div className="text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md border border-outline-variant/20 hover:scale-105 transition-transform duration-200">
                <span className="material-symbols-outlined text-secondary text-3xl">verified</span>
              </div>
              <h3 className="font-headline text-md font-bold text-primary">Uncompromising Quality</h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                Every batch undergoes rigorous quality testing to ensure it meets the highest domestic safety, purity, and potency standards.
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md border border-outline-variant/20 hover:scale-105 transition-transform duration-200">
                <span className="material-symbols-outlined text-secondary text-3xl">handshake</span>
              </div>
              <h3 className="font-headline text-md font-bold text-primary">Direct Integrity</h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                Transparency in every pack. We guarantee harvest origin traceability from the plantation gate to your home kitchen.
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md border border-outline-variant/20 hover:scale-105 transition-transform duration-200">
                <span className="material-symbols-outlined text-secondary text-3xl">eco</span>
              </div>
              <h3 className="font-headline text-md font-bold text-primary">Future Sustainability</h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                Investing in regenerative farming practices and fair-wage initiatives that protect both the longevity of the soil and our farming communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing section */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-16 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Sourcing Image Frame with Glass Overlay */}
          <div className="relative flex justify-center">
            <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border-[24px] md:border-[32px] border-surface-container overflow-hidden relative shadow-lg">
              <Image
                src="/images/spice_farmer.webp"
                alt="Spice farmer smile in the field"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating Glass Card */}
            <div className="absolute bottom-4 right-0 md:right-8 glass-card p-6 rounded-2xl shadow-xl max-w-[280px] border border-white/40">
              <span className="material-symbols-outlined text-primary mb-2 text-3xl">location_on</span>
              <h4 className="font-headline font-bold text-sm text-primary mb-1">Direct Relationships</h4>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                We trade directly with independent farmers, ensuring they receive premiums that support families and sustainable local farming.
              </p>
            </div>
          </div>

          {/* Sourcing description details */}
          <div className="space-y-6">
            <span className="text-secondary font-headline font-bold text-xs uppercase tracking-widest block">
              Ethical Sourcing
            </span>
            <h2 className="font-headline text-3xl font-extrabold text-primary">
              Where Authenticity Meets Equity
            </h2>
            <p className="text-on-surface-variant text-sm md:text-md leading-relaxed font-medium">
              We source our spices from region-specific hubs known for producing individual varieties under optimal microclimates: Cardamom from the high ranges of Idukki, Ginger and Turmeric from Alleppey, and Black Pepper from the coastal slopes of Malabar.
            </p>
            <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
              By maintaining direct links with growers and providing them with agricultural education and eco-friendly soil practices, we secure top-grade products for Indian homes while building a resilient future for rural farming communities.
            </p>
            <div className="pt-4">
              <Link href="/order">
                <button className="bg-primary text-white hover:bg-primary-container px-6 py-3 rounded-lg font-headline font-bold text-xs tracking-wider uppercase transition-colors">
                  Shop Spices Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
