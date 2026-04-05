"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { BluetoothPrinterSettings } from "./bluetooth-printer-settings";

export function PosSettingsDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-2 p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          title="Cài đặt máy in"
        >
          <Settings className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-white border-l-0 shadow-2xl flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-800">Cài đặt thiết bị</SheetTitle>
        </SheetHeader>
        
        {/* Placeholder for Bluetooth printer settings */}
        <div className="flex-1 overflow-y-auto pr-2">
          <BluetoothPrinterSettings />
        </div>
      </SheetContent>
    </Sheet>
  );
}
