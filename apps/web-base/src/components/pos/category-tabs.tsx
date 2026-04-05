"use client";

import { useEffect, useState } from "react";
import { getCategories, PosCategory } from "@/lib/pos/pos-api";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

type Props = {
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
};

export function CategoryTabs({ selectedId, onSelect }: Props) {
  const [categories, setCategories] = useState<PosCategory[]>([]);
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Only show top-level categories (no parentId)
  const topLevel = categories.filter((c) => !c.parentId);

  if (topLevel.length === 0) return null;

  return (
    <div 
      ref={scrollRef}
      className="overflow-x-auto flex gap-2 py-1 px-1 scrollbar-none no-scrollbar shrink-0"
    >
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          "shrink-0 px-5 h-11 rounded-xl font-semibold text-base transition-all duration-200",
          !selectedId
            ? "bg-emerald-500 text-white shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        Tất cả
      </button>
      {topLevel.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "shrink-0 px-5 h-11 rounded-xl font-semibold text-base transition-all duration-200 whitespace-nowrap",
            selectedId === cat.id
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
