import type { Metadata } from "next";
import { ChaosBanner } from "@/components/chaos-banner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SiteChrome } from "@/components/site-chrome";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

export const metadata: Metadata = {
  // Each page sets its own title; it renders as "<page> | ShopLab".
  title: { template: "%s | ShopLab", default: "ShopLab" },
  description: "A practice e-commerce site for learning Playwright.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-gray-50 text-gray-900">
        <ToastProvider>
          <SiteChrome
            banner={<ChaosBanner />}
            header={<Header />}
            footer={<Footer />}
          >
            {children}
          </SiteChrome>
        </ToastProvider>
      </body>
    </html>
  );
}
