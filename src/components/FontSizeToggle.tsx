import { Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFontSize, FontSize } from "@/hooks/useFontSize";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

const labelMap: Record<FontSize, string> = { sm: "A-", md: "A", lg: "A+", xl: "A++" };

export const FontSizeToggle = ({ className }: { className?: string }) => {
  const { size, cycle } = useFontSize();
  const { t } = useI18n();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycle}
      aria-label={`${t("settings.fontSize")}: ${labelMap[size]}`}
      title={`${t("settings.fontSize")}: ${labelMap[size]}`}
      className={cn("rounded-full shadow-card bg-background/90 backdrop-blur relative", className)}
    >
      <Type className="h-4 w-4" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
        {labelMap[size]}
      </span>
    </Button>
  );
};