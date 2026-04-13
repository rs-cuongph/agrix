"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CropSearchInputProps = {
  value: string;
  onChange: (keyword: string) => void;
};

export function CropSearchInput({ value, onChange }: CropSearchInputProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onChange(draft);
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [draft, onChange]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Tìm kiếm cây trồng..."
        className="bg-white pl-9 pr-10"
      />
      {draft ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={() => setDraft("")}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
