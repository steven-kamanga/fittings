import "./globals.css";
import SessionProviders from "@/providers/session.provider";
import { Toaster } from "@/components/ui/sonner";
import StoreProvider from "@/lib/Redux/StoreProvider";

export const metadata = {
  title: "Fitting",
  description: "Simple Fitting App",
};

export default function RootLayout({ children }) {
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
