"use client";

import { useEffect, useRef } from "react";

const BARCODE_TIMEOUT_MS = 50; // max ms between scanner keystrokes
const MIN_BARCODE_LENGTH = 6;

export function useBarcodeListener(onScan: (barcode: string) => void) {
  const bufferRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimestampRef = useRef<number>(0);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      // Only process if not typing in an input/textarea already handling the scanner
      const inInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;

      const now = Date.now();
      const gap = now - lastTimestampRef.current;
      lastTimestampRef.current = now;

      // If gap is too large, reset buffer (user is typing manually)
      if (gap > 200 && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      if (e.key === "Enter") {
        const code = bufferRef.current.trim();
        bufferRef.current = "";
        if (code.length >= MIN_BARCODE_LENGTH) {
          e.preventDefault();
          onScan(code);
        }
        return;
      }

      // Only accumulate printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Fast scanner strokes — accumulate even if in input
        if (gap < BARCODE_TIMEOUT_MS || bufferRef.current.length > 0) {
          bufferRef.current += e.key;

          // Clear buffer if idle
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            bufferRef.current = "";
          }, 500);
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onScan]);
}
