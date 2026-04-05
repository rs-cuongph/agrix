"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PosUserMenu({ user }: { user: { fullName?: string; username: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pos/auth", {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đăng xuất thành công");
        router.push("/pos/login");
        router.refresh();
      } else {
        toast.error("Lỗi đăng xuất. Vui lòng thử lại.");
      }
    } catch {
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const displayName = user.fullName || user.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-emerald-900/50 hover:bg-emerald-800/80 transition-colors rounded-full border border-emerald-800/50">
          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
            {initial}
          </div>
          <span className="text-sm font-medium text-emerald-50 max-w-[120px] truncate">
            {displayName}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 bg-white rounded-xl shadow-xl border border-gray-100" align="end">
        <div className="flex flex-col gap-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tài khoản
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors text-left outline-none focus:outline-none">
                <LogOut className="w-4 h-4" />
                Đăng xuất POS
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Xác nhận đăng xuất</DialogTitle>
                <DialogDescription>
                  Bạn sắp đăng xuất khỏi ca làm việc hiện tại trên máy POS này. Bạn có chắc chắn muốn tiếp tục không?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Hủy</Button>
                </DialogClose>
                <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                  {loading ? "Đang xử lý..." : "Đăng xuất"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PopoverContent>
    </Popover>
  );
}
