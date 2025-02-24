"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionProviders({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
