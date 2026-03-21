"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { X, UploadCloud, Loader2 } from "lucide-react";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  uploadPath: string; // The backend path like "/products/admin/upload"
};

export function ImageGalleryUpload({ value = [], onChange, uploadPath }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        // Appending 'files' matches backend FilesInterceptor('files')
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch(`/api/admin/proxy?path=${uploadPath}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Tải ảnh lên thất bại");
      }

      const data = await res.json();
      if (data.urls && Array.isArray(data.urls)) {
        onChange([...value, ...data.urls]);
        toast.success(`Đã tải lên ${data.urls.length} ảnh`);
      } else {
        throw new Error("Phản hồi từ máy chủ không hợp lệ");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tải ảnh");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg border bg-gray-50 overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
            <button
              title="Xóa ảnh"
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1.5 right-1.5 p-1 bg-white/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Upload box */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="relative aspect-square flex flex-col justify-center items-center gap-2 rounded-lg border-2 border-dashed hover:border-emerald-500 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          ) : (
            <>
              <UploadCloud className="w-6 h-6" />
              <span className="text-xs font-medium px-2 text-center text-muted-foreground">Thêm ảnh</span>
            </>
          )}
        </button>
      </div>
      
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handleUpload(e.target.files);
        }}
      />
    </div>
  );
}
