"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

type NetworkStatus = "online" | "slow" | "offline";

const SLOW_THRESHOLD_MS = 400; // >400ms round-trip = slow
const PING_INTERVAL_MS = 5_000; // check every 5s

async function measureLatency(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const start = Date.now();

    // Ping a static asset — no backend needed
    await fetch("/favicon.ico?_t=" + start, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const elapsed = Date.now() - start;
    console.log("[Network] ping latency:", elapsed, "ms");
    return elapsed;
  } catch (e) {
    console.log("[Network] ping failed:", e);
    return null; // fetch failed or aborted
  }
}

export function OfflineIndicator() {
  const [status, setStatus] = useState<NetworkStatus>("online");
  const prevStatusRef = useRef<NetworkStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyStatus = useCallback((currentStatus: NetworkStatus) => {
    const prev = prevStatusRef.current;
    console.log("[Network] applyStatus:", { prev, currentStatus });

    if (prev !== null && prev !== currentStatus) {
      console.log("[Network] >> showing toast for:", currentStatus);

      if (currentStatus === "offline") {
        toast.error("Mất kết nối mạng", {
          id: "network-status",
          description: "Vui lòng kiểm tra lại kết nối WiFi hoặc 3G",
          duration: 5000,
        });
      } else if (currentStatus === "slow") {
        toast.warning("Mạng yếu hoặc chập chờn", {
          id: "network-status",
          description: "Có thể ảnh hưởng đến tốc độ đồng bộ giao dịch",
          duration: 5000,
        });
      } else {
        toast.success("Đã kết nối mạng lại ổn định", {
          id: "network-status",
          duration: 3000,
        });
      }
    }

    prevStatusRef.current = currentStatus;
    setStatus(currentStatus);
  }, []);

  const checkNetwork = useCallback(async () => {
    if (!navigator.onLine) {
      applyStatus("offline");
      return;
    }

    const latency = await measureLatency();

    if (latency === null) {
      // fetch failed but still "online" according to browser → treat as slow
      applyStatus("slow");
    } else if (latency > SLOW_THRESHOLD_MS) {
      applyStatus("slow");
    } else {
      applyStatus("online");
    }
  }, [applyStatus]);

  useEffect(() => {
    // Run initial check (sets prevStatusRef, no toast since prev is null)
    checkNetwork();

    // Periodic re-check
    intervalRef.current = setInterval(checkNetwork, PING_INTERVAL_MS);

    // Instant reaction on browser events
    const handleOnline = () => checkNetwork();
    const handleOffline = () => applyStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkNetwork, applyStatus]);

  if (status === "offline") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium animate-pulse">
        <WifiOff className="w-4 h-4" />
        <span>Mất kết nối</span>
      </div>
    );
  }

  if (status === "slow") {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-medium"
        title="Mạng yếu hoặc chập chờn"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Mạng yếu</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
      title="Mạng ổn định"
    >
      <Wifi className="w-4 h-4" />
    </div>
  );
}
