"use client";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateScroll } from "@/lib/slices/scroll_slice";

export const BidirectionalScroll = ({
  width = "300px",
  height = "calc(100vh - 240px)",
  className = "",
  children,
}) => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const lastScrollPosition = useRef({ left: 0, top: 0 });

  useEffect(() => {
    const handleScroll = (e) => {
      if (scrollRef.current) {
        const { scrollLeft, scrollTop } = scrollRef.current;
        const deltaX = Math.abs(scrollLeft - lastScrollPosition.current.left);
        const deltaY = Math.abs(scrollTop - lastScrollPosition.current.top);

        if (deltaX > 0 && deltaY > 0) {
          e.preventDefault();
          scrollRef.current.scrollTo(
            lastScrollPosition.current.left,
            lastScrollPosition.current.top,
          );
          return;
        }

        lastScrollPosition.current = { left: scrollLeft, top: scrollTop };

        dispatch(updateScroll({ scrollLeft, scrollTop }));
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, {
        passive: false,
      });
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [dispatch]);

  return (
    <div
      ref={scrollRef}
      style={{
        width,
        height,
        overflow: "auto",
      }}
      className={`${className}`}
    >
      <div className="min-w-max min-h-min">{children}</div>
    </div>
  );
};
