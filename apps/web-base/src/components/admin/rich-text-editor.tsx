"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "Nhập nội dung...",
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[150px] p-4 focus:outline-none tiptap prose prose-sm max-w-none w-full",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-md border overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-1">
        <MenuButton
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
          icon={<Bold className="w-4 h-4" />}
          title="In đậm"
        />
        <MenuButton
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
          icon={<Italic className="w-4 h-4" />}
          title="In nghiêng"
        />
        <MenuButton
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run() || disabled}
          icon={<UnderlineIcon className="w-4 h-4" />}
          title="Gạch chân"
        />
        <div className="w-px h-4 bg-border mx-1" />
        <MenuButton
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run() || disabled}
          icon={<Heading2 className="w-4 h-4" />}
          title="Tiêu đề 2"
        />
        <div className="w-px h-4 bg-border mx-1" />
        <MenuButton
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run() || disabled}
          icon={<List className="w-4 h-4" />}
          title="Danh sách"
        />
        <MenuButton
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run() || disabled}
          icon={<ListOrdered className="w-4 h-4" />}
          title="Danh sách số"
        />
      </div>
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function MenuButton({
  isActive,
  onClick,
  disabled,
  icon,
  title,
}: {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground",
        isActive && "bg-muted text-emerald-600",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {icon}
    </button>
  );
}
