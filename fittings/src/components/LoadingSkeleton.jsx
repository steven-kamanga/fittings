import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => {
  return (
    <main className={"p-10"}>
      <div className="flex flex-col w-full items-center h-full space-y-4">
        <section className={"flex w-full justify-center space-x-4"}>
          <Skeleton className="h-60 w-80" />
          <Skeleton className="h-60 w-80" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-36 w-[250px]" />
          </div>
          <Skeleton className="h-60 w-80" />
        </section>
      </div>
    </main>
  );
};
export default LoadingSkeleton;
