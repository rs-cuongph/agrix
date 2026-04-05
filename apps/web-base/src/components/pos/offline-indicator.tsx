"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1.5 text-sm px-3 py-1">
        <Wifi className="w-4 h-4" />
        Online
      </Badge>
    );
  }

  return (
    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 gap-1.5 text-sm px-3 py-1 animate-pulse">
      <WifiOff className="w-4 h-4" />
      Offline
    </Badge>
  );
}
