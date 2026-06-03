"use client";

import React from "react";

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center">
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        title="Message Us on WhatsApp"
        className="bg-secondary hover:bg-secondary-container text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group relative overflow-visible"
      >
        <span className="material-symbols-outlined text-3xl leading-none">chat</span>
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-headline font-bold text-xs tracking-wider uppercase shadow-md">
          Direct Chat
        </div>
      </a>
    </div>
  );
}
