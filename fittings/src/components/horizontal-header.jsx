import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const HorizontalHeader = () => {
  return (
    <main className={"flex w-full justify-between items-center"}>
      <section className={"flex flex-row items-center"}>
        <Separator orientation="vertical" className="mr-2 h-4" />
      </section>
      <section className="flex-1 mx-4">
        <div className="space-x-2 flex items-center justify-center text-green-800 text-sm font-medium px-4 py-2 rounded text-center">
          <h3 className={"uppercase"}>
            This Month Only: 50% off{" "}
            <span className={"text-yellow-600 font-bold"}>Gold Tier</span> Golf
            Clubs
          </h3>
          <Button variant={"default"} className={"h-8 m-0 py-0 px-2"}>
            <ShoppingCart />
            Shop now!
          </Button>
        </div>
      </section>
    </main>
  );
};

export default HorizontalHeader;
