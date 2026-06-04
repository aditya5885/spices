"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import FAQSection from "@/components/FAQSection";
import { Product } from "@/types";
import { products as fallbackProducts } from "@/data/products";

export default function HomePage() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Extract search parameter
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search") || "";
    setSearchQuery(search);

    // 2. Fetch products from PHP API with JSON validation
    fetch("/api/products.php")
      .then((res) => {
        // Ensure response is JSON
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        if (!contentType.includes("application/json")) {
          // Unexpected HTML or other content, treat as error
          throw new Error("API returned non-JSON response");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProductsList(data);
        } else {
          throw new Error("Invalid format");
        }
      })
      .catch((err) => {
        console.warn("API not available or returned invalid data, falling back to static catalogue:", err);
        setProductsList(fallbackProducts);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Filter based on search query
  // In src/app/page.tsx after filteredProducts definition
  const filteredProducts = productsList.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.badge && product.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.specs && product.specs.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Notify Header about search result count and items
  React.useEffect(() => {
    const event = new CustomEvent('productSearchResult', { detail: filteredProducts });
    window.dispatchEvent(event);
  }, [filteredProducts]);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <Image
            src="https://lh3.googleusercontent.com/aida/ADBb0uhmetOTcF3lItwtUpDXOevVnsBQRkBWfWEi_qk_vEJRlXV2neKGMY7WerDMwk3rgbFK3NfFVjqDTQkrFRST19WspzTehFw16B0nLOqavxM5lwIszr5_-u3pRqCgDtC10TUUUZ6yvdk7YQ4hohy3I7liv-TsvYYJZcZ09nA0pLgu71z2_lu37bNks56VeltlmhTse82ni4vrubM1VBtYSa2aWDhpE_smQLTDgkcy5oU3D4O6DcdrdlTyO9o"
            alt="Premium Spices Banner"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="relative z-20 max-w-[1280px] mx-auto px-4 md:px-16 w-full py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-white mb-6 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
              <span className="font-headline font-bold text-[10px] tracking-widest uppercase">
                Premium Farm-Direct Spices
              </span>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
              Premium Indian Spices <br />
              Delivered <span className="text-secondary-container">To Your Kitchen</span>
            </h1>
            <p className="text-white/90 text-md md:text-lg leading-relaxed mb-10 max-w-xl font-medium">
              Direct sourcing from the lush, heritage plantations of South India. We bring handpicked, sun-dried, and pure culinary spices straight to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/order">
                <button className="bg-primary text-white px-8 py-4 rounded-full font-headline font-bold text-xs tracking-wider uppercase hover:scale-105 transition-all shadow-xl flex items-center gap-2">
                  Order Now
                  <span className="material-symbols-outlined text-sm leading-none">shopping_cart</span>
                </button>
              </Link>
              <Link href="#products">
                <button className="glass-panel text-white border-white/40 px-8 py-4 rounded-full font-headline font-bold text-xs tracking-wider uppercase hover:bg-white/10 transition-all">
                  View Products
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <span className="material-symbols-outlined text-white text-4xl select-none">
            keyboard_double_arrow_down
          </span>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-16" id="products">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-secondary font-headline font-bold text-xs uppercase tracking-widest block mb-4">
              Our Premium Collection
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary">
              {searchQuery ? `Search Results for "${searchQuery}"` : "The Finest Origin-Verified Spices"}
            </h2>
          </div>
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                window.history.pushState({}, "", "/");
              }}
              className="text-primary font-headline font-bold text-xs tracking-widest flex items-center gap-2 hover:gap-3 transition-all uppercase border border-primary/20 rounded-full px-4 py-2 hover:bg-primary/5 cursor-pointer"
            >
              Clear Search{" "}
              <span className="material-symbols-outlined leading-none text-sm align-middle ml-1">close</span>
            </button>
          ) : (
            <Link
              href="/#products"
              className="text-primary font-headline font-bold text-xs tracking-widest flex items-center gap-2 hover:gap-4 transition-all uppercase"
            >
              EXPLORE FULL CATALOGUE{" "}
              <span className="material-symbols-outlined leading-none text-sm">trending_flat</span>
            </Link>
          )}
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-white border border-outline-variant/30 rounded-2xl p-6 h-[420px] flex flex-col justify-between">
                <div className="bg-surface-container/60 rounded-xl h-48 w-full"></div>
                <div className="space-y-3 mt-6 flex-1">
                  <div className="h-5 bg-surface-container/60 rounded w-2/3"></div>
                  <div className="h-3.5 bg-surface-container/60 rounded w-full"></div>
                  <div className="h-3.5 bg-surface-container/60 rounded w-4/5"></div>
                </div>
                <div className="h-10 bg-surface-container/60 rounded-full w-full mt-6"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-outline-variant/30 rounded-2xl p-8 max-w-xl mx-auto shadow-sm">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 select-none">search_off</span>
            <h3 className="font-headline font-bold text-lg text-primary mb-2">No Spices Found</h3>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6">
              We couldn&apos;t find any spices matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                window.history.pushState({}, "", "/");
              }}
              className="bg-primary text-white px-6 py-3 rounded-full font-headline font-bold text-xs tracking-wider uppercase hover:scale-105 transition-transform shadow-md cursor-pointer"
            >
              Show All Spices
            </button>
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-surface-container py-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="text-center mb-16">
            <span className="text-secondary font-headline font-bold text-xs uppercase tracking-widest block mb-4">
              Our Core Standards
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary">
              The Vintage Global Difference
            </h2>
            <p className="text-on-surface-variant text-sm font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
              We bring the authentic, rich flavors of Indian plantations directly to culinary enthusiasts and professional kitchens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-outline-variant/30 text-center group hover:scale-[1.03] transition-transform duration-300 shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-115 transition-transform duration-300 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
              </div>
              <h3 className="font-headline text-md font-bold text-primary mb-4">Doorstep Delivery</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                Fast courier delivery all over India, with orders carefully packed in resealable zip-locks to maintain maximum aroma and freshness.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-outline-variant/30 text-center group hover:scale-[1.03] transition-transform duration-300 shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-115 transition-transform duration-300 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
              </div>
              <h3 className="font-headline text-md font-bold text-primary mb-4">Pure & Certified</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                100% natural spices containing no fillers, colors, or preservatives. Certified by FSSAI and tested for maximum curcumin and piperine active oils.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-outline-variant/30 text-center group hover:scale-[1.03] transition-transform duration-300 shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-115 transition-transform duration-300 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">agriculture</span>
              </div>
              <h3 className="font-headline text-md font-bold text-primary mb-4">Direct Sourcing</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                Procured directly from local farmers in Idukki, Malabar, and Alleppey to guarantee origin-traceable quality at the best retail rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing Heritage Section */}
      <section className="py-24 max-w-[1280px] mx-auto px-4 md:px-16 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/15 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <span className="text-secondary font-headline font-bold text-xs uppercase tracking-widest block mb-4">
              Local Sourcing
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary mb-6">
              From Southern Farms to Your Pantry
            </h2>
            <p className="text-on-surface-variant text-sm md:text-md leading-relaxed font-medium mb-8">
              We source each spice variety from its optimal microclimate in South India: cardamom from the misty valleys of Idukki, robust black pepper from Malabar slopes, and rich turmeric from Alleppey.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-outline-variant/30 spice-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-headline text-lg">
                  3+
                </div>
                <div>
                  <h4 className="font-headline font-bold text-xs text-primary uppercase tracking-wider">
                    Generations of Sourcing Legacy
                  </h4>
                  <p className="text-xs text-on-surface-variant font-semibold">Decades of deep relationships with local farmers</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-outline-variant/30 spice-shadow">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-white font-bold font-headline text-lg">
                  10k+
                </div>
                <div>
                  <h4 className="font-headline font-bold text-xs text-secondary uppercase tracking-wider">
                    Happy Indian Households
                  </h4>
                  <p className="text-xs text-on-surface-variant font-semibold">Delivering pure, high-grade spices nationwide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing Image Frame */}
          <div className="relative bg-surface-container-low rounded-3xl p-4 border border-outline-variant/20 shadow-md flex items-center justify-center h-[380px] overflow-hidden group">
            <Image
              src="https://lh3.googleusercontent.com/aida/AP1WRLuxdf_3AUvevt8sQoaQ7EkPEe36dIkm9m5RsSOL8yUgVxybTruRMHGrHVATLvWplS3rM-OCp-QtcuEzW-ZxoM9t6NAXDUEFlPJqcTeIjvuA9G4tvK8ieTyZw_g0va-dLv-wS8s1LndqY_VrvhvwRkf21XLSs1n-66nXc-ZD2WblkwMifKPMxi0VPWwEBxuz7LFFF7wzuZ7HJkZll69W_Y0LB_1WzIWbdijNQ3kjHwJzdz9CQ8ObLmUU5lg"
              alt="Indian Spice Plantation"
              fill
              className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Quality compliance certs section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <h3 className="font-headline font-bold text-xs uppercase tracking-[0.3em] mb-12 opacity-80">
            Quality Standards & Certifications
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group hover:bg-white transition-all duration-300">
                <span className="material-symbols-outlined text-white text-4xl group-hover:text-primary transition-colors duration-300">
                  verified
                </span>
              </div>
              <span className="font-headline font-bold text-xs tracking-wider">ISO 22000</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group hover:bg-white transition-all duration-300">
                <span className="material-symbols-outlined text-white text-4xl group-hover:text-primary transition-colors duration-300">
                  health_and_safety
                </span>
              </div>
              <span className="font-headline font-bold text-xs tracking-wider">HACCP Certified</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group hover:bg-white transition-all duration-300">
                <span className="material-symbols-outlined text-white text-4xl group-hover:text-primary transition-colors duration-300">
                  eco
                </span>
              </div>
              <span className="font-headline font-bold text-xs tracking-wider">Organic India</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group hover:bg-white transition-all duration-300">
                <span className="material-symbols-outlined text-white text-4xl group-hover:text-primary transition-colors duration-300">
                  assignment_turned_in
                </span>
              </div>
              <span className="font-headline font-bold text-xs tracking-wider">FSSAI License</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
