"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Product } from "@/types";
import { products as productData } from "@/data/products";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter products locally as user types in the header search box (minimum 3 characters)
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const filtered = productData.filter((product: Product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.badge && product.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.specs && product.specs.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/#products" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? "py-3 bg-white/90 backdrop-blur-md shadow-md border-b border-outline-variant/20"
          : "py-5 bg-background-cream/80 backdrop-blur-sm border-b border-outline-variant/10"
          }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <Image
              src="/images/headlogo_trimmed.png"
              alt="Vintage Global Ventures"
              width={280}
              height={70}
              priority
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-headline font-semibold text-sm tracking-wider uppercase">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <div className="relative group" key={link.name}>
                  <Link
                    href={link.href}
                    className={`transition-colors pb-1 ${isActive
                      ? "text-primary border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-primary"
                      }`}
                  >
                    {link.name}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Desktop Search & Action */}
          <div className="hidden lg:flex items-center gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/?search=${encodeURIComponent(searchQuery)}#products`;
                }
              }}
              className="relative flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant/50"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl leading-none">
                search
              </span>
                <input
                  type="text"
                  placeholder="Search spices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm ml-2 w-32 focus:w-44 transition-all duration-300 focus:ring-0 text-on-surface"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 w-80 bg-white border border-outline-variant/20 rounded-lg shadow-lg p-2 z-[60] max-h-60 overflow-y-auto">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/?search=${encodeURIComponent(p.name)}#products`}
                        onClick={(e) => {
                          setSearchQuery("");
                          if (window.location.pathname === "/") {
                            e.preventDefault();
                            window.location.href = `/?search=${encodeURIComponent(p.name)}#products`;
                          }
                        }}
                        className="flex items-center space-x-3 p-2 hover:bg-surface-container rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">{p.name}</p>
                          {p.specs && (
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider truncate">
                              {p.specs}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </form>
            <Link href="/order">
              <button className="bg-primary text-background-cream hover:bg-primary-container px-6 py-2.5 rounded-full font-headline font-semibold text-xs tracking-wider uppercase hover:scale-[1.03] transition-all duration-300 shadow-md">
                Order Now
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <Link href="/order">
              <button className="bg-primary text-background-cream px-4 py-1.5 rounded-full font-headline font-semibold text-xs tracking-wider uppercase text-[10px]">
                Order
              </button>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-on-surface hover:text-primary transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-3xl">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="fixed top-0 right-0 h-full w-[280px] bg-background-cream shadow-2xl p-6 flex flex-col z-50 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 border-b border-outline-variant/30 pb-4">
              <span className="font-headline text-lg font-bold text-primary">Vintage Global Ventures</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Mobile Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setIsMobileMenuOpen(false);
                  window.location.href = `/?search=${encodeURIComponent(searchQuery)}#products`;
                }
              }}
              className="relative flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant/50 mb-6"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl leading-none">search</span>
              <input
                type="text"
                placeholder="Search spices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm ml-2 w-full focus:ring-0 text-on-surface"
              />
            </form>

            {/* Mobile Links */}
            <nav className="flex flex-col gap-6 font-headline font-bold text-md uppercase tracking-wide">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`hover:text-primary transition-colors ${pathname === link.href ? "text-primary pl-2 border-l-4 border-primary" : "text-on-surface-variant"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/order"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`hover:text-primary transition-colors ${pathname === "/order" ? "text-primary pl-2 border-l-4 border-primary" : "text-on-surface-variant"
                  }`}
              >
                Order Form
              </Link>
            </nav>

            {/* Mobile Footer Area */}
            <div className="mt-auto border-t border-outline-variant/30 pt-6">
              <p className="text-xs text-on-surface-variant mb-4">Pure, farm-direct spices delivered straight to your doorstep.</p>
              <div className="flex gap-4">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Store: Open</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
