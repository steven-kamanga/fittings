import "./globals.css";
import SessionProviders from "@/providers/session.provider";
import { Toaster } from "@/components/ui/sonner";
import StoreProvider from "@/lib/Redux/StoreProvider";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitting",
  description: "Simple Fitting App",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <SessionProviders>{children}</SessionProviders>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
