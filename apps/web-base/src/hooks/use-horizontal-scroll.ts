"use client";

import { useRef, useEffect } from "react";

export function useHorizontalScroll<T extends HTMLElement>() {
  const elRef = useRef<T>(null);
  
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        // Prevent vertical scroll of the page when hovering this element
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY,
          behavior: "auto"
        });
      };
      // Passive must be false to allow preventDefault
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);
  
  return elRef;
}
