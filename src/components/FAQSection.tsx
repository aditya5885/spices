"use client";

import React, { useState } from "react";
import { faqs } from "@/data/faqs";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section className="py-24 bg-white border-t border-b border-outline-variant/30">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="text-center mb-16">
          <span className="text-secondary font-headline font-bold text-xs uppercase tracking-widest block mb-4">
            Frequently Asked Questions
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary">
            Spices & Delivery FAQs
          </h2>
          <div className="h-1 w-20 bg-secondary mx-auto mt-4"></div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-outline-variant/40 rounded-xl bg-background-cream overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none hover:bg-surface-container-low transition-colors duration-200"
                >
                  <span className="font-headline font-bold text-sm md:text-md text-primary pr-4">
                    {faq.question}
                  </span>
                  <span className="material-symbols-outlined text-primary transition-transform duration-300 select-none">
                    {isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[300px] border-t border-outline-variant/20" : "max-h-0"
                  } overflow-hidden`}
                >
                  <p className="px-6 py-5 text-sm leading-relaxed text-on-surface-variant font-medium">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
