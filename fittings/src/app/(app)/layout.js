"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import HorizontalHeader from "@/components/horizontal-header";
import { Suspense } from "react";
import Loading from "@/app/(app)/loading";
import { useLoadingState } from "@/hooks/useLoadingState";

export default function AppLayout({ children }) {
  const isLoading = useLoadingState();

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="items-center flex w-full gap-2 px-3">
            <SidebarTrigger />
            <HorizontalHeader />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {isLoading ? <Loading /> : children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
