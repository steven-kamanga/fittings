import "./globals.css";
import SessionProviders from "@/providers/session.provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Fitting",
  description: "Simple Fitting App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProviders>{children}</SessionProviders>
        <Toaster />
      </body>
    </html>
  );
}
