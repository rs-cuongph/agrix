"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBluetoothPrinterStore } from "@/stores/use-bluetooth-printer-store";
import { Bluetooth, Printer, Trash2, Edit2, CheckCircle2, Monitor } from "lucide-react";

export function BluetoothPrinterSettings() {
  const [isSupported, setIsSupported] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const store = useBluetoothPrinterStore();

  useEffect(() => {
    setMounted(true);
    if (!navigator.bluetooth) {
      setIsSupported(false);
    }
  }, []);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // common ESC/POS service
      });

      store.addDevice({
        id: device.id,
        originalName: device.name || "Máy in ảo",
        alias: device.name || "Máy in ảo",
      });
      toast.success("Đã thêm máy in thành công");
    } catch (error: any) {
      if (error.name === "NotFoundError") {
        // User cancelled, ignore
      } else {
        toast.error("Không thể kết nối máy in: " + error.message);
      }
    } finally {
      setIsScanning(false);
    }
  };

  if (!mounted) return null;

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center text-amber-600 bg-amber-50 rounded-lg">
        <Monitor className="w-10 h-10" />
        <h3 className="font-semibold text-lg">Trình duyệt không hỗ trợ</h3>
        <p className="text-sm">Tính năng Web Bluetooth không được hỗ trợ trên trình duyệt này. Vui lòng sử dụng Chrome, Edge hoặc Chrome trên Android để in trực tiếp hóa đơn.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">
          Quét và kết nối với máy in nhiệt Bluetooth xung quanh.
        </p>
        <Button onClick={handleScan} disabled={isScanning} className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Bluetooth className="w-4 h-4 mr-2" />
          {isScanning ? "Đang quét..." : "Quét tìm máy in mới"}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <Printer className="w-5 h-5 text-gray-500" /> Máy in đã lưu
        </h4>
        
        {store.savedDevices.length === 0 ? (
          <div className="text-sm text-gray-400 p-4 border border-dashed rounded-lg text-center">
            Chưa có máy in nào được kết nối
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {store.savedDevices.map((d) => (
              <div key={d.id} className={`p-3 rounded-lg border transition-colors ${store.defaultDeviceId === d.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <div className="font-medium text-gray-800 flex items-center gap-2 flex-wrap">
                      <span className="truncate">{d.alias}</span>
                      {store.defaultDeviceId === d.id && (
                        <span className="text-[10px] uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-1 opacity-70 truncate" title={d.id}>
                      ID: {d.id}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {store.defaultDeviceId !== d.id && (
                      <button 
                        onClick={() => {
                          store.setDefaultDevice(d.id);
                          toast.success("Đã đổi máy in mặc định");
                        }}
                        className="text-gray-400 hover:text-emerald-600 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                        title="Đặt làm mặc định"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                        onClick={() => {
                          const newAlias = prompt("Nhập tên gợi nhớ:", d.alias);
                          if (newAlias && newAlias.trim() !== "") {
                            store.updateDeviceAlias(d.id, newAlias.trim());
                            toast.success("Đã đổi tên máy in");
                          }
                        }}
                        className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Đổi tên"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    <button 
                      onClick={() => {
                        if (confirm("Chắc chắn muốn xóa máy in này?")) {
                          store.removeDevice(d.id);
                          toast.success("Đã xóa máy in");
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Xóa máy in"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
