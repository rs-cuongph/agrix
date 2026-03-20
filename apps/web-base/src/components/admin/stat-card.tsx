import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, color = "text-primary" }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={cn("w-5 h-5", color)} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-3xl font-extrabold tracking-tight", color)}>
        {value}
      </p>
    </div>
  );
}
