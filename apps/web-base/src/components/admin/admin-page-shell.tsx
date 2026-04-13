"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminPageHeroProps = {
  badge: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  className?: string;
};

type AdminPanelProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

type AdminStatItem = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: LucideIcon;
  accentClassName?: string;
};

export function AdminPageHero({
  badge,
  title,
  description,
  icon: Icon,
  actions,
  className,
}: AdminPageHeroProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-emerald-100/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#f8fafc_42%,#eff6ff_100%)] p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)]",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-emerald-700">
            <Icon className="h-3.5 w-3.5" />
            {badge}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export function AdminPanel({
  title,
  description,
  actions,
  className,
  contentClassName,
  children,
}: AdminPanelProps) {
  return (
    <Card className={cn("overflow-hidden border-slate-200/80 shadow-sm", className)}>
      {title || description || actions ? (
        <CardHeader className="border-b border-slate-100 bg-white/80">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              {title ? <CardTitle className="text-slate-900">{title}</CardTitle> : null}
              {description ? (
                <CardDescription className="text-sm leading-6 text-slate-500">
                  {description}
                </CardDescription>
              ) : null}
            </div>
            {actions}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cn("p-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export function AdminStatsGrid({ items }: { items: AdminStatItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon, accentClassName }) => (
        <div
          key={label}
          className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
              {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
            </div>
            <div
              className={cn(
                "rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-600",
                accentClassName,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
