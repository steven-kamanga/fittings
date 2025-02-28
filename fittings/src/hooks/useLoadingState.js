import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MINIMUM_LOADING_TIME = 300;

export const useLoadingState = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timer;

    setIsLoading(true);
    timer = setTimeout(() => {
      setIsLoading(false);
    }, MINIMUM_LOADING_TIME);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return isLoading;
};
