import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { NavUser } from "@/components/nav/nav-user";

const HorizontalHeader = () => {
  const isOpen = useSelector((state) => state.toggle.sidebarOpen);

  return (
    <main className={"flex w-full justify-between items-center"}>
      <section className={"flex flex-row items-center"}>
        <Separator orientation="vertical" className="mr-2 h-4" />
        {isOpen && (
          <div className={"flex items-center space-x-1"}>
            <Image
              src={"/icons/golf.svg"}
              height={"30"}
              width={"30"}
              alt={"Golf Icon"}
            />
            <p className={"text-lg font-semibold"}>
              Fitting<span className={"font-thin"}>.gg</span>
            </p>
          </div>
        )}
      </section>
      <section className="flex-1 mx-4">
        <div className="flex flex-col sm:flex-row items-center justify-center text-green-800 text-xs sm:text-sm font-medium px-2 sm:px-4 py-2 my-2 rounded text-center">
          <h3 className="uppercase mb-2 sm:mb-0 sm:mr-2 text-center sm:text-left">
            This Month Only: 50% off{" "}
            <span className="text-yellow-600 font-bold">Gold Tier</span> Golf
            Clubs.
          </h3>
          <Button
            variant="default"
            className="h-8 w-full sm:w-auto py-0 px-2 text-xs sm:text-sm"
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            Shop now!
          </Button>
        </div>
      </section>
      <div>
        {isOpen && (
          <div>
            <NavUser />
          </div>
        )}
      </div>
    </main>
  );
};

export default HorizontalHeader;
