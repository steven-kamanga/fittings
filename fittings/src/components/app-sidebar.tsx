"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavUser } from "@/components/nav/nav-user";
import Link from "next/link";

interface NavItem {
  title: string;
  url: string;
}

interface AppSidebarProps {
  [key: string]: any;
}

const data: { navMain: NavItem[] } = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
    },
    {
      title: "Getting Started",
      url: "/getting-started",
    },
    {
      title: "Swing Analysis",
      url: "/swing-analysis",
    },
    {
      title: "Fitting",
      url: "/schedule-fitting",
    },
  ],
};

export function AppSidebar({ ...props }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <Image
                  src="/icons/golf.svg"
                  height={30}
                  width={30}
                  alt="Golf Icon"
                />
                <div className="flex text-lg flex-row gap-0.5 leading-none">
                  <span className="font-semibold">Fitting</span>
                  <span className={"font-thin"}>.gg</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link
                    href={item.url}
                    className={`font-medium ${
                      pathname === item.url ? "text-primary" : ""
                    }`}
                  >
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
