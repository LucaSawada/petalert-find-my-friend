import accessibilityIcon from "@/assets/accessibility-icon.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFontSize, FontSize } from "@/hooks/useFontSize";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

const labelMap: Record<FontSize, string> = { sm: "A-", md: "A", lg: "A+", xl: "A++" };
const descMap: Record<FontSize, string> = {
  sm: "Pequeno",
  md: "Normal",
  lg: "Grande",
  xl: "Muito Grande",
};

export const FontSizeToggle = ({ className }: { className?: string }) => {
  const { size, setSize } = useFontSize();
  const { t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("settings.fontSize")}
          title={t("settings.fontSize")}
          className={cn("rounded-full shadow-card bg-background/90 backdrop-blur", className)}
        >
          <div className="h-5 w-5 flex items-center justify-center rounded-full dark:bg-white/90 p-0.5">
            <img
              src={accessibilityIcon}
              alt=""
              className="h-full w-full object-contain"
              aria-hidden="true"
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuItem disabled className="text-xs opacity-60">
          {t("settings.fontSize")}
        </DropdownMenuItem>
        {(Object.keys(labelMap) as FontSize[]).map((s) => (
          <DropdownMenuItem
            key={s}
            onSelect={() => setSize(s)}
            className={cn(
              "flex items-center justify-between gap-4 cursor-pointer",
              s === size && "bg-accent text-accent-foreground font-medium"
            )}
          >
            <span>{descMap[s]}</span>
            <span className="text-xs opacity-70">{labelMap[s]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};