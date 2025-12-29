"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProvidersProps {
  children: ReactNode;
}

export default function SessionProviders({ children }: SessionProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
