import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Vintage Global Ventures | Pure Indian Spices Sourced Directly",
    template: "%s | Vintage Global Ventures"
  },
  description: "Direct sourcing from the lush plantations of India. We deliver premium, certified Indian spices including Alleppey Turmeric, Bold Black Pepper, Green Cardamom, and Ceylon Cinnamon straight to your kitchen.",
  openGraph: {
    title: "Vintage Global Ventures | Pure Indian Spices Sourced Directly",
    description: "Premium quality spices sourced directly from local Indian farms with rigorous quality standards.",
    url: "https://vintageglobalventures.com",
    siteName: "Vintage Global Ventures",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida/ADBb0uhmetOTcF3lItwtUpDXOevVnsBQRkBWfWEi_qk_vEJRlXV2neKGMY7WerDMwk3rgbFK3NfFVjqDTQkrFRST19WspzTehFw16B0nLOqavxM5lwIszr5_-u3pRqCgDtC10TUUUZ6yvdk7YQ4hohy3I7liv-TsvYYJZcZ09nA0pLgu71z2_lu37bNks56VeltlmhTse82ni4vrubM1VBtYSa2aWDhpE_smQLTDgkcy5oU3D4O6DcdrdlTyO9o",
        width: 1200,
        height: 630,
        alt: "Vintage Global Ventures Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background-cream text-on-surface font-body" suppressHydrationWarning>
        {/* Sticky Header */}
        <Header />

        {/* Main Content Pages */}
        <main className="flex-grow pt-16">
          {children}
        </main>

        {/* WhatsApp Floating Button */}
        <WhatsAppButton />

        {/* Retail Footer */}
        <Footer />

        {/* Razorpay Script Trigger */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
