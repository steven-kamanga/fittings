import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => {
  return (
    <main className={"p-10"}>
      <div className="flex flex-col w-full items-center h-full space-y-2">
        <div className="flex flex-row justify-end w-full gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
        <section className={"flex w-full justify-center"}>
          <Skeleton className="h-60 w-full" />
        </section>
      </div>
    </main>
  );
};
export default LoadingSkeleton;
