"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { BlogEditor } from "@/components/admin/blog-editor";
import { adminApiCall } from "@/components/admin/crud-dialog";
import { toast } from "sonner";
import { Save, Eye, EyeOff, ArrowLeft, Upload, X, Search } from "lucide-react";

type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };
type Product = { id: string; name: string; baseSellPrice: number };

export function BlogEditorPage({
  postId,
  initialData,
  categories,
  tags,
  linkedProducts: initialLinkedProducts,
}: {
  postId?: string;
  initialData?: any;
  categories: Category[];
  tags: Tag[];
  linkedProducts?: Product[];
}) {
  const router = useRouter();
  const isEdit = !!postId;

  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((t: Tag) => t.id) || []
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.ogImageUrl || "");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(postId || "");

  // Linked products
  const [linkedProducts, setLinkedProducts] = useState<Product[]>(initialLinkedProducts || []);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);

  // Tag input
  const [tagInput, setTagInput] = useState("");
  const [allTags, setAllTags] = useState<Tag[]>(tags);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Use ref to always have latest content for save (avoids stale React state)
  const contentRef = useRef(content);

  const buildPayload = useCallback(() => ({
    title,
    content: contentRef.current,
    status,
    categoryId: categoryId || null,
    tagIds: selectedTagIds,
    coverImageUrl: coverImageUrl || null,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    ogImageUrl: ogImageUrl || null,
  }), [title, status, categoryId, selectedTagIds, coverImageUrl, metaTitle, metaDescription, ogImageUrl]);

  // Auto-save: pause after manual save, resume on next editor interaction
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSavePausedRef = useRef(false);

  const scheduleAutoSave = useCallback(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!currentPostId || autoSavePausedRef.current) return;

    autoSaveTimerRef.current = setTimeout(async () => {
      if (!currentPostId || autoSavePausedRef.current) return;
      const t = contentRef.current;
      if (!t) return;
      setSaving(true);
      try {
        await adminApiCall(`/blog/admin/posts/${currentPostId}`, "PUT", buildPayload());
        setLastSaved(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      } catch { /* silent */ }
      setSaving(false);
      // Schedule next auto-save
      scheduleAutoSave();
    }, 30000);
  }, [currentPostId, buildPayload]);

  // Start auto-save when post exists
  useEffect(() => {
    scheduleAutoSave();
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [scheduleAutoSave]);

  // Resume auto-save on editor content change
  const handleContentChangeWithAutoResume = useCallback((html: string) => {
    contentRef.current = html;
    setContent(html);
    // Resume auto-save if paused
    if (autoSavePausedRef.current) {
      autoSavePausedRef.current = false;
      scheduleAutoSave();
    }
  }, [scheduleAutoSave]);

  const handleSave = async (newStatus?: string) => {
    if (!title) { toast.error("Vui lòng nhập tiêu đề"); return; }
    // Pause auto-save — will resume on next editor interaction
    autoSavePausedRef.current = true;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    setSaving(true);
    try {
      const payload = { ...buildPayload(), status: newStatus || status };
      if (currentPostId) {
        await adminApiCall(`/blog/admin/posts/${currentPostId}`, "PUT", payload);
        toast.success(newStatus === "PUBLISHED" ? "Đã xuất bản!" : "Đã lưu!");
      } else {
        const res = await adminApiCall("/blog/admin/posts", "POST", payload);
        setCurrentPostId(res.id);
        toast.success("Đã tạo bài viết!");
      }
      setLastSaved(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      if (newStatus === "PUBLISHED") {
        router.push("/admin/blog");
        router.refresh();
      }
    } catch {
      toast.error("Lưu thất bại");
    }
    setSaving(false);
  };

  // Cover image upload
  const handleCoverUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/proxy?path=/blog/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setCoverImageUrl(url);
      toast.success("Upload ảnh bìa thành công");
    } catch {
      toast.error("Upload thất bại");
    }
  };

  // Product search
  const searchProducts = async (q: string) => {
    if (q.length < 2) { setProductResults([]); return; }
    try {
      const res = await fetch(`/api/admin/proxy?path=/products?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setProductResults((data.data || data).filter((p: Product) => !linkedProducts.some((lp) => lp.id === p.id)));
    } catch { setProductResults([]); }
  };

  const addProduct = async (product: Product) => {
    if (currentPostId) {
      try {
        await adminApiCall(`/blog/admin/posts/${currentPostId}/products`, "POST", { productIds: [product.id] });
      } catch { /* will save on next save */ }
    }
    setLinkedProducts((prev) => [...prev, product]);
    setProductSearch("");
    setProductResults([]);
  };

  const removeProduct = async (productId: string) => {
    if (currentPostId) {
      try {
        await adminApiCall(`/blog/admin/posts/${currentPostId}/products/${productId}`, "DELETE");
      } catch { /* ok */ }
    }
    setLinkedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Tag management
  const filteredTags = allTags.filter(
    (t) => !selectedTagIds.includes(t.id) && t.name.toLowerCase().includes(tagInput.toLowerCase())
  );

  const selectTag = (tag: Tag) => {
    if (!selectedTagIds.includes(tag.id)) setSelectedTagIds((prev) => [...prev, tag.id]);
    setTagInput("");
    setShowTagDropdown(false);
  };

  const addTag = async () => {
    if (!tagInput.trim()) return;
    const existing = allTags.find((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());
    if (existing) {
      selectTag(existing);
    } else {
      try {
        const newTag = await adminApiCall("/blog/admin/tags", "POST", { name: tagInput.trim() });
        setAllTags((prev) => [...prev, newTag]);
        setSelectedTagIds((prev) => [...prev, newTag.id]);
        toast.success(`Tag "${newTag.name}" đã được tạo`);
      } catch { toast.error("Tạo tag thất bại"); }
    }
    setTagInput("");
    setShowTagDropdown(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main editor area */}
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { router.push("/admin/blog"); router.refresh(); }} className="p-2 rounded-lg hover:bg-gray-200">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          {lastSaved && (
            <span className="text-xs text-muted-foreground ml-auto">
              {saving ? "Đang lưu..." : `Đã lưu lúc ${lastSaved}`}
            </span>
          )}
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết"
          className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-emerald-500 bg-transparent py-3 rounded-none shadow-none placeholder:text-gray-300"
        />

        <BlogEditor content={content} onChange={handleContentChangeWithAutoResume} />
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l bg-white p-4 space-y-5 overflow-y-auto">
        {/* Actions */}
        <div className="space-y-2">
          <button onClick={() => handleSave()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm font-medium">
            <Save size={16} /> Lưu nháp
          </button>
          {status === "PUBLISHED" ? (
            <button onClick={() => { setStatus("DRAFT"); handleSave("DRAFT"); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
              <EyeOff size={16} /> Ngừng xuất bản
            </button>
          ) : (
            <button onClick={() => handleSave("PUBLISHED")} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
              <Eye size={16} /> Xuất bản
            </button>
          )}
        </div>

        <hr />

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Danh mục</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="-- Chọn danh mục --" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Tags</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedTagIds.map((tid) => {
              const tag = allTags.find((t) => t.id === tid);
              return tag && (
                <span key={tid} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                  {tag.name}
                  <button onClick={() => setSelectedTagIds((prev) => prev.filter((id) => id !== tid))} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="relative mt-1">
            <Input value={tagInput}
              onChange={(e) => { setTagInput(e.target.value); setShowTagDropdown(true); }}
              onFocus={() => setShowTagDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(); }
                if (e.key === "Escape") setShowTagDropdown(false);
              }}
              placeholder="Thêm tag..." />
            {showTagDropdown && tagInput && filteredTags.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {filteredTags.slice(0, 8).map((t) => (
                  <button key={t.id} onClick={() => selectTag(t)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">{t.name}</button>
                ))}
              </div>
            )}
            {showTagDropdown && tagInput.trim() && !allTags.some((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase()) && (
              <p className="text-xs text-muted-foreground mt-1">Enter để tạo tag "{tagInput.trim()}"</p>
            )}
          </div>
        </div>

        <hr />

        {/* Cover image */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Ảnh bìa</label>
          {coverImageUrl ? (
            <div className="relative mt-1">
              <img src={coverImageUrl} alt="cover" className="w-full rounded-lg" />
              <button onClick={() => setCoverImageUrl("")} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="mt-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-emerald-500 text-sm text-muted-foreground">
              <Upload size={16} /> Chọn ảnh bìa
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }} />
            </label>
          )}
        </div>

        <hr />

        {/* Linked products */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Sản phẩm liên kết</label>
          <div className="relative mt-1">
            <div className="flex items-center border rounded-lg px-2">
              <Search size={14} className="text-gray-400" />
              <Input value={productSearch} onChange={(e) => { setProductSearch(e.target.value); searchProducts(e.target.value); }}
                placeholder="Tìm sản phẩm..." className="flex-1 border-0 shadow-none" />
            </div>
            {productResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {productResults.map((p) => (
                  <button key={p.id} onClick={() => addProduct(p)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">{p.name}</button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1 mt-2">
            {linkedProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <span>{p.name}</span>
                <button onClick={() => removeProduct(p.id)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <hr />

        {/* SEO */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">SEO</label>
          <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Meta Title" />
          <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Meta Description" rows={3} className="resize-none" />
          <Input value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)}
            placeholder="OG Image URL" />
        </div>
      </div>
    </div>
  );
}
