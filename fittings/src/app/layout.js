import "./globals.css";
import SessionProviders from "@/providers/session.provider";

export const metadata = {
  title: "Fitting",
  description: "Simple Fitting App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProviders>{children}</SessionProviders>
      </body>
    </html>
  );
}
