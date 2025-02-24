import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviders from "@/providers/session.provider";

export const metadata = {
  title: "Fittings App",
  description: "Hackathon Fittings App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <SessionProviders>
        {children}
      </SessionProviders>
      </body>
    </html>
  );
}
