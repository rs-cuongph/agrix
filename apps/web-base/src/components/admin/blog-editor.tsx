"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, Heading4, List, ListOrdered,
  Quote, Code, Minus, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// --- Extend Image to support width & alignment ---
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-width") || el.style.width || null,
        renderHTML: (attrs) => {
          if (!attrs.width) return {};
          return { "data-width": attrs.width, style: `width: ${attrs.width}` };
        },
      },
      dataAlign: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => {
          return { "data-align": attrs.dataAlign || "center" };
        },
      },
    };
  },
});

// --- Toolbar button ---
type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
};

function ToolbarButton({ onClick, active, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded hover:bg-gray-200 transition-colors",
        active && "bg-emerald-100 text-emerald-700"
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />;
}

// --- Floating image toolbar ---
function ImageToolbar({
  pos,
  currentWidth,
  currentAlign,
  onResize,
  onAlign,
  onDelete,
}: {
  pos: { top: number; left: number };
  currentWidth: string | null;
  currentAlign: string;
  onResize: (w: string) => void;
  onAlign: (a: string) => void;
  onDelete: () => void;
}) {
  const sizes = [
    { label: "25%", value: "25%" },
    { label: "50%", value: "50%" },
    { label: "75%", value: "75%" },
    { label: "100%", value: "100%" },
  ];

  return (
    <div
      data-image-toolbar
      className="absolute z-50 flex items-center gap-0.5 bg-white border rounded-lg shadow-lg p-1"
      style={{ top: pos.top - 44, left: Math.max(0, pos.left) }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Size buttons */}
      {sizes.map((s) => (
        <button key={s.value}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResize(s.value); }}
          className={cn(
            "px-2 py-1 text-xs rounded font-medium transition-colors",
            currentWidth === s.value ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-100"
          )}>
          {s.label}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-300 mx-0.5" />

      {/* Alignment */}
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAlign("left"); }} title="Trái"
        className={cn("p-1 rounded", currentAlign === "left" ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-100")}>
        <AlignLeft size={14} />
      </button>
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAlign("center"); }} title="Giữa"
        className={cn("p-1 rounded", currentAlign === "center" ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-100")}>
        <AlignCenter size={14} />
      </button>
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAlign("right"); }} title="Phải"
        className={cn("p-1 rounded", currentAlign === "right" ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-100")}>
        <AlignRight size={14} />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-0.5" />

      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} title="Xóa ảnh" className="p-1 rounded hover:bg-red-100 text-red-500">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// --- Main editor ---
export function BlogEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const [imageToolbar, setImageToolbar] = useState<{
    pos: { top: number; left: number };
    width: string | null;
    align: string;
  } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Bắt đầu viết nội dung..." }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[400px] p-4 focus:outline-none",
      },
    },
  });

  // Handle image click to show toolbar
  const handleEditorClick = useCallback(
    (e: MouseEvent) => {
      if (!editor || !editorWrapperRef.current) return;
      const target = e.target as HTMLElement;
      // Ignore clicks on the floating image toolbar
      if (target.closest("[data-image-toolbar]")) return;
      if (target.tagName === "IMG") {
        const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
        const imgRect = target.getBoundingClientRect();
        setImageToolbar({
          pos: {
            top: imgRect.top - wrapperRect.top,
            left: Math.max(0, imgRect.left - wrapperRect.left + imgRect.width / 2 - 160),
          },
          width: target.getAttribute("data-width") || target.style.width || null,
          align: target.getAttribute("data-align") || "center",
        });
        // Select the image node in editor
        const pos = editor.view.posAtDOM(target, 0);
        editor.commands.setNodeSelection(pos);
      } else {
        setImageToolbar(null);
      }
    },
    [editor]
  );

  useEffect(() => {
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;
    wrapper.addEventListener("click", handleEditorClick);
    return () => wrapper.removeEventListener("click", handleEditorClick);
  }, [handleEditorClick]);

  // Close toolbar on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImageToolbar(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  if (!editor) return null;

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/proxy?path=/blog/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload thất bại");
      }
      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err: any) {
      toast.error(err.message || "Upload ảnh thất bại");
    }
  };

  const addLink = () => {
    const url = prompt("Nhập URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const handleImageResize = (width: string) => {
    editor.chain().focus().updateAttributes("image", { width }).run();
    setImageToolbar((prev) => prev ? { ...prev, width } : null);
  };

  const handleImageAlign = (dataAlign: string) => {
    editor.chain().focus().updateAttributes("image", { dataAlign }).run();
    setImageToolbar((prev) => prev ? { ...prev, align: dataAlign } : null);
  };

  const handleImageDelete = () => {
    editor.chain().focus().deleteSelection().run();
    setImageToolbar(null);
  };

  const s = 16;

  return (
    <div className="border rounded-xl bg-white overflow-visible relative" ref={editorWrapperRef}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough size={s} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive("heading", { level: 4 })} title="Heading 4">
          <Heading4 size={s} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <ListOrdered size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Quote size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
          <Code size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus size={s} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Link">
          <LinkIcon size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Upload ảnh">
          <ImageIcon size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Chèn bảng">
          <TableIcon size={s} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={s} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={s} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Floating image toolbar */}
      {imageToolbar && (
        <ImageToolbar
          pos={imageToolbar.pos}
          currentWidth={imageToolbar.width}
          currentAlign={imageToolbar.align}
          onResize={handleImageResize}
          onAlign={handleImageAlign}
          onDelete={handleImageDelete}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
