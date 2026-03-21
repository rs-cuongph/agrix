"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApiCall } from "@/components/admin/crud-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "sonner";

type Settings = {
  id?: string;
  storeName: string;
  address: string;
  phoneNumber: string;
  email: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
};

const EMPTY: Settings = {
  storeName: "", address: "", phoneNumber: "", email: "",
  description: "", heroTitle: "", heroSubtitle: "", heroImageUrl: "",
};

export default function StoreSettingsPage() {
  const [form, setForm] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApiCall("/admin/settings", "GET") as Settings;
      if (data) setForm(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { id, ...payload } = form;
      await adminApiCall("/admin/settings", "PATCH", payload);
      toast.success("Lưu cài đặt thành công");
    } catch {} finally {
      setSaving(false);
    }
  };

  const update = (key: keyof Settings, value: string) =>
    setForm({ ...form, [key]: value });

  if (loading) return <div className="p-6 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Cài đặt Cửa hàng</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <fieldset className="space-y-4 rounded-xl border p-5">
          <legend className="px-2 text-sm font-bold text-gray-700">Thông tin Cửa hàng</legend>
          <div>
            <Label>Tên cửa hàng *</Label>
            <Input required value={form.storeName} onChange={(e) => update("storeName", e.target.value)} />
          </div>
          <div>
            <Label>Địa chỉ *</Label>
            <Input required value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Số điện thoại *</Label>
              <Input required value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Giới thiệu</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border p-5">
          <legend className="px-2 text-sm font-bold text-gray-700">Hero Banner</legend>
          <div>
            <Label>Tiêu đề</Label>
            <Input value={form.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} />
          </div>
          <div>
            <Label>Phụ đề</Label>
            <Textarea rows={2} value={form.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} />
          </div>
          <div>
            <Label>URL Ảnh nền</Label>
            <Input value={form.heroImageUrl} onChange={(e) => update("heroImageUrl", e.target.value)} />
          </div>
        </fieldset>

        <Button type="submit" disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </form>
    </div>
  );
}
