import React from "react";
import { cn } from "@/lib/utils";

const LoadingSpinner = ({ color }) => {
  return (
    <span
      className={cn(
        !color
          ? "border-t-white border-r-white border-b-white"
          : "border-t-black border-r-black border-b-black",
        "inline-block w-5 h-5 rounded-full border-4  border-l-transparent animate-spin",
      )}
    ></span>
  );
};

export default LoadingSpinner;
