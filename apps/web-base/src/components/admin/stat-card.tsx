import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  description?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-primary",
  description,
}: StatCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl border border-current/10 bg-muted/60",
            color,
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className={cn("font-mono text-3xl font-bold tracking-tight", color)}>
          {value}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          {description ?? "Cập nhật theo bộ lọc báo cáo hiện tại."}
        </p>
      </CardContent>
    </Card>
  );
}
