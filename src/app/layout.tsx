import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/common/NotificationSystem";
import { ReduxProvider } from "@/components/providers/redux-providers";
import AuthLayout from "@/components/layouts/AuthLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadG CRM",
  description: "LeadG is a CRM application for Track and Manage Leads",
  icons: "leadg-menu-icon.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <NotificationProvider>
            <AuthLayout>{children}</AuthLayout>
          </NotificationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
