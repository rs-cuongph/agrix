"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonVariant = NonNullable<React.ComponentProps<typeof Button>["variant"]>;
type ButtonSize = NonNullable<React.ComponentProps<typeof Button>["size"]>;

type AdminActionButtonProps = React.ComponentProps<typeof Button> & {
  tone?: "primary" | "secondary" | "danger" | "ghost";
};

const toneToVariant: Record<NonNullable<AdminActionButtonProps["tone"]>, ButtonVariant> = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
  ghost: "ghost",
};

const toneClassName: Record<NonNullable<AdminActionButtonProps["tone"]>, string> = {
  primary:
    "rounded-2xl bg-emerald-600 px-4 py-2.5 text-white shadow-sm hover:bg-emerald-700",
  secondary:
    "rounded-2xl border-slate-200 bg-white/90 px-4 py-2.5 text-slate-700 shadow-sm hover:bg-slate-50",
  danger:
    "rounded-2xl border-red-200 bg-red-50 px-4 py-2.5 text-red-700 hover:bg-red-100",
  ghost: "rounded-2xl px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

const sizeClassName: Record<ButtonSize, string> = {
  default: "",
  xs: "",
  sm: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "",
  "icon-xs": "",
  "icon-sm": "",
  "icon-lg": "",
};

export function AdminActionButton({
  tone = "primary",
  variant,
  size = "sm",
  className,
  ...props
}: AdminActionButtonProps) {
  const resolvedSize = size ?? "sm";
  return (
    <Button
      variant={variant ?? toneToVariant[tone]}
      size={resolvedSize}
      className={cn(toneClassName[tone], sizeClassName[resolvedSize], className)}
      {...props}
    />
  );
}

type AdminIconButtonProps = React.ComponentProps<typeof Button> & {
  tone?: "default" | "danger";
};

export function AdminIconButton({
  tone = "default",
  variant = "ghost",
  size = "icon-sm",
  className,
  ...props
}: AdminIconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "rounded-xl",
        tone === "default" &&
          "text-slate-500 hover:bg-slate-100 hover:text-emerald-600",
        tone === "danger" &&
          "text-slate-500 hover:bg-red-50 hover:text-red-600",
        className,
      )}
      {...props}
    />
  );
}
