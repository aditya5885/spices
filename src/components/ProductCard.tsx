"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Product } from "@/types"

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQty !== undefined && product.stockQty <= 0;

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-outline-variant/30 hover:border-primary/30 transition-all duration-500 spice-shadow flex flex-col h-full">
      {/* Product Image Wrapper */}
      <div className="h-72 overflow-hidden relative w-full bg-surface-container-low">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          priority={product.slug === "premium-turmeric"}
        />
        {isOutOfStock ? (
          <div className="absolute top-4 left-4 bg-error text-white font-headline font-bold text-[10px] px-3 py-1 rounded-full tracking-wider shadow-sm uppercase">
            Out of Stock
          </div>
        ) : product.badge && (
          <div className="absolute top-4 right-4 bg-secondary text-white font-headline font-bold text-[10px] px-3 py-1 rounded-full tracking-wider shadow-sm uppercase">
            {product.badge}
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="font-headline text-lg font-bold text-primary mb-2">
          {product.name}
        </h3>
        {product.specs && (
          <span className="text-[11px] font-bold text-secondary uppercase tracking-widest block mb-3">
            {product.specs}
          </span>
        )}
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow line-clamp-4">
          {product.description}
        </p>

        {/* Action Button */}
        {isOutOfStock ? (
          <button disabled className="w-full py-3 rounded-lg border border-outline/50 bg-surface-variant/30 text-outline font-headline font-bold text-xs tracking-wider uppercase cursor-not-allowed">
            Out of Stock
          </button>
        ) : (
          <Link href={`/order?product=${product.slug}`} className="block w-full">
            <button className="w-full py-3 rounded-lg border border-primary text-primary font-headline font-bold text-xs tracking-wider uppercase hover:bg-primary hover:text-white transition-all duration-300">
              Order Now
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
