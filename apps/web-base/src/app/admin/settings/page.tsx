import { Settings, Store, Printer, RefreshCw, Info } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <Settings className="w-6 h-6" /> Cài đặt
      </h1>

      <div className="space-y-3 max-w-2xl">
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer">
          <Store className="w-5 h-5 text-emerald-600" />
          <div className="flex-1">
            <p className="font-medium">Thông tin cửa hàng</p>
            <p className="text-sm text-muted-foreground">Agrix — Đại lý vật tư nông nghiệp</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer">
          <Printer className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium">Cài đặt máy in</p>
            <p className="text-sm text-muted-foreground">Chưa kết nối máy in</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer">
          <RefreshCw className="w-5 h-5 text-orange-600" />
          <div className="flex-1">
            <p className="font-medium">Đồng bộ dữ liệu</p>
            <p className="text-sm text-muted-foreground">Backend: http://localhost:3000/api/v1</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer">
          <Info className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            <p className="font-medium">Phiên bản</p>
            <p className="text-sm text-muted-foreground">Agrix Admin v2.0.0 (Next.js)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
