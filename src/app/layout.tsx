import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kitchen Inventory Tracker",
  description: "Manage your kitchen inventory and generate shopping lists efficiently",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kitchen Tracker",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

import { AppLayout } from '@/components/layout';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
import { ToastProvider } from '@/components/ui';
import { GlobalErrorBoundary } from '@/components/error-boundary';
import { OnboardingFlow } from '@/components/onboarding';
import { HelpCenter } from '@/components/help';
import { SkipToContent } from '@/components/accessibility';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kitchen Tracker" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipToContent />
        <ServiceWorkerRegistration />
        <GlobalErrorBoundary>
          <ToastProvider>
            <AppLayout>{children}</AppLayout>
            <OnboardingFlow />
            <HelpCenter />
          </ToastProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
