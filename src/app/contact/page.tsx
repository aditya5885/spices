"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    spiceCategory: "premium-turmeric",
    purpose: "general-query",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        spiceCategory: "premium-turmeric",
        purpose: "general-query",
        message: "",
      });
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="overflow-x-hidden bg-background-cream text-on-surface">
      {/* Hero Banner */}
      <header className="relative pt-32 pb-20 bg-surface-container-low overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_spices_banner.webp"
            alt="Spices bags raw material background"
            fill
            priority
            className="object-cover opacity-15 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-cream via-transparent to-background-cream"></div>
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <span className="font-headline font-bold text-primary text-xs uppercase tracking-[0.2em] mb-4 block">
            Global Network
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-6 leading-tight">
            Connect With Our Spice Experts
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-lg leading-relaxed text-on-surface-variant font-medium">
            Sourced directly from farmers in South India. Get in touch with our customer support desk in Kochi, Kerala.
          </p>
        </div>
      </header>

      {/* Main Form and Info Layout */}
      <section className="py-16 max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: B2B Coordinates */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              {/* Location Coordinates */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl select-none">location_on</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-primary">Registered Office</h3>
                  <p className="text-sm text-on-surface-variant font-semibold mt-1">
                    Vintage Global Ventures Private Limited<br />
                    55/1668, Suraj Buildings, Club Road,<br />
                    Giri Nagar, Kadavanthara, Ernakulam,<br />
                    Kerala - 682020, India
                  </p>
                </div>
              </div>

              {/* Email Contacts */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl select-none">mail</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-primary">Email Enquiries</h3>
                  <p className="text-sm text-on-surface-variant font-semibold mt-1">
                    General: <a href="mailto:info@vintageglobaltrading.com" className="text-primary hover:underline">info@vintageglobaltrading.com</a><br />
                    Support: <a href="mailto:support@vintageglobaltrading.com" className="text-primary hover:underline">support@vintageglobaltrading.com</a>
                  </p>
                </div>
              </div>

              {/* Direct Phone Lines */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl select-none">call</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-primary">Phone Enquiries</h3>
                  <p className="text-sm text-on-surface-variant font-semibold mt-1">
                    +91 (484) 2355-600<br />
                    +91 99999 99999
                  </p>
                </div>
              </div>
            </div>

            {/* Static Map Graphic */}
            <div className="relative rounded-2xl overflow-hidden border border-outline-variant/30 h-[280px] shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7035.27171135622!2d76.29587843109529!3d9.96087138568541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0872c42c1492af%3A0x45bf994e1b572400!2sSuraj%20Buildings%2C%20Giringar%20Housing%20Colony%2C%20Giri%20Nagar%2C%20Kadavanthra%2C%20Ernakulam%2C%20Kochi%2C%20Kerala%20682020!5e0!3m2!1sen!2sin!4v1780537701905!5m2!1sen!2sin"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ernakulam Office Location"
              />
            </div>

            {/* Follow Journey links */}
            <div className="pt-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-primary mb-3">
                Follow Our Journey
              </h4>
              <div className="flex gap-4 text-on-surface-variant">
                <a href="#" className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">globe_uk</span>
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">share</span>
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">query_stats</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-10 shadow-sm">
            <h2 className="font-headline text-xl md:text-2xl font-extrabold text-primary mb-2">
              Get In Touch
            </h2>
            <p className="text-xs text-on-surface-variant font-semibold mb-8">
              Have questions about our spices, bulk family orders, or custom gifting? Fill out the form below and we will get back to you within 4 hours.
            </p>

            {isSubmitted ? (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h3 className="font-headline font-bold text-md text-primary">
                  Enquiry Submitted Successfully!
                </h3>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed max-w-md mx-auto">
                  Thank you for reaching out to Vintage Global Ventures. Our customer support team has received your message and will contact you shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 bg-primary text-white hover:bg-primary-container px-6 py-2.5 rounded-lg font-headline font-bold text-xs tracking-wider uppercase transition-colors"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-background-cream text-sm text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rajesh@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-background-cream text-sm text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 99999 99999"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-background-cream text-sm text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Spice Category
                    </label>
                    <select
                      name="spiceCategory"
                      value={formData.spiceCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-background-cream text-sm text-on-surface"
                    >
                      <option value="premium-turmeric">Premium Turmeric</option>
                      <option value="black-pepper">Black Pepper</option>
                      <option value="green-cardamom">Green Cardamom</option>
                      <option value="ceylon-cinnamon">Ceylon Cinnamon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    Enquiry Purpose
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-background-cream text-sm text-on-surface"
                  >
                    <option value="general-query">General Query</option>
                    <option value="bulk-order">Bulk / Family Order</option>
                    <option value="gifting">Gifting & Corporate Orders</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    Message Details
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your query or custom packaging requirements in detail..."
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-background-cream text-sm text-on-surface resize-none"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-lg font-headline font-bold text-xs tracking-wider uppercase transition-colors duration-300 shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm leading-none">send</span>
                        Submit Enquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Compliance Quality Badges bottom section */}
      <section className="bg-surface-container py-12 border-t border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 flex flex-wrap justify-around items-center gap-6 text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl select-none">verified</span>
            <span className="font-headline font-bold text-[10px] tracking-wider uppercase">ISO 22000</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl select-none">eco</span>
            <span className="font-headline font-bold text-[10px] tracking-wider uppercase">Organic Cert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl select-none">health_and_safety</span>
            <span className="font-headline font-bold text-[10px] tracking-wider uppercase">HACCP Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl select-none">domain_verification</span>
            <span className="font-headline font-bold text-[10px] tracking-wider uppercase">GMP Certified</span>
          </div>
        </div>
      </section>
    </div>
  );
}
